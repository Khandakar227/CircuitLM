import json
import argparse
import os

def count_errors(file_path):
    """
    Parses a batch results JSON and counts the number of fatal, major, and minor errors.
    """
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    total_fatal = 0
    total_major = 0
    total_minor = 0
    syntax_errors = 0
    total_prompts = len(data)

    for prompt, result in data.items():
        # Check if result is an error dict from batch_process.py
        if isinstance(result, dict) and "error" in result:
             # This happens if there was an exception during generation itself
             syntax_errors += 1
             continue

        evaluation = result.get('evaluation')
        if not evaluation:
            continue
            
        if evaluation.get('verdict') == "SYNTAX ERROR":
            syntax_errors += 1
            continue

        logic_errors = evaluation.get('electrical_logic', {}).get('errors', [])
        for error in logic_errors:
            error_lower = error.lower()
            if 'fatal_error:' in error_lower:
                total_fatal += 1
            elif 'major_error:' in error_lower:
                total_major += 1
            elif 'minor_error:' in error_lower:
                total_minor += 1

    avg_fatal = total_fatal / total_prompts if total_prompts > 0 else 0
    avg_major = total_major / total_prompts if total_prompts > 0 else 0
    avg_minor = total_minor / total_prompts if total_prompts > 0 else 0

    print(f"\nBatch Results Summary: {os.path.basename(file_path)}")
    print(f"{'='*60}")
    print(f"Total Prompts Processed: {total_prompts}")
    print(f"Syntax/Process Errors:   {syntax_errors}")
    print(f"{'-'*40}")
    print(f"Fatal Errors:   {total_fatal:<10} (Mean: {avg_fatal:.2f})")
    print(f"Major Errors:   {total_major:<10} (Mean: {avg_major:.2f})")
    print(f"Minor Errors:   {total_minor:<10} (Mean: {avg_minor:.2f})")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Count error types in batch results JSON.")
    parser.add_argument("file", type=str, help="Path to the JSON results file.")
    args = parser.parse_args()

    count_errors(args.file)
