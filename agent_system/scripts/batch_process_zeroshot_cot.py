import json
import os
import datetime
import argparse
from src.zeroshot_cot import ZeroShotCoTCircuitGenerator
from src.data.user_prompts import USER_PROMPTS, PROMPTS_BY_CATEGORY
from src.config import Config

def batch_process_zeroshot_cot(model_id=Config.DEFAULT_LLM, resume_file=None, category=None):
    generator = ZeroShotCoTCircuitGenerator(model_id=model_id)
    results = {}

    # Filter prompts by category if specified
    if category and category in PROMPTS_BY_CATEGORY:
        prompts_to_process = PROMPTS_BY_CATEGORY[category]
        print(f"🎯 Filtering by category: {category} ({len(prompts_to_process)} prompts)")
    else:
        prompts_to_process = USER_PROMPTS

    if resume_file and os.path.exists(resume_file):
        print(f"🔄 Resuming from {resume_file}...")
        try:
            with open(resume_file, "r") as f:
                results = json.load(f)
            output_file = resume_file
        except Exception as e:
            print(f"⚠️ Error loading resume file: {e}. Starting fresh.")
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            cat_str = f"_{category}" if category else ""
            output_file = f"output/batch_results_{model_id}{cat_str}_zeroshot_cot_{timestamp}.json"
    else:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        cat_str = f"_{category}" if category else ""
        output_file = f"output/batch_results_{model_id}{cat_str}_zeroshot_cot_{timestamp}.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

    print(f"🚀 Starting zero-shot CoT batch processing of {len(prompts_to_process)} prompts using model: {model_id}...")
    print(f"📂 Results will be saved to {output_file}")

    for i, prompt in enumerate(prompts_to_process):
        # Smarter resume: regenerate if schematic is malformed (not a dict)
        existing_schematic = results.get(prompt, {}).get("schematic")
        has_schematic = isinstance(existing_schematic, dict)
        has_evaluation = results.get(prompt, {}).get("evaluation") is not None

        if has_schematic and has_evaluation:
            print(f"⏩ Skipping (already exists): {prompt[:50]}...")
            continue
        # if i > 24:
        #     break

        print(f"\n[{i+1}/{len(USER_PROMPTS)}] Processing: {prompt}")
        try:
            if has_schematic and not has_evaluation:
                print(f"⚖️ Schematic found, but evaluation missing. Running evaluation only...")
                evaluation = generator.evaluate_circuit(prompt, results[prompt]["schematic"])
                results[prompt]["evaluation"] = evaluation
            else:
                result = generator.generate(prompt, eval=True)
                results[prompt] = result

            # Save incrementally after each successful generation
            with open(output_file, "w") as f:
                json.dump(results, f, indent=4)
            print(f"✅ Successfully processed and saved.")

        except Exception as e:
            print(f"❌ Error processing prompt '{prompt}': {e}")
            results[prompt] = {"error": str(e)}
            with open(output_file, "w") as f:
                json.dump(results, f, indent=4)

    print(f"\n✨ Batch processing complete. Total results saved: {len(results)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Batch process circuit designs (zero-shot with CoT).")
    parser.add_argument("--model", type=str, default=Config.DEFAULT_LLM, help=f"Model ID to use (default: {Config.DEFAULT_LLM})")
    parser.add_argument("--category", type=str, choices=["easy", "medium", "hard"], help="Filter prompts by category")
    parser.add_argument("--resume", type=str, help="Path to a JSON file to resume from")

    args = parser.parse_args()

    print(f"\n🚀 Starting zero-shot CoT batch processing...")
    print(f"   MODEL: {args.model}")
    print(f"   CATEGORY: {args.category or 'all'}")
    print(f"   PROVIDER: {Config.LLM_PROVIDER}")
    
    batch_process_zeroshot_cot(model_id=args.model, resume_file=args.resume, category=args.category)
