import os
from sentence_transformers import SentenceTransformer
from src.config import Config
from typing import List

class EmbeddingManager:
    def __init__(self, model_name: str = None):
        # Set the Hugging Face home directory before loading the model
        os.environ["HF_HOME"] = Config.HF_HOME
        os.makedirs(Config.HF_HOME, exist_ok=True)
        
        self.model_name = model_name or Config.EMBEDDING_MODEL_NAME
        # In a real environment, we'd handle device placement (CPU/GPU)
        self.model = SentenceTransformer(self.model_name, model_kwargs={"torch_dtype": "float16"})

    def encode(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts)
        return embeddings.tolist()
