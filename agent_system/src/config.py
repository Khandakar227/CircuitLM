import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # API Keys
    OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")
    REPLICATE_API_KEY = os.getenv("REPLICATE_API_KEY")
    
    # Provider toggle: "openrouter" or "replicate"
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openrouter").lower()

    # ChromaDB Configuration
    CHROMA_PERSISTENT_PATH = os.getenv("CHROMA_PERSISTENT_PATH", "components_store")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME", "components")
    
    # Hugging Face Cache
    # Default to a .cache folder in the project root to keep it contained
    HF_HOME = os.getenv("HF_HOME", os.path.join(os.getcwd(), ".cache", "huggingface"))
    
    # Model Selection
    EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "Qwen/Qwen3-Embedding-0.6B")

    # OpenRouter model identifiers
    LLM_MODELS = {
        "deepseek": "deepseek/deepseek-chat-v3.1",
        "qwen": "qwen/qwen3-235b-a22b-2507",
        "grok": "x-ai/grok-code-fast-1",
        "gemini": "google/gemini-2.5-flash",
        "gpt": "openai/gpt-5-mini",
        "llama": "meta-llama/llama-3.3-70b-instruct",
        "claude": "anthropic/claude-sonnet-4.5:floor"
    }

    # Replicate model identifiers (same short keys)
    REPLICATE_MODELS = {
        "deepseek": "deepseek-ai/deepseek-v3.1",
        "qwen": "qwen/qwen3-235b-a22b-instruct-2507",
        # "kimi": "moonshotai/kimi-k2.5",
        "grok": "xai/grok-4",
        "gemini": "google/gemini-2.5-flash",
        "gpt": "openai/gpt-5-mini",
        "llama": "meta/meta-llama-3-70b-instruct",
        "claude": "anthropic/claude-4.5-sonnet"
    }

    DEFAULT_LLM = "gpt"
    EVAL_LLM = "claude"
    
    # Search Thresholds
    FUZZY_THRESHOLD = 70
    DISTANCE_THRESHOLD = 0.9

