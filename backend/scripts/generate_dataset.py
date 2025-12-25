import pandas as pd
import numpy as np
import uuid
import os
from datetime import datetime, timedelta

# Settings
NUM_RECORDS = 1_000_000
OUTPUT_DIR = "data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "million_patients.csv")

def generate_data():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    print(f"Generating {NUM_RECORDS} records... This may take a minute.")

    # 1. Demographics
    ids = [f"PAT-{1000000 + i}" for i in range(NUM_RECORDS)]
    ages = np.random.randint(18, 90, size=NUM_RECORDS)
    genders = np.random.choice(['M', 'F'], size=NUM_RECORDS)
    zones = np.random.choice(['Home Care A', 'Home Care B', 'North Wing', 'Cardiac Unit', 'ICU Remote'], size=NUM_RECORDS)
    
    # 2. Clinical Metrics (Correlated)
    bmi = np.clip(np.random.normal(26.5, 5.0, NUM_RECORDS), 16.0, 45.0).round(1)
    has_hypertension = (ages > 50) & (bmi > 30) | (np.random.rand(NUM_RECORDS) < 0.2)
    has_diabetes = (bmi > 32) | (np.random.rand(NUM_RECORDS) < 0.1)

    # 3. Vitals
    sys_bp = (np.random.normal(120, 10, NUM_RECORDS) + (has_hypertension * 20)).astype(int)
    dia_bp = (np.random.normal(80, 8, NUM_RECORDS) + (has_hypertension * 10)).astype(int)
    heart_rate = np.random.normal(72, 12, NUM_RECORDS).astype(int)
    spo2 = np.random.choice(np.arange(85, 101), size=NUM_RECORDS, p=[0.01, 0.01, 0.02, 0.03, 0.03, 0.05, 0.05, 0.1, 0.2, 0.3, 0.15, 0.03, 0.01, 0.005, 0.005, 0.0])

    # 4. Risk Calculation
    risk_score_raw = (
        ((ages - 40) * 0.5) + ((bmi - 25) * 1.5) + 
        (has_diabetes * 15) + (has_hypertension * 10) + ((100 - spo2) * 2)
    )
    risk_score = np.clip(risk_score_raw + np.random.normal(0, 5, NUM_RECORDS), 0, 100).astype(int)
    
    conditions_list = [(risk_score >= 80), (risk_score >= 60), (risk_score >= 30)]
    choices = ['Critical', 'High', 'Medium']
    risk_level = np.select(conditions_list, choices, default='Low')

    # 5. Dates
    start_date = datetime.now() - timedelta(days=365)
    dates = [start_date + timedelta(days=int(d)) for d in np.random.randint(0, 365, NUM_RECORDS)]
    dates_str = [d.strftime("%Y-%m-%d") for d in dates]

    # 6. DataFrame
    df = pd.DataFrame({
        'id': ids,
        'name': [f"Patient_{uuid.uuid4().hex[:6]}" for _ in range(NUM_RECORDS)],
        'age': ages,
        'gender': genders,
        'admission_date': dates_str,
        'condition': np.random.choice(['COPD', 'CHF', 'Pneumonia', 'Sepsis', 'Hypertension'], size=NUM_RECORDS),
        'sys_bp': sys_bp, 'dia_bp': dia_bp, 'heart_rate': heart_rate, 'spo2': spo2,
        'temp': np.round(np.random.normal(36.8, 0.4, NUM_RECORDS), 1),
        'bmi': bmi,
        'risk_score': risk_score, 'risk_level': risk_level, 'zone': zones
    })

    print(f"Saving to {OUTPUT_FILE}...")
    df.to_csv(OUTPUT_FILE, index=False)
    print("Done!")

if __name__ == "__main__":
    generate_data()