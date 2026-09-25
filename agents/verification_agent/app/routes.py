from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


# ---- Input: what this agent receives ----

class Citation(BaseModel):
    document_id: str
    passage: str


class RetrievedDocument(BaseModel):
    document_id: str
    title: str
    passage: str
    score: float


class VerifyRequest(BaseModel):
    query: str
    answer: str
    citations: List[Citation]
    retrieved_documents: List[RetrievedDocument]


# ---- Output: what this agent must return ----

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
    # STILL STUB LOGIC — but now receiving REAL-shaped input
    # (real citations + real retrieved documents).
    # Real checking logic comes in Phase C.

    verified_claims = [
        VerifiedClaim(
            claim=request.answer,
            supported=True,
            supporting_document_id=request.citations[0].document_id if request.citations else None
        )
    ]

    return FinalResponse(
        query=request.query,
        answer=request.answer,
        verified_claims=verified_claims,
        evidence_sufficient=len(request.retrieved_documents) > 0,
        conflicting_sources=False,
        warning=None
    )