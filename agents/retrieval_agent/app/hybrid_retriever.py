from .retriever import BM25Retriever
from .semantic_retriever import SemanticRetriever


class HybridRetriever:

    def __init__(
        self,
        bm25_weight: float = 0.5,
        semantic_weight: float = 0.5
    ):
        self.bm25_weight = bm25_weight
        self.semantic_weight = semantic_weight

        print("Loading BM25 retriever...")
        self.bm25 = BM25Retriever()

        print("Loading semantic retriever...")
        self.semantic = SemanticRetriever()

    @staticmethod
    def normalize_scores(results, score_key):
        """
        Normalize scores to the range 0-1 using min-max normalization.
        """
        if not results:
            return results

        scores = [
            result[score_key]
            for result in results
        ]

        min_score = min(scores)
        max_score = max(scores)

        # Avoid division by zero
        if max_score == min_score:
            for result in results:
                result[f"normalized_{score_key}"] = 1.0
            return results

        for result in results:
            result[f"normalized_{score_key}"] = (
                (result[score_key] - min_score)
                / (max_score - min_score)
            )

        return results

    def search(
        self,
        query: str,
        top_k: int = 5
    ):

        # Get results from both retrievers
        candidate_k = max(top_k * 2, 10)

        bm25_results = self.bm25.search(
            query,
            top_k=candidate_k
        )

        semantic_results = self.semantic.search(
            query,
            top_k=candidate_k
        )

        # Normalize BM25 scores
        bm25_results = self.normalize_scores(
            bm25_results,
            "score"
        )

        # Normalize semantic scores
        semantic_results = self.normalize_scores(
            semantic_results,
            "score"
        )

        # Store combined results
        combined = {}

        # Add BM25 results
        for result in bm25_results:

            chunk_id = (
                result["document_id"],
                result["passage"]
            )

            combined[chunk_id] = {
                "document_id": result["document_id"],
                "title": result["title"],
                "passage": result["passage"],
                "bm25_score": result["score"],
                "semantic_score": 0.0,
                "normalized_bm25_score":
                    result["normalized_score"],
                "normalized_semantic_score": 0.0,
            }

        # Add semantic results
        for result in semantic_results:

            chunk_id = (
                result["document_id"],
                result["passage"]
            )

            if chunk_id not in combined:

                combined[chunk_id] = {
                    "document_id": result["document_id"],
                    "title": result["title"],
                    "passage": result["passage"],
                    "bm25_score": 0.0,
                    "semantic_score": result["score"],
                    "normalized_bm25_score": 0.0,
                    "normalized_semantic_score":
                        result["normalized_score"],
                }

            else:

                combined[chunk_id]["semantic_score"] = result["score"]

                combined[chunk_id][
                    "normalized_semantic_score"
                ] = result["normalized_score"]

        # Calculate normalized hybrid score
        results = []

        for result in combined.values():

            hybrid_score = (
                self.bm25_weight
                * result["normalized_bm25_score"]
                +
                self.semantic_weight
                * result["normalized_semantic_score"]
            )

            result["score"] = hybrid_score

            results.append(result)

        # Sort by hybrid score
        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        return results[:top_k]