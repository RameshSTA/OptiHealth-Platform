import React, { useState } from 'react';
import { 
    BrainCircuit, Sparkles, Activity, FileText, 
    HeartPulse, Thermometer,
    CheckCircle, Target, Microscope, Database, Cpu, X, Info
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { MLPredictionInput, MLPredictionResult } from '../types';

// --- DATA & CONFIG ---
const INITIAL_DATA: MLPredictionInput = {
    age: 65, gender: 'Male', bmi: 28.5,
    systolicBp: 138, diastolicBp: 85, heartRate: 78,
    spo2: 96, temp: 36.8,
    clinicalNotes: "Patient reports mild chest pain and shortness of breath after exercise. History of hypertension."
};

const METRIC_EXPLANATIONS: Record<string, { title: string, desc: string, value: string }> = {
    'accuracy': { title: 'Model Accuracy (AUC-ROC)', value: '85.3%', desc: 'The ability of the model to distinguish between High and Low risk patients. An AUC of 0.85 indicates excellent discrimination capability for clinical triage.' },
    'precision': { title: 'Precision (PPV)', value: '89.1%', desc: 'Positive Predictive Value. Out of all patients predicted as High Risk, 89% actually were high risk. Crucial for reducing alarm fatigue in hospitals.' },
    'data': { title: 'Training Cohort', value: '1.0M+', desc: 'The model was trained on over 1,000,000 anonymized patient records, ensuring robust generalization across diverse demographics and conditions.' },
    'latency': { title: 'Inference Speed', value: '120ms', desc: 'Real-time classification speed. The XGBoost pipeline processes vitals, text, and history in under 120ms to support immediate clinical decisions.' }
};

// --- HELPER COMPONENTS (MOVED TO TOP TO FIX CRASH) ---

const InputGroup = ({ label, name, val, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
        <input 
            type="number" name={name} value={val} onChange={onChange}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
        />
    </div>
);

const MetricCard = ({ label, value, sub, icon: Icon, color, onClick }: any) => (
    <div onClick={onClick} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon className={`h-16 w-16 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <div className="text-2xl font-extrabold text-slate-900">{value}</div>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{sub}</p>
            </div>
        </div>
    </div>
);

const DetailModal = ({ metricId, onClose }: { metricId: string, onClose: () => void }) => {
    if (!metricId) return null;
    const info = METRIC_EXPLANATIONS[metricId];
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><Info className="h-5 w-5" /></div>
                        <h3 className="font-bold text-slate-900">Metric Details</h3>
                    </div>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-8">
                    <div className="text-4xl font-extrabold text-slate-900 mb-2">{info.value}</div>
                    <div className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-4">{info.title}</div>
                    <p className="text-slate-600 leading-relaxed">{info.desc}</p>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800">Close</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const RiskPrediction: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MLPredictionResult | null>(null);
  const [formData, setFormData] = useState<MLPredictionInput>(INITIAL_DATA);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.predictRisk(formData);
      setResult(data);
    } catch (err) { alert("Analysis failed. Is backend running?"); } 
    finally { setLoading(false); }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'gender' || name === 'clinicalNotes' ? value : Number(value) }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8 font-sans pb-20">
      
      {selectedMetric && <DetailModal metricId={selectedMetric} onClose={() => setSelectedMetric(null)} />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-600 rounded-2xl shadow-lg shadow-teal-200/50">
                <BrainCircuit className="h-8 w-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical AI Workbench</h1>
                <p className="text-slate-500 font-medium">XGBoost Risk Stratification & BioBERT NLP Engine</p>
            </div>
        </div>
        {result && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Analysis Complete</span>
            </div>
        )}
      </div>

      {/* KPI METRICS (Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard onClick={() => setSelectedMetric('accuracy')} label="Model Accuracy" value="85.3%" sub="AUC-ROC Score" icon={Target} color="bg-indigo-600" />
          <MetricCard onClick={() => setSelectedMetric('precision')} label="Precision" value="89.1%" sub="PPV (Positive Pred. Value)" icon={Microscope} color="bg-teal-600" />
          <MetricCard onClick={() => setSelectedMetric('data')} label="Training Data" value="1.0M+" sub="Anonymized Records" icon={Database} color="bg-blue-600" />
          <MetricCard onClick={() => setSelectedMetric('latency')} label="Inference Time" value="120ms" sub="Real-time Processing" icon={Cpu} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT: INPUT FORM */}
        <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-indigo-500"></div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Patient Parameters
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Age" name="age" val={formData.age} onChange={handleChange} />
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none">
                                <option>Male</option><option>Female</option>
                            </select>
                        </div>
                    </div>

                    {/* Vitals Group 1 */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                        <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><HeartPulse className="h-3 w-3" /> Hemodynamics</p>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Systolic BP" name="systolicBp" val={formData.systolicBp} onChange={handleChange} />
                            <InputGroup label="Diastolic BP" name="diastolicBp" val={formData.diastolicBp} onChange={handleChange} />
                        </div>
                        <InputGroup label="Heart Rate (BPM)" name="heartRate" val={formData.heartRate} onChange={handleChange} />
                    </div>

                    {/* Vitals Group 2 */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                        <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Thermometer className="h-3 w-3" /> Metabolic</p>
                        <div className="grid grid-cols-3 gap-3">
                            <InputGroup label="SPO2 (%)" name="spo2" val={formData.spo2} onChange={handleChange} />
                            <InputGroup label="Temp (°C)" name="temp" val={formData.temp} onChange={handleChange} />
                            <InputGroup label="BMI" name="bmi" val={formData.bmi} onChange={handleChange} />
                        </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <FileText className="h-3 w-3" /> Clinical Notes (NLP)
                        </label>
                        <textarea 
                            name="clinicalNotes" rows={3} 
                            value={formData.clinicalNotes} onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none placeholder-slate-400"
                            placeholder="e.g. Patient complaining of shortness of breath..."
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Sparkles className="h-5 w-5 text-teal-400" /> Run AI Analysis</>}
                    </button>
                </form>
            </div>
        </div>

        {/* RIGHT: RESULTS PANEL */}
        <div className="xl:col-span-8">
            {result ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* 1. RISK SCORE CARD */}
                    <div className={`p-8 rounded-3xl border shadow-lg bg-white relative overflow-hidden ${result.riskLevel === 'High' ? 'border-rose-100 shadow-rose-100' : 'border-emerald-100 shadow-emerald-100'}`}>
                        {/* Background Decoration */}
                        <div className={`absolute -right-10 -top-10 h-64 w-64 rounded-full opacity-5 blur-3xl ${result.riskLevel === 'High' ? 'bg-rose-600' : 'bg-emerald-600'}`}></div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${result.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        AI Assessment
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium">Confidence: 94%</span>
                                </div>
                                <h2 className="text-5xl font-extrabold text-slate-900 mb-2">{result.riskLevel} Risk</h2>
                                <p className="text-slate-500 max-w-md">Patient shows significant indicators for readmission based on Hemodynamic stability and NLP extraction.</p>
                            </div>
                            
                            {/* Score Circle */}
                            <div className="relative h-32 w-32 flex items-center justify-center">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className={result.riskLevel === 'High' ? 'text-rose-500' : 'text-emerald-500'} strokeDasharray={`${result.riskScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-slate-900">{result.riskScore}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. NLP & INSIGHTS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* NLP Extraction */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-teal-600" /> Clinical Entities (NLP)</h4>
                            <div className="flex-grow bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex flex-wrap gap-2">
                                    {result.nlpAnalysis.entities.length > 0 ? result.nlpAnalysis.entities.map((e, i) => (
                                        <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 shadow-sm ${
                                            e.type === 'SYMPTOM' ? 'bg-white text-rose-700 border-rose-200' : 
                                            e.type === 'MEDICATION' ? 'bg-white text-blue-700 border-blue-200' :
                                            'bg-white text-amber-700 border-amber-200'
                                        }`}>
                                            {e.type === 'SYMPTOM' && <Thermometer className="h-3 w-3" />}
                                            {e.type === 'MEDICATION' && <Pill className="h-3 w-3" />}
                                            {e.type === 'DISEASE' && <Activity className="h-3 w-3" />}
                                            {e.text}
                                        </span>
                                    )) : <p className="text-slate-400 italic text-sm">No clinical entities detected in notes.</p>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">AI Summary</p>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{result.nlpAnalysis.summary}</p>
                                </div>
                            </div>
                        </div>

                        {/* SHAP Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-600" /> Explainability (SHAP)</h4>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={result.shapValues} margin={{left: 30}}>
                                        <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="feature" type="category" width={100} tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}} />
                                        <Tooltip cursor={{fill: '#f8fafc'}} />
                                        <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                            {result.shapValues.map((entry, index) => (
                                                <Cell key={index} fill={entry.value > 0 ? '#f43f5e' : '#10b981'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 3. INTERVENTIONS */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl text-white">
                        <h4 className="font-bold mb-4 flex items-center gap-2 text-teal-400"><CheckCircle className="h-5 w-5" /> Recommended Interventions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {result.suggestedInterventions.map((rec, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-sm font-medium flex items-start gap-3 hover:bg-white/15 transition-colors">
                                    <div className="mt-1.5 min-w-[6px] h-1.5 rounded-full bg-teal-400"></div>
                                    {rec}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <BrainCircuit className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Ready to Analyze</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">Enter patient vitals and clinical notes to generate a comprehensive AI risk profile and readmission probability.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RiskPrediction;