import json
import argparse
import os
import glob
import math
from typing import List, Dict, Any

def extract_model_from_filename(filename: str) -> str:
    # batch_results_llama_cot_20260314_202633.json -> llama
    parts = os.path.basename(filename).split('_')
    if len(parts) >= 3:
        return parts[2]
    return "unknown"

def calculate_stats(data: List[float]):
    if not data:
        return 0, 0
    n = len(data)
    mean = sum(data) / n
    variance = sum((x - mean) ** 2 for x in data) / n
    std_dev = math.sqrt(variance)
    return mean, std_dev

def parse_result_file(file_path: str, pass_src='erc'):
    if not os.path.exists(file_path):
        return None

    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return None

    model_name = extract_model_from_filename(file_path)
    prompts_stats = []
    
    fatal_counts = []
    major_counts = []
    minor_counts = []
    warning_counts = []
    pass_binary = []
    
    evaluated_count = 0

    for prompt, result in data.items():
        eval_data = result.get('evaluation')
        if not eval_data or not isinstance(eval_data, dict):
            continue
        
        evaluated_count += 1
        
        # Determine source (erc or llm)
        source = eval_data.get("llm_as_judge") if pass_src == 'llm' else eval_data.get("deterministic_erc")
        if not isinstance(source, dict):
            source = eval_data
            
        f_count = len(source.get("fatal_errors", []))
        m_count = len(source.get("major_errors", []))
        mi_count = len(source.get("minor_errors", []))
        w_count = len(source.get("warnings", []))
        
        fatal_counts.append(f_count)
        major_counts.append(m_count)
        minor_counts.append(mi_count)
        warning_counts.append(w_count)
        
        is_pass = (f_count + m_count) == 0
        pass_binary.append(1 if is_pass else 0)
            
        prompts_stats.append({
            "prompt": prompt,
            "fatal": f_count,
            "major": m_count,
            "minor": mi_count,
            "warning": w_count,
            "passed": is_pass
        })

    if evaluated_count == 0:
        return None

    pass_rate, pass_std = calculate_stats(pass_binary)
    # Scale pass rate to percentage
    pass_rate *= 100
    pass_std *= 100 / math.sqrt(evaluated_count) if evaluated_count > 0 else 0 # Standard Error for proportion

    fatal_mean, fatal_std = calculate_stats(fatal_counts)
    major_mean, major_std = calculate_stats(major_counts)
    minor_mean, minor_std = calculate_stats(minor_counts)
    warning_mean, warning_std = calculate_stats(warning_counts)
    
    return {
        "model": model_name,
        "file": os.path.basename(file_path),
        "pass_rate": pass_rate,
        "pass_std": pass_std,
        "total": evaluated_count,
        "fatal_mean": fatal_mean,
        "fatal_std": fatal_std,
        "major_mean": major_mean,
        "major_std": major_std,
        "minor_mean": minor_mean,
        "minor_std": minor_std,
        "warning_mean": warning_mean,
        "warning_std": warning_std,
        "prompts": prompts_stats
    }

def print_table(results: List[Dict]):
    header = f"{'Model':<15} | {'Pass@1 (%)':<16} | {'Fatal':<12} | {'Major':<12} | {'Minor':<12} | {'Warning':<12}"
    print(header)
    print("-" * len(header))
    for res in results:
        pass_str = f"{res['pass_rate']:.1f} ± {res['pass_std']:.1f}"
        fatal_str = f"{res['fatal_mean']:.1f} ± {res['fatal_std']:.1f}"
        major_str = f"{res['major_mean']:.1f} ± {res['major_std']:.1f}"
        minor_str = f"{res['minor_mean']:.1f} ± {res['minor_std']:.1f}"
        warning_str = f"{res['warning_mean']:.1f} ± {res['warning_std']:.1f}"
        print(f"{res['model']:<15} | {pass_str:<16} | {fatal_str:<12} | {major_str:<12} | {minor_str:<12} | {warning_str:<12}")

def print_latex(results: List[Dict]):
    print("\\begin{table}[h]")
    print("\\caption{Model Performance Comparison (Means $\pm$ Std. Dev.)}")
    print("\\centering")
    print("\\begin{tabular}{l|c|c|c|c|c}")
    print("\\hline")
    print("\\textbf{Model} & \\textbf{Pass@1 (\\%)} & \\textbf{Fatal} & \\textbf{Major} & \\textbf{Minor} & \\textbf{Warning} \\\\ \\hline")
    for res in results:
        model = res['model'].capitalize()
        pass_str = f"{res['pass_rate']:.1f} \\pm {res['pass_std']:.1f}"
        fatal_str = f"{res['fatal_mean']:.1f} \\pm {res['fatal_std']:.1f}"
        major_str = f"{res['major_mean']:.1f} \\pm {res['major_std']:.1f}"
        minor_str = f"{res['minor_mean']:.1f} \\pm {res['minor_std']:.1f}"
        warning_str = f"{res['warning_mean']:.1f} \\pm {res['warning_std']:.1f}"
        print(f"{model} & {pass_str} & {fatal_str} & {major_str} & {minor_str} & {warning_str} \\\\")
    print("\\hline")
    print("\\end{tabular}")
    print("\\end{table}")

def print_detailed_prompts(res: Dict):
    print(f"\nDetailed Per-Prompt Report for Model: {res['model']} ({res['file']})")
    print(f"{'Prompt':<80} | {'Status':<8} | {'F':<3} | {'M':<3} | {'m':<3} | {'W':<3}")
    print("-" * 110)
    for p in res['prompts']:
        status = "PASS" if p['passed'] else "FAIL"
        prompt_trunc = p['prompt'][:77] + "..." if len(p['prompt']) > 80 else p['prompt']
        print(f"{prompt_trunc:<80} | {status:<8} | {p['fatal']:<3} | {p['major']:<3} | {p['minor']:<3} | {p['warning']:<3}")

def main():
    parser = argparse.ArgumentParser(description="Generate model performance reports.")
    parser.add_argument("--type", choices=['cot', 'zeroshot'], default='cot', help="Report type (cot or zeroshot).")
    parser.add_argument("--format", choices=['table', 'json', 'latex'], default='table', help="Output format.")
    parser.add_argument("--pass-src", choices=['erc', 'llm'], default='llm', help="Source for Pass@1 (erc or llm).")
    parser.add_argument("--detailed", action="store_true", help="Print per-prompt detailed info.")
    args = parser.parse_args()

    output_dir = "output"
    pattern = f"batch_results_*_{args.type}_*.json"
    files = glob.glob(os.path.join(output_dir, pattern))
    
    if not files:
        print(f"No files found for type: {args.type}")
        return

    # Process all files and sort by model name
    results = []
    for f in files:
        res = parse_result_file(f, pass_src=args.pass_src)
        if res:
            results.append(res)
    
    results.sort(key=lambda x: x['model'])

    if args.format == 'json':
        print(json.dumps(results, indent=2))
    elif args.format == 'latex':
        print_latex(results)
    else:
        print_table(results)

    if args.detailed:
        for res in results:
            print_detailed_prompts(res)

if __name__ == "__main__":
    main()
