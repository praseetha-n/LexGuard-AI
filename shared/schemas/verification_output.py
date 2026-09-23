from pydantic import BaseModel
from typing import List


class VerifiedClaim(BaseModel):
    claim: str
    supported: bool
    supporting_document_id: str | None = None


class FinalResponse(BaseModel):
    query: str
    answer: str
    verified_claims: List[VerifiedClaim]
    evidence_sufficient: bool
    conflicting_sources: bool
    warning: str | None = None
