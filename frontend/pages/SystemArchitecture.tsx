import React, { useState } from 'react';
import { 
    Server, Database, Globe, Code, GitBranch, Layers, Shield, 
    Terminal, Brain, Cpu, Lock, Zap, Workflow, BookOpen, ExternalLink, 
    FileText, CheckCircle2, ChevronRight, Activity, ArrowRight, FileCode, 
    Target, Box, Layout
} from 'lucide-react';

// --- CONSTANTS ---
const APP_VERSION = 'prod-v2.0.0'; 

// --- DATA: REALISTIC ARCHITECTURE LAYERS ---
const ARCHITECTURE_LAYERS = [
    {
        id: 'ingestion',
        title: 'Ingestion & Data Layer',
        subtitle: 'REST API & Batch Processing',
        icon: Database,
        colorClass: 'text-amber-500',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        activeBorderClass: 'border-amber-500',
        tech: ['PostgreSQL', 'SQLAlchemy', 'Pandas', 'Pydantic'],
        description: 'The system uses a synchronous REST API for real-time patient data entry and a batch processor for historical CSV uploads. Data is validated using Pydantic schemas before being persisted to a relational database.',
        specs: [
            { label: 'Database', value: 'PostgreSQL (Relational)' },
            { label: 'ORM', value: 'SQLAlchemy (Python)' },
            { label: 'Validation', value: 'Pydantic V2' },
            { label: 'Batch Loading', value: 'Pandas Chunking' }
        ],
        patterns: [
            { title: 'Schema Validation', desc: 'Strict typing on input ensures no malformed clinical data enters the system.' },
            { title: 'ACID Transactions', desc: 'Ensures data integrity during patient registration and vital sign updates.' }
        ],
        codeSnippet: `
# Pydantic Schema (Validation)
class PatientCreate(BaseModel):
    name: str
    age: int
    sys_bp: int
    heart_rate: int
    
    # Custom Validator
    @validator('sys_bp')
    def check_bp(cls, v):
        if v < 0 or v > 300:
            raise ValueError('Invalid BP')
        return v`
    },
    {
        id: 'processing',
        title: 'Analytics Engine',
        subtitle: 'Statistical Computing Core',
        icon: Workflow,
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        activeBorderClass: 'border-blue-600',
        tech: ['Pandas', 'NumPy', 'SciPy'],
        description: 'A dedicated Python service that handles data transformation, missing value imputation, and statistical forecasting. It bridges the raw database and the ML models.',
        specs: [
            { label: 'Data Processing', value: 'Pandas DataFrames' },
            { label: 'Forecasting', value: 'Exponential Smoothing (EMA)' },
            { label: 'Imputation', value: 'Median Strategy' },
            { label: 'Aggregation', value: 'SQL Group By + Pandas' }
        ],
        patterns: [
            { title: 'Lazy Evaluation', desc: 'KPI metrics are calculated on-demand via optimized SQL queries rather than storing aggregates.' },
            { title: 'Vectorization', desc: 'Using NumPy arrays for high-speed calculation of risk drift across the entire cohort.' }
        ],
        codeSnippet: `
# Analytics Logic (analytics_engine.py)
def generate_forecast(self, db: Session):
    # 1. Fetch History
    df = pd.read_sql(query, db.bind)
    
    # 2. Calculate Trend (AI)
    df['trend'] = df['actual'].ewm(span=14).mean()
    
    # 3. Project Future
    last_val = df['trend'].iloc[-1]
    return [last_val * (1 + growth_rate) for i in range(7)]`
    },
    {
        id: 'ml',
        title: 'AI Prediction Core',
        subtitle: 'XGBoost & Explainability',
        icon: Brain,
        colorClass: 'text-purple-600',
        bgClass: 'bg-purple-50',
        borderClass: 'border-purple-200',
        activeBorderClass: 'border-purple-600',
        tech: ['XGBoost', 'SHAP', 'Scikit-Learn', 'Joblib'],
        description: 'The decision support engine. It uses a pre-trained Gradient Boosting model to predict readmission risk and SHAP (Game Theory) to generate local explanations for each patient.',
        specs: [
            { label: 'Algorithm', value: 'XGBoost Classifier' },
            { label: 'Explainability', value: 'TreeSHAP' },
            { label: 'Serialization', value: 'Joblib (.pkl)' },
            { label: 'Preprocessing', value: 'OneHotEncoder / StandardScaler' }
        ],
        patterns: [
            { title: 'Model Persistence', desc: 'The trained model is serialized to a file and loaded into memory on server start for low-latency inference.' },
            { title: 'Local Interpretability', desc: 'Providing specific reasons (e.g., "High BP") for every individual risk score.' }
        ],
        codeSnippet: `
# Inference Pipeline
# 1. Load Model
model = joblib.load("risk_model.pkl")

# 2. Predict Probability
risk_score = model.predict_proba(features)[0][1]

# 3. Generate Explanation
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(features)
# Returns feature contributions`
    },
    {
        id: 'serving',
        title: 'API Gateway',
        subtitle: 'FastAPI Microservice',
        icon: Server,
        colorClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
        activeBorderClass: 'border-emerald-600',
        tech: ['FastAPI', 'Uvicorn', 'CORS Middleware'],
        description: 'A lightweight, asynchronous web server exposing REST endpoints. It orchestrates the flow between the Database, Analytics Engine, and ML Model.',
        specs: [
            { label: 'Framework', value: 'FastAPI' },
            { label: 'Server', value: 'Uvicorn (ASGI)' },
            { label: 'Concurrency', value: 'Async / Await' },
            { label: 'Docs', value: 'Swagger UI (Auto-generated)' }
        ],
        patterns: [
            { title: 'Dependency Injection', desc: 'Database sessions are injected into route handlers, ensuring clean connection management.' },
            { title: 'Controller-Service', desc: 'Routes (Controllers) delegate logic to Services (Analytics/ML), keeping endpoints clean.' }
        ],
        codeSnippet: `
# API Endpoint (routes.py)
@router.post("/predict")
async def predict_risk(
    input: PatientData, 
    db: Session = Depends(get_db)
):
    # Delegate to Service
    result = ml_service.predict(input)
    
    return {
        "risk_score": result.score,
        "drivers": result.shap_values
    }`
    },
    {
        id: 'ui',
        title: 'Frontend Dashboard',
        subtitle: 'React Visualization Layer',
        icon: Globe,
        colorClass: 'text-teal-600',
        bgClass: 'bg-teal-50',
        borderClass: 'border-teal-200',
        activeBorderClass: 'border-teal-600',
        tech: ['React 18', 'TypeScript', 'Recharts', 'Tailwind'],
        description: 'A responsive Single Page Application (SPA) providing real-time data visualization. It transforms complex JSON API responses into intuitive medical dashboards.',
        specs: [
            { label: 'Framework', value: 'React + Vite' },
            { label: 'Language', value: 'TypeScript' },
            { label: 'Charting', value: 'Recharts (SVG)' },
            { label: 'Styling', value: 'Tailwind CSS' }
        ],
        patterns: [
            { title: 'Custom Hooks', desc: 'Encapsulating API fetching logic (e.g., usePatients) to keep components purely presentational.' },
            { title: 'Data Transformation', desc: 'Frontend adapters transform flat API data into nested structures required for UI components.' }
        ],
        codeSnippet: `
// Data Fetching Hook
useEffect(() => {
  const loadData = async () => {
    const data = await api.getPatients();
    // Transform for UI
    const formatted = data.map(p => ({
      ...p,
      vitals: { bp: \`\${p.sys}/\${p.dia}\` }
    }));
    setPatients(formatted);
  };
  loadData();
}, []);`
    }
];

