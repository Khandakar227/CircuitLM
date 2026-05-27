from typing import Dict, Any, List
from src.erc.graph import CircuitGraph
from pydantic import BaseModel
from src.erc.checkers import get_default_registry, ERCIssue

class ERCSummary(BaseModel):
    failure_count: int = 0
    fatal_errors: List[str] = []
    major_errors: List[str] = []
    minor_errors: List[str] = []
    warnings: List[str] = []
    verdict: str = "Deterministic Check Passed."
    
    def add_issue(self, issue: ERCIssue):
        self.failure_count += 1
        msg = issue.to_string()
        if issue.severity == "fatal_error":
            self.fatal_errors.append(msg)
            self.verdict = "Deterministic Check Failed: FATAL Errors Found."
        elif issue.severity == "major_error":
             self.major_errors.append(msg)
             if "FATAL" not in self.verdict:
                 self.verdict = "Deterministic Check Failed: MAJOR Errors Found."
        elif issue.severity == "minor_error":
             self.minor_errors.append(msg)
        elif issue.severity == "warning":
             self.warnings.append(msg)

def run_deterministic_erc(circuit_json: Dict[str, Any]) -> ERCSummary:
    """
    Takes a generated CircuitJson dictionary, builds the component graph,
    and runs deterministic rules against the physical hardware constraints.
    """
    summary = ERCSummary()
    
    try:
        if not isinstance(circuit_json, dict):
             raise ValueError(f"circuit_json must be a dictionary, got {type(circuit_json)}")
             
        # 1. Build mathematical graph
        graph = CircuitGraph(circuit_json)
        
        # 2. Run modular checkers via registry
        registry = get_default_registry()
        issues = registry.run_all(graph)
        
        # 3. Aggregate results
        for issue in issues:
            summary.add_issue(issue)
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        summary.add_issue(ERCIssue(severity="fatal_error", message=f"Deterministic ERC Engine crashed: {str(e)}"))
        
    return summary
