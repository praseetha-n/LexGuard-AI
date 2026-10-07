from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


# --------------------------------------------------
# Input schemas
# --------------------------------------------------

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


# --------------------------------------------------
# Output schemas
# --------------------------------------------------

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


# --------------------------------------------------
# Verification logic
# --------------------------------------------------

@router.post("/verify")
def verify_answer(request: VerifyRequest):

    # Create a lookup dictionary so documents can be
    # accessed quickly using their document_id.
    doc_lookup = {
        doc.document_id: doc
        for doc in request.retrieved_documents
    }

    verified_claims = []

    # --------------------------------------------------
    # 1. Verify each citation against retrieved evidence
    # --------------------------------------------------

    for citation in request.citations:

        matching_doc = doc_lookup.get(citation.document_id)

        if matching_doc is None:
            supported = False
        else:
            cited_text = citation.passage.lower().strip()
            evidence_text = matching_doc.passage.lower().strip()

            supported = (
                cited_text in evidence_text
                or evidence_text in cited_text
            )

        verified_claims.append(
            VerifiedClaim(
                claim=citation.passage,
                supported=supported,
                supporting_document_id=(
                    citation.document_id
                    if supported
                    else None
                )
            )
        )

    # --------------------------------------------------
    # 2. Check whether all claims are supported
    # --------------------------------------------------

    all_supported = (
        len(verified_claims) > 0
        and all(
            claim.supported
            for claim in verified_claims
        )
    )

    # Evidence is sufficient only when:
    # - retrieved documents exist
    # - citations exist
    # - all citations are supported

    evidence_sufficient = (
        len(request.retrieved_documents) > 0
        and len(request.citations) > 0
        and all_supported
    )

    # --------------------------------------------------
    # 3. Basic conflicting-source detection
    # --------------------------------------------------

    conflicting_sources = False

    # Look for very simple contradiction indicators.
    # This is a lightweight rule-based check and does
    # not claim to understand legal meaning completely.

    contradiction_pairs = [
        ("shall", "shall not"),
        ("may", "may not"),
        ("allowed", "prohibited"),
        ("permitted", "not permitted"),
        ("required", "not required"),
        ("must", "must not"),
    ]

    evidence_texts = [
        doc.passage.lower()
        for doc in request.retrieved_documents
    ]

    for positive, negative in contradiction_pairs:

        has_positive = any(
            positive in text
            for text in evidence_texts
        )

        has_negative = any(
            negative in text
            for text in evidence_texts
        )

        if has_positive and has_negative:
            conflicting_sources = True
            break

    # --------------------------------------------------
    # 4. Generate warning
    # --------------------------------------------------

    warning = None

    if not evidence_sufficient:

        warning = (
            "Some claims in this answer could not be "
            "fully verified against the available evidence. "
            "Please treat this as general information, "
            "not confirmed legal advice."
        )

    elif conflicting_sources:

        warning = (
            "The retrieved sources may contain conflicting "
            "information. Please review the cited legal "
            "sources before relying on this information."
        )

    # --------------------------------------------------
    # 5. Return final verification result
    # --------------------------------------------------

    return FinalResponse(
        query=request.query,
        answer=request.answer,
        verified_claims=verified_claims,
        evidence_sufficient=evidence_sufficient,
        conflicting_sources=conflicting_sources,
        warning=warning
    )