const ML_DEEP_DIVE = [
    { 
        title: "Why XGBoost?", 
        content: "We selected XGBoost because it is the industry standard for structured tabular data (like medical records). Unlike neural networks, it performs exceptionally well on small-to-medium datasets and handles missing values natively, which is critical for real-world EMR data.", 
        icon: Target 
    },
    { 
        title: "Explainability Strategy", 
        content: "In healthcare, a 'black box' prediction is useless. We implemented SHAP (SHapley Additive exPlanations) to decompose the model's output. This allows the UI to display exactly which vital signs contributed to a high risk score, building trust with clinicians.", 
        icon: Brain 
    },
    { 
        title: "Forecasting Logic", 
        content: "For the patient census forecast, we avoided heavy time-series models (like ARIMA) in favor of Exponential Smoothing. This provides a responsive trend line that adapts quickly to recent changes in admission rates without requiring complex retraining.", 
        icon: Activity 
    }
];

const REFERENCES = [
    { title: "XGBoost: A Scalable Tree Boosting System", author: "Chen, T., & Guestrin, C.", year: "2016", context: "The core algorithm used for risk stratification." },
    { title: "FastAPI Documentation", author: "Ramírez, S.", year: "2023", context: "Architecture pattern for asynchronous microservices." },
    { title: "React: A JavaScript library for building user interfaces", author: "Meta", year: "2023", context: "Component-based UI design patterns." }
];

// --- COMPONENTS ---

const ArchitectureFlow = ({ onSelect, selectedId }: any) => (
    <div className="relative py-12 px-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[800px] gap-4 relative z-10">
            {ARCHITECTURE_LAYERS.map((layer, idx) => {
                const Icon = layer.icon;
                const isSelected = selectedId === layer.id;
                
                // Explicit classes to prevent Tailwind purging issues
                const borderClass = isSelected ? layer.activeBorderClass : 'border-slate-200';
                
                return (
                    <React.Fragment key={layer.id}>
                        {/* Node */}
                        <div 
                            onClick={() => onSelect(layer.id)}
                            className={`
                                relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer w-32 h-32 bg-white
                                ${borderClass} ${isSelected ? 'shadow-xl scale-110 z-20' : 'hover:border-slate-300 hover:shadow-md'}
                            `}
                        >
                            <div className={`p-2 rounded-lg ${layer.bgClass} ${layer.colorClass} mb-2`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 uppercase text-center leading-tight">{layer.title}</span>
                            
                            {/* Connector Line (Right) */}
                            {idx < ARCHITECTURE_LAYERS.length - 1 && (
                                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-0">
                                    <ArrowRight className="h-4 w-4 text-slate-300" />
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
        {/* Background Stream Line */}
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -z-0 transform -translate-y-1/2 min-w-[800px]"></div>
    </div>
);

const SystemArchitecture: React.FC = () => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>('ingestion');
  const [detailView, setDetailView] = useState<'overview' | 'specs' | 'code'>('overview');

  const selectedLayer = ARCHITECTURE_LAYERS.find(l => l.id === selectedLayerId);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12 font-sans text-slate-900">
      
      {/* 1. Hero / Abstract */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50 via-teal-50 to-transparent rounded-full blur-3xl opacity-60 -z-0"></div>
        <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Layers className="h-8 w-8 text-indigo-600" />
                        System Architecture
                    </h2>
                    <p className="text-slate-500 mt-3 text-lg max-w-3xl leading-relaxed">
                        Technical documentation for the <strong>OptiHealth Clinical AI Platform</strong>. 
                        This system utilizes a clean, modular architecture powered by Python (FastAPI) for high-performance inference and React for real-time clinician visualization.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 shadow-md">
                        <GitBranch className="h-4 w-4 text-emerald-400" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Live Environment</span>
                            <span className="font-mono text-sm font-bold text-white">{APP_VERSION}</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2 shadow-[0_0_10px_#10b981]"></span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Status: Operational</span>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Interactive Architecture Map */}
      <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Data Flow Topology
              </h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Interactive: Click nodes to inspect</span>
          </div>
          
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
              <ArchitectureFlow onSelect={setSelectedLayerId} selectedId={selectedLayerId} />
          </div>

          {/* Detail Pane */}
          {selectedLayer && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Left: Header & Nav */}
                  <div className={`lg:w-1/3 p-8 ${selectedLayer.bgClass} bg-opacity-30 border-r border-slate-100 flex flex-col`}>
                      <div className={`p-4 rounded-2xl bg-white shadow-sm border ${selectedLayer.borderClass} w-fit mb-6`}>
                          <selectedLayer.icon className={`h-10 w-10 ${selectedLayer.colorClass}`} />
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-900 mb-2">{selectedLayer.title}</h3>
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">{selectedLayer.subtitle}</p>
                      
                      <div className="flex flex-col gap-2 mt-auto">
                          {['overview', 'specs', 'code'].map((view) => (
                              <button 
                                key={view}
                                onClick={() => setDetailView(view as any)}
                                className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex justify-between items-center ${detailView === view ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/50'}`}
                              >
                                  {view.charAt(0).toUpperCase() + view.slice(1)}
                                  {detailView === view && <ChevronRight className="h-4 w-4 text-slate-400" />}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Right: Content */}
                  <div className="lg:w-2/3 p-8 bg-white relative">
                      {detailView === 'overview' && (
                          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                              <div>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Core Functionality</h4>
                                  <p className="text-slate-700 leading-relaxed text-base">{selectedLayer.description}</p>
                              </div>
                              <div>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Design Patterns</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {selectedLayer.patterns.map((p, i) => (
                                          <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                              <div className="flex items-center gap-2 mb-1">
                                                  <Box className="h-4 w-4 text-indigo-500" />
                                                  <h5 className="font-bold text-slate-800 text-sm">{p.title}</h5>
                                              </div>
                                              <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}

                      {detailView === 'specs' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                  <table className="w-full text-sm text-left">
                                      <tbody className="divide-y divide-slate-200">
                                          {selectedLayer.specs.map((spec, i) => (
                                              <tr key={i} className="hover:bg-white transition-colors">
                                                  <td className="px-6 py-4 font-bold text-slate-700 w-1/3">{spec.label}</td>
                                                  <td className="px-6 py-4 font-mono text-slate-600">{spec.value}</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                  {selectedLayer.tech.map(t => (
                                      <span key={t} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">{t}</span>
                                  ))}
                              </div>
                          </div>
                      )}

                      {detailView === 'code' && (
                          <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4">
                              <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><FileCode className="h-4 w-4" /> Code Snippet</h4>
                                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono border border-slate-200">Implementation</span>
                              </div>
                              <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto shadow-inner border border-slate-700 flex-1 relative group">
                                  <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                                      <code>{selectedLayer.codeSnippet}</code>
                                  </pre>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>

      {/* 3. Deep Dives (Algorithms) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
                  <BookOpen className="h-5 w-5 text-teal-600" /> Key Technical Decisions
              </h3>
              <div className="space-y-4">
                  {ML_DEEP_DIVE.map((article, i) => (
                      <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex-shrink-0 flex items-center justify-center text-indigo-600"><article.icon className="h-5 w-5" /></div>
                          <div><h4 className="font-bold text-slate-900 text-sm">{article.title}</h4><p className="text-xs text-slate-600 mt-1 leading-relaxed">{article.content}</p></div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Security */}
          <div className="bg-slate-900 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5"><Shield className="h-64 w-64" /></div>
              <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-teal-400" /> Security Best Practices</h3>
                  <p className="text-slate-400 text-sm mb-6">Designed with strict adherence to security principles for handling sensitive medical data.</p>
                  <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2"><span className="text-xs text-slate-400">Data Validation</span><span className="text-xs font-mono text-teal-400">Pydantic Schemas</span></div>
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2"><span className="text-xs text-slate-400">API Security</span><span className="text-xs font-mono text-teal-400">OAuth2 Bearer Tokens</span></div>
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2"><span className="text-xs text-slate-400">Database</span><span className="text-xs font-mono text-teal-400">SQL Injection Protection (ORM)</span></div>
                  </div>
                  <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded border border-slate-700"><Lock className="h-3 w-3 text-emerald-400" /><span className="text-xs font-bold">Secure by Design</span></div>
                  </div>
              </div>
          </div>
      </div>

      {/* 4. References */}
      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">References</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {REFERENCES.map((ref, i) => (
                  <div key={i} className="flex gap-3 group">
                      <span className="text-teal-600 font-mono text-xs mt-0.5">[{i + 1}]</span>
                      <div>
                          <p className="text-slate-900 font-bold text-sm group-hover:text-teal-700 transition-colors">{ref.title}</p>
                          <p className="text-xs text-slate-500">{ref.author}, {ref.year}</p>
                          <p className="text-[10px] text-slate-400 italic mt-1">{ref.context}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};

export default SystemArchitecture;