import json
import os
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
from matplotlib import rcParams

# Define specific files for each model
files = {
    "Deepseek v3.1": "output/batch_results_deepseek_cot_20251230_162641.json",
    "Gemini 2.5 Flash": "output/batch_results_gemini_cot_20260101_030231.json",
    "Llama-3.3 70b Instruct": "output/batch_results_llama_cot_20260101_160005.json",
    "Qwen-3 235B": "output/batch_results_qwen_cot_20251231_031859.json",
    "GPT-5 Mini": "output/batch_results_gpt_cot_20260103_131240.json",
    "Grok Fast": "output/batch_results_grok_cot_20260102_012400.json"
}

# ── Visual theme (paper-ready) ────────────────────────────────────────────────
MODEL_COLORS = {
    "Deepseek v3.1":          "#4C72B0",
    "Gemini 2.5 Flash":       "#DD8452",
    "Llama-3.3 70b Instruct": "#55A868",
    "Qwen-3 235B":            "#C44E52",
    "GPT-5 Mini":             "#8172B3",
    "Grok Fast":              "#937860",
}

MODEL_HATCHES = {
    "Deepseek v3.1":          "",
    "Gemini 2.5 Flash":       "//",
    "Llama-3.3 70b Instruct": "\\\\",
    "Qwen-3 235B":            "xx",
    "GPT-5 Mini":             "..",
    "Grok Fast":              "--",
}

def _apply_paper_theme():
    """Clean, minimal theme suitable for academic papers."""
    rcParams.update({
        "figure.facecolor":   "white",
        "axes.facecolor":     "white",
        "axes.edgecolor":     "#333333",
        "axes.labelcolor":    "black",
        "axes.titlepad":      8,
        "axes.linewidth":     0.8,
        "axes.grid":          False,
        "text.color":         "black",
        "xtick.color":        "black",
        "ytick.color":        "black",
        "xtick.direction":    "in",
        "ytick.direction":    "in",
        "xtick.major.width":  0.6,
        "ytick.major.width":  0.6,
        "legend.facecolor":   "white",
        "legend.edgecolor":   "#cccccc",
        "legend.framealpha":  1.0,
        "font.family":        "serif",
        "font.size":          10,
        "axes.spines.top":    False,
        "axes.spines.right":  False,
    })


# ── Data helpers (unchanged) ─────────────────────────────────────────────────
def resolve_path(path):
    if os.path.exists(path):
        return path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    clean_path = path.replace('./', '')
    abs_path = os.path.join(project_root, clean_path)
    if os.path.exists(abs_path):
        return abs_path
    return path

def extract_data(file_path):
    full_path = resolve_path(file_path)
    if not os.path.exists(full_path):
        print(f"Warning: File not found {full_path}")
        return [], []

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {full_path}: {e}")
        return [], []

    elec_scores = []
    lib_scores = []

    for prompt, result in data.items():
        eval_data = result.get('evaluation')
        if not eval_data:
            elec_scores.append(0)
            lib_scores.append(0)
            continue

        if eval_data.get('verdict') == "SYNTAX ERROR":
            elec_scores.append(0)
            lib_scores.append(0)
        else:
            elec_scores.append(eval_data.get('electrical_logic', {}).get('score', 0))
            lib_scores.append(eval_data.get('compliance', {}).get('score', 0))

    return elec_scores, lib_scores

def extract_scores_dict(file_path):
    full_path = resolve_path(file_path)
    if not os.path.exists(full_path):
        return {}

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return {}

    scores_dict = {}
    for prompt, result in data.items():
        eval_data = result.get('evaluation')
        if not eval_data:
            scores_dict[prompt] = {"electrical_score": 0, "library_compliance_score": 0}
            continue

        if eval_data.get('verdict') == "SYNTAX ERROR":
            scores_dict[prompt] = {"electrical_score": 0, "library_compliance_score": 0}
        else:
            scores_dict[prompt] = {
                "electrical_score": eval_data.get('electrical_logic', {}).get('score', 0),
                "library_compliance_score": eval_data.get('compliance', {}).get('score', 0)
            }

    return scores_dict

def export_compiled_json(output_filename):
    compiled_data = {}
    all_prompts = set()
    model_results = {}

    for model, path in files.items():
        results = extract_scores_dict(path)
        model_results[model] = results
        all_prompts.update(results.keys())

    for prompt in all_prompts:
        compiled_data[prompt] = {}
        for model in files.keys():
            scores = model_results[model].get(
                prompt, {"electrical_score": 0, "library_compliance_score": 0}
            )
            compiled_data[prompt][model] = scores

    os.makedirs(os.path.dirname(output_filename), exist_ok=True)
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(compiled_data, f, indent=4)
    print(f"Exported compiled scores to {output_filename}")


# ── Single-metric bar chart page (landscape) ─────────────────────────────────
def plot_score_histogram(metric_key, title, filename):
    """Create a landscape PDF for one metric.

    Layout: 2 rows × 3 cols of bar charts.
    X-axis = prompt number, Y-axis = score (0–10).

    Parameters
    ----------
    metric_key : str   – "electrical" or "compliance"
    title      : str   – figure super-title
    filename   : str   – output path
    """
    _apply_paper_theme()
    models = list(files.keys())

    fig, axes = plt.subplots(2, 3, figsize=(11, 5.5))

    for idx, model in enumerate(models):
        row, col = divmod(idx, 3)
        ax = axes[row][col]

        elec, lib = extract_data(files[model])
        scores = elec if metric_key == "electrical" else lib
        color = MODEL_COLORS[model]

        prompts = np.arange(1, len(scores) + 1)
        ax.bar(prompts, scores, color=color, edgecolor="none")

        ax.set_title(model, fontsize=9)
        ax.set_ylim(0, 10.5)
        ax.yaxis.set_major_locator(mticker.MultipleLocator(2))
        ax.tick_params(labelsize=7)

        if col == 0:
            ax.set_ylabel("Score", fontsize=8)
        if row == 1:
            ax.set_xlabel("Prompt Number", fontsize=8)

    fig.suptitle(title, fontsize=12, y=1.0)
    fig.tight_layout(rect=[0, 0, 1, 0.96])
    fig.savefig(filename, dpi=300, bbox_inches="tight")
    print(f"Saved → {filename}")
    plt.close(fig)


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    os.makedirs("output", exist_ok=True)

    plot_score_histogram(
        "electrical",
        "Electrical Logic Score",
        "output/prompt_plot_electrical.pdf",
    )
    plot_score_histogram(
        "compliance",
        "Library Compliance Score",
        "output/prompt_plot_library.pdf",
    )
    export_compiled_json("output/compiled_scores.json")

    print("\n✓ All histograms and compiled JSON exported.")
