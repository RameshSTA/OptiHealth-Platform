from fastapi import APIRouter
from app.schemas.governance import GovernanceOverview, PipelineNode, DqRule
from app.services.governance_engine import governance_engine
from typing import List

router = APIRouter()

@router.get("/pipeline", response_model=List[PipelineNode])
def get_pipeline():
    return governance_engine.get_pipeline_topology()

@router.get("/rules", response_model=List[DqRule])
def get_rules():
    return governance_engine.get_dq_rules()

@router.get("/drift")
def get_drift():
    return governance_engine.get_drift_report()