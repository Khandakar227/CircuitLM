import json
from src.models.llm import LLMClient
from src.utils.parser import extract_json_object
from src.data.component_library import COMPONENT_LIBRARY
from src.prompts.system_prompts import (
    CIRCUIT_GENERATION_SYSTEM_PROMPT_TEMPLATE,
    EVALUATION_SYSTEM_PROMPT_TEMPLATE,
)

from src.config import Config
from src.erc.engine import run_deterministic_erc


class ZeroShotCircuitGenerator:
    """Generate a circuit in a single LLM call — no component extraction,
    no RAG matching, no chain-of-thought.  The full component library is
    passed directly to the generation prompt."""

    def __init__(self, model_id: str = Config.DEFAULT_LLM):
        self.llm = LLMClient()
        self._models = (Config.REPLICATE_MODELS if Config.LLM_PROVIDER == "replicate"
                        else Config.LLM_MODELS)
        self.model_id = self._models[model_id]

    # ── main pipeline ─────────────────────────────────────────────────────────
    def generate(self, user_prompt: str, eval: bool = True) -> dict:
        print(f"[zero-shot] Generating design for: {user_prompt}")

        all_components = COMPONENT_LIBRARY

        gen_prompt = CIRCUIT_GENERATION_SYSTEM_PROMPT_TEMPLATE.format(
            component_pins=json.dumps(all_components, indent=2),
            design_advice="",
        )

        circuit_response = self.llm.generate(
            prompt=f"User Request: {user_prompt}",
            system_prompt=gen_prompt,
            model_name=self.model_id,
        )

        circuit_json = extract_json_object(circuit_response)

        # Retry logic if schema is an array
        retries = 0
        while isinstance(circuit_json, list) and retries < 3:
            print(f"--- [zero-shot] Extracted schema is an array, retrying... ({retries + 1}/3) ---")
            circuit_response = self.llm.generate(
                prompt=f"User Request: {user_prompt}",
                system_prompt=gen_prompt,
                model_name=self.model_id,
            )
            circuit_json = extract_json_object(circuit_response)
            retries += 1

        # Evaluation (same agent as the CoT pipeline)
        evaluation = None
        if eval:
            evaluation = self.evaluate_circuit(user_prompt, circuit_json)

        return {
            "reasoning": "",
            # "components": list(COMPONENT_LIBRARY.keys()),
            "matched_components": all_components,
            "schematic": circuit_json,
            "evaluation": evaluation,
        }

    # ── evaluation (reused from orchestrator) ─────────────────────────────────
    def evaluate_circuit(self, user_prompt: str, circuit_json: dict):
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
            augmented_prompt = user_prompt + f"\n\n[DETERMINISTIC ERC FINDINGS]\n{json.dumps(deterministic_output, indent=2)}\nConsider these physical rule violations in your verdict."
            
            eval_prompt = EVALUATION_SYSTEM_PROMPT_TEMPLATE.format(
                user_prompt=augmented_prompt,
                schematic=json.dumps(circuit_json, indent=2),
            )
            eval_model = self._models.get(Config.EVAL_LLM,
                                          Config.LLM_MODELS[Config.EVAL_LLM])
            eval_response = self.llm.generate(
                prompt=eval_prompt,
                model_name=eval_model,
            )
            llm_eval = extract_json_object(eval_response)
            if llm_eval:
                evaluation["llm_as_judge"] = llm_eval

            return evaluation

        # Syntax Error fallback
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
