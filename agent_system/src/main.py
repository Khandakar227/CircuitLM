from src.config import Config
import argparse
import json
import os
from src.orchestrator import CircuitGenerator, OODHaltError
import time

def main():
    parser = argparse.ArgumentParser(description="CircuitLM - Advanced Circuit Generation Pipeline")
    parser.add_argument("prompt", type=str, help="Project idea or circuit description")
    parser.add_argument("--output", type=str, default=f"output/output_{time.time()}.json", help="Path to save the generated circuit JSON")
    parser.add_argument("--eval", action="store_true", help="Include evaluation in the output")
    parser.add_argument("--cot", action="store_true", help="Include chain of thoughts in the output")
    parser.add_argument("--model_id", type=str, default="deepseek", help="Model ID to use for circuit generation (e.g., 'gpt', 'gemini')")
    args = parser.parse_args()

    generator = CircuitGenerator(model_id=args.model_id)
    try:
        if args.cot:
            result = generator.generate_circuit_pipeline(args.prompt)
        else:
            result = generator.generate_circuit_no_cot_pipeline(args.prompt)
    except OODHaltError as e:
        print(f"\n⛔ {e}")
        print("Generation halted. Add the missing component(s) to the library or revise the prompt.")
        return

    # Prepare output
    output_data = {
        "user_prompt": args.prompt,
        "reasoning": result["reasoning"],
        "components": result["components"],
        "schematic": result["schematic"]
    }

    if args.eval:
        output_data["evaluation"] = result["evaluation"]

    # Save to file
    with open(args.output, "w") as f:
        json.dump(output_data, f, indent=4)

    print(f"\n✅ Generation complete! Results saved to {args.output}")
    print("\n--- Summary ---")
    print(f"Components extracted: {len(result['components'])}")
    print(f"Components matched: {len(result['matched_components'])}")
    if args.eval and result["evaluation"]:
        print(f"Evaluation Verdict: {result['evaluation'].get('verdict', 'N/A')}")
        print(f"Failure Count: {result['evaluation'].get('failure_count')}")

if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)
    main()
