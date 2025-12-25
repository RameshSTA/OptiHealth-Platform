from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
import logging
import re # <--- Added for NLP

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# --- PATHS ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "models", "risk_model.pkl")
CLASSES_PATH = os.path.join(BASE_DIR, "ml", "models", "classes.pkl")

# --- LOAD MODEL ---
try:
    model_pipeline = joblib.load(MODEL_PATH)
    classes = joblib.load(CLASSES_PATH)
    logger.info("✅ ML Model Loaded.")
except Exception as e:
    logger.error(f"❌ ML Model Missing: {e}")
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
    clinicalNotes: str = "" # Added default

# --- MOCK BIOBERT ENGINE (Rule-Based for Speed) ---
def extract_clinical_entities(text):
    if not text: return [], "No clinical notes provided."
    
    entities = []
    text_lower = text.lower()
    
    # 1. Dictionary of terms (Mimics Named Entity Recognition)
    keywords = {
        "DISEASE": ["diabetes", "hypertension", "copd", "chf", "pneumonia", "sepsis", "asthma", "cancer", "heart failure"],
        "SYMPTOM": ["pain", "fever", "cough", "shortness of breath", "dizziness", "fatigue", "nausea", "swelling"],
        "MEDICATION": ["lisinopril", "metformin", "insulin", "antibiotics", "aspirin", "statin", "beta blocker"]
    }
    
    for category, terms in keywords.items():
        for term in terms:
            if term in text_lower:
                entities.append({"text": term.title(), "type": category})
    
    # 2. Generate Summary
    risk_terms = len(entities)
    if risk_terms > 3:
        summary = "High clinical complexity detected based on multiple conditions and symptoms mentioned."
    elif risk_terms > 0:
        summary = "Moderate clinical findings extracted from notes."
    else:
        summary = "No significant clinical entities extracted from the text."
        
    return entities, summary

@router.post("/predict")
def predict_risk(input_data: PredictionInput):
    if model_pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    try:
        # 1. Feature Engineering
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

        # 2. Prediction
        pred_idx = model_pipeline.predict(features)[0]
        probs = model_pipeline.predict_proba(features)[0]
        
        # 3. NLP Analysis
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