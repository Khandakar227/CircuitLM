import json
import os
import glob
import argparse
from typing import Dict, List, Any
import sys

# Add the project root to sys.path to import internal modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from src.data.user_prompts import PROMPTS_BY_CATEGORY
except ImportError:
    print("Error: Could not import src.data.user_prompts. Ensure you are running from the agent_system directory.")
    sys.exit(1)

def get_difficulty_map():
    diff_map = {}
    for diff, prompts in PROMPTS_BY_CATEGORY.items():
        for prompt in prompts:
            # Normalize prompt for matching
            diff_map[prompt.strip().lower()] = diff
    return diff_map

def get_latest_file(pattern: str) -> str:
    files = glob.glob(pattern)
    if not files:
        return None
    return max(files, key=os.path.getctime)

def safe_get(data: Any, keys: List[str], default: Any = None) -> Any:
    curr = data
    for key in keys:
        if isinstance(curr, dict):
            curr = curr.get(key, default)
        else:
            return default
    return curr

def calculate_metrics(results: Dict[str, Any], diff_map: Dict[str, str]):
    # Initialize storage for metrics
    stats = {
        "easy": {"count": 0, "erc_pass": 0, "llm_pass": 0, "fatal": 0, "major": 0},
        "medium": {"count": 0, "erc_pass": 0, "llm_pass": 0, "fatal": 0, "major": 0},
        "hard": {"count": 0, "erc_pass": 0, "llm_pass": 0, "fatal": 0, "major": 0}
    }
    
    # Handle list-based results or dict-based results
    items = []
    if isinstance(results, list):
        items = results
    elif isinstance(results, dict):
        if "results" in results and isinstance(results["results"], list):
            items = results["results"]
        else:
            for prompt, data in results.items():
                if isinstance(data, dict):
                    if "prompt" not in data:
                        data["prompt"] = prompt
                    items.append(data)
                elif isinstance(data, str):
                    continue

    for data in items:
        if not isinstance(data, dict):
            continue
            
        prompt = data.get("prompt", "")
        normalized_prompt = prompt.strip().lower()
        difficulty = diff_map.get(normalized_prompt)
        
        if not difficulty:
            for p_text, d in diff_map.items():
                if p_text in normalized_prompt or normalized_prompt in p_text:
                    difficulty = d
                    break
        
        if difficulty:
            stats[difficulty]["count"] += 1
            
            # ERC Pass (Zero Fatal + Zero Major)
            erc_fatals = safe_get(data, ["evaluation", "deterministic_erc", "fatal_errors"], [])
            erc_majors = safe_get(data, ["evaluation", "deterministic_erc", "major_errors"], [])
            
            if isinstance(erc_fatals, list) and isinstance(erc_majors, list):
                if len(erc_fatals) == 0 and len(erc_majors) == 0:
                    stats[difficulty]["erc_pass"] += 1
                
            # LLM Pass (Zero Fatal + Zero Major)
            llm_fatals = safe_get(data, ["evaluation", "llm_as_judge", "fatal_errors"], [])
            llm_majors = safe_get(data, ["evaluation", "llm_as_judge", "major_errors"], [])
            
            if isinstance(llm_fatals, list) and isinstance(llm_majors, list):
                if len(llm_fatals) == 0 and len(llm_majors) == 0:
                    stats[difficulty]["llm_pass"] += 1
            
            # Metrics for Averages
            if isinstance(llm_fatals, list):
                stats[difficulty]["fatal"] += len(llm_fatals)
            if isinstance(llm_majors, list):
                stats[difficulty]["major"] += len(llm_majors)
            
    return stats

