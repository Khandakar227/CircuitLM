import json
import re
from src.models.llm import LLMClient
from src.database.chroma_store import ComponentStore
from src.database.embeddings import EmbeddingManager
from src.utils.parser import extract_json_object, parse_extracted_components
from src.utils.fuzzy import fuzzy_search_components
from src.data.component_library import COMPONENT_LIBRARY
from src.prompts.system_prompts import (
    CHAIN_OF_THOUGHT_PROMPT_TEMPLATE,
    COMPONENT_EXTRACTION_SYSTEM_PROMPT,
    CIRCUIT_GENERATION_SYSTEM_PROMPT_TEMPLATE,
    EVALUATION_SYSTEM_PROMPT_TEMPLATE
)
from src.config import Config
from src.erc.engine import run_deterministic_erc


class OODHaltError(Exception):
    """Raised when a requested component cannot be resolved to the knowledge base.

    Per CircuitLM's safety design, an Out-of-Distribution (OOD) component halts
    generation and flags the design for human review, rather than letting the
    LLM hallucinate wiring for an unknown part.
    """

    def __init__(self, unmatched):
        self.unmatched = unmatched
        super().__init__(
            "OOD halt: requested component(s) not found in the knowledge base; "
            f"human review required: {unmatched}"
        )


# Passive / trivial parts that should not, on their own, trigger an OOD halt.
# The halt is reserved for "major" components (MCUs, sensors, modules, ICs,
# drivers, motors) that the knowledge base genuinely cannot represent.
TRIVIAL_COMPONENT_KEYWORDS = (
    "resistor", "capacitor", "inductor", "diode", "led", "fuse", "crystal",
    "oscillator", "resonator", "ferrite", "jumper", "wire", "cable",
    "connector", "header", "terminal", "switch", "button", "potentiometer",
    "trimmer", "varistor", "battery",
)


def _is_trivial_component(name: str) -> bool:
    """True for passive/trivial parts that should never trigger an OOD halt.

    Matches per-token by prefix so plurals are caught (e.g. "resistors") without
    false-matching substrings inside larger words (e.g. "led" inside "OLED")."""
    tokens = re.split(r"[^a-z0-9]+", name.lower())
    return any(tok.startswith(kw) for tok in tokens for kw in TRIVIAL_COMPONENT_KEYWORDS)


