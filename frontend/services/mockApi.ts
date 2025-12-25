
import { Patient, RiskLevel, MLPredictionInput, MLPredictionResult, DataQualityMetric, ShapValue, NlpEntity } from '../types';

// Generators for synthetic data
const generatePatients = (count: number): Patient[] => {
  const conditions = ['Pneumonia', 'CHF', 'COPD', 'Post-Surgical', 'Sepsis Recovery', 'Diabetes Management', 'Hypertension Crisis'];
  const zones = ['Home Care A', 'Home Care B', 'North Wing', 'Cardiac Unit', 'ICU Remote'];
  const patients: Patient[] = [];
  
  for (let i = 0; i < count; i++) {
    const riskScore = Math.floor(Math.random() * 100);
    let riskLevel = RiskLevel.LOW;
    if (riskScore > 80) riskLevel = RiskLevel.CRITICAL;
    else if (riskScore > 60) riskLevel = RiskLevel.HIGH;
    else if (riskScore > 30) riskLevel = RiskLevel.MEDIUM;

    patients.push({
      id: `PAT-${10000 + i}`,
      name: `Patient ${10000 + i}`,
      age: 18 + Math.floor(Math.random() * 80),
      gender: Math.random() > 0.5 ? 'M' : 'F',
      admissionDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      riskScore,
      riskLevel,
      zone: zones[Math.floor(Math.random() * zones.length)],
      vitals: {
        bp: `${110 + Math.floor(Math.random() * 50)}/${70 + Math.floor(Math.random() * 30)}`,
        hr: 55 + Math.floor(Math.random() * 60),
        spo2: 88 + Math.floor(Math.random() * 12),
        temp: Number((36.1 + Math.random() * 2.0).toFixed(1))
      }
    });
  }
  return patients;
};

// Scaled up to 500 to simulate a larger "page" of data from the backend
export const MOCK_PATIENTS = generatePatients(500); 

export const getDataQualityMetrics = (): DataQualityMetric[] => [
  { metric: 'Completeness', value: '98.4%', status: 'Good', description: 'Percentage of non-null values across critical columns.' },
  { metric: 'Uniqueness', value: '99.9%', status: 'Good', description: 'Duplicate record detection rate.' },
  { metric: 'Consistency', value: '92.1%', status: 'Warning', description: 'Format standardization (e.g. date formats, units).' },
  { metric: 'Outliers Detected', value: 1450, status: 'Warning', description: 'Values outside 3-sigma range requiring review.' },
  { metric: 'Total Records Processed', value: '124,592', status: 'Good', description: 'Total dataset size after ETL.' },
];

