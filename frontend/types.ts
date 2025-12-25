// Location: frontend/src/types.ts

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  zone: string;
  riskScore: number;
  riskLevel: RiskLevel | string;
  vitals: {
    bp: string;
    hr: number;
    spo2: number;
    temp: number;
  };
  admissionDate: string;
}

// --- Helper Types (Exported for reuse) ---
export interface ShapValue {
  feature: string;
  value: number;
}

export interface NlpEntity {
  text: string;
  type: string;
}

// --- ML Models ---
export interface MLPredictionInput {
  age: number;
  gender: string;
  bmi: number;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  spo2: number;
  temp: number;
  
  // Optional fields
  clinicalNotes?: string;
  priorReadmissions?: number;
  hasDiabetes?: boolean;
  hasHypertension?: boolean;
}

export interface MLPredictionResult {
  riskScore: number;
  riskLevel: string;
  readmissionProbability: number;
  
  // Model Insights
  suggestedInterventions: string[];
  shapValues: ShapValue[]; 
  
  // NLP Output
  nlpAnalysis: {
    summary: string;
    entities: NlpEntity[];
  };
}

// --- System Types ---
export interface SystemService {
    id: string;
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    uptime: string;
    latency: number;
    description: string;
    dependencies: string[];
    history: { time: string; latency: number }[];
}

export interface Ticket {
    id: string;
    subject: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    priority: 'Low' | 'Medium' | 'High';
    date: string;
    requester: string;
    assignee?: string;
    slaBreach?: string;
    conversation: { sender: string; text: string; time: string; isInternal?: boolean }[];
}