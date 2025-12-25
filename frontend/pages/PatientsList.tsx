import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ArrowUpDown, Download, Eye, 
  User, Activity, MapPin, AlertTriangle, X, Plus, 
  BarChart3, PieChart as PieIcon, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Patient } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';

// --- Configuration ---
const COLORS = {
    primary: '#0F766E', secondary: '#6366F1', 
    risk: ['#10B981', '#F59E0B', '#F97316', '#EF4444']
};

// --- INITIAL DRILL DOWN DATA (Will be updated with Real Data) ---
const INITIAL_COHORT_DETAILS: Record<string, any> = {
    'total': { id: 'total', title: 'Demographics', description: 'Age distribution of current census.', chartType: 'bar', data: [{ name: '18-35', value: 120 }, { name: '36-50', value: 200 }, { name: '51-65', value: 310 }, { name: '65+', value: 525 }], colors: ['#3B82F6'] },
    'critical': { id: 'critical', title: 'Critical Acuity', description: 'Breakdown of high-risk conditions.', chartType: 'pie', data: [{ name: 'Sepsis', value: 30 }, { name: 'CHF', value: 45 }, { name: 'Pneumonia', value: 25 }], colors: ['#EF4444', '#F59E0B', '#10B981'] },
    'risk': { id: 'risk', title: 'Risk Stratification', description: 'Live population risk distribution.', chartType: 'bar', data: [], colors: ['#6366F1'] }, // Data loaded dynamically
    'zones': { id: 'zones', title: 'Zone Load', description: 'Patient distribution across units.', chartType: 'pie', data: [{ name: 'North Wing', value: 300 }, { name: 'Cardiac', value: 250 }, { name: 'ICU Remote', value: 200 }], colors: ['#0F766E', '#2DD4BF', '#F59E0B'] }
};

