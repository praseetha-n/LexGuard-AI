from pathlib import Path
import json

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


PROJECT_ROOT = Path(__file__).resolve().parents[3]

CHUNKS_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "chunks"
    / "legal_chunks.json"
)


class SemanticRetriever:

    def __init__(self):

        # Load legal chunks
        with open(
            CHUNKS_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            self.documents = json.load(f)

        # Load embedding model
        print("Loading semantic model...")

        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        # Create embeddings for all passages
        print(
            f"Creating embeddings for "
            f"{len(self.documents)} chunks..."
        )

        passages = [
            document["passage"]
            for document in self.documents
        ]

        self.embeddings = self.model.encode(
            passages,
            convert_to_numpy=True
        )

        print(
            f"Semantic index loaded: "
            f"{len(self.documents)} chunks"
        )

    def search(
        self,
        query: str,
        top_k: int = 5
    ):

        # Convert query into an embedding
        query_embedding = self.model.encode(
            [query],
            convert_to_numpy=True
        )

        # Calculate similarity between query
        # and every legal chunk
        scores = cosine_similarity(
            query_embedding,
            self.embeddings
        )[0]

        # Rank highest similarity first
        ranked_indices = sorted(
            range(len(scores)),
            key=lambda i: scores[i],
            reverse=True
        )

        results = []

        for index in ranked_indices[:top_k]:

            document = self.documents[index]

            results.append(
                {
                    "document_id": document["document_id"],
                    "title": document["title"],
                    "passage": document["passage"],
                    "score": float(scores[index])
                }
            )

        return results