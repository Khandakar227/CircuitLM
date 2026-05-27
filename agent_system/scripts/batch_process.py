import json
import os
import datetime
import argparse
from src.orchestrator import CircuitGenerator
from src.data.user_prompts import USER_PROMPTS, PROMPTS_BY_CATEGORY
from src.config import Config

def batch_process(model_id=Config.DEFAULT_LLM, with_cot=True, resume_file=None, run_eval=True, skip_llm_eval=False, category=None):
    generator = CircuitGenerator(model_id=model_id)
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
            output_file = f"output/batch_results_{model_id}{cat_str}_{'cot' if with_cot else ''}_{timestamp}.json"
    else:
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        cat_str = f"_{category}" if category else ""
        output_file = f"output/batch_results_{model_id}{cat_str}_{'cot' if with_cot else ''}_{timestamp}.json"
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    print(f"🚀 Starting batch processing of {len(prompts_to_process)} prompts using model: {model_id}...")
    print(f"📂 Results will be saved to {output_file}")

    for i, prompt in enumerate(prompts_to_process):
        # We consider a schematic "valid" for resume only if it's a dictionary
        # If it's a string (malformed LLM output), we re-process it.
        existing_schematic = results.get(prompt, {}).get("schematic")
        has_schematic = isinstance(existing_schematic, dict)
        has_evaluation = results.get(prompt, {}).get("evaluation") is not None
        
        # Determine if we should skip based on current flags
        should_skip = has_schematic
        if run_eval:
            if not has_evaluation:
                should_skip = False
            elif not skip_llm_eval:
                # If we want full eval, but only have partial (ERC only), don't skip
                eval_data = results[prompt].get("evaluation", {})
                if eval_data and eval_data.get("llm_as_judge") is None:
                    should_skip = False

        if should_skip:
            print(f"⏩ Skipping (already exists): {prompt[:50]}...")
            continue

        print(f"\n[{i+1}/{len(USER_PROMPTS)}] Processing: {prompt}")
        try:
            if has_schematic and run_eval:
                print(f"⚖️ Schematic found, running evaluation (skip_llm={skip_llm_eval})...")
                evaluation = generator.evaluate_circuit(prompt, results[prompt]["schematic"], skip_llm=skip_llm_eval)
                results[prompt]["evaluation"] = evaluation
            else:
                if with_cot:
                    result = generator.generate_circuit_pipeline(prompt, eval=run_eval, skip_llm_eval=skip_llm_eval)
                else:
                    result = generator.generate_circuit_no_cot_pipeline(prompt, eval=run_eval, skip_llm_eval=skip_llm_eval)
                results[prompt] = result
            
            # Save incrementally after each successful generation
            with open(output_file, "w") as f:
                json.dump(results, f, indent=4)
            print(f"✅ Successfully processed and saved.")
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"❌ Error processing prompt '{prompt}': {e}")
            results[prompt] = {"error": str(e)}
            # Still save the error state
            with open(output_file, "w") as f:
                json.dump(results, f, indent=4)

    print(f"\n✨ Batch processing complete. Total results saved: {len(results)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Batch process circuit designs.")
    parser.add_argument("--model", type=str, default=Config.DEFAULT_LLM, help=f"Model ID to use (default: {Config.DEFAULT_LLM})")
    parser.add_argument("--category", type=str, choices=["easy", "medium", "hard"], help="Filter prompts by category")
    parser.add_argument("--no-cot", action="store_true", help="Disable Chain of Thought (CoT)")
    parser.add_argument("--resume", type=str, help="Path to a JSON file to resume from")
    parser.add_argument("--no-eval", action="store_true", help="Disable all evaluations (ERC + LLM)")
    parser.add_argument("--no-llm-eval", action="store_true", help="Disable LLM-as-judge evaluation (Keep ERC)")
    
    args = parser.parse_args()
    
    with_cot = not args.no_cot
    run_eval = not args.no_eval
    skip_llm_eval = args.no_llm_eval
    
    print(f"\n🚀 Starting batch processing...")
    print(f"   MODEL: {args.model}")
    print(f"   CATEGORY: {args.category or 'all'}")
    print(f"   COT: {with_cot}")
    print(f"   RUN_EVAL: {run_eval}")
    print(f"   SKIP_LLM_EVAL: {skip_llm_eval}")
    
    batch_process(model_id=args.model, with_cot=with_cot, resume_file=args.resume, run_eval=run_eval, skip_llm_eval=skip_llm_eval, category=args.category)
