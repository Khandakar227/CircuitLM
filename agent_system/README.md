# CircuitLM - Automated Circuit Generation Pipeline

This project is a structured, scalable implementation of the CircuitLM pipeline. It uses LLMs (via OpenRouter) and vector search (ChromaDB) to generate schematic-ready circuit designs from high-level user prompts.

## Project Structure

```text
code/
├── src/
│   ├── data/
│   │   └── component_library.py   # Central component definition data
│   ├── database/
│   │   ├── chroma_store.py      # ChromaDB interaction logic
│   │   └── embeddings.py        # SentenceTransformer embedding logic
│   ├── models/
│   │   └── llm.py               # OpenRouter LLM client
│   ├── prompts/
│   │   └── system_prompts.py    # Standardized system prompts
│   ├── schemas/
│   │   └── circuit.py           # Pydantic data models
│   ├── utils/
│   │   ├── fuzzy.py             # Fuzzy string matching utilities
│   │   └── parser.py            # JSON extraction and parsing utilities
│   ├── orchestrator.py          # Core generation pipeline logic
│   └── main.py                  # CLI entry point
├── scripts/
│   └── init_db.py               # Database initialization script
├── .env.example                 # Environment variable template
├── requirements.txt             # Project dependencies
└── README.md                    # Project documentation
```

## Setup

1.  **Clone the environment template**:
    ```bash
    cp .env.example .env
    ```
    Fill in your API keys in the `.env` file.

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Initialize the component database**:
    ```bash
    python -m scripts.init_db
    ```

## Usage

Generate a circuit from a prompt:

```bash
python -m src.main "Create a simple motor controller using arduino"
```

Options:
- `--output`: Path to save the generated JSON (default: `output.json`)
- `--eval`: Flag to include an AI-driven evaluation of the generated circuit.

## Features

- **Modular Design**: Separates concerns across dedicated modules for easier maintenance and testing.
- **Type Safety**: Uses Pydantic schemas for structured data validation.
- **Hybrid Matching**: Combines vector search (ChromaDB) with fuzzy string matching to accurately map LLM-suggested components to the local library.
- **Robust Parsing**: Includes advanced JSON extraction logic to handle various LLM response formats.
- **Integrated Evaluation**: Includes a multi-dimensional evaluation rubric to audit generated designs for correctness.
- **Local Model Caching**: Configured to store Hugging Face models within the project's `.cache` directory, keeping the environment self-contained.
