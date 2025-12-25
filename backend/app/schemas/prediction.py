from pydantic import BaseModel
from typing import List, Optional

class MLPredictionInput(BaseModel):
    age: int
    bmi: float
    systolicBp: int
    diastolicBp: int
    heartRate: int
    priorReadmissions: int
    hasDiabetes: bool
    hasHypertension: bool
    clinicalNotes: str

class ShapValue(BaseModel):
    feature: str
    value: float

class NlpEntity(BaseModel):
    text: str
    category: str
    sentiment: str

class NlpAnalysis(BaseModel):
    entities: List[NlpEntity]
    sentimentScore: float
    summary: str

class MLPredictionResult(BaseModel):
    readmissionProbability: float
    riskLevel: str
    contributingFactors: List[str]
    suggestedInterventions: List[str]
    shapValues: List[ShapValue]
    nlpAnalysis: NlpAnalysis
    modelConfidence: float