// --- COMPONENTS ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, borderClass, onClick }: any) => (
  <div onClick={onClick} className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between relative overflow-hidden group ${borderClass} cursor-pointer hover:shadow-md transition-all hover:-translate-y-1`}>
    <div className="relative z-10">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{title}</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{value?.toLocaleString() || 0}</h2>
        <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1 group-hover:text-slate-800 transition-colors">
            {subtext} <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
        <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

const CohortStatModal = ({ statId, details, onClose }: { statId: string | null, details: any, onClose: () => void }) => {
    if (!statId || !details[statId]) return null;
    const detail = details[statId];
    
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {detail.chartType === 'pie' ? <PieIcon className="h-5 w-5 text-teal-600" /> : <BarChart3 className="h-5 w-5 text-teal-600" />} {detail.title}
                    </h3>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-6 h-64">
                    <p className="text-sm text-slate-500 mb-4">{detail.description}</p>
                    <ResponsiveContainer width="100%" height="85%">
                        {detail.chartType === 'pie' ? (
                            <PieChart>
                                <Pie data={detail.data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {detail.data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={detail.colors ? detail.colors[index % detail.colors.length] : '#3B82F6'} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        ) : (
                            <BarChart data={detail.data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                <YAxis tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="value" fill={detail.colors ? detail.colors[0] : '#3B82F6'} radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const AddPatientModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', age: '', gender: 'Male',
        condition: 'Hypertension', zone: 'General Ward',
        bp_sys: '120', bp_dia: '80', hr: '75', spo2: '98', temp: '37.0', weight: '70', height: '175'
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        // 1. Calculate BMI
        const heightM = parseFloat(formData.height) / 100;
        const weightKg = parseFloat(formData.weight);
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);

        // 2. Prepare Flat Payload (Matches Backend Schema exactly)
        const payload = {
            name: `${formData.first_name} ${formData.last_name}`,
            age: parseInt(formData.age) || 0,
            gender: formData.gender,
            condition: formData.condition,
            zone: formData.zone,
            sys_bp: parseInt(formData.bp_sys) || 120,
            dia_bp: parseInt(formData.bp_dia) || 80,
            heart_rate: parseInt(formData.hr) || 75,
            spo2: parseFloat(formData.spo2) || 98.0,
            temp: parseFloat(formData.temp) || 37.0,
            bmi: parseFloat(bmi) || 25.0,
            risk_score: 0, // Backend will recalculate if needed
            risk_level: "Low"
        };
        onSave(payload);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Plus className="h-5 w-5 text-teal-600" /> Register New Patient</h3>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-500 uppercase">First Name</label><input className="w-full border p-2 rounded text-sm" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Last Name</label><input className="w-full border p-2 rounded text-sm" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Age</label><input type="number" className="w-full border p-2 rounded text-sm" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Gender</label><select className="w-full border p-2 rounded text-sm" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option>Male</option><option>Female</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Condition</label><select className="w-full border p-2 rounded text-sm" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}><option>Hypertension</option><option>Diabetes</option><option>COPD</option><option>CHF</option><option>Pneumonia</option></select></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Zone</label><select className="w-full border p-2 rounded text-sm" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})}><option>General Ward</option><option>ICU Remote</option><option>Home Care A</option><option>Cardiac Unit</option></select></div>
                    </div>
                    <div className="pt-2 border-t border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Vitals</p>
                        <div className="grid grid-cols-3 gap-3">
                            <input placeholder="Sys BP" className="border p-2 rounded text-sm" value={formData.bp_sys} onChange={e => setFormData({...formData, bp_sys: e.target.value})} />
                            <input placeholder="Dia BP" className="border p-2 rounded text-sm" value={formData.bp_dia} onChange={e => setFormData({...formData, bp_dia: e.target.value})} />
                            <input placeholder="HR" className="border p-2 rounded text-sm" value={formData.hr} onChange={e => setFormData({...formData, hr: e.target.value})} />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-bold shadow-lg shadow-slate-200">Register Patient</button>
                </div>
            </div>
        </div>
    );
};

const PatientDetailModal = ({ patient, onClose }: { patient: Patient, onClose: () => void }) => {
    if (!patient) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold border border-teal-200">{patient.name.substring(0,2).toUpperCase()}</div>
                        <div><h2 className="text-lg font-bold text-slate-900">{patient.name}</h2><p className="text-xs text-slate-500 font-mono">{patient.id}</p></div>
                    </div>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className={`p-4 rounded-xl border-l-4 flex items-start gap-3 ${patient.riskLevel === 'Critical' ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-slate-50 border-slate-300'}`}>
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div><p className="font-bold text-sm">Risk Level: {patient.riskLevel}</p><p className="text-xs opacity-90">{patient.condition} • {patient.zone}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-[10px] text-slate-500 uppercase font-bold">BP</span><div className="font-bold text-slate-900">{patient.vitals.bp}</div></div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-[10px] text-slate-500 uppercase font-bold">Heart Rate</span><div className="font-bold text-slate-900">{patient.vitals.hr} bpm</div></div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-[10px] text-slate-500 uppercase font-bold">SpO2</span><div className="font-bold text-slate-900">{patient.vitals.spo2}%</div></div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-[10px] text-slate-500 uppercase font-bold">Temp</span><div className="font-bold text-slate-900">{patient.vitals.temp}°C</div></div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50">Close Record</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const PatientsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRisk, setFilterRisk] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStatId, setSelectedStatId] = useState<string | null>(null);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, critical: 0, avgRisk: 0, activeUnits: 0 });
  const [cohortDetails, setCohortDetails] = useState(INITIAL_COHORT_DETAILS); // Dynamic Drill-down data

  const itemsPerPage = 10;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadPatients();
    }, 500); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, filterRisk, sortBy]);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
      try {
          const metrics = await api.getDashboardMetrics();
          
          // Inject REAL Risk Data into the "Avg Risk Score" drill-down chart
          if (metrics.populationRisk) {
              setCohortDetails(prev => ({
                  ...prev,
                  'risk': {
                      ...prev['risk'],
                      data: metrics.populationRisk.map((item: any) => ({ name: item.name, value: item.value }))
                  }
              }));
          }

          setStats({
              total: metrics.kpi.activePatients,
              critical: 0, // Can be refined if API returns count
              avgRisk: 51,
              activeUnits: metrics.kpi.virtualBedUtilization > 0 ? 5 : 0
          });
      } catch (e) { console.error("Stats Error", e); }
  };

  const loadPatients = async () => {
    setLoading(true);
    try {
        const skip = (currentPage - 1) * itemsPerPage;
        const data = await api.getPatients(skip, itemsPerPage, searchTerm, filterRisk, sortBy);
        setPatients(data);
    } catch (err) { console.error("Data Load Error", err); } 
    finally { setLoading(false); }
  };

  const handleAddPatient = async (newPatientData: any) => {
      try {
          await api.createPatient(newPatientData);
          loadPatients(); 
          alert("Patient Registered Successfully!");
      } catch (e: any) {
          alert("Registration Failed: " + e.message);
      }
  };

  const handleExport = async () => {
      try {
          await api.downloadCSV();
      } catch (e) { alert("Download failed"); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      
      {selectedPatient && <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}
      <AddPatientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddPatient} />
      <CohortStatModal statId={selectedStatId} details={cohortDetails} onClose={() => setSelectedStatId(null)} />

      {/* Cards - Clickable Drill Downs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard title="Total Census" value={stats.total} subtext="Records Loaded" icon={User} colorClass="bg-blue-600 text-blue-600" borderClass="border-l-4 border-l-blue-600" onClick={() => setSelectedStatId('total')} />
         <StatCard title="Critical Acuity" value={patients.filter(p => p.riskLevel === 'Critical').length} subtext="Visible on Page" icon={AlertTriangle} colorClass="bg-rose-600 text-rose-600" borderClass="border-l-4 border-l-rose-600" onClick={() => setSelectedStatId('critical')} />
         <StatCard title="Avg Risk Score" value={stats.avgRisk} subtext="Cohort Average" icon={Activity} colorClass="bg-indigo-600 text-indigo-600" borderClass="border-l-4 border-l-indigo-600" onClick={() => setSelectedStatId('risk')} />
         <StatCard title="Operational Zones" value={stats.activeUnits} subtext="Active Units" icon={MapPin} colorClass="bg-teal-600 text-teal-600" borderClass="border-l-4 border-l-teal-600" onClick={() => setSelectedStatId('zones')} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-slate-900">Patient Cohort Management</h2><p className="text-slate-500 mt-1">Real-time patient monitoring.</p></div>
        <div className="flex gap-3">
             <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-all"><Plus className="h-4 w-4" /> Register Patient</button>
             <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium shadow-sm transition-all"><Download className="h-4 w-4" /> Export CSV</button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search Patient ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            </div>
            <div className="flex gap-2">
                <select className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 focus:outline-none" value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                    <option value="">All Risks</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <button onClick={() => setSortBy(prev => prev === 'date' ? 'risk' : 'date')} className="px-4 py-2 border border-slate-300 rounded-lg flex items-center gap-2 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                    <ArrowUpDown className="h-4 w-4" /> Sort: {sortBy === 'date' ? 'Date' : 'Risk'}
                </button>
            </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
            <div className="p-12 flex flex-col justify-center items-center text-slate-500 gap-3">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Loading Data...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Identity</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Vitals (Live)</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Zone</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Acuity Level</th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                    <tr key={patient.id} onClick={() => setSelectedPatient(patient)} className="hover:bg-teal-50/20 transition-colors group cursor-pointer">
                    <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">{patient.name.substring(0, 2).toUpperCase()}</div>
                            <div><div className="font-bold text-slate-900">{patient.name}</div><div className="text-xs text-slate-500 font-mono">{patient.id}</div></div>
                        </div>
                    </td>
                    <td className="py-4 px-6"><span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{patient.condition}</span></td>
                    <td className="py-4 px-6"><div className="flex gap-4 text-sm text-slate-600 font-mono"><span>BP: {patient.vitals.bp}</span><span className={`font-bold ${patient.vitals.spo2 < 92 ? 'text-rose-600' : 'text-emerald-600'}`}>SpO2: {patient.vitals.spo2}%</span></div></td>
                    <td className="py-4 px-6 text-sm text-slate-600 flex items-center gap-2"><MapPin className="h-3 w-3 text-slate-400" /> {patient.zone}</td>
                    <td className="py-4 px-6">
                        <div className="w-full max-w-[120px]">
                            <div className="flex justify-between text-xs mb-1"><span className={`font-bold ${patient.riskScore > 80 ? 'text-rose-600' : 'text-slate-700'}`}>{patient.riskLevel}</span><span className="font-mono">{patient.riskScore}%</span></div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${patient.riskScore > 80 ? 'bg-rose-500' : patient.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${patient.riskScore}%` }}></div></div>
                        </div>
                    </td>
                    <td className="py-4 px-6 text-right"><button className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 p-2 rounded-lg transition-colors"><Eye className="h-5 w-5" /></button></td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">Page {currentPage}</span>
            <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 text-sm font-medium bg-white">Previous</button>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={loading} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 text-sm font-medium bg-white">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsList;