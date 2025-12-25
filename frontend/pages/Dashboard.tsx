import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  Users, Activity, Clock, BedDouble, AlertTriangle, RefreshCw, Settings, 
  LayoutDashboard, Filter, CheckCircle2, Zap, BrainCircuit, MapPin, Stethoscope, ChevronRight, X
} from 'lucide-react';
import { api } from '../services/api';
import { Patient } from '../types';

interface DashboardProps {
    onNavigate: (tab: string) => void;
}

const COLORS = {
  low: '#10B981', medium: '#F59E0B', high: '#F97316', critical: '#EF4444', 
  primary: '#0F766E', secondary: '#6366F1', slate: '#64748B'
};

const KPICard = ({ title, value, unit, change, trend, icon: Icon, colorClass, subtitle, onClick }: any) => (
  <div onClick={onClick} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
    <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-lg border ${colorClass.bg} ${colorClass.border} ${colorClass.text} group-hover:scale-110 transition-transform`}>
            <Icon className="h-5 w-5" />
        </div>
        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full border ${trend === 'up' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
            {change}
        </div>
    </div>
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value?.toLocaleString() || 0}</span>
        <span className="text-sm text-slate-500 font-medium">{unit}</span>
    </div>
    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
        <Clock className="h-3 w-3" /> {subtitle} <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Patient[]>([]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [riskStats, setRiskStats] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
        const dashboardMetrics = await api.getDashboardMetrics();
        setData(dashboardMetrics);

        if (dashboardMetrics.populationRisk) {
            const riskMapping = dashboardMetrics.populationRisk.map((item: any) => ({
                ...item,
                color: COLORS[item.name.toLowerCase() as keyof typeof COLORS] || COLORS.medium
            }));
            setRiskStats(riskMapping);
        }

        const patients = await api.getPatients(0, 50, '', 'High'); 
        setAlerts(patients.slice(0, 5));

    } catch (err: any) {
        console.error("Dashboard Error:", err);
        setError("Analytics Engine offline. Ensure backend is running on port 8000.");
    } finally {
        setLoading(false);
    }
  };

  const handleDismissAlert = (e: React.MouseEvent, patientId: string) => {
      e.stopPropagation();
      setAlerts(prev => prev.filter(p => p.id !== patientId));
  };

  const handlePatientClick = (patient: Patient) => {
      setSelectedPatient(patient);
  };

  const renderKPIModal = () => {
      if (!selectedKPI) return null;
      return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">{selectedKPI.title} Details</h3>
                      <button onClick={() => setSelectedKPI(null)}><X className="h-5 w-5 text-slate-400" /></button>
                  </div>
                  <div className="p-6">
                      <div className="text-4xl font-extrabold text-slate-900 mb-2">{selectedKPI.value} <span className="text-lg text-slate-500 font-medium">{selectedKPI.unit}</span></div>
                      <p className="text-slate-500 text-sm mb-6">Historical trend analysis for the last 30 days based on aggregated EMR data.</p>
                      <div className="h-40 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                          <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2"><Activity className="h-4 w-4" /> Trend Data Visualization</span>
                      </div>
                  </div>
              </div>
          </div>
      )
  };

  const renderPatientModal = () => {
      if (!selectedPatient) return null;
      const vitals = selectedPatient.vitals || { hr: '--', bp: '--/--', spo2: '--', temp: '--' };

      return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
                      <div>
                          <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                          <p className="text-slate-300 text-sm mt-1">ID: {selectedPatient.id} • {selectedPatient.zone}</p>
                      </div>
                      <button onClick={() => setSelectedPatient(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="h-6 w-6" /></button>
                  </div>
                  <div className="p-6 space-y-6">
                      <div className="flex gap-4">
                          <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                              <span className="block text-xs font-bold text-slate-400 uppercase">Risk Score</span>
                              <span className={`text-3xl font-extrabold ${selectedPatient.riskScore > 70 ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedPatient.riskScore}</span>
                          </div>
                          <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                              <span className="block text-xs font-bold text-slate-400 uppercase">Condition</span>
                              <span className="text-lg font-bold text-slate-700">{selectedPatient.condition}</span>
                          </div>
                      </div>
                      <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2"><Activity className="h-4 w-4" /> Live Vitals</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex justify-between p-3 border rounded-lg"><span>Heart Rate</span> <span className="font-bold">{vitals.hr} bpm</span></div>
                              <div className="flex justify-between p-3 border rounded-lg"><span>BP</span> <span className="font-bold">{vitals.bp}</span></div>
                              <div className="flex justify-between p-3 border rounded-lg"><span>SPO2</span> <span className="font-bold">{vitals.spo2}%</span></div>
                              <div className="flex justify-between p-3 border rounded-lg"><span>Temp</span> <span className="font-bold">{vitals.temp}°C</span></div>
                          </div>
                      </div>
                      <button onClick={() => { setSelectedPatient(null); onNavigate('ml'); }} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                          <BrainCircuit className="h-5 w-5" /> Run ML Analysis
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  const renderSettingsModal = () => {
      if (!isSettingsOpen) return null;
      return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2"><Settings className="h-4 w-4" /> Dashboard Settings</h3>
                      <button onClick={() => setIsSettingsOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div><label className="text-sm font-bold text-slate-700">Refresh Rate</label><select className="w-full border p-2 rounded-lg mt-1 text-sm"><option>Real-time (Live Socket)</option><option>Every 30 Seconds</option></select></div>
                      <div><label className="text-sm font-bold text-slate-700">Risk Threshold</label><input type="range" className="w-full mt-2 accent-teal-600" /></div>
                  </div>
                  <div className="p-4 bg-slate-50 flex justify-end"><button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold">Save Changes</button></div>
              </div>
          </div>
      )
  };

  if (loading || !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Loading Real-Time Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans relative">
      {renderSettingsModal()}
      {renderKPIModal()}
      {renderPatientModal()}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10 backdrop-blur-xl bg-white/95">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5"><LayoutDashboard className="h-7 w-7 text-teal-600" /> OptiHealth Operations</h1>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
            System Operational • Live Data Stream
          </p>
        </div>
        <div className="flex items-center gap-3">
             <button onClick={loadData} className="p-2.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"><RefreshCw className="h-5 w-5" /></button>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"><Settings className="h-5 w-5" /></button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard onClick={() => setSelectedKPI({title: "Census", value: data.kpi.activePatients, unit: "Patients"})} title="Current Census" value={data.kpi.activePatients} unit="Patients" change="+1.2%" trend="up" icon={Users} colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' }} subtitle="Real-time Count" />
        <KPICard onClick={() => setSelectedKPI({title: "Readmission", value: data.kpi.readmissionRate, unit: "%"})} title="Readmission Rate" value={data.kpi.readmissionRate} unit="%" change="-0.4%" trend="down" icon={Activity} colorClass={{ bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' }} subtitle="30-day Rolling" />
        <KPICard onClick={() => setSelectedKPI({title: "Avg LOS", value: data.kpi.avgLos, unit: "Days"})} title="Avg Length of Stay" value={data.kpi.avgLos} unit="Days" change="-0.2" trend="down" icon={Clock} colorClass={{ bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' }} subtitle="Target: < 4.5" />
        <KPICard onClick={() => setSelectedKPI({title: "Bed Util", value: data.kpi.virtualBedUtilization, unit: "%"})} title="Bed Utilization" value={data.kpi.virtualBedUtilization} unit="%" change="+5%" trend="up" icon={BedDouble} colorClass={{ bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }} subtitle="Virtual Units" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Census Forecasting (DOTTED LINE UPDATE) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Patient Census Forecasting</h3>
                <div className="flex gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">Actual</span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">AI Predicted</span>
                </div>
            </div>
            <div className="flex-grow w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.censusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: COLORS.slate, fontSize: 11}} dy={10} tickFormatter={(str) => str.slice(5)} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: COLORS.slate, fontSize: 11}} domain={['auto', 'auto']} />
                        <Tooltip />
                        
                        {/* Actual History (Area) */}
                        <Area type="monotone" dataKey="actual" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual Census" connectNulls={true} />
                        
                        {/* AI Forecast (DOTTED LINE "....") */}
                        <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke={COLORS.secondary} 
                            strokeWidth={3} 
                            strokeDasharray="2 2" // <--- This creates the "...." dotted effect
                            dot={false} 
                            name="AI Projection" 
                            connectNulls={true} 
                        />
                        
                        <Line type="monotone" dataKey="capacity" stroke="#CBD5E1" strokeWidth={1} strokeDasharray="10 5" dot={false} name="Capacity" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 2. Population Risk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Population Risk</h3>
            <div className="flex-grow relative min-h-[220px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={riskStats} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" cornerRadius={6}>
                            {riskStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
                        {Math.round((riskStats.find(r => r.name === 'Critical')?.value || 0) / (riskStats.reduce((a:any, b:any) => a + b.value, 0) || 1) * 100)}%
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-widest mt-1">CRITICAL</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
                {riskStats.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div> {item.name}</div>
                        <span>{item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Feature Importance & Readmission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Top Risk Drivers (AI Powered) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6"><BrainCircuit className="h-5 w-5 text-indigo-600" /> Top Risk Drivers (AI)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.featureImportance} margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="feature" type="category" width={100} tick={{fontSize: 11, fill: COLORS.slate}} />
                        <Tooltip cursor={{fill: '#F8FAFC'}} />
                        <Bar dataKey="importance" fill={COLORS.secondary} radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 4. Readmission Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Readmission Trend</h3>
            <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.readmissionTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: COLORS.slate, fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: COLORS.slate, fontSize: 12}} domain={[0, 'auto']} />
                        <Tooltip />
                        <Bar dataKey="rate" fill="#CCFBF1" barSize={32} radius={[6, 6, 0, 0]} />
                        <Line type="monotone" dataKey="rate" stroke={COLORS.primary} strokeWidth={3} dot={{r: 4, fill: 'white', strokeWidth: 2}} />
                    </ComposedChart>
                 </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Live Alerts Table (Clickable) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" /> Live Clinical Alerts</h3><p className="text-sm text-slate-500 mt-1">Real-time triage queue.</p></div>
            <button onClick={() => onNavigate('patients')} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">View Full Cohort</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                    <tr><th className="px-6 py-4">Patient</th><th className="px-6 py-4">Condition</th><th className="px-6 py-4">Risk Score</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {alerts.length > 0 ? alerts.map((patient) => (
                        <tr 
                            key={patient.id} 
                            onClick={() => handlePatientClick(patient)} 
                            className="hover:bg-teal-50/30 cursor-pointer transition-colors"
                        >
                            <td className="px-6 py-4 font-bold text-slate-900">{patient.name} <span className="block text-xs font-normal text-slate-500">{patient.zone}</span></td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">{patient.condition}</span></td>
                            <td className="px-6 py-4"><div className="w-full max-w-[80px] h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${patient.riskScore > 80 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${patient.riskScore}%` }}></div></div><span className="text-xs font-bold mt-1 block">{patient.riskScore}</span></td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={(e) => handleDismissAlert(e, patient.id)} 
                                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                                >
                                    Done
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 italic">No active clinical alerts.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;