# Simple Heuristic NLP Engine (Placeholder for BioBERT)
class NlpEngine:
    def analyze_notes(self, text: str):
        text_lower = text.lower()
        entities = []
        
        # Simple Keyword Extraction
        keywords = {
            'shortness of breath': 'SYMPTOM', 'chest pain': 'SYMPTOM',
            'fever': 'SYMPTOM', 'lisinopril': 'MEDICATION',
            'metformin': 'MEDICATION', 'pneumonia': 'DIAGNOSIS'
        }

        for key, category in keywords.items():
            if key in text_lower:
                entities.append({
                    "text": key,
                    "category": category,
                    "sentiment": "negative" if category == "SYMPTOM" else "neutral"
                })

        # Sentiment Simulation
        sentiment_score = -0.4 if "pain" in text_lower or "shortness" in text_lower else 0.2
        
        return {
            "entities": entities,
            "sentimentScore": sentiment_score,
            "summary": "Automated extraction indicates presence of acute symptoms."
        }

nlp_engine = NlpEngine()