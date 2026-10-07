from fastapi import APIRouter
from pydantic import BaseModel

from shared.schemas.query_output import QueryOutput


router = APIRouter()


class QueryRequest(BaseModel):
    query: str


@router.post("/analyze", response_model=QueryOutput)
def analyze_query(request: QueryRequest):
    return QueryOutput(
        query=request.query,
        legal_area="termination",
        keywords=["employer", "termination", "notice"]
    )