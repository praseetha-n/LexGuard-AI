from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class VerifyRequest(BaseModel):
    query: str
    answer: str


class VerifiedClaim(BaseModel):
    claim: str
    supported: bool
    supporting_document_id: Optional[str] = None


class FinalResponse(BaseModel):
    query: str
    answer: str
    verified_claims: List[VerifiedClaim]
    evidence_sufficient: bool
    conflicting_sources: bool
    warning: Optional[str] = None


@router.post("/verify")
def verify_answer(request: VerifyRequest):
    # STUB VERSION — hardcoded fake response, just to prove the endpoint works
    # and matches the FinalResponse contract. Real verification logic comes next.
    return FinalResponse(
        query=request.query,
        answer=request.answer,
        verified_claims=[
            VerifiedClaim(
                claim="Employers must give notice before termination.",
                supported=True,
                supporting_document_id="tewa_1971_s2"
            )
        ],
        evidence_sufficient=True,
        conflicting_sources=False,
        warning=None
    )