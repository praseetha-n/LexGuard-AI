import sys
from pathlib import Path

RETRIEVAL_AGENT = Path(__file__).resolve().parents[1]

sys.path.insert(
    0,
    str(RETRIEVAL_AGENT)
)

from app.hybrid_retriever import HybridRetriever


def main():

    retriever = HybridRetriever()

    query = (
         "What are the requirements for terminating scheduled employment?"
    )

    results = retriever.search(
        query,
        top_k=5
    )

    print("\n==============================")
    print("HYBRID SEARCH RESULTS")
    print("==============================")

    for i, result in enumerate(results, start=1):

        print(f"\nResult {i}")
        print("------------------------------")

        print("Document ID:")
        print(result["document_id"])

        print("\nTitle:")
        print(result["title"])

        print("\nBM25 Score:")
        print(result["bm25_score"])

        print("\nSemantic Score:")
        print(result["semantic_score"])

        print("\nHybrid Score:")
        print(result["score"])

        print("\nPassage:")
        print(result["passage"][:1000])

        print("\n")


if __name__ == "__main__":
    main()