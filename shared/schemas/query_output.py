from pydantic import BaseModel
from typing import List


class QueryOutput(BaseModel):
    query: str
    legal_area: str
    keywords: List[str]