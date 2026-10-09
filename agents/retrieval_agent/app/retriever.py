from pathlib import Path
import json
import re

from rank_bm25 import BM25Okapi


PROJECT_ROOT = Path(__file__).resolve().parents[3]

CHUNKS_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "chunks"
    / "legal_chunks.json"
)


class BM25Retriever:

    def __init__(self):

        with open(
            CHUNKS_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            self.documents = json.load(f)

        self.tokenized_documents = [
            self.tokenize(
                document["title"] + " " + document["passage"]
            )
            for document in self.documents
        ]

        self.bm25 = BM25Okapi(
            self.tokenized_documents
        )

        print(
            f"BM25 index loaded: "
            f"{len(self.documents)} chunks"
        )

    @staticmethod
    def tokenize(text: str):

        text = text.lower()

        return re.findall(
            r"\b\w+\b",
            text
        )

    def search(
        self,
        query: str,
        top_k: int = 5
    ):

        query_tokens = self.tokenize(query)

        scores = self.bm25.get_scores(
            query_tokens
        )

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