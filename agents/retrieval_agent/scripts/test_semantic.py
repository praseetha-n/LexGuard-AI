import sys
from pathlib import Path

RETRIEVAL_AGENT = Path(__file__).resolve().parents[1]

sys.path.insert(
    0,
    str(RETRIEVAL_AGENT)
)

from app.semantic_retriever import SemanticRetriever


def main():

    retriever = SemanticRetriever()

    query = (
        "What approval is required before an employer "
        "terminates a workman?"
    )

    results = retriever.search(
        query,
        top_k=5
    )

    print("\n==============================")
    print("SEMANTIC SEARCH RESULTS")
    print("==============================")

    for i, result in enumerate(results, start=1):

        print(f"\nResult {i}")
        print("------------------------------")

        print("Document ID:")
        print(result["document_id"])

        print("\nTitle:")
        print(result["title"])

        print("\nSimilarity Score:")
        print(result["score"])

        print("\nPassage:")
        print(result["passage"][:1000])

        print("\n")


if __name__ == "__main__":
    main()