import pandas as pd
import numpy as np
import sys
import os
import joblib
import logging
from sqlalchemy import text
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from xgboost import XGBClassifier

# --- 1. SETUP PROFESSIONAL LOGGING ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# --- 2. ROBUST PATH CONFIGURATION ---
# Get the absolute path of the 'backend' folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Define where models live (e.g., backend/app/ml/models)
MODEL_DIR = os.path.join(BASE_DIR, "app", "ml", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl") # Note: Pipeline saves scaler inside model, but we keep reference
CLASSES_PATH = os.path.join(MODEL_DIR, "classes.pkl")

# Ensure the directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Add backend to sys.path to allow imports
sys.path.append(BASE_DIR)

from app.db.session import SessionLocal

TARGET_COLUMN = "risk_level"

def get_data_from_db():
    """ 
    Load data directly from Postgres.
    """
    logger.info("🔌 Connecting to Database...")
    db = SessionLocal()
    try:
        # Fetch only valid training records
        query = text("""
            SELECT age, gender, sys_bp, dia_bp, heart_rate, spo2, temp, bmi, risk_level 
            FROM patients 
            WHERE risk_level IS NOT NULL
        """)
        result = db.execute(query)
        df = pd.DataFrame(result.fetchall(), columns=result.keys())
        
        if df.empty:
            logger.error("❌ Database is empty! Run 'ingest_data.py' first.")
            return None
            
        logger.info(f"✅ Loaded {len(df)} records from Database.")
        return df
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return None
    finally:
        db.close()

def clean_and_engineering(df):
    """
    Cleaning + Feature Engineering combined for efficiency.
    """
    logger.info("🧠 Cleaning & Engineering Features...")
    initial_count = len(df)
    
    # 1. Basic Cleaning
    df = df.dropna()
    df = df[df['age'] > 0]
    
    # 2. Advanced Feature Engineering (Medical Domain Knowledge)
    # Pulse Pressure: Strong indicator of arterial stiffness
    df['pulse_pressure'] = df['sys_bp'] - df['dia_bp']
    
    # MAP (Mean Arterial Pressure): Perfusion pressure seen by organs
    df['map'] = (df['sys_bp'] + (2 * df['dia_bp'])) / 3
    
    # Shock Index: Early sign of shock/sepsis
    # Avoid division by zero
    df['shock_index'] = df.apply(lambda x: x['heart_rate'] / x['sys_bp'] if x['sys_bp'] > 0 else 0, axis=1)

    logger.info(f"✅ Data ready. {(len(df)/initial_count)*100:.1f}% of data retained.")
    return df

def train_and_evaluate(df):
    """
    Trains XGBoost using a scikit-learn Pipeline and GridSearchCV.
    """
    logger.info("🏋️‍♂️ Starting Model Training Pipeline...")

    # 1. Encode Target (Low/Medium/High -> 0/1/2)
    le = LabelEncoder()
    df['target'] = le.fit_transform(df[TARGET_COLUMN])
    
    # 2. Encode Gender (Male/Female -> 0/1)
    df['gender'] = df['gender'].map({'M': 1, 'F': 0, 'Male': 1, 'Female': 0}).fillna(0)

    # 3. Split Data
    # 'stratify=y' ensures we have equal % of High Risk patients in Train and Test
    X = df.drop([TARGET_COLUMN, 'target'], axis=1)
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. Build Pipeline (Scaler + Model)
    # This prevents "Data Leakage" by ensuring scaling stats are learned ONLY from training fold
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', XGBClassifier(
            eval_metric='mlogloss',
            use_label_encoder=False,
            random_state=42
        ))
    ])

    # 5. Hyperparameter Tuning
    # We test different tree depths and learning rates to find the "Perfect" brain
    param_grid = {
        'classifier__n_estimators': [100, 200],
        'classifier__max_depth': [3, 5, 7],
        'classifier__learning_rate': [0.01, 0.1]
    }

    logger.info("🔍 Running GridSearch optimization...")
    grid_search = GridSearchCV(pipeline, param_grid, cv=3, n_jobs=-1, verbose=1)
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_
    logger.info(f"✅ Best Parameters: {grid_search.best_params_}")

    # 6. Evaluation
    logger.info("\n📊 --- FINAL EVALUATION REPORT ---")
    y_pred = best_model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    logger.info(f"Accuracy: {acc:.4f}")
    print("\n" + classification_report(y_test, y_pred, target_names=le.classes_))

    # 7. Save Artifacts
    logger.info(f"💾 Saving artifacts to: {MODEL_DIR}")
    
    # Save the whole pipeline (includes the Scaler AND the Model)
    joblib.dump(best_model, MODEL_PATH)
    
    # Save class names so the API knows 0='Low', 1='High'
    joblib.dump(le.classes_, CLASSES_PATH)
    
    logger.info("🚀 Training Complete. Model is ready for the API.")

if __name__ == "__main__":
    data = get_data_from_db()
    if data is not None:
        data = clean_and_engineering(data)
        train_and_evaluate(data)