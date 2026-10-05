import sys
from pathlib import Path

RETRIEVAL_AGENT = Path(__file__).resolve().parents[1]

sys.path.insert(
    0,
    str(RETRIEVAL_AGENT)
)

from app.retriever import BM25Retriever


def main():

    retriever = BM25Retriever()

    query =  query = "Does an employer need the Commissioner's approval to terminate a workman?"
    results = retriever.search(
        query,
        top_k=5
    )

    print("\n==============================")
    print("BM25 SEARCH RESULTS")
    print("==============================")

    for i, result in enumerate(results, start=1):

        print(f"\nResult {i}")
        print("------------------------------")

        print("Document ID:")
        print(result["document_id"])

        print("\nTitle:")
        print(result["title"])

        print("\nScore:")
        print(result["score"])

        print("\nPassage:")
        print(result["passage"][:500])

        print("\n")


if __name__ == "__main__":
    main()