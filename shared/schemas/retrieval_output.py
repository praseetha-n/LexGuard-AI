from pydantic import BaseModel
from typing import List


class RetrievedDocument(BaseModel):
    document_id: str
    title: str
    passage: str
    score: float


class RetrievalOutput(BaseModel):
    query: str
    documents: List[RetrievedDocument]