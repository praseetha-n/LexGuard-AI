from fastapi import APIRouter

from shared.schemas.query_output import QueryOutput
from shared.schemas.retrieval_output import (
    RetrievalOutput,
    RetrievedDocument
)

from agents.retrieval_agent.app.hybrid_retriever import HybridRetriever


router = APIRouter()

retriever = HybridRetriever()


@router.post("/process", response_model=RetrievalOutput)
def process_query(request: QueryOutput):

    # Combine the query with keywords from the Query Agent.
    # legal_area is kept as part of the request contract and
    # can be used for filtering/ranking later if required.
    retrieval_query = request.query

    if request.keywords:
        retrieval_query += " " + " ".join(request.keywords)

    results = retriever.search(
        retrieval_query,
        top_k=5
    )

    documents = [
        RetrievedDocument(
            document_id=result["document_id"],
            title=result["title"],
            passage=result["passage"],
            score=result["score"]
        )
        for result in results
    ]

    return RetrievalOutput(
        query=request.query,
        documents=documents
    )