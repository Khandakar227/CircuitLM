"""Zero-shot circuit generation entry point.

Usage:
    python -m src.zeroshot_main "Build an LED blink circuit with Arduino" --eval --model_id deepseek
"""

from src.config import Config
import argparse
import json
import os
import time
from src.zeroshot import ZeroShotCircuitGenerator


def main():
    parser = argparse.ArgumentParser(
        description="CircuitLM – Zero-Shot Circuit Generation (no CoT, no RAG)"
    )
    parser.add_argument("prompt", type=str, help="Project idea or circuit description")
    parser.add_argument(
        "--output",
        type=str,
        default=f"output/zeroshot_{time.time()}.json",
        help="Path to save the generated circuit JSON",
    )
    parser.add_argument(
        "--eval", action="store_true", help="Include evaluation in the output"
    )
    parser.add_argument(
        "--model_id",
        type=str,
        default="deepseek",
        help="Model short key (e.g. 'deepseek', 'qwen', 'gemini')",
    )
    args = parser.parse_args()
    print(Config.LLM_PROVIDER)
    generator = ZeroShotCircuitGenerator(model_id=args.model_id)
    result = generator.generate(args.prompt, eval=args.eval)

    output_data = {
        "user_prompt": args.prompt,
        "schematic": result["schematic"],
    }

    if args.eval:
        output_data["evaluation"] = result["evaluation"]

    os.makedirs(os.path.dirname(args.output) or "output", exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(output_data, f, indent=4)

    print(f"\n✅ Zero-shot generation complete! Results saved to {args.output}")
    if args.eval and result["evaluation"]:
        print(f"Evaluation Verdict: {result['evaluation'].get('verdict', 'N/A')}")
        print(f"Electrical Score: {result['evaluation'].get('electrical_logic')}")
        print(f"Final Score: {result['evaluation'].get('final_score')}")


if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)
    main()
