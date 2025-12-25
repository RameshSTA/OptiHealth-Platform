import { RiskLevel } from '../types';

export interface RawPatientRecord {
  patient_id: string;
  full_name: string;
  age: number | string; // Mixed type for "messy" data
  gender: string;
  admission_date: string;
  discharge_date: string | null;
  diagnosis_code: string;
  clinical_notes: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  sp_o2: number;
  temperature_c: number;
  bmi: number;
  readmission_count: number;
  risk_score: number;
}

// Helper for random data
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const conditions = ['Pneumonia', 'CHF', 'COPD', 'Post-Surgical', 'Sepsis', 'Diabetes', 'Hypertension', 'Stroke', 'Kidney Failure'];
const notes_snippets = ['Patient stable.', 'Complains of chest pain.', 'Bp elevated.', 'Discharge planning initiated.', 'Family requested update.', 'Monitor o2 levels.', 'Signs of infection.', 'Medication adjusted.'];

// Introduce "messiness" (typos, missing values, outliers)
export const generateRawDataset = (count: number): RawPatientRecord[] => {
  const data: RawPatientRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    const hasError = Math.random() < 0.05; // 5% chance of data error
    const isMissingVitals = Math.random() < 0.03; // 3% missing vitals
    
    const sys = 110 + Math.floor(Math.random() * 50);
    const dia = 70 + Math.floor(Math.random() * 30);
    
    data.push({
      patient_id: `PAT-${100000 + i}`,
      full_name: `Patient_${Math.random().toString(36).substring(7)}`, // Anonymized
      age: hasError ? "Unknown" : 18 + Math.floor(Math.random() * 85), // Messy type
      gender: Math.random() > 0.5 ? 'M' : Math.random() > 0.5 ? 'F' : 'NB',
      admission_date: randomDate(new Date(2023, 0, 1), new Date()).toISOString().split('T')[0],
      discharge_date: Math.random() > 0.7 ? randomDate(new Date(2023, 0, 1), new Date()).toISOString().split('T')[0] : null, // Active patients have null discharge
      diagnosis_code: `${conditions[Math.floor(Math.random() * conditions.length)]}_${Math.floor(Math.random() * 9)}`,
      clinical_notes: Array(3).fill(null).map(() => notes_snippets[Math.floor(Math.random() * notes_snippets.length)]).join(" "),
      systolic_bp: isMissingVitals ? null : (hasError ? 300 : sys), // Outlier injection
      diastolic_bp: isMissingVitals ? null : dia,
      heart_rate: 55 + Math.floor(Math.random() * 60),
      sp_o2: 85 + Math.floor(Math.random() * 15),
      temperature_c: Number((36.1 + Math.random() * 2.5).toFixed(1)),
      bmi: Number((18.5 + Math.random() * 15).toFixed(1)),
      readmission_count: Math.random() < 0.2 ? Math.floor(Math.random() * 5) : 0, // 20% have readmissions
      risk_score: Math.floor(Math.random() * 100)
    });
  }
  return data;
};

export const downloadCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        const val = row[fieldName] === null ? '' : row[fieldName];
        return JSON.stringify(val); // Handle commas in strings
      }).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};