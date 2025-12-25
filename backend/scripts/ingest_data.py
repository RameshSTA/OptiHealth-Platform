import pandas as pd
import numpy as np
import sys
import os
from datetime import datetime

# --- Setup Paths ---
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import SessionLocal
from app.models.patient import Patient

# CONFIGURATION
FILE_PATH = "data/million_patients.csv"
CHUNK_SIZE = 10000 

# *** MAPPING ***
RENAME_MAP = {
    "sys_bp": "systolic_bp",
    "dia_bp": "diastolic_bp",
    "temp": "temperature",
    # Ensure these exist in your CSV
    "heart_rate": "heart_rate",
    "spo2": "spo2",
    "bmi": "bmi",
    "id": "id",
    "name": "name"
}

def calculate_clinical_risk(row):
    score = 0
    if row.get('systolic_bp', 0) > 140 or row.get('diastolic_bp', 0) > 90: score += 30
    if row.get('heart_rate', 0) > 100 or row.get('heart_rate', 0) < 60: score += 20
    if row.get('spo2', 0) < 95: score += 25
    if row.get('bmi', 0) > 30: score += 15
    return min(score, 100)

def categorize_risk(score):
    if score > 70: return 'High'
    if score > 30: return 'Moderate'
    return 'Low'

def process_chunk(chunk, db):
    # 0. NORMALIZE COLUMNS
    chunk.rename(columns=RENAME_MAP, inplace=True)

    # 1. CLEANING
    required_cols = ['age', 'systolic_bp', 'diastolic_bp']
    chunk.dropna(subset=required_cols, inplace=True)
    
    # Fill missing values with safe defaults
    chunk['spo2'] = chunk.get('spo2', pd.Series([98.0]*len(chunk))).fillna(98.0)
    chunk['temperature'] = chunk.get('temperature', pd.Series([37.0]*len(chunk))).fillna(37.0)
    chunk['heart_rate'] = chunk.get('heart_rate', pd.Series([72.0]*len(chunk))).fillna(72.0)
    
    # 2. FEATURE ENGINEERING
    # Use existing BMI if valid, else calculate
    if 'bmi' not in chunk.columns:
        if 'weight_kg' in chunk.columns and 'height_cm' in chunk.columns:
            chunk = chunk[chunk['height_cm'] > 0]
            chunk['bmi'] = chunk['weight_kg'] / ((chunk['height_cm'] / 100) ** 2)
            chunk['bmi'] = chunk['bmi'].round(2)
        else:
            chunk['bmi'] = 0.0
    
    # Ensure Risk Score Exists
    if 'risk_score' not in chunk.columns:
        chunk['risk_score'] = chunk.apply(calculate_clinical_risk, axis=1)
    
    if 'risk_level' not in chunk.columns:
        chunk['risk_level'] = chunk['risk_score'].apply(categorize_risk)

    # 3. PREPARE BUFFER
    patients_buffer = []
    
    for _, row in chunk.iterrows():
        # Parse Dates
        adm_date = row.get('admission_date')
        if pd.isna(adm_date):
            adm_date = datetime.now()
        else:
            try:
                adm_date = pd.to_datetime(adm_date)
            except:
                adm_date = datetime.now()

        # Create Patient Object
        patient = Patient(
            # *** FIX: EXPLICITLY PASS ID ***
            id=str(row.get('id', f"PAT-{np.random.randint(1000000,9999999)}")), 
            name=row.get('name', "Unknown"),
            age=int(row['age']),
            gender=row.get('gender', 'Unknown'),
            condition=row.get('condition', 'General Checkup'),
            admission_date=adm_date,
            
            # Vitals
            sys_bp=int(row['systolic_bp']),
            dia_bp=int(row['diastolic_bp']),
            heart_rate=int(row['heart_rate']),
            spo2=float(row['spo2']),
            temp=float(row['temperature']),
            bmi=float(row.get('bmi', 0)),
            
            # Computed Features
            risk_score=float(row.get('risk_score', 0)),
            risk_level=row.get('risk_level', 'Low'),
            zone=row.get('zone', 'General Ward')
        )
        patients_buffer.append(patient)

    # 4. BULK INSERT
    try:
        db.add_all(patients_buffer)
        db.commit()
        print(f"   ✅ Committed chunk of {len(patients_buffer)} records.")
    except Exception as e:
        print(f"   ❌ Error committing chunk: {e}")
        db.rollback()

def run_pipeline():
    print(f"🚀 Starting Ingestion Pipeline for: {FILE_PATH}")
    
    if not os.path.exists(FILE_PATH):
        print(f"❌ File not found at: {FILE_PATH}")
        return

    db = SessionLocal()
    total_processed = 0

    try:
        # Read first chunk to validate headers
        with pd.read_csv(FILE_PATH, chunksize=CHUNK_SIZE) as reader:
            for i, chunk in enumerate(reader):
                if i == 0:
                    print(f"ℹ️  Processing CSV Columns: {chunk.columns.tolist()}")
                
                print(f"🔄 Processing Chunk {i+1}...")
                process_chunk(chunk, db)
                total_processed += len(chunk)
                
        print(f"🎉 SUCCESS! Total Processed: {total_processed} Patients.")
        
    except Exception as e:
        print(f"❌ Critical Pipeline Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_pipeline()