class CircuitGenerator:
    def __init__(self, model_id=Config.DEFAULT_LLM):
        self.llm = LLMClient()
        self.store = ComponentStore()
        self.embeddings = EmbeddingManager()
        self._models = (Config.REPLICATE_MODELS if Config.LLM_PROVIDER == "replicate"
                        else Config.LLM_MODELS)
        self.model_id = self._models[model_id]

    def _find_unmatched_components(self, component_names):
        """Return *major* requested components that resolve to neither a vector-DB
        match (within DISTANCE_THRESHOLD) nor a fuzzy match (>= FUZZY_THRESHOLD).

        Passive/trivial parts are intentionally skipped so the OOD halt fires
        rarely — only for significant unknown components."""
        unmatched = []
        for name in component_names:
            if _is_trivial_component(name):
                continue
            if fuzzy_search_components([name], COMPONENT_LIBRARY):
                continue
            if self.store.search_components([name], self.embeddings):
                continue
            unmatched.append(name)
        return unmatched

    def _find_unknown_part_types(self, circuit_json):
        """Return non-trivial part types in the generated schematic that are not
        canonical components in the knowledge base.

        The extraction agent silently omits parts it cannot map, so an unknown
        *major* component typically only surfaces here — as a hallucinated part
        type the LLM invented during generation (e.g. "fpga-dev-board")."""
        if not isinstance(circuit_json, dict):
            return []
        unknown = []
        for part in circuit_json.get("parts", []) or []:
            if not isinstance(part, dict):
                continue
            ptype = part.get("type", "")
            if not ptype or ptype in COMPONENT_LIBRARY or _is_trivial_component(ptype):
                continue
            unknown.append(ptype)
        return unknown

    def _build_pin_legend(self, circuit_json):
        """Human-readable pin-function reference for the component types used in
        the schematic, sourced from COMPONENT_LIBRARY['pin_functions'].

        Lets the LLM judge resolve cryptic silkscreen labels (e.g. ESP32-CAM
        'U0T'=UART0 TX) instead of guessing and raising false ambiguity flags."""
        if not isinstance(circuit_json, dict):
            return ""
        seen = []
        for part in circuit_json.get("parts", []) or []:
            if isinstance(part, dict) and part.get("type") and part["type"] not in seen:
                seen.append(part["type"])
        lines = []
        for t in seen:
            funcs = (COMPONENT_LIBRARY.get(t) or {}).get("pin_functions")
            if funcs:
                pin_str = ", ".join(f"{pin}={fn}" for pin, fn in funcs.items())
                lines.append(f"- {t}: {pin_str}")
        return "\n".join(lines)

    def generate_circuit_pipeline(self, user_prompt: str, eval: bool = True, skip_llm_eval: bool = False):

        # 1. Extract Components
        print(f"Generating design for: {user_prompt}")
        available_components_text = "\n".join([f"{k}: {v['description']}" for k, v in COMPONENT_LIBRARY.items()])
        extraction_response = self.llm.generate(
            prompt=f"{user_prompt}\nAvailable Components: {available_components_text}", 
            system_prompt=COMPONENT_EXTRACTION_SYSTEM_PROMPT,
            model_name=self.model_id
        )
        component_names = parse_extracted_components(extraction_response)
        print(f"--- Extracted Components: {component_names} ---")

        # 2. Match Components (Hybrid: Search + Fuzzy)
        matched = self.store.search_components(component_names, self.embeddings)
        fuzzy_matched = fuzzy_search_components(component_names, COMPONENT_LIBRARY)
        merged_components = {**matched, **fuzzy_matched}
        print(f"--- Matched {len(merged_components)} components from library ---")

        # OOD safety guardrail: halt before generation if any requested part is
        # missing from the knowledge base, and flag the design for human review.
        unmatched = self._find_unmatched_components(component_names)
        if unmatched:
            print(f"--- OOD HALT: unmatched component(s) {unmatched} ---")
            raise OODHaltError(unmatched)

        # 3. Get Chain of Thoughts
        cot_prompt = CHAIN_OF_THOUGHT_PROMPT_TEMPLATE.format(available_components="\n".join([f"{k}= PINS:{v['pins']}" for k, v in merged_components.items()]))
        
        chain_of_thoughts = self.llm.generate(prompt=user_prompt, system_prompt=cot_prompt, model_name=self.model_id)
        print("--- Chain of Thoughts Generated ---")
        print(chain_of_thoughts)
        # 4. Generate Circuit JSON
        # Ground the final generation on the original user_prompt 
        # and use the CoT as "design advice" to avoid prompt drift.
        gen_prompt = CIRCUIT_GENERATION_SYSTEM_PROMPT_TEMPLATE.format(
            component_pins=json.dumps(merged_components, indent=2),
            design_advice=f"DESIGN ADVICE (FOR GUIDANCE ONLY): {chain_of_thoughts}"
        )
        circuit_response = self.llm.generate(
            prompt=f"User Request: {user_prompt}", 
            system_prompt=gen_prompt,
            model_name=self.model_id
        )
        circuit_json = extract_json_object(circuit_response)

        # Retry logic if schema is an array
        retries = 0
        while isinstance(circuit_json, list) and retries < 3:
            print(f"--- Extracted schema is an array, retrying... ({retries + 1}/3) ---")
            circuit_response = self.llm.generate(
                prompt=f"User Request: {user_prompt}", 
                system_prompt=gen_prompt,
                model_name=self.model_id
            )
            circuit_json = extract_json_object(circuit_response)
            retries += 1
        
        # OOD safety guardrail (post-generation): unknown major components only
        # surface here, as a hallucinated part type the LLM invented. Halt.
        unknown_parts = self._find_unknown_part_types(circuit_json)
        if unknown_parts:
            print(f"--- OOD HALT: hallucinated/unknown part type(s) {unknown_parts} ---")
            raise OODHaltError(unknown_parts)

        # 5. Optional Evaluation
        evaluation = None
        if eval:
            evaluation = self.evaluate_circuit(user_prompt, circuit_json)

        return {
            "reasoning": chain_of_thoughts,
            "components": component_names,
            "matched_components": merged_components,
            "schematic": circuit_json,
            "evaluation": evaluation
        }

    def evaluate_circuit(self, user_prompt: str, circuit_json: dict, skip_llm: bool = False):
        """
        Runs evaluation on a generated circuit.
        """
        evaluation = {
            "deterministic_erc": None,
            "llm_as_judge": None
        }
        
        if circuit_json:
            # 1. Run Deterministic Rules First
            deterministic_eval = run_deterministic_erc(circuit_json)
            deterministic_output = {
                "failure_count": deterministic_eval.failure_count,
                "fatal_errors": deterministic_eval.fatal_errors,
                "major_errors": deterministic_eval.major_errors,
                "minor_errors": deterministic_eval.minor_errors,
                "warnings": deterministic_eval.warnings,
                "verdict": deterministic_eval.verdict
            }
            evaluation["deterministic_erc"] = deterministic_output
            
            # 2. Run LLM Judge
            if not skip_llm:
                # We append the deterministic findings to the LLM prompt so it has physical context
                augmented_prompt = user_prompt + f"\n\n[DETERMINISTIC ERC FINDINGS]\n{json.dumps(deterministic_output, indent=2)}\nConsider these physical rule violations in your verdict."

                # Give the judge a pin-function legend so it doesn't flag cryptic
                # but valid silkscreen labels (e.g. ESP32-CAM U0T/U0R) as ambiguous.
                pin_legend = self._build_pin_legend(circuit_json)
                if pin_legend:
                    augmented_prompt += (
                        "\n\n[PIN FUNCTION REFERENCE]\n"
                        "These pin labels have documented functions; treat them as "
                        "authoritative and do NOT flag them as ambiguous or non-standard:\n"
                        + pin_legend
                    )

                eval_prompt = EVALUATION_SYSTEM_PROMPT_TEMPLATE.format(
                    user_prompt=augmented_prompt,
                    schematic=json.dumps(circuit_json, indent=2)
                )
                eval_model = self._models.get(Config.EVAL_LLM,
                                              Config.LLM_MODELS[Config.EVAL_LLM])
                eval_response = self.llm.generate(
                    prompt=eval_prompt, 
                    model_name=eval_model
                )
                llm_eval = extract_json_object(eval_response)
                if llm_eval:
                    evaluation["llm_as_judge"] = llm_eval
                
        else:
            # Syntax error case
            syntax_err = {
                "failure_count": 1,
                "fatal_errors": ["Invalid or unparseable JSON"],
                "major_errors": [],
                "minor_errors": [],
                "warnings": [],
                "verdict": "SYNTAX ERROR: Schema validation failed. Circuit structure is invalid."
            }
            evaluation["deterministic_erc"] = syntax_err
            evaluation["llm_as_judge"] = syntax_err
            
        return evaluation

    def generate_circuit_no_cot_pipeline(self, user_prompt: str, eval: bool = True, skip_llm_eval: bool = False):
        print(f"Generating design for: {user_prompt}")
        available_components_text = "\n".join([f"{k}: {v['description']}" for k, v in COMPONENT_LIBRARY.items()])

        extraction_response = self.llm.generate(
            prompt=f"{user_prompt}\n Available Components: {available_components_text}", 
            system_prompt=COMPONENT_EXTRACTION_SYSTEM_PROMPT,
            model_name=self.model_id
        )
        component_names = parse_extracted_components(extraction_response)
        print(f"--- Extracted Components: {component_names} ---")

        matched = self.store.search_components(component_names, self.embeddings)
        fuzzy_matched = fuzzy_search_components(component_names, COMPONENT_LIBRARY)
        
        # Merge results (matched from DB takes precedence if we wanted, but here we just merge)
        merged_components = {**matched, **fuzzy_matched}
        print(f"--- Matched {len(merged_components)} components from library ---")

        # OOD safety guardrail: halt before generation if any requested part is
        # missing from the knowledge base, and flag the design for human review.
        unmatched = self._find_unmatched_components(component_names)
        if unmatched:
            print(f"--- OOD HALT: unmatched component(s) {unmatched} ---")
            raise OODHaltError(unmatched)

        gen_prompt = CIRCUIT_GENERATION_SYSTEM_PROMPT_TEMPLATE.format(
            component_pins=json.dumps(merged_components, indent=2),
            design_advice=""
        )
        circuit_response = self.llm.generate(
            prompt=f"User Request: {user_prompt}", 
            system_prompt=gen_prompt,
            model_name=self.model_id
        )
        circuit_json = extract_json_object(circuit_response)
        
        # Retry logic if schema is an array
        retries = 0
        while isinstance(circuit_json, list) and retries < 3:
            print(f"--- Extracted schema is an array, retrying... ({retries + 1}/3) ---")
            circuit_response = self.llm.generate(
                prompt=f"User Request: {user_prompt}", 
                system_prompt=gen_prompt,
                model_name=self.model_id
            )
            circuit_json = extract_json_object(circuit_response)
            retries += 1

        # OOD safety guardrail (post-generation): unknown major components only
        # surface here, as a hallucinated part type the LLM invented. Halt.
        unknown_parts = self._find_unknown_part_types(circuit_json)
        if unknown_parts:
            print(f"--- OOD HALT: hallucinated/unknown part type(s) {unknown_parts} ---")
            raise OODHaltError(unknown_parts)

        # 5. Optional Evaluation
        evaluation = None
        if eval:
            evaluation = self.evaluate_circuit(user_prompt, circuit_json)

        return {
            "reasoning": "",
            "components": component_names,
            "matched_components": merged_components,
            "schematic": circuit_json,
            "evaluation": evaluation
        }