// Simulate an Advanced ML Model API call (Ensemble + NLP)
export const predictReadmissionRisk = async (input: MLPredictionInput): Promise<MLPredictionResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Calculate Structured Risk (XGBoost Simulation)
      let score = 0;
      score += (input.age - 50) * 0.4;
      score += (input.bmi - 25) * 0.8;
      score += (input.systolicBp - 120) * 0.5;
      score += input.priorReadmissions * 12;
      if (input.hasDiabetes) score += 8;
      if (input.hasHypertension) score += 6;

      // Normalize roughly 0-100
      let probability = Math.min(Math.max(score + 10, 5), 98);
      
      let level = RiskLevel.LOW;
      if (probability > 75) level = RiskLevel.CRITICAL;
      else if (probability > 50) level = RiskLevel.HIGH;
      else if (probability > 25) level = RiskLevel.MEDIUM;

      // 2. Generate Explainability Data (SHAP Values)
      const shapValues: ShapValue[] = [
        { feature: 'Prior Readmissions', value: input.priorReadmissions * 5 },
        { feature: 'Systolic BP', value: (input.systolicBp - 120) * 0.3 },
        { feature: 'Age', value: (input.age - 50) * 0.2 },
        { feature: 'BMI', value: (input.bmi - 25) * 0.4 },
        { feature: 'Adherence', value: -15 }, // Hypothetical negative factor (reduces risk)
      ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

      // 3. Simulate NLP Analysis on Clinical Notes
      const notes = input.clinicalNotes.toLowerCase();
      const entities: NlpEntity[] = [];
      const keywords = {
          'shortness of breath': 'SYMPTOM',
          'chest pain': 'SYMPTOM',
          'fever': 'SYMPTOM',
          'lisinopril': 'MEDICATION',
          'metformin': 'MEDICATION',
          'pneumonia': 'DIAGNOSIS',
          'stable': 'SYMPTOM'
      };

      Object.entries(keywords).forEach(([key, category]) => {
          if (notes.includes(key)) {
              entities.push({
                  text: key,
                  category: category as any,
                  sentiment: key === 'stable' ? 'positive' : 'negative'
              });
          }
      });
      
      // Bump risk if specific keywords found
      if (notes.includes('chest pain') || notes.includes('shortness of breath')) {
          probability = Math.min(probability + 15, 99);
          if (probability > 75) level = RiskLevel.CRITICAL;
      }

      const contributingFactors = shapValues.filter(s => s.value > 0).map(s => s.feature);
      const suggestedInterventions = [];
      
      if (level === RiskLevel.CRITICAL || level === RiskLevel.HIGH) {
        suggestedInterventions.push('Initiate Daily Telehealth Monitoring Protocol');
        suggestedInterventions.push('Review Medication Adherence via PillPack');
      }
      if (input.hasDiabetes) suggestedInterventions.push('Endocrinology Consult: Glycemic Control');
      if (entities.find(e => e.text === 'chest pain')) suggestedInterventions.push('Urgent Cardiology Review Required');

      resolve({
        readmissionProbability: Math.floor(probability),
        riskLevel: level,
        contributingFactors: contributingFactors.slice(0, 3),
        suggestedInterventions: suggestedInterventions.length > 0 ? suggestedInterventions : ['Standard Monitoring Protocol'],
        shapValues: shapValues,
        nlpAnalysis: {
            entities: entities,
            sentimentScore: -0.4, // Simulating slightly negative sentiment for sick patients
            summary: "Patient shows signs of acute decompensation. High frequency of cardiac symptoms noted in unstructured text."
        },
        modelConfidence: 94.2
      });
    }, 2000); // Simulate network latency/inference time
  });
};

export const getTechSupportResponse = (msg: string): string => {
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes('ping') || lowerMsg.includes('connect')) return "I'm running a network diagnostic... PING 8.8.8.8: 24ms average. Your gateway connection appears stable. Are you experiencing packet loss on the patient tablet?";
  if (lowerMsg.includes('login') || lowerMsg.includes('password')) return "For security reasons, I cannot reset passwords here. However, I can trigger a secure reset link to your registered email. Shall I proceed?";
  if (lowerMsg.includes('screen') || lowerMsg.includes('black')) return "Please try holding the power button for 15 seconds to force a hardware restart. Let me know if the logo appears.";
  return "I've logged that request. A Level 2 technician will review the ticket (TKT-4921) within 2 hours. Is there anything else critical?";
};

// --- NEW DASHBOARD ANALYTICS DATA ---

export const getDashboardData = (timeRange: string) => {
    // Generate trending data based on selected time range
    const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    
    const censusData = Array.from({ length: points }, (_, i) => ({
        time: timeRange === '24h' ? `${i}:00` : `Day ${i+1}`,
        actual: 1200 + Math.floor(Math.random() * 200),
        predicted: 1200 + Math.floor(Math.random() * 200) + 50, // Slight variance for ML prediction
        capacity: 1500
    }));

    // ML Feature Importance (Simulated XGBoost output)
    const featureImportance = [
        { feature: 'Prior Readmissions', importance: 0.35 },
        { feature: 'Comorbidity Index', importance: 0.25 },
        { feature: 'Age > 75', importance: 0.15 },
        { feature: 'Recent Sepsis', importance: 0.10 },
        { feature: 'Low SpO2 Avg', importance: 0.08 },
        { feature: 'High Systolic BP', importance: 0.07 },
    ];

    // Readmission Rate Trend
    const readmissionTrend = [
        { month: 'Jan', rate: 14.2 },
        { month: 'Feb', rate: 13.8 },
        { month: 'Mar', rate: 13.5 },
        { month: 'Apr', rate: 12.9 },
        { month: 'May', rate: 12.1 }, // Dropping due to "intervention"
        { month: 'Jun', rate: 11.8 },
    ];

    return {
        censusData,
        featureImportance,
        readmissionTrend,
        kpi: {
            activePatients: 1248,
            readmissionRate: 11.8,
            avgLos: 4.2,
            virtualBedUtilization: 83
        }
    };
};
