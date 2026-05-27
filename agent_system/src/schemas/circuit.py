from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field

class Part(BaseModel):
    type: str
    id: str
    top: float
    left: float
    rotate: Optional[float] = None
    attrs: Dict[str, Any] = Field(default_factory=dict)

class CircuitJson(BaseModel):
    version: int
    author: Optional[str] = None
    editor: Optional[str] = None
    parts: List[Part]
    connections: List[Tuple[str, str, str, List[Any]]]

class SingleEvaluationResult(BaseModel):
    failure_count: int
    fatal_errors: List[str]
    major_errors: List[str]
    minor_errors: List[str]
    warnings: List[str]
    verdict: str

class EvaluationResult(BaseModel):
    deterministic_erc: SingleEvaluationResult
    llm_as_judge: SingleEvaluationResult
