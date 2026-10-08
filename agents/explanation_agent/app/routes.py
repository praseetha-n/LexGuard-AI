from fastapi import APIRouter, HTTPException

from shared.schemas.retrieval_output import RetrievalOutput
from shared.schemas.explanation_output import ExplanationOutput

from agents.explanation_agent.app.explainer import generate_explanation

from agents.explanation_agent.app.verification_ready_output import (
    VerificationReadyOutput
)


router = APIRouter()


@router.post(
    "/process",
    response_model=ExplanationOutput
)
def process_retrieval(
    request: RetrievalOutput
) -> ExplanationOutput:

    try:
        return generate_explanation(request)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Explanation generation failed: {str(error)}"
        )


@router.post(
    "/process-for-verification",
    response_model=VerificationReadyOutput
)
def process_for_verification(
    request: RetrievalOutput
) -> VerificationReadyOutput:

    try:
        explanation = generate_explanation(request)

        return VerificationReadyOutput(
            query=explanation.query,
            answer=explanation.answer,
            citations=explanation.citations,
            retrieved_documents=request.documents
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Explanation generation failed: {str(error)}"
        )