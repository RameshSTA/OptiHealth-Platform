from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import joblib
import pandas as pd
import numpy as np
import os
import logging
import re

from app.api import deps
# Import the new training script we just created
from app.ml.train import train_census_model 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# --- PATHS ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
# Risk Model (Existing)
RISK_MODEL_PATH = os.path.join(BASE_DIR, "ml", "models", "risk_model.pkl")
CLASSES_PATH = os.path.join(BASE_DIR, "ml", "models", "classes.pkl")

# --- LOAD RISK MODEL ---
try:
    model_pipeline = joblib.load(RISK_MODEL_PATH)
    classes = joblib.load(CLASSES_PATH)
    logger.info(" ML Risk Model Loaded.")
except Exception as e:
    logger.error(f" ML Risk Model Missing: {e}")
    model_pipeline = None

# --- INPUT SCHEMA ---
class PredictionInput(BaseModel):
    age: int
    gender: str
    systolicBp: int
    diastolicBp: int
    heartRate: int
    spo2: float
    temp: float
    bmi: float
    clinicalNotes: str = "" 

# --- NLP ENGINE (Rule-Based) ---
def extract_clinical_entities(text):
    if not text: return [], "No clinical notes provided."
    
    entities = []
    text_lower = text.lower()
    
    keywords = {
        "DISEASE": ["diabetes", "hypertension", "copd", "chf", "pneumonia", "sepsis", "asthma", "cancer", "heart failure"],
        "SYMPTOM": ["pain", "fever", "cough", "shortness of breath", "dizziness", "fatigue", "nausea", "swelling"],
        "MEDICATION": ["lisinopril", "metformin", "insulin", "antibiotics", "aspirin", "statin", "beta blocker"]
    }
    
    for category, terms in keywords.items():
        for term in terms:
            if term in text_lower:
                entities.append({"text": term.title(), "type": category})
    
    risk_terms = len(entities)
    if risk_terms > 3:
        summary = "High clinical complexity detected based on multiple conditions."
    elif risk_terms > 0:
        summary = "Moderate clinical findings extracted from notes."
    else:
        summary = "No significant clinical entities extracted."
        
    return entities, summary

# ==========================
# 1. RISK PREDICTION ENDPOINT
# ==========================
@router.post("/predict")
def predict_risk(input_data: PredictionInput):
    if model_pipeline is None:
        raise HTTPException(status_code=503, detail="Risk Model not loaded.")

    try:
        # Feature Engineering
        sys_bp = input_data.systolicBp
        dia_bp = input_data.diastolicBp
        pulse_pressure = sys_bp - dia_bp
        map_val = (sys_bp + (2 * dia_bp)) / 3
        shock_index = input_data.heartRate / sys_bp if sys_bp > 0 else 0
        gender_code = 1 if input_data.gender.lower() in ['m', 'male'] else 0

        features = pd.DataFrame([{
            'age': input_data.age,
            'gender': gender_code,
            'sys_bp': sys_bp,
            'dia_bp': dia_bp,
            'heart_rate': input_data.heartRate,
            'spo2': input_data.spo2,
            'temp': input_data.temp,
            'bmi': input_data.bmi,
            'pulse_pressure': pulse_pressure,
            'map': map_val,
            'shock_index': shock_index
        }])

        # Prediction
        pred_idx = model_pipeline.predict(features)[0]
        probs = model_pipeline.predict_proba(features)[0]
        
        # NLP Analysis
        nlp_entities, nlp_summary = extract_clinical_entities(input_data.clinicalNotes)

        return {
            "riskLevel": classes[pred_idx],
            "riskScore": int(np.max(probs) * 100),
            "readmissionProbability": int(probs[1] * 100) if len(probs) > 1 else 0,
            "suggestedInterventions": ["Continuous vitals monitoring", "Review meds", "Sepsis protocol check"],
            "shapValues": [
                {"feature": "Pulse Pressure", "value": round(pulse_pressure, 1)},
                {"feature": "MAP", "value": round(map_val, 1)},
                {"feature": "SPO2", "value": -15 if input_data.spo2 < 95 else 5},
            ],
            "nlpAnalysis": {
                "entities": nlp_entities,
                "summary": nlp_summary
            }
        }

    except Exception as e:
        logger.error(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================
# 2. FORECAST TRAINING ENDPOINT (NEW)
# ==========================
@router.post("/train")
def trigger_training(db: Session = Depends(deps.get_db)):
    """
    Manually triggers the Prophet AI Training Pipeline.
    Call this when you have new data and want to update the 'Census Forecasting' chart.
    """
    try:
        success = train_census_model(db)
        if not success:
            raise HTTPException(status_code=400, detail="Not enough data to train model (Need 10+ days)")
        
        return {"status": "success", "message": "Census Forecasting Model trained and saved successfully "}
    except Exception as e:
        print(f"Training Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))