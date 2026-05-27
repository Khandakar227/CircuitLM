import json
import os
import glob
import numpy as np
import argparse

from src.erc.engine import run_deterministic_erc

def get_model_display_name(filename):
    """Maps filename to model display name."""
    mapping = {
        "gemini": "Gemini 2.5 Flash",
        "qwen": "Qwen-3 235B",
        "gpt": "GPT-5 Mini",
        "llama": "Llama-3.3 70B",
        "deepseek": "DeepSeek v3.1"
    }
    for key, val in mapping.items():
        if key in filename.lower():
            return val
    return "Unknown Model"

def calculate_stats(error_list):
    """Calculates mean and standard deviation."""
    if not error_list:
        return 0.0, 0.0
    return np.mean(error_list), np.std(error_list)

def generate_latex(source='erc'):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "..", "output")
    files = glob.glob(os.path.join(output_dir, "batch_results_*.json"))
    
    # Structure: { model_name: { 'fatal': [], 'major': [], 'minor': [], 'warning': [], 'pass': 0, 'total': 0 } }
    model_data = {}

    for file_path in files:
        filename = os.path.basename(file_path)
        model_name = get_model_display_name(filename)
        
        if model_name not in model_data:
            model_data[model_name] = {
                'fatal': [], 'major': [], 'minor': [], 'warning': [],
                'pass': 0, 'total': 0
            }
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            for prompt, result in data.items():
                if source == 'erc':
                    # RE-CALCULATE ERC on the fly to reflect newest rules
                    schematic = result.get('schematic')
                    if not schematic or "error" in result:
                        continue
                    
                    summary = run_deterministic_erc(schematic)
                    f_count = len(summary.fatal_errors)
                    m_count = len(summary.major_errors)
                    mi_count = len(summary.minor_errors)
                    w_count = len(summary.warnings)
                else:
                    # Use LLM as judge data from the file
                    eval_data = result.get('evaluation', {})
                    src_data = eval_data.get("llm_as_judge", {})
                    if not isinstance(src_data, dict):
                        src_data = {}
                    
                    f_count = len(src_data.get("fatal_errors", []))
                    m_count = len(src_data.get("major_errors", []))
                    mi_count = len(src_data.get("minor_errors", []))
                    w_count = len(src_data.get("warnings", []))
                
                model_data[model_name]['fatal'].append(f_count)
                model_data[model_name]['major'].append(m_count)
                model_data[model_name]['minor'].append(mi_count)
                model_data[model_name]['warning'].append(w_count)
                model_data[model_name]['total'] += 1
                
                if f_count == 0 and m_count == 0:
                    model_data[model_name]['pass'] += 1
                    
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    # Compile table results
    table_rows = []
    for model, stats in model_data.items():
        if stats['total'] == 0: continue
        
        pass_rate = (stats['pass'] / stats['total']) * 100
        f_mean, f_std = calculate_stats(stats['fatal'])
        m_mean, m_std = calculate_stats(stats['major'])
        mi_mean, mi_std = calculate_stats(stats['minor'])
        w_mean, w_std = calculate_stats(stats['warning'])
        
        table_rows.append({
            'name': model,
            'pass_rate': pass_rate,
            'f_str': f"{f_mean:.2f} $\\pm$ {f_std:.2f}",
            'm_str': f"{m_mean:.2f} $\\pm$ {m_std:.2f}",
            'mi_str': f"{mi_mean:.2f} $\\pm$ {mi_std:.2f}",
            'w_str': f"{w_mean:.2f} $\\pm$ {w_std:.2f}",
            'f_val': f_mean,
            'm_val': m_mean,
            'mi_val': mi_mean,
            'w_val': w_mean
        })

    # Sort by Pass@1 descending
    table_rows.sort(key=lambda x: x['pass_rate'], reverse=True)

    # find bests for bolding
    best_pass = max(t['pass_rate'] for t in table_rows) if table_rows else 0
    best_f = min(t['f_val'] for t in table_rows) if table_rows else 999
    best_m = min(t['m_val'] for t in table_rows) if table_rows else 999
    best_mi = min(t['mi_val'] for t in table_rows) if table_rows else 999
    best_w = min(t['w_val'] for t in table_rows) if table_rows else 999

    src_label = source.upper()
    print("\\begin{table*}[t]")
    print(f"\\caption{{{src_label} Evaluation Results: Pass@1 Rates and Average Faults per Prompt ($\\mu \\pm \\sigma$)}}")
    print(f"\\label{{tab:{source}_eval}}")
    print("\\centering")
    print("\\resizebox{\\textwidth}{!}{%")
    print("\\begin{tabular}{lcccccc}")
    print("\\toprule")
    print("\\textbf{Model Pipeline} & \\textbf{Pass@1 (\\%)} $\\uparrow$ & \\textbf{Fatal Errors} $\\downarrow$ & \\textbf{Major Errors} $\\downarrow$ & \\textbf{Minor Errors} $\\downarrow$ & \\textbf{Warnings} $\\downarrow$ \\\\")
    print("\\midrule")

    for r in table_rows:
        pass_str = f"{r['pass_rate']:.1f}\\%"
        if r['pass_rate'] == best_pass: pass_str = f"\\textbf{{{pass_str}}}"
        
        f_str = r['f_str']
        if r['f_val'] == best_f: f_str = f"\\textbf{{{f_str}}}"
        
        m_str = r['m_str']
        if r['m_val'] == best_m: m_str = f"\\textbf{{{m_str}}}"
        
        mi_str = r['mi_str']
        if r['mi_val'] == best_mi: mi_str = f"\\textbf{{{mi_str}}}"
        
        w_str = r['w_str']
        if r['w_val'] == best_w: w_str = f"\\textbf{{{w_str}}}"

        print(f"{r['name']} & {pass_str} & {f_str} & {m_str} & {mi_str} & {w_str} \\\\")

    print("\\bottomrule")
    print("\\multicolumn{6}{l}{\\footnotesize \\textit{Note: A prompt achieves a ``Pass@1'' exclusively if the generated schematic contains 0 Fatal and 0 Major errors.}} \\\\")
    print("\\end{tabular}%")
    print("}")
    print("\\end{table*}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate LaTeX evaluation table from batch results.")
    parser.add_argument("--source", choices=['erc', 'llm'], default='erc', help="Source for error metrics (erc or llm).")
    args = parser.parse_args()
    
    generate_latex(source=args.source)
