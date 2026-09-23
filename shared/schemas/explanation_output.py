from pydantic import BaseModel
from typing import List


class Citation(BaseModel):
    document_id: str
    passage: str


class ExplanationOutput(BaseModel):
    query: str
    answer: str
    citations: List[Citation]