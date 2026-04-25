"""Government scheme schema."""
from typing import Optional
from pydantic import BaseModel


class Scheme(BaseModel):
    name: str
    description: str
    link: Optional[str] = None
    state: Optional[str] = None
    eligibility: Optional[str] = None
