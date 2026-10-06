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
    doc_lookup = {doc.document_id: doc for doc in request.retrieved_documents}

    verified_claims = []
    for citation in request.citations:
        matching_doc = doc_lookup.get(citation.document_id)

        if matching_doc is None:
            # cited a document that wasn't actually retrieved — unsupported
            supported = False
        else:
            # simple check: does the cited passage text roughly appear
            # in the real retrieved passage?
            cited_text = citation.passage.lower().strip()
            real_text = matching_doc.passage.lower().strip()
            supported = cited_text in real_text or real_text in cited_text

        verified_claims.append(
            VerifiedClaim(
                claim=citation.passage,
                supported=supported,
                supporting_document_id=citation.document_id if supported else None
            )
        )

    all_supported = all(c.supported for c in verified_claims) if verified_claims else False
    evidence_sufficient = len(request.retrieved_documents) > 0 and all_supported

    warning = None
    if not evidence_sufficient:
        warning = "Some claims in this answer could not be fully verified against the available evidence. Please treat this as general information, not confirmed legal advice."

    return FinalResponse(
        query=request.query,
        answer=request.answer,
        verified_claims=verified_claims,
        evidence_sufficient=evidence_sufficient,
        conflicting_sources=False,  # we'll tackle this separately, it's genuinely harder
        warning=warning
    )