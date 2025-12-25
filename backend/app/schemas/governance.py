from pydantic import BaseModel
from typing import List, Optional, Any

# --- PIPELINE TOPOLOGY ---
class NodeMetrics(BaseModel):
    latency: str
    throughput: str
    errorRate: str
    uptime: str

class PipelineNode(BaseModel):
    id: str
    label: str
    type: str  # batch, stream, store, model
    status: str # healthy, warning, error
    metrics: NodeMetrics
    techStack: str
    description: str
    lastIncident: Optional[str] = None

# --- DATA QUALITY ---
class FailedRow(BaseModel):
    id: str
    reason: str

class DqRule(BaseModel):
    id: str
    asset: str
    column: str
    ruleName: str
    ruleType: str # Completeness, Uniqueness, etc.
    status: str # pass, fail, warning
    passRate: float
    threshold: float
    description: str
    sqlLogic: str
    failedRows: List[FailedRow] = []

# --- DATA DRIFT ---
class DriftBin(BaseModel):
    x: str
    y: int

class DriftReport(BaseModel):
    feature: str
    score: float
    status: str
    threshold: float
    training: List[DriftBin]
    serving: List[DriftBin]

# --- MAIN RESPONSE ---
class GovernanceOverview(BaseModel):
    pipeline: List[PipelineNode]
    dq_rules: List[DqRule]
    drift: DriftReport