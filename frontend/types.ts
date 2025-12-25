// Location: /Users/ramesh/Desktop/OptiHealth/frontend/types.ts

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

// --- UPDATED FOR ML MODEL ---
export interface MLPredictionInput {
  age: number;
  gender: string;       // <--- Added (Required by Backend)
  bmi: number;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  spo2: number;         // <--- Added (Required by Backend)
  temp: number;         // <--- Added (Required by Backend)
  
  // Optional fields (Used for UI state, even if model doesn't use them yet)
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
  shapValues: { feature: string; value: number }[];
  
  // NLP Output
  nlpAnalysis: {
    summary: string;
    entities: { text: string; type: string }[];
  };
}

// --- SYSTEM & SUPPORT ---
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