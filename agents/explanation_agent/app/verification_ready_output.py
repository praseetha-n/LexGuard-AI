from typing import List

from pydantic import BaseModel

from shared.schemas.retrieval_output import RetrievedDocument
from shared.schemas.explanation_output import Citation


class VerificationReadyOutput(BaseModel):
    query: str
    answer: str
    citations: List[Citation]
    retrieved_documents: List[RetrievedDocument]