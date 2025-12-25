# OptiHealth Clinical AI Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-v2.0.0--prod-blue)
![Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20React%20%7C%20XGBoost-indigo)
![License](https://img.shields.io/badge/license-MIT-green)

**OptiHealth** is an enterprise-grade Clinical Decision Support System (CDSS) designed to reduce patient readmission rates through real-time risk stratification. It bridges the gap between raw Electronic Medical Records (EMR) and actionable clinical insights using transparent, Explainable AI (XAI).

---

## 📋 Table of Contents

- [Abstract](#-abstract)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Machine Learning Methodology](#-machine-learning-methodology)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)

---

## 🏥 Abstract

In modern healthcare, "Black Box" AI models are unacceptable. OptiHealth provides a transparent **Explainable AI (XAI)** framework. It ingests patient vitals, processes them through a data reliability pipeline, and uses an ensemble Gradient Boosting model to predict the likelihood of readmission within 30 days.

Crucially, every prediction is accompanied by **SHAP (SHapley Additive exPlanations)** values, allowing clinicians to understand exactly *why* a patient was flagged (e.g., *"High Risk due to elevated Systolic BP and low Oxygen Saturation"*).

---

## 🚀 Key Features

### 1. **Real-Time Command Center**
- **Live Census Forecasting:** Uses Exponential Smoothing (EMA) to project patient admission trends 7 days into the future.
- **Operational KPIs:** Monitors bed utilization, average length of stay (LOS), and critical acuity levels in real-time.

### 2. **AI Risk Stratification**
- **Instant Inference:** Sub-100ms prediction latency for readmission risk.
- **Explainability:** Visualizes top risk drivers for every patient using TreeSHAP algorithms.
- **NLP Integration:** Extracts clinical entities (Symptoms, Medications) from unstructured nursing notes using biomedical NER.

### 3. **Data Governance Console**
- **Pipeline Topology:** Visualizes the end-to-end flow of data from ingestion to serving.
- **Data Quality (DQ) Suite:** Enforces schema validation and checks for null values or outliers.
- **Drift Detection:** Monitors statistical distribution shifts (KL Divergence) between training and live data to trigger retraining alerts.

### 4. **Patient Cohort Management**
- **CRUD Operations:** Register, update, and discharge patients via a secure REST API.
- **Search & Filter:** Advanced filtering by risk level, medical condition, or operational zone.

---

## 🏗 System Architecture

The platform follows a decoupled **Microservices Architecture**:

1.  **Ingestion Layer:** REST API endpoints receiving JSON payloads validated by Pydantic schemas.
2.  **Processing Layer:** A Pandas/NumPy analytics engine handling feature engineering, missing value imputation, and statistical aggregation.
3.  **Inference Engine:** A pre-trained XGBoost model serialized via Joblib, loaded into memory for high-performance scoring.
4.  **Presentation Layer:** A React 18 SPA (Single Page Application) styled with Tailwind CSS for responsive, accessible clinical visualization.

---

## 💻 Technology Stack

### **Frontend (Client)**
* **Framework:** React 18 + Vite (TypeScript)
* **State Management:** React Hooks
* **Visualization:** Recharts (SVG-based charting)
* **Styling:** Tailwind CSS + Lucide Icons
* **Routing:** React Router DOM v6

### **Backend (Server)**
* **API Framework:** FastAPI (Python 3.9+)
* **Server:** Uvicorn (ASGI)
* **Data Validation:** Pydantic V2
* **ORM:** SQLAlchemy
* **Database:** PostgreSQL (Production) / SQLite (Dev)

### **Data Science & ML**
* **Algorithm:** XGBoost Classifier
* **Explainability:** SHAP (TreeExplainer)
* **Data Processing:** Pandas, Scikit-Learn
* **Drift Detection:** SciPy (Statistical tests)

---

## 🛠 Installation & Setup

### Prerequisites
- Node.js v18+
- Python 3.9+
- Git

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/optihealth.git](https://github.com/yourusername/optihealth.git)
cd optihealth
```
## Backend
```
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Database Migrations (Optional for first run)
# python scripts/init_db.py 

# Start the API Server
uvicorn app.main:app --reload --port 8000
```

## Frontend 
```
cd ../frontend

# Install Node modules
npm install

# Start Development Server
npm run dev
```