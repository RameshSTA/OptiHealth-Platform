import random

class GovernanceEngine:
    def get_pipeline_topology(self):
        # Simulate real-time metrics fluctuation
        latency_base = random.randint(220, 260)
        return [
            {
                "id": "source", "label": "Ingestion Layer", "type": "stream", "status": "healthy",
                "metrics": {"latency": f"{latency_base}ms", "throughput": "12k events/s", "errorRate": "0.01%", "uptime": "99.99%"},
                "techStack": "Apache Kafka", "description": "Real-time telemetry ingestion from patient wearables."
            },
            {
                "id": "bronze", "label": "Bronze Lake", "type": "store", "status": "healthy",
                "metrics": {"latency": "45s", "throughput": "1.2M rows/hr", "errorRate": "0.00%", "uptime": "99.95%"},
                "techStack": "AWS S3 (Parquet)", "description": "Raw data landing zone. Immutable storage."
            },
            {
                "id": "silver", "label": "Silver Processing", "type": "batch", "status": "warning",
                "metrics": {"latency": "1m 20s", "throughput": "850k rows/hr", "errorRate": "1.2%", "uptime": "99.9%"},
                "techStack": "Apache Spark", "description": "Data cleaning and schema enforcement (Pandera).",
                "lastIncident": 'Schema mismatch in "vitals_json" (2h ago)'
            },
            {
                "id": "gold", "label": "Gold Feature Store", "type": "store", "status": "healthy",
                "metrics": {"latency": "15ms", "throughput": "45k req/s", "errorRate": "0.00%", "uptime": "99.99%"},
                "techStack": "Redis + Delta Lake", "description": "Aggregated features for ML inference."
            },
            {
                "id": "model", "label": "ML Serving", "type": "model", "status": "healthy",
                "metrics": {"latency": "120ms", "throughput": "200 pred/s", "errorRate": "0.05%", "uptime": "99.95%"},
                "techStack": "XGBoost / FastAPI", "description": "Real-time Readmission Risk scoring API."
            }
        ]

    def get_dq_rules(self):
        return [
            {
                "id": "DQ-101", "asset": "silver.vitals", "column": "patient_id", "ruleName": "unique_check",
                "ruleType": "Uniqueness", "status": "pass", "passRate": 100.0, "threshold": 100.0,
                "description": "Ensures no duplicate patient records in active census.",
                "sqlLogic": "SELECT count(*) - count(distinct id) FROM vitals", "failedRows": []
            },
            {
                "id": "DQ-103", "asset": "silver.notes", "column": "text", "ruleName": "not_null",
                "ruleType": "Completeness", "status": "warning", "passRate": 94.2, "threshold": 95.0,
                "description": "Critical nursing notes should not be empty.",
                "sqlLogic": "SELECT * FROM notes WHERE text IS NULL",
                "failedRows": [{"id": "REC-992", "reason": "NULL value"}, {"id": "REC-995", "reason": "Empty string"}]
            },
            {
                "id": "DQ-105", "asset": "gold.meds", "column": "dosage", "ruleName": "outlier_check",
                "ruleType": "Validity", "status": "fail", "passRate": 88.4, "threshold": 95.0,
                "description": "Statistical check: Dosage > 3-sigma from mean.",
                "sqlLogic": "SELECT * FROM meds WHERE dosage > (avg + 3*stddev)",
                "failedRows": [{"id": "MED-112", "reason": "> 3 sigma (5000mg)"}]
            }
        ]

    def get_drift_report(self):
        # Simulate slight changes in distribution
        return {
            "feature": "Systolic BP (mmHg)",
            "score": 0.28, "status": "Drift Detected", "threshold": 0.1,
            "training": [{"x": "<100", "y": 10}, {"x": "100-120", "y": 40}, {"x": "120-140", "y": 30}, {"x": "140-160", "y": 15}, {"x": ">160", "y": 5}],
            "serving": [{"x": "<100", "y": 5}, {"x": "100-120", "y": 25}, {"x": "120-140", "y": 35}, {"x": "140-160", "y": 25}, {"x": ">160", "y": 10}]
        }

governance_engine = GovernanceEngine()