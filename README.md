# CircuitLM: Multi-Agent LLM-Aided Circuit Design Framework

<div align="center">

[![arXiv](https://img.shields.io/badge/arXiv-2601.04505-b31b1b.svg)](https://arxiv.org/abs/2601.04505)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4+-000000.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## Overview

**CircuitLM** is a multi-agent LLM-aided design framework that generates circuit schematics from natural language prompts. The system combines Large Language Models (LLMs), vector search (ChromaDB), and fuzzy matching to produce schematic-ready circuit designs that can be directly visualized and validated.

This implementation provides both:
- **Backend Generation System**: Multi-agent pipeline for circuit design generation
- **Interactive Visualizer**: Web-based interface for circuit visualization and editing

---

## Project Status

This repository is **actively maintained** and will evolve into a general-purpose tool — we may frequently add components, prompts, and pipeline improvements. Contributions are welcome.

### TODO

- [ ] **Human-in-the-loop review** — approve, flag, or correct generated circuits before use
- [ ] **In-editor circuit fixing** — tools to repair a generated schematic directly in the visualizer
- [ ] **Closed-loop LLM evaluation** — feed evaluator findings back to automatically fix the schema
- [ ] **Netlist generation** — export CircuitJSON to a standard netlist format
- **Extend Components Library** - Add more components to the component library.
---

## Paper & Citation

**Paper**: [CircuitLM: A Multi-Agent LLM-Aided Design Framework for Generating Circuit Schematics from Natural Language Prompts](https://arxiv.org/abs/2601.04505)

**Authors**: Khandakar Shakib Al Hasan, Syed Rifat Raiyan, Hasin Mahtab Alvee, Wahid Sadik

If you use this work, please cite:

```bibtex
@misc{hasan2026circuitlmmultiagentllmaideddesign,
      title={CircuitLM: A Multi-Agent LLM-Aided Design Framework for Generating Circuit Schematics from Natural Language Prompts}, 
      author={Khandakar Shakib Al Hasan and Syed Rifat Raiyan and Hasin Mahtab Alvee and Wahid Sadik},
      year={2026},
      eprint={2601.04505},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2601.04505}, 
}
```

---

## Structure

```
circuitlm/
├── agent_system/              # Backend circuit generation pipeline
│   ├── src/
│   │   ├── data/              # Component library definitions
│   │   ├── database/          # ChromaDB vector store
│   │   ├── erc/               # Deterministic ERC engine (rule-based checks)
│   │   ├── models/            # LLM client (OpenRouter / Replicate)
│   │   ├── prompts/           # System prompts for agents
│   │   ├── schemas/           # Pydantic data models
│   │   ├── utils/             # Parsing and fuzzy matching
│   │   ├── config.py          # Model registry, API keys, thresholds
│   │   ├── orchestrator.py    # Multi-agent pipeline orchestrator
│   │   ├── zeroshot*.py       # Zero-shot / CoT baseline runners
│   │   ├── main.py            # CLI interface
│   │   └── server.py          # FastAPI REST API server
│   ├── scripts/               # DB init, batch runs, evaluation & reports
│   │   └── init_db.py         # Database initialization
│   ├── requirements.txt
│   └── README.md
│
└── visualizer/                # Interactive web-based visualizer
    ├── src/
    │   ├── app/               # Next.js app routes
    │   ├── components/        # React components & circuit elements
    │   ├── lib/               # Utilities
    │   └── types/             # TypeScript type definitions
    ├── public/                # Static assets
    ├── package.json
    └── README.md
```

---

## Quick Start

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 18.x or higher (for visualizer)
- **npm** or **yarn** package manager

---

## Part 1: Circuit Generation System

We implemented the multi-agent pipeline described in the paper, using LLMs to generate circuit designs from natural language descriptions.

### 1.1 Installation

Navigate to the agent system directory:

```bash
cd agent_system
```

Create and activate a virtual environment (recommended):

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 1.2 Configuration

Create environment file from template:

```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# API Keys
OPEN_ROUTER_API_KEY=your_open_router_api_key
REPLICATE_API_KEY=your_replicate_api_key

# Provider: "openrouter" (default) or "replicate"
LLM_PROVIDER=openrouter

# Optional Overrides
# CHROMA_PERSISTENT_PATH=components_store
# COLLECTION_NAME=components
# EMBEDDING_MODEL_NAME=Qwen/Qwen3-Embedding-0.6B
# HF_HOME=.cache/huggingface
```

> **Note**: 
> 1. `LLM_PROVIDER` selects the backend — only the matching API key is required.
> 2. Get your OpenRouter API key from [openrouter.ai](https://openrouter.ai/)
> 3. Get your Replicate API key from [replicate.com](https://replicate.com/)

### 1.3 Initialize Component Database

Initialize the ChromaDB vector store with the component library:

```bash
python -m scripts.init_db
```

This creates a local vector database of electronic components for semantic matching.

### 1.4 Usage

#### CLI Interface

Generate circuits using the command-line interface:

**Basic usage:**
```bash
python -m src.main "Create a simple LED circuit with Arduino"
```

**With custom output path:**
```bash
python -m src.main "Build a motor controller" --output circuits/motor.json
```

**With evaluation enabled:**
```bash
python -m src.main "Design an IR sensor circuit" --eval
```

**With chain-of-thought reasoning:**
```bash
python -m src.main "Create a temperature monitor" --cot
```

**Full parameter list:**
```bash
python -m src.main --help
```

**Parameters:**
- `prompt` (required): Natural language circuit description
- `--output`: Output JSON file path (default: `output/output_<timestamp>.json`)
- `--eval`: Include multi-dimensional evaluation (default: `False`)
- `--cot`: Enable chain-of-thought reasoning (default: `False`)
- `--model_id`: LLM model to use (default: `deepseek`, available models are: `qwen`, `grok`, `gemini`, `gpt`, `llama`, `claude`)


If you want to use different llm model. add the model id in `agent_system/src/config.py` with generic name as key and the model id (available at OpenRouter) as value at:
```py
    LLM_MODELS = {
        "deepseek": "deepseek/deepseek-chat-v3.1",
        "qwen": "qwen/qwen3-235b-a22b-2507",
        "grok": "x-ai/grok-code-fast-1",
        "gemini": "google/gemini-2.5-flash",
        "gpt": "openai/gpt-5-mini",
        "llama": "meta-llama/llama-3.3-70b-instruct",
        "claude": "anthropic/claude-sonnet-4.5:floor"
    }
```

If you want to use replicate, use the following model id:
```py
    REPLICATE_MODELS = {
        "deepseek": "deepseek-ai/deepseek-v3.1",
        "qwen": "qwen/qwen3-235b-a22b-instruct-2507",
        "grok": "xai/grok-4",
        "gemini": "google/gemini-2.5-flash",
        "gpt": "openai/gpt-5-mini",
        "llama": "meta/meta-llama-3-70b-instruct",
        "claude": "anthropic/claude-4.5-sonnet"
    }
```

**Example output:**
```json
{
  "user_prompt": "Create a simple LED circuit with Arduino",
  "reasoning": "...",
  "components": [...],
  "schematic": {
    "parts": [
      {"id": "U1", "type": "arduino-uno", "left": 100, "top": 100},
      {"id": "LED1", "type": "led", "left": 300, "top": 150}
    ],
    "connections": [
      ["U1:D13", "LED1:+", "red", []],
      ["LED1:-", "U1:GND", "black", []]
    ]
  }
}
```

#### REST API Server

To use it with the visualizer you would need to start the FastAPI server:

**Start server:**
```bash
python -m src.server
```

**Custom host/port:**
```bash
python -m src.server --host 0.0.0.0 --port 8000
```

**Development mode (auto-reload):**
```bash
python -m src.server --reload
```


**Example API request:**

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple LED circuit with Arduino",
    "model_id": "deepseek",
    "cot": true,
    "eval": false
  }'
```

**Available endpoints:**
- `POST /generate` - Generate circuit from prompt
- `GET /health` - Health check
- `GET /models` - List available LLM models
- `GET /components` - Return the full component library with pin definitions and specs
- `GET /generate/status` - Server status

---

## Part 2: Interactive Visualizer

The visualizer is a Next.js web application that provides an interactive interface for generating, visualizing, and editing circuit schematics. We used the browsers svg manipulation capabilities to render the circuit diagrams.

### 2.1 Installation

Navigate to the visualizer directory:

```bash
cd visualizer
```

Install dependencies:

```bash
npm install
# or
yarn install
```

### 2.2 Configuration

Create environment file:

```bash
# Windows
copy .env.example .env.local

# Linux/macOS
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Optional: Backend API URL (defaults to http://localhost:8000)
CIRCUIT_API_URL=http://localhost:8000
```

### 2.3 Running the Visualizer

**Development mode:**
```bash
npm run dev
```

The visualizer will be available at **http://localhost:3000**

**Production build:**
```bash
npm run build
npm run start
```

### 2.4 Using the Visualizer

1. **Start the backend server** (required):
   ```bash
   cd agent_system
   python -m src.server --port 8000
   ```

2. **Start the visualizer**:
   ```bash
   cd visualizer
   npm run dev
   ```

3. **Generate circuits**:
   - Navigate to http://localhost:3000
   - Enter a circuit description (e.g., "Create a simple LED circuit with Arduino")
   - Click "Generate"
   - View the generated circuit on the canvas

4. **Features**:
   - **Interactive Canvas**: Drag components to rearrange
   - **Wire Routing**: Multiple routing strategies (auto, L-shape, Z-shape, U-shape, direct)
   - **JSON Editor**: Edit circuit JSON directly with live preview
   - **Connection Table**: View and validate all circuit connections
   - **Visual Validation**: Real-time circuit visualization with component pins

---

## System Architecture

### Multi-Agent Pipeline

We implemented a multi-agent system as described in the paper:

1. **Reasoning Agent**: Analyzes user requirements and determines circuit functionality
2. **Component Agent**: Selects appropriate electronic components from the library
3. **Schematic Agent**: Generates the circuit schematic with proper connections
4. **Evaluation** (optional): A hybrid pass combining a deterministic rule-based ERC engine with an LLM-as-judge to validate the generated design

### Component Matching

CircuitLM uses a hybrid approach for component matching:
- **Vector Search**: Semantic similarity using ChromaDB and SentenceTransformers
- **Fuzzy Matching**: RapidFuzz for handling variations in component names
- **LLM-Guided Selection**: Final component selection with context awareness

### Visualization Pipeline

```
User Input → Next.js Frontend → API Route → Backend Server → LLM Pipeline
                                                                    ↓
                                                            Circuit JSON
                                                                    ↓
Frontend Canvas ← JSON Response ← API Route ← Backend Response
```

---

## Add new electrical components:
```bash
cd visualizer/src/components/electrical-components
# Add component SVG and pin definitions
```

---

## Features

### Agent System Features
- ✅ Multi-agent LLM pipeline for circuit generation
- ✅ Hybrid vector + fuzzy component matching
- ✅ Chain-of-thought reasoning support
- ✅ Multi-dimensional circuit evaluation
- ✅ REST API with automatic documentation
- ✅ Model-agnostic design (supports multiple LLMs)
- ✅ Local component library caching

### Visualizer Features
- ✅ Real-time circuit visualization
- ✅ Interactive component placement
- ✅ Smart wire routing with obstacle avoidance
- ✅ Live JSON editing with validation
- ✅ Connection table and pin mapping
- ✅ Export to various formats

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

- **OpenRouter and Replicate** for LLM API access
- **ChromaDB** for vector search capabilities
- **Wokwi and Fritzing** for electronic component SVG elements
- **Next.js** and **FastAPI** communities

---

## Contact

For questions or issues, please open an issue on GitHub or contact the authors through the paper.

---

## Related Links

- [Paper (arXiv)](https://arxiv.org/abs/2601.04505)
- [OpenRouter](https://openrouter.ai/)
- [Replicate](https://replicate.com/)
- [ChromaDB](https://www.trychroma.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
