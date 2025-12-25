from pydantic import BaseModel
from typing import List, Optional

# --- Sub-Models ---
class ShapValue(BaseModel):
    feature: str
    value: float

class Entity(BaseModel):
    text: str
    type: str

class NLPAnalysis(BaseModel):
    summary: str
    entities: List[Entity]
    sentiment: str

# --- Main Response Model ---
class PredictionResult(BaseModel):
    riskScore: int
    riskLevel: str
    readmissionProbability: int
    modelConfidence: float
    contributingFactors: List[str]
    suggestedInterventions: List[str]
    
    # CRITICAL: This definition allows the data to pass through to the frontend
    shapValues: List[ShapValue] 
    
    nlpAnalysis: NLPAnalysis