import json
import argparse
import os
import glob
from typing import List, Dict, Any, Tuple

def extract_metadata(filename: str) -> Tuple[str, str, str]:
    # batch_results_llama_cot_20260314_202633.json -> (llama, cot, 20260314202633)
    parts = os.path.basename(filename).split('_')
    if len(parts) >= 5:
        model = parts[2]
        mode = parts[3]
        timestamp = parts[4] + parts[5].split('.')[0]
        return model, mode, timestamp
    return "unknown", "unknown", "0"

def get_latest_files(directory: str) -> Dict[str, Dict[str, str]]:
    files = glob.glob(os.path.join(directory, "batch_results_*.json"))
    models_data = {}
    
    for f in files:
        model, mode, ts = extract_metadata(f)
        if model == "unknown": continue
        
        if model not in models_data:
            models_data[model] = {}
        
        if mode not in models_data[model] or ts > models_data[model][mode]['ts']:
            models_data[model][mode] = {'path': f, 'ts': ts}
            
    return models_data

def get_metrics(file_path: str) -> Dict[str, float]:
    if not os.path.exists(file_path):
        return None

    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return None

    erc_passed = 0
    llm_passed = 0
    erc_fatal_total = 0
    erc_major_total = 0
    llm_fatal_total = 0
    llm_major_total = 0
    count = 0

    for prompt, result in data.items():
        eval_data = result.get('evaluation')
        if not eval_data or not isinstance(eval_data, dict):
            continue
        
        erc = eval_data.get("deterministic_erc", {})
        llm = eval_data.get("llm_as_judge", {})
        
        # Robust handling for cases where erc/llm might be lists or strings
        def extract_count(field, key):
            if isinstance(field, dict):
                return len(field.get(key, []))
            return 0

        ef = extract_count(erc, "fatal_errors")
        em = extract_count(erc, "major_errors")
        lf = extract_count(llm, "fatal_errors")
        lm = extract_count(llm, "major_errors")
        
        if (ef + em) == 0: erc_passed += 1
        if (lf + lm) == 0: llm_passed += 1
        
        erc_fatal_total += ef
        erc_major_total += em
        llm_fatal_total += lf
        llm_major_total += lm
        count += 1

    if count == 0: return None
    
    return {
        "erc_pass": (erc_passed / count) * 100,
        "llm_pass": (llm_passed / count) * 100,
        "llm_fatal": llm_fatal_total / count,
        "llm_major": llm_major_total / count
    }

def print_latex_comparison(models_results: List[Dict]):
    print(r"\begin{table*}[t]")
    print(r"\vspace{-3mm}")
    print(r"\caption{Performance Comparison: Full-Context Zero-Shot Baseline vs. CircuitLM Pipeline}")
    print(r"\label{tab:zeroshot_comparison}")
    print(r"\centering")
    print(r"\resizebox{\textwidth}{!}{%")
    print(r"\begin{tabular}{l|cccc|cccc}")
    print(r"\toprule")
    print(r"\multirow{2}{*}{\textbf{Model}} & \multicolumn{4}{c|}{\textbf{Zero-Shot Baseline}} & \multicolumn{4}{c}{\textbf{CircuitLM}} \\")
    print(r"\cmidrule(lr){2-5} \cmidrule(l){6-9}")
    print(r"& \textbf{ERC Pass@1} $\uparrow$ & \textbf{LLM Pass@1} $\uparrow$ & \textbf{LLM Fatal} $\downarrow$ & \textbf{LLM Major} $\downarrow$ ")
    print(r"& \textbf{ERC Pass@1} $\uparrow$ & \textbf{LLM Pass@1} $\uparrow$ & \textbf{LLM Fatal} $\downarrow$ & \textbf{LLM Major} $\downarrow$ \\")
    print(r"\midrule")
    
    for res in models_results:
        z = res['zeroshot']
        c = res['cot']
        line = f"{res['model'].capitalize()} & {z['erc_pass']:.1f}\% & {z['llm_pass']:.1f}\% & {z['llm_fatal']:.2f} & {z['llm_major']:.2f} & " \
               f"{c['erc_pass']:.1f}\% & {c['llm_pass']:.1f}\% & {c['llm_fatal']:.2f} & {c['llm_major']:.2f} \\\\"
        print(line)
        
    print(r"\bottomrule")
    print(r"\end{tabular}")
    print(r"}")
    print(r"\end{table*}")

def main():
    parser = argparse.ArgumentParser(description="Generate LaTeX comparison table.")
    parser.add_argument("--dir", default="output", help="Directory containing JSON results.")
    args = parser.parse_args()

    models_data = get_latest_files(args.dir)
    final_results = []
    
    # Define models to include (or just take all discovered)
    models_to_include = ['gemini', 'gpt', 'llama', 'deepseek', 'qwen']
    
    for model in models_to_include:
        if model in models_data and 'zeroshot' in models_data[model] and 'cot' in models_data[model]:
            z_metrics = get_metrics(models_data[model]['zeroshot']['path'])
            c_metrics = get_metrics(models_data[model]['cot']['path'])
            if z_metrics and c_metrics:
                final_results.append({
                    'model': model,
                    'zeroshot': z_metrics,
                    'cot': c_metrics
                })

    print_latex_comparison(final_results)

if __name__ == "__main__":
    main()
