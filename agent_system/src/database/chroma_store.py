import chromadb
from src.config import Config
from typing import List, Dict, Any, Optional

class ComponentStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=Config.CHROMA_PERSISTENT_PATH)
        self.collection = self.client.get_or_create_collection(name=Config.COLLECTION_NAME)

    def upsert_components(self, ids: List[str], documents: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]]):
        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def query(self, query_embeddings: List[List[float]], n_results: int = 1) -> Dict[str, Any]:
        return self.collection.query(
            query_embeddings=query_embeddings,
            n_results=n_results
        )

    def search_components(self, components: List[str], embedding_manager: Any) -> Dict[str, Any]:
        results_map = {}
        for comp in components:
            query_emb = embedding_manager.encode([comp])
            results = self.query(query_embeddings=query_emb, n_results=1)
            
            if results["documents"] and results["distances"]:
                for dist, meta in zip(results["distances"][0], results['metadatas'][0]):
                    # Check distance threshold
                    if dist < Config.DISTANCE_THRESHOLD:
                        results_map[meta['key']] = meta
        return results_map

    def delete_collection(self):
        self.client.delete_collection(name=Config.COLLECTION_NAME)