def print_table(model_name: str, stats: Dict[str, Any]):
    print(f"\nTarget Model: {model_name}")
    print("-" * 100)
    print(f"{'Difficulty':<12} | {'Count':<6} | {'ERC Pass@1 (n/N)':<18} | {'LLM Pass@1 (n/N)':<18} | {'Fatal (Avg)':<12} | {'Major (Avg)':<12}")
    print("-" * 100)
    
    for diff in ["easy", "medium", "hard"]:
        s = stats[diff]
        count = s["count"]
        if count == 0:
            print(f"{diff.capitalize():<12} | {0:<6} | {'N/A':<18} | {'N/A':<18} | {'N/A':<12} | {'N/A':<12}")
            continue
            
        erc_p = (s["erc_pass"] / count) * 100
        llm_p = (s["llm_pass"] / count) * 100
        fatal_avg = s["fatal"] / count
        major_avg = s["major"] / count
        
        erc_str = f"{s['erc_pass']}/{count} ({erc_p:>5.1f}%)"
        llm_str = f"{s['llm_pass']}/{count} ({llm_p:>5.1f}%)"
        
        print(f"{diff.capitalize():<12} | {count:<6} | {erc_str:<18} | {llm_str:<18} | {fatal_avg:>12.2f} | {major_avg:>12.2f}")
    print("-" * 100)

def generate_latex(all_data: Dict[str, Dict[str, Any]]):
    latex = []
    latex.append(r"\begin{table*}[t]")
    latex.append(r"\caption{Performance Breakdown by Prompt Difficulty (Passed/Total)}")
    latex.append(r"\label{tab:difficulty_breakdown}")
    latex.append(r"\centering")
    latex.append(r"\resizebox{\textwidth}{!}{%")
    latex.append(r"\begin{tabular}{l|ccc|ccc|ccc}")
    latex.append(r"\toprule")
    latex.append(r"\multirow{2}{*}{\textbf{Model}} & \multicolumn{3}{c|}{\textbf{Easy}} & \multicolumn{3}{c|}{\textbf{Medium}} & \multicolumn{3}{c}{\textbf{Hard (Adversarial)}} \\")
    latex.append(r"\cmidrule(lr){2-4} \cmidrule(lr){5-7} \cmidrule(l){8-10}")
    latex.append(r"& \textbf{Pass (E/L)} & \textbf{Fatal} & \textbf{Major} & \textbf{Pass (E/L)} & \textbf{Fatal} & \textbf{Major} & \textbf{Pass (E/L)} & \textbf{Fatal} & \textbf{Major} \\")
    latex.append(r"\midrule")
    
    for model, stats in all_data.items():
        row = [model]
        for diff in ["easy", "medium", "hard"]:
            s = stats[diff]
            count = s["count"]
            if count == 0:
                row.extend(["N/A", "0.0", "0.0"])
            else:
                fatal = s["fatal"] / count
                major = s["major"] / count
                pass_str = f"{s['erc_pass']}/{count} | {s['llm_pass']}/{count}"
                row.extend([pass_str, f"{fatal:.1f}", f"{major:.1f}"])
        latex.append(" & ".join(row) + r" \\")
        
    latex.append(r"\bottomrule")
    latex.append(r"\end{tabular}")
    latex.append(r"}")
    latex.append(r"\end{table*}")
    return "\n".join(latex)

def main():
    parser = argparse.ArgumentParser(description="Generate performance report by difficulty")
    parser.add_argument("--zeroshot", action="store_true", help="Process zeroshot results instead of CoT")
    args = parser.parse_args()
    
    suffix = "zeroshot" if args.zeroshot else "cot"
    output_dir = "output"
    diff_map = get_difficulty_map()
    
    models = ["gemini", "qwen", "deepseek", "gpt", "llama"]
    all_stats = {}
    
    for model in models:
        pattern = os.path.join(output_dir, f"batch_results_{model}_{suffix}_*.json")
        filepath = get_latest_file(pattern)
        if not filepath:
            print(f"Warning: No results found for {model} {suffix}")
            continue
            
        try:
            with open(filepath, 'r') as f:
                results = json.load(f)
            
            stats = calculate_metrics(results, diff_map)
            all_stats[model.capitalize()] = stats
            print_table(model.capitalize(), stats)
            
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
            
    if all_stats:
        latex_output = generate_latex(all_stats)
        print("\nLaTeX Table Output:")
        print("-" * 50)
        print(latex_output)
        
        with open(f"difficulty_report_{suffix}.tex", "w") as f:
            f.write(latex_output)
        print(f"\nLaTeX table saved to difficulty_report_{suffix}.tex")

if __name__ == "__main__":
    main()
