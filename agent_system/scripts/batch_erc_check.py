import os
import json
import glob
import argparse
from src.erc.engine import run_deterministic_erc

def process_batch_files(batch_files: list):
    """
    Parses the generated CircuitJson schematics from provided batch files,
    runs the Deterministic ERC engine on them, and reports aggregate stats per model.
    """
    if not batch_files:
        print(f"No batch result files provided.")
        return

    print(f"{'Model/File':<40} | {'Pass@1':<8} | {'Fatal':<6} | {'Major':<6} | {'Minor':<6} | {'Warn':<6}")
    print("-" * 85)

    for bf in batch_files:
        if not os.path.exists(bf):
            continue
            
        model_name = os.path.basename(bf).replace("batch_results_", "").replace(".json", "")
        
        with open(bf, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                continue
                
        stats = {
            "total": 0,
            "pass": 0,
            "fatal": 0,
            "major": 0,
            "minor": 0,
            "warn": 0,
            "issue_breakdown": {} # Message -> Count
        }

        for prompt, result_dict in data.items():
            if not isinstance(result_dict, dict):
                 continue

            circuit_json = result_dict.get("schematic")
            if not circuit_json or "error" in result_dict:
                continue
                
            stats["total"] += 1
            summary = run_deterministic_erc(circuit_json)
            
            # Pass@1: No fatal or major errors
            if len(summary.fatal_errors) == 0 and len(summary.major_errors) == 0:
                stats["pass"] += 1
            
            stats["fatal"] += len(summary.fatal_errors)
            stats["major"] += len(summary.major_errors)
            stats["minor"] += len(summary.minor_errors)
            stats["warn"] += len(summary.warnings)

            # Record breakdown
            for issue in summary.fatal_errors + summary.major_errors + summary.minor_errors + summary.warnings:
                # Group by message prefix (the rule name usually)
                msg_base = issue.split(".")[0] if "." in issue else issue.split(":")[0]
                stats["issue_breakdown"][msg_base] = stats["issue_breakdown"].get(msg_base, 0) + 1
            
        if stats["total"] > 0:
            pass_rate = (stats["pass"] / stats["total"]) * 100
            print(f"{model_name:<40} | {pass_rate:>6.1f}% | {stats['fatal']:>6} | {stats['major']:>6} | {stats['minor']:>6} | {stats['warn']:>6}")
            
            # Print top issues if they exist
            if stats["issue_breakdown"]:
                sorted_issues = sorted(stats["issue_breakdown"].items(), key=lambda x: x[1], reverse=True)
                for issue_msg, count in sorted_issues[:5]: # Show top 5
                    print(f"    - {issue_msg}: {count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Deterministic ERC on batch-processed circuit JSON files.")
    parser.add_argument("file", nargs="?", help="Path to a specific batch result JSON file.")
    parser.add_argument("--dir", help="Directory containing batch result files.", default=os.path.join(os.path.dirname(__file__), "..", "output"))
    
    args = parser.parse_args()
    
    if args.file:
        files_to_process = [args.file]
    else:
        # Default to the output directory relative to the script
        output_dir = os.path.abspath(args.dir)
        files_to_process = glob.glob(os.path.join(output_dir, "batch_results_*.json"))
        
    process_batch_files(files_to_process)
