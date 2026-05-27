import json
import argparse
import os

def analyze_results(file_path, pass_src='erc'):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    final_scores = []
    compliance_scores = []
    logic_scores = []
    
    total_items = len(data)
    evaluated_items = 0
    syntax_errors = 0
    
    # Separate counters for the summary
    erc_stats = {"fatal": 0, "major": 0, "minor": 0, "warning": 0}
    llm_stats = {"fatal": 0, "major": 0, "minor": 0, "warning": 0}
    pass_count = 0

    print(f"\n--- Detailed Prompt Electrical Logic Scores ---")
    print(f"{'Prompt':<100} | {'Deterministic ERC':<25} | {'LLM as Judge':<25}")
    print("-" * 155)
    for prompt, result in data.items():
        eval_data = result.get('evaluation')
        if not eval_data or not isinstance(eval_data, dict):
            continue

        evaluated_items += 1
        
        # 1. Handle Syntax Errors (either flat or nested)
        verdict = eval_data.get('verdict', "")
        if not verdict and isinstance(eval_data.get("deterministic_erc"), dict):
             verdict = eval_data["deterministic_erc"].get("verdict", "")
        
        if verdict and isinstance(verdict, str) and "SYNTAX ERROR" in verdict:
            syntax_errors += 1
            final_scores.append(0)
            compliance_scores.append(0)
            logic_scores.append(0)
            erc_stats["fatal"] += 1
            print(f"{prompt[:97] + '...' if len(prompt) > 100 else prompt:<100} | 0 (Syntax Error)")
            continue

        # 2. Extract Errors and Warnings
        ef, em, emin, ew = 0, 0, 0, 0
        lf, lm, lmin, lw = 0, 0, 0, 0

        # Support New Nested Schema
        if "deterministic_erc" in eval_data or "llm_as_judge" in eval_data:
            erc = eval_data.get("deterministic_erc")
            if not isinstance(erc, dict): erc = {}
            llm = eval_data.get("llm_as_judge")
            if not isinstance(llm, dict): llm = {}
            
            ef, em, emin, ew = len(erc.get("fatal_errors", [])), len(erc.get("major_errors", [])), len(erc.get("minor_errors", [])), len(erc.get("warnings", []))
            lf, lm, lmin, lw = len(llm.get("fatal_errors", [])), len(llm.get("major_errors", [])), len(llm.get("minor_errors", [])), len(llm.get("warnings", []))

        # Support Flat LLM Schema (Backward compatibility)
        elif "failure_count" in eval_data:
            lf = len(eval_data.get('fatal_errors', []))
            lm = len(eval_data.get('major_errors', []))
            lmin = len(eval_data.get('minor_errors', []))
            lw = len(eval_data.get('warnings', []))
            
        # Support Old Score-based Schema (Backward compatibility)
        elif "electrical_logic" in eval_data and "errors" in eval_data["electrical_logic"]:
            ew = len(eval_data.get("electrical_logic", {}).get("warnings", []))
            for err in eval_data["electrical_logic"].get("errors", []):
                if err.startswith("fatal_error"): ef += 1
                elif err.startswith("major_error"): em += 1
                elif err.startswith("minor_error"): emin += 1
                elif err.startswith("logical_warning"): ew += 1

        # Aggregate for summary
        erc_stats["fatal"] += ef; erc_stats["major"] += em; erc_stats["minor"] += emin; erc_stats["warning"] += ew
        llm_stats["fatal"] += lf; llm_stats["major"] += lm; llm_stats["minor"] += lmin; llm_stats["warning"] += lw

        # Combined status for Pass@1 (Deterministic ERC ONLY per user request)
        if pass_src == 'erc':
            if (ef + em) == 0:
                pass_count += 1
        else: # llm
            if (lf + lm) == 0:
                pass_count += 1

        # Legacy score handling (stays as fallback/extra metrics)
        final_score = eval_data.get('final_score', 0)
        compliance_score = eval_data.get('compliance', {}).get('score', 0)
        logic_score = eval_data.get('electrical_logic', {}).get('score', 0)
        final_scores.append(final_score)
        compliance_scores.append(compliance_score)
        logic_scores.append(logic_score)

        erc_sum = f"F:{ef} M:{em} m:{emin} W:{ew}"
        llm_sum = f"F:{lf} M:{lm} m:{lmin} W:{lw}"
        print(f"{prompt[:97] + '...' if len(prompt) > 100 else prompt:<100} | {erc_sum:<25} | {llm_sum:<25}")

    if not evaluated_items:
        print("No evaluation data found in the file.")
        return

    avg_final = sum(final_scores) / evaluated_items
    avg_compliance = sum(compliance_scores) / evaluated_items
    avg_logic = sum(logic_scores) / evaluated_items

    print(f"\n--- Summary Analysis for: {os.path.basename(file_path)} ---")
    print(f"Total Prompts:    {total_items}")
    print(f"Evaluated:        {evaluated_items}")
    print(f"Syntax Errors:    {syntax_errors}")
    print("-" * 60)
    print(f"{'Source':<20} | {'Fatal':<8} | {'Major':<8} | {'Minor':<8} | {'Warning':<8}")
    print("-" * 60)
    print(f"{'Deterministic ERC':<20} | {erc_stats['fatal']:<8} | {erc_stats['major']:<8} | {erc_stats['minor']:<8} | {erc_stats['warning']:<8}")
    print(f"{'LLM as Judge':<20} | {llm_stats['fatal']:<8} | {llm_stats['major']:<8} | {llm_stats['minor']:<8} | {llm_stats['warning']:<8}")
    print("-" * 60)
    
    pass_rate = (pass_count / evaluated_items) * 100 if evaluated_items > 0 else 0
    src_label = pass_src.upper()
    print(f"Pass@1 ({src_label} ONLY):        {pass_count}/{evaluated_items} ({pass_rate:.1f}%)")
    print(f"Failed ({src_label} Fatal/Major): {evaluated_items - pass_count}/{evaluated_items}")
    print("-" * 60)
    print(f"Average Final Score (Old):      {avg_final:.3f}")
    print(f"Average Library Score (Old):    {avg_compliance:.3f}")
    print(f"Average Electrical Score (Old): {avg_logic:.3f}")
    print("-" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze batch processing results.")
    parser.add_argument("file", type=str, help="Path to the JSON results file.")
    parser.add_argument("--pass-src", choices=['erc', 'llm'], default='erc', help="Source for Pass@1 calculation (default: erc).")
    args = parser.parse_args()

    analyze_results(args.file, pass_src=args.pass_src)
