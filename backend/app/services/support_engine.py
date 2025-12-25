import random
from datetime import datetime, timedelta

# --- OPTIHEALTH INTELLIGENCE LAYER ---
# This dictionary acts as the "LLM Context" for your project
OPTIHEALTH_BRAIN = {
    # Project Basics
    "optihealth": "OptiHealth is an advanced AI Care Coordination platform designed to reduce hospital readmissions. It uses a multimodal approach combining structured EMR data (XGBoost) and unstructured clinical notes (BioBERT).",
    "service": "We provide real-time patient risk monitoring, automated acuity scoring, and 'Human-in-the-Loop' decision support for virtual wards and home care teams.",
    
    # ML & Technical
    "xgboost": "XGBoost (Extreme Gradient Boosting) is our core model for structured data. It analyzes tabular features like Age, BMI, BP, and Lab Results to predict readmission probability with 94.2% accuracy.",
    "bert": "BioBERT (Bidirectional Encoder Representations from Transformers for Biomedical Text Mining) processes nursing notes to extract symptoms (NER) and sentiment, adding a qualitative layer to our risk scores.",
    "shap": "SHAP (SHapley Additive exPlanations) values provide model transparency. They show exactly how much each feature (e.g., 'High BP') pushed the risk score up or down, solving the 'Black Box' problem in AI healthcare.",
    "risk score": "The Risk Score (0-100) is a composite metric. Scores >50 trigger a 'High Risk' alert, and >75 trigger a 'Critical' alert requiring immediate intervention. It is updated every 15 minutes.",
    
    # Governance & Architecture
    "governance": "We use the 'SHIELD' framework for Data Governance. This includes Bronze (Raw), Silver (Clean), and Gold (Aggregated) data layers, validated by Great Expectations for quality assurance.",
    "architecture": "Our system uses a Modern Data Stack: React (Frontend), FastAPI (Backend), PostgreSQL (Operational DB), and a simulated Data Lake for ML training.",
    
    # Support & Issues
    "reset": "To reset your password, please go to the 'My Requests' section below or contact the IT Service Desk at Ext. 4022. For security, we cannot reset passwords via chat.",
    "slow": "System slowness often correlates with high load on the IoT Gateway. Please run the 'Self-Healing Diagnostics' tool on the left to check your local latency.",
    "ipad": "iPad synchronization failures usually occur when the device drifts off the 'Clinical-Secure' subnet. Please toggle Airplane Mode or restart the dedicated OptiHealth App.",
    "contact": "For critical system outages, please use the red 'NOC Hotline' button at the top of this console to reach the 24/7 Operations Center immediately."
}

class SupportEngine:
    def get_system_status(self):
        # Simulate Live Telemetry
        now = datetime.now()
        history = []
        for i in range(10, 0, -1):
            t = (now - timedelta(minutes=i*2)).strftime("%H:%M")
            history.append({"time": t, "latency": random.randint(20, 100)})

        return [
            {
                "id": "srv-1", "name": "EMR Integration (FHIR)", "status": "operational", "uptime": "99.98%", 
                "latency": random.randint(35, 55), "description": "Bi-directional sync with Epic/Cerner systems.",
                "dependencies": ["VPN Gateway", "Auth Provider"], "history": history
            },
            {
                "id": "srv-2", "name": "Telehealth Video Bridge", "status": "operational", "uptime": "99.95%", 
                "latency": random.randint(110, 130), "description": "WebRTC signaling for virtual visits.",
                "dependencies": ["Media Cluster", "CDN"], "history": history
            },
            {
                "id": "srv-3", "name": "Auth Provider (SSO)", "status": "operational", "uptime": "100%", 
                "latency": random.randint(15, 25), "description": "OAuth2/OIDC Identity Provider.",
                "dependencies": ["Active Directory"], "history": history
            },
            {
                "id": "srv-4", "name": "IoT Device Gateway", "status": "degraded", "uptime": "98.50%", 
                "latency": random.randint(350, 480), "description": "Ingestion point for wearable biosensors.",
                "dependencies": ["Kafka", "MQTT"], "history": history
            }
        ]

    def get_chatbot_response(self, message: str):
        msg = message.lower()
        
        # 1. Smart Keyword Matching (The "AI" part)
        response = []
        for key, value in OPTIHEALTH_BRAIN.items():
            if key in msg:
                response.append(value)
        
        if response:
            return " ".join(response)
            
        # 2. Context-Aware Fallbacks
        if "hello" in msg or "hi" in msg:
            return "Hello! I am the OptiHealth AI Assistant. I can explain our ML models (XGBoost/SHAP), help with EMR integration, or troubleshoot device issues. What do you need?"
        elif "help" in msg:
            return "I can assist with: 1. Explaining Risk Scores 2. Troubleshooting iPads 3. Reporting Outages. You can also type 'SHAP' or 'BioBERT' to learn about our AI."
        
        return "I'm not sure about that specific query. I am trained on the OptiHealth technical stack and operational protocols. Could you try asking about 'Risk Scores', 'SHAP', or 'System Status'?"

support_engine = SupportEngine()