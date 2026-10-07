from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, field_validator

from agents.query_agent.app.analyzer import process_query
from shared.schemas.query_output import QueryOutput


router = APIRouter()


class QueryRequest(BaseModel):
    query: str

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        """
        Validates that the input query is a non-empty string and trims whitespace.
        Raises ValueError if query is empty or whitespace-only.
        """
        if not isinstance(v, str):
            raise ValueError("Query must be a string.")
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Query must not be empty or contain only whitespace.")
        return cleaned


@router.post("/analyze", response_model=QueryOutput)
def analyze_query(request: QueryRequest) -> QueryOutput:
    """
    Analyzes an incoming natural language employment-law query,
    determines the primary legal area, and extracts structured search keywords.
    """
    try:
        return process_query(request.query)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )