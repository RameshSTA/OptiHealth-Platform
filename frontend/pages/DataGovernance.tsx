import React, { useState, useEffect, useRef } from 'react';
import { 
    ShieldCheck, Database, AlertCircle, CheckCircle2, Download, Server, 
    GitBranch, Activity, RefreshCw, ArrowRight, AlertTriangle, 
    Filter, Clock, BarChart2, Workflow, Terminal, Play, X, Zap, Brain,
    ArrowUpRight, ArrowDownRight, HelpCircle, Code, Table, Check, Info
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { api } from '../services/api'; 
import { generateRawDataset, downloadCSV } from '../services/dataGenerator';

// --- TYPES (Matching Backend Schemas) ---

interface PipelineNode {
    id: string;
    label: string;
    type: 'batch' | 'stream' | 'store' | 'model';
    status: 'healthy' | 'warning' | 'error' | 'processing';
    metrics: { latency: string; throughput: string; errorRate: string; uptime: string; };
    techStack: string;
    description: string;
    lastIncident?: string;
}

interface FailedRow {
    id: string;
    reason: string;
}

interface DqRule {
    id: string;
    asset: string;
    column: string;
    ruleName: string;
    ruleType: string;
    status: 'pass' | 'fail' | 'warning';
    passRate: number;
    threshold: number;
    description: string;
    sqlLogic: string;
    failedRows: FailedRow[];
}

interface DriftBin {
    x: string;
    y: number;
}

interface DriftReport {
    feature: string;
    score: number;
    status: string;
    threshold: number;
    training: DriftBin[];
    serving: DriftBin[];
}

// --- SUB-COMPONENTS ---

const ExplainableMetricCard = ({ title, value, icon: Icon, colorClass, description, trend, onClick }: any) => (
    <div 
        onClick={() => onClick && onClick({ title, value, description })}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorClass.bg.replace('bg-', 'bg-').replace('/10', '')}`}></div>
        <div className="flex justify-between items-start mb-2 pl-3">
            <div className={`p-2.5 rounded-lg ${colorClass.bg} text-opacity-100 transition-transform group-hover:scale-110`}>
                <Icon className={`h-6 w-6 ${colorClass.text}`} />
            </div>
             {trend && (
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${trend.positive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trend.value}
                </div>
            )}
        </div>
        <div className="pl-3 mt-3 relative z-10">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        </div>
        <Icon className={`absolute right-[-10px] bottom-[-10px] h-24 w-24 opacity-[0.03] transform rotate-12 transition-transform group-hover:rotate-0 ${colorClass.text}`} />
    </div>
);

const PipelineVisual = ({ nodes, onSelectNode, selectedId }: { nodes: PipelineNode[], onSelectNode: (n: PipelineNode) => void, selectedId: string | null }) => (
    <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-4 relative px-4 py-8">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -z-10 transform -translate-y-1/2 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400 to-transparent w-1/2 animate-[shimmer_2s_infinite]"></div>
        </div>
        {nodes.map((node, idx) => {
            const isSelected = selectedId === node.id;
            const Icon = node.type === 'stream' ? Zap : node.type === 'store' ? Database : node.type === 'model' ? Brain : Server;
            return (
                <div key={node.id} className="relative flex-1 flex flex-col items-center group">
                    {idx < nodes.length - 1 && (
                        <div className="hidden md:flex absolute -right-[50%] top-1/2 transform -translate-y-1/2 z-0 items-center justify-center w-full">
                            <ArrowRight className="h-4 w-4 text-slate-300" />
                        </div>
                    )}
                    <div 
                        onClick={() => onSelectNode(node)}
                        className={`relative w-full max-w-[180px] bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? 'border-teal-500 shadow-lg ring-2 ring-teal-50 scale-105 z-10' : 'border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md z-10'}`}
                    >
                        <div className={`h-1.5 w-full ${node.status === 'healthy' ? 'bg-emerald-500' : node.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                        <div className="p-4 flex flex-col items-center text-center">
                            <div className={`p-2.5 rounded-lg mb-3 ${isSelected ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-500 group-hover:text-teal-600'}`}><Icon className="h-6 w-6" /></div>
                            <h4 className={`text-sm font-bold mb-1 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{node.label}</h4>
                            <p className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{node.techStack}</p>
                        </div>
                        <div className="bg-slate-50 border-t border-slate-100 p-2 flex justify-between items-center text-[10px] text-slate-500 px-4">
                            <span>Lat: {node.metrics.latency}</span>
                            <div className={`w-2 h-2 rounded-full ${node.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

const NodeDetailPanel = ({ node, onClose }: { node: PipelineNode, onClose: () => void }) => (
    <div className="border-t border-slate-200 bg-slate-50/50 p-6 animate-in slide-in-from-top-4">
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    {node.type === 'stream' ? <Zap className="h-6 w-6 text-teal-600" /> : 
                     node.type === 'store' ? <Database className="h-6 w-6 text-blue-600" /> : 
                     node.type === 'model' ? <Brain className="h-6 w-6 text-purple-600" /> : <Server className="h-6 w-6 text-slate-600" />}
                </div>
                <div><h3 className="text-xl font-bold text-slate-900">{node.label}</h3><p className="text-sm text-slate-500">{node.techStack}</p></div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Processing Metrics</p>
                <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-slate-600">Throughput</span><span className="text-sm font-mono font-bold text-slate-900">{node.metrics.throughput}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-600">Latency (p95)</span><span className="text-sm font-mono font-bold text-slate-900">{node.metrics.latency}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-600">Error Rate</span><span className={`text-sm font-mono font-bold ${node.metrics.errorRate === '0.00%' ? 'text-emerald-600' : 'text-amber-600'}`}>{node.metrics.errorRate}</span></div>
                </div>
            </div>
            <div className="md:col-span-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Stage Description & Status</p>
                <p className="text-sm text-slate-600 mb-4">{node.description}</p>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                    {node.status === 'healthy' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    <span className="font-medium text-slate-700">{node.status === 'healthy' ? 'System functioning normally. No active alerts.' : `Warning: ${node.lastIncident}`}</span>
                </div>
            </div>
        </div>
    </div>
);

const RuleDetailsModal = ({ rule, onClose }: { rule: DqRule, onClose: () => void }) => {
    if (!rule) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600" /> Rule Analysis: {rule.id}</h3><p className="text-xs text-slate-500 mt-0.5">{rule.ruleName}</p></div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className={`p-4 rounded-lg border flex items-start gap-3 ${rule.status === 'pass' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : rule.status === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
                         {rule.status === 'pass' ? <CheckCircle2 className="h-5 w-5 mt-0.5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 mt-0.5" />}
                         <div><h4 className="font-bold text-sm uppercase mb-1">Status: {rule.status}</h4><p className="text-sm opacity-90">{rule.description}</p><div className="mt-2 text-xs font-mono font-bold bg-white/50 px-2 py-1 rounded inline-block">Pass Rate: {rule.passRate}% (Threshold: {rule.threshold}%)</div></div>
                    </div>
                    <div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Code className="h-4 w-4" /> Validation Logic (SQL)</h4><div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs border border-slate-700 overflow-x-auto shadow-inner">{rule.sqlLogic}</div></div>
                    {rule.status !== 'pass' && rule.failedRows.length > 0 && (
                        <div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Table className="h-4 w-4" /> Sample Failed Records</h4><div className="border border-slate-200 rounded-lg overflow-hidden"><table className="w-full text-xs text-left"><thead className="bg-slate-50 font-bold text-slate-600"><tr><th className="px-3 py-2 border-b">ID</th><th className="px-3 py-2 border-b">Error Reason</th></tr></thead><tbody className="divide-y divide-slate-100">{rule.failedRows.map((row, i) => (<tr key={i}><td className="px-3 py-2 font-mono text-slate-700">{row.id}</td><td className="px-3 py-2 text-rose-600">{row.reason}</td></tr>))}</tbody></table></div></div>
                    )}
                </div>
             </div>
        </div>
    );
};

const DQSimulationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [step, setStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) { setStep(0); setLogs([]); runSimulation(); }
    }, [isOpen]);

    useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const runSimulation = async () => {
        addLog("Initializing Great Expectations Validation Suite v0.15.0..."); await new Promise(r => setTimeout(r, 800)); setStep(1);
        addLog("Connecting to Spark Session (Cluster: amp-data-prod-01)..."); await new Promise(r => setTimeout(r, 1000));
        addLog("Connection established. Fetching latest batch from 'silver.patient_vitals'..."); await new Promise(r => setTimeout(r, 1200)); setStep(2);
        addLog("Running Expectation: expect_column_values_to_be_unique(patient_id)");
        addLog("Running Expectation: expect_column_values_to_not_be_null(admission_date)"); await new Promise(r => setTimeout(r, 1500)); setStep(3);
        addLog("WARN: Null values detected in 'clinical_notes' (Rate: 5.8%)"); await new Promise(r => setTimeout(r, 1000)); setStep(4);
        addLog("Aggregating Data Quality Metrics..."); addLog("Validation Run Complete.");
    };

    if (!isOpen) return null;
    const progress = (step / 4) * 100;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Terminal className="h-5 w-5 text-teal-600" /> Running Validation Suite</h3><button onClick={onClose}><X className="h-5 w-5 text-slate-500" /></button></div>
                <div className="p-6 space-y-6">
                    <div><div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2"><span>Progress</span><span>{Math.round(progress)}%</span></div><div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div></div></div>
                    <div className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-green-400 border border-slate-700 shadow-inner custom-scrollbar">{logs.map((log, i) => (<div key={i} className="mb-1 opacity-90 border-l-2 border-transparent hover:border-green-600 pl-2">{log}</div>))}<div ref={logEndRef} /></div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">{step === 4 ? (<button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">Close & View Report</button>) : (<button disabled className="px-6 py-2 bg-slate-200 text-slate-400 rounded-lg font-bold cursor-wait">Running Checks...</button>)}</div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const DataGovernance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'observability' | 'quality' | 'lineage' | 'drift'>('observability');
  
  // Data State
  const [nodes, setNodes] = useState<PipelineNode[]>([]);
  const [rules, setRules] = useState<DqRule[]>([]);
  const [driftData, setDriftData] = useState<DriftReport | null>(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const [isSimulatingDQ, setIsSimulatingDQ] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DqRule | null>(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  // 1. FETCH DATA FROM BACKEND
  useEffect(() => {
      const loadData = async () => {
          setLoading(true);
          try {
              const [pipelineData, rulesData, driftRes] = await Promise.all([
                  api.getGovernancePipeline(),
                  api.getGovernanceRules(),
                  api.getDriftReport()
              ]);
              setNodes(pipelineData);
              setRules(rulesData);
              setDriftData(driftRes);
              if (pipelineData.length > 0) setSelectedNode(pipelineData[0]);
          } catch (e) {
              console.error("Governance Load Failed", e);
          } finally {
              setLoading(false);
          }
      };
      loadData();
  }, []);

  const handleDownloadDataset = () => {
    setIsGenerating(true);
    setTimeout(() => {
        const data = generateRawDataset(50000); 
        downloadCSV(data, 'optihealth_raw_data.csv');
        setIsGenerating(false);
    }, 800);
  };

  const handleRetrain = () => {
      setIsRetraining(true);
      setTimeout(() => { setIsRetraining(false); setRetrainSuccess(true); setTimeout(() => setRetrainSuccess(false), 3000); }, 2500);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Connecting to Data Control Plane...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 font-sans">
      
      {/* MODALS */}
      <DQSimulationModal isOpen={isSimulatingDQ} onClose={() => setIsSimulatingDQ(false)} />
      <RuleDetailsModal rule={selectedRule as DqRule} onClose={() => setSelectedRule(null)} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-teal-600" /> Data Reliability Engineering</h2>
            <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">Control plane for the end-to-end healthcare data lifecycle. Monitoring pipeline health, enforcing <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700">Great Expectations</span> quality rules.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={() => setIsSimulatingDQ(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all"><Play className="h-4 w-4" /> Run DQ Suite</button>
            <button onClick={handleDownloadDataset} disabled={isGenerating} className={`px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all ${isGenerating ? 'opacity-75 cursor-wait' : ''}`}>{isGenerating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</> : <><Download className="h-4 w-4" /> Download Raw Data</>}</button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ExplainableMetricCard title="Data Health Score" value="98.4%" icon={Activity} colorClass={{ bg: 'bg-emerald-100/10', text: 'text-emerald-600' }} trend={{ value: "+0.2%", positive: true }} onClick={() => {}} />
        <ExplainableMetricCard title="Pipeline Uptime" value="99.99%" icon={Server} colorClass={{ bg: 'bg-blue-100/10', text: 'text-blue-600' }} trend={{ value: "Stable", positive: true }} onClick={() => {}} />
        <ExplainableMetricCard title="Failed Rows (DLQ)" value="1,402" icon={AlertTriangle} colorClass={{ bg: 'bg-rose-100/10', text: 'text-rose-600' }} trend={{ value: "-12%", positive: true }} onClick={() => {}} />
        <ExplainableMetricCard title="Active Policies" value="158" icon={ShieldCheck} colorClass={{ bg: 'bg-purple-100/10', text: 'text-purple-600' }} onClick={() => {}} />
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
              {[{ id: 'observability', label: 'Pipeline Topology', icon: Activity }, { id: 'quality', label: 'DQ Rules', icon: CheckCircle2 }, { id: 'drift', label: 'Model Drift', icon: BarChart2 }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 ${activeTab === tab.id ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
                      <tab.icon className="h-4 w-4" /> {tab.label}
                  </button>
              ))}
          </div>

          <div className="p-6 min-h-[500px] bg-slate-50/30">
            {/* OBSERVABILITY TAB */}
            {activeTab === 'observability' && nodes.length > 0 && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex justify-between items-center">
                        <div><h3 className="text-lg font-bold text-slate-900">End-to-End Data Flow</h3><p className="text-sm text-slate-500">Real-time status of ingestion, processing, and serving layers.</p></div>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Monitoring</div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4 overflow-x-auto">
                        <div className="min-w-[768px]"><PipelineVisual nodes={nodes} onSelectNode={setSelectedNode} selectedId={selectedNode?.id || null} /></div>
                        {selectedNode && <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
                    </div>
                </div>
            )}

            {/* QUALITY TAB */}
            {activeTab === 'quality' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div><h3 className="text-lg font-bold text-slate-900">Validation Rules Suite</h3><p className="text-sm text-slate-500">Enforces schema, uniqueness, and domain constraints.</p></div>
                        <div className="flex gap-2 w-full sm:w-auto"><input type="text" placeholder="Search rules..." className="flex-1 sm:w-auto px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /><button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50"><Filter className="h-5 w-5 text-slate-500" /></button></div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[800px]">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200"><tr><th className="px-6 py-4">Status</th><th className="px-6 py-4">Rule Name & Asset</th><th className="px-6 py-4">Constraint Type</th><th className="px-6 py-4">Success Rate</th><th className="px-6 py-4 text-right">Action</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">{rules.map((rule) => (<tr key={rule.id} className="hover:bg-slate-50 group"><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${rule.status==='pass'?'bg-emerald-50 text-emerald-700 border-emerald-100':rule.status==='warning'?'bg-amber-50 text-amber-700 border-amber-100':'bg-rose-50 text-rose-700 border-rose-100'}`}>{rule.status==='pass'?<CheckCircle2 className="h-3 w-3"/>:<AlertTriangle className="h-3 w-3"/>}{rule.status.toUpperCase()}</span></td><td className="px-6 py-4"><p className="font-bold text-slate-800 font-mono text-xs">{rule.ruleName}</p><p className="text-xs text-slate-500 mt-0.5">{rule.asset} <span className="text-slate-300">|</span> {rule.column}</p><p className="text-[10px] text-slate-400 mt-1 italic max-w-md truncate">{rule.description}</p></td><td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">{rule.ruleType}</span></td><td className="px-6 py-4"><div className="w-full max-w-[120px]"><div className="flex justify-between text-xs mb-1"><span className="font-bold text-slate-700">{rule.passRate}%</span><span className="text-slate-400">Target: {rule.threshold}%</span></div><div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${rule.passRate>=rule.threshold?'bg-emerald-500':rule.passRate>80?'bg-amber-500':'bg-rose-500'}`} style={{width: `${rule.passRate}%`}}></div></div></div></td><td className="px-6 py-4 text-right"><button onClick={() => setSelectedRule(rule)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:bg-teal-50 hover:text-teal-700 shadow-sm">View Analysis</button></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* DRIFT TAB */}
            {activeTab === 'drift' && driftData && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2">
                             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-6"><div><h3 className="text-lg font-bold text-slate-900">{driftData.feature}</h3><p className="text-sm text-slate-500">Distribution comparison: Training (Baseline) vs Serving (Live)</p></div><div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100"><Activity className="h-4 w-4 text-rose-600" /><span className="text-sm font-bold text-rose-700">{driftData.status}</span></div></div>
                                <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={driftData.training.map((t, i) => ({ bin: t.x, Training: t.y, Serving: driftData.serving[i].y }))}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="bin" tick={{fontSize: 12}} /><YAxis /><RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} /><Legend verticalAlign="top" height={36} iconType="circle" /><Bar dataKey="Training" fill="#cbd5e1" barSize={32} radius={[4, 4, 0, 0]} /><Bar dataKey="Serving" fill="#f43f5e" barSize={32} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                             </div>
                         </div>
                         <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <h3 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2"><Brain className="h-5 w-5 text-indigo-600" /> Drift Diagnostics</h3>
                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100"><div className="flex justify-between items-end mb-1"><p className="text-xs text-slate-500 uppercase font-bold">KL Divergence</p><p className="text-xl font-bold font-mono text-rose-600">{driftData.score}</p></div><div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '85%' }}></div></div><p className="text-[10px] text-slate-400 mt-1 text-right">Threshold: {driftData.threshold}</p></div>
                                    <div><p className="text-sm text-slate-600 leading-relaxed"><strong>Analysis:</strong> Significant shift detected. The model is seeing lower values than trained on, leading to <strong className="text-rose-600">underestimation</strong>.</p></div>
                                    <div className="pt-4 border-t border-slate-100">{retrainSuccess ? (<div className="w-full py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2"><Check className="h-4 w-4" /> Pipeline Triggered</div>) : (<button onClick={handleRetrain} disabled={isRetraining} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">{isRetraining ? <><RefreshCw className="h-4 w-4 animate-spin" /> Triggering...</> : <><GitBranch className="h-4 w-4" /> Trigger Retraining</>}</button>)}</div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default DataGovernance;