import { Patient, MLPredictionInput, MLPredictionResult, SystemService } from '../types';

// --- DYNAMIC CONFIGURATION ---
// If VITE_API_URL is set (in Vercel), use it. Otherwise, default to localhost.
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';
const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log("🔌 Connected to API:", API_BASE_URL); // Debug log

// --- DATA TRANSFORMER ---
const transformPatientData = (p: any): Patient => {
    return {
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        condition: p.condition,
        zone: p.zone,
        riskScore: p.risk_score,
        riskLevel: p.risk_level,
        admissionDate: p.admission_date,
        vitals: {
            bp: `${p.sys_bp}/${p.dia_bp}`,
            hr: p.heart_rate,
            spo2: p.spo2,
            temp: p.temp
        }
    };
};

export const api = {
  // --- AUTHENTICATION ---
  login: async (credentials: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
          })
      });

      if (!response.ok) {
          const errorText = await response.text();
          try {
              const errorJson = JSON.parse(errorText);
              throw new Error(errorJson.detail || 'Login failed');
          } catch (e) {
              throw new Error(errorText || 'Login failed');
          }
      }
      return await response.json();
  },

  signup: async (userData: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
      });
      if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Signup failed');
      }
      return await response.json();
  },

  // --- SYSTEM HEALTH ---
  checkHealth: async (): Promise<boolean> => {
    try {
      // Hit the root "/" to check status
      const response = await fetch(`${API_ROOT}/`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.status === 'operational';
    } catch (e) { return false; }
  },

  // --- DASHBOARD ANALYTICS ---
  getDashboardMetrics: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/`);
    if (!response.ok) throw new Error('Failed to load analytics');
    return await response.json();
  },

  // --- PATIENT MANAGEMENT ---
  getPatients: async (skip = 0, limit = 50, search = '', riskLevel = '', sortBy = 'date'): Promise<Patient[]> => {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString(), sort_by: sortBy });
    if (search) params.append('search', search);
    if (riskLevel && riskLevel !== 'All') params.append('risk_level', riskLevel);
    
    const response = await fetch(`${API_BASE_URL}/patients/?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch patients');
    
    const rawData = await response.json();
    return rawData.map(transformPatientData);
  },

  createPatient: async (patientData: any): Promise<Patient> => {
    const response = await fetch(`${API_BASE_URL}/patients/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) throw new Error('Failed to create patient');
    
    const rawData = await response.json();
    return transformPatientData(rawData);
  },

  downloadCSV: async () => {
      const response = await fetch(`${API_BASE_URL}/patients/export_csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patients_export.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
  },

  // --- ML RISK PREDICTION ---
  predictRisk: async (input: MLPredictionInput): Promise<MLPredictionResult> => {
    const response = await fetch(`${API_BASE_URL}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Prediction failed');
    return await response.json();
  },

  // --- DATA GOVERNANCE ---
  getGovernancePipeline: async () => {
    const response = await fetch(`${API_BASE_URL}/governance/pipeline`);
    return await response.json();
  },

  getGovernanceRules: async () => {
    const response = await fetch(`${API_BASE_URL}/governance/rules`);
    return await response.json();
  },

  getDriftReport: async () => {
    const response = await fetch(`${API_BASE_URL}/governance/drift`);
    return await response.json();
  },

  // --- TECH SUPPORT ---
  getSystemStatus: async (): Promise<SystemService[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/support/status`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        return [];
    }
  },

  sendChatMessage: async (text: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/support/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    if (!response.ok) throw new Error('Chat service offline');
    const data = await response.json();
    return data.reply;
  },

  createTicket: async (ticket: any) => {
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
    });
    if (!response.ok) throw new Error('Failed to create ticket');
    return await response.json();
  }
};