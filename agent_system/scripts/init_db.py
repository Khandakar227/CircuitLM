from src.database.chroma_store import ComponentStore
from src.database.embeddings import EmbeddingManager
from src.data.component_library import COMPONENT_LIBRARY

def init_database():
    print("🚀 Initializing Component Database...")
    store = ComponentStore()
    store.delete_collection()
    embeddings = EmbeddingManager()

    ids = []
    documents = []
    texts_to_embed = []
    metadatas = []

    for key, data in COMPONENT_LIBRARY.items():
        # Prepare all searchable terms for this component
        search_terms = [
            key,
            *data.get("aliases", []),
            data.get("description", ""),
            data.get("category", ""),
            data.get("typical_usage", ""),
            ", ".join(data.get("compatible_with", [])),
            data.get("specs", "")
        ]
        
        # Filter out empty strings
        search_terms = [term for term in search_terms if term]
        
        combined_text = "\n".join(search_terms)
        
        # We'll store one main entry per component for now, 
        # but we could store multiple entries per component for better recall
        # if we wanted to mirror the notebook exactly.
        # Mirroring the notebook: it inserts multiple entries per component key.
        
        for term in search_terms:
            ids.append(f"{key}_{term.replace(' ', '_')[:30]}") # truncate to avoid very long ids
            documents.append(term)
            texts_to_embed.append(term)
            metadatas.append({
                "key": key,
                "pins": ",".join(data["pins"]),
                "width": data["width"],
                "height": data["height"],
            })

    print(f"Encoding {len(texts_to_embed)} search terms...")
    embedded_vectors = embeddings.encode(texts_to_embed)

    print("Upserting to ChromaDB...")
    store.upsert_components(
        ids=ids,
        documents=documents,
        embeddings=embedded_vectors,
        metadatas=metadatas
    )

    print("✅ Database Initialization Complete!")

if __name__ == "__main__":
    init_database()
