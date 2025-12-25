import React, { useState, useRef, useEffect } from 'react';
import { 
    Send, User, Bot, Phone, Book, Server, 
    Activity, CheckCircle2, AlertCircle, RefreshCw, Terminal, 
    Smartphone, Search, FileText, ChevronRight, Clock,
    Zap, ExternalLink, LifeBuoy, AlertTriangle,
    MessageSquare, MoreHorizontal, Paperclip, X, Network, Lock,
    PhoneCall, Headphones, Calendar, ArrowRight, Filter, Eye
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { SystemService, Ticket } from '../types';

// --- DATA ---
const RECENT_TICKETS: Ticket[] = [
    { 
        id: 'INC-4921', subject: 'iPad unable to sync vitals', status: 'In Progress', priority: 'High', date: 'Today', requester: 'Nurse Joy', assignee: 'Mike T.', slaBreach: '2h 15m',
        conversation: [{ sender: 'Nurse Joy', text: 'Sync Failed on iPad Room 402.', time: '09:30 AM' }, { sender: 'Mike T.', text: 'Checking logs.', time: '09:45 AM' }]
    },
    { 
        id: 'REQ-1102', subject: 'Password reset request', status: 'Resolved', priority: 'Low', date: 'Yesterday', requester: 'Dr. Smith', conversation: [{ sender: 'System', text: 'Reset link sent.', time: '10:00 AM' }]
    },
    {
        id: 'INC-3382', subject: 'Video Bridge Latency', status: 'Open', priority: 'Medium', date: 'Oct 24', requester: 'Admin', conversation: []
    }
];

const KB_ARTICLES = [
    { id: '1', title: 'Troubleshooting Bluetooth Oximeters', cat: 'Hardware', views: 1200, updated: '2 days ago' },
    { id: '2', title: 'VPN Connection Errors (Error 800)', cat: 'Network', views: 850, updated: '1 week ago' },
    { id: '3', title: 'Resetting Clinical iPad Credentials', cat: 'Access', views: 600, updated: '3 days ago' },
    { id: '4', title: 'OptiHealth Risk Score Explanation', cat: 'Clinical', views: 450, updated: '1 month ago' },
    { id: '5', title: 'Sanitizing IoT Sensors Protocol', cat: 'Protocol', views: 320, updated: '5 days ago' }
];

// --- MODALS (POPUPS) ---

// 1. Service Diagnostics Modal (Linked to Top Cards)
const ServiceDetailModal = ({ service, onClose }: { service: SystemService, onClose: () => void }) => {
    if (!service) return null;
    const isHealthy = service.status === 'operational';
    const color = isHealthy ? '#10B981' : service.status === 'degraded' ? '#F59E0B' : '#EF4444';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Activity className="h-5 w-5 text-teal-600" /> Service Diagnostics</h3>
                    <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                            <h2 className="text-xl font-bold text-slate-900">{service.name}</h2>
                        </div>
                        <p className="text-sm text-slate-500">{service.description}</p>
                    </div>
                    
                    {/* Latency Graph */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                            <span>Real-time Latency</span>
                            <span className="font-mono text-slate-900">{service.latency}ms</span>
                        </div>
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={service.history}>
                                    <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.3}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <Area type="monotone" dataKey="latency" stroke={color} fill="url(#grad)" strokeWidth={2} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Dependencies</h4>
                        <div className="flex flex-wrap gap-2">{service.dependencies.map(d => <span key={d} className="px-2 py-1 bg-slate-100 text-xs font-bold rounded border border-slate-200 text-slate-600">{d}</span>)}</div>
                    </div>
                    <div className={`p-3 rounded-lg flex items-center gap-3 ${isHealthy ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {isHealthy ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        <span className="text-sm font-bold">{isHealthy ? 'All Systems Operational' : 'Performance Degraded - Ticket #INC-992 Created'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Knowledge Base Modal (Linked to Bottom Card 1)
const KnowledgeBaseModal = ({ onClose }: { onClose: () => void }) => {
    const [search, setSearch] = useState('');
    const filtered = KB_ARTICLES.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="px-6 py-5 border-b border-slate-100 bg-blue-600 text-white flex justify-between items-center">
                    <div><h3 className="text-xl font-bold flex items-center gap-2"><Book className="h-6 w-6" /> Knowledge Base</h3><p className="text-blue-100 text-sm mt-1">Search 450+ guides and clinical protocols.</p></div>
                    <button onClick={onClose}><X className="h-6 w-6 text-white hover:text-blue-200" /></button>
                </div>
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" /><input type="text" autoFocus placeholder="Search..." className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium shadow-sm" value={search} onChange={e => setSearch(e.target.value)} /></div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                    {filtered.map(article => (
                        <div key={article.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md cursor-pointer group bg-white transition-all">
                            <div className="flex justify-between mb-2"><span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded text-slate-600 tracking-wide group-hover:bg-blue-50 group-hover:text-blue-600">{article.cat}</span><span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {article.updated}</span></div>
                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-700">{article.title}</h4>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 3. Report Incident Modal (Linked to Bottom Card 2)
const ReportIncidentModal = ({ onClose }: { onClose: () => void }) => {
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); await new Promise(r => setTimeout(r, 1500)); setLoading(false); onClose(); alert("Ticket Created!"); };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-amber-50 flex justify-between items-center">
                    <div><h3 className="text-xl font-bold text-amber-900 flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-amber-600" /> Report Incident</h3><p className="text-amber-800/70 text-sm mt-1">Log a hardware or software failure.</p></div>
                    <button onClick={onClose}><X className="h-6 w-6 text-amber-900/50 hover:text-amber-900" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label><input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="e.g. iPad Screen Frozen" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label><select className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset</label><select className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"><option>iPad</option><option>Workstation</option><option>Network</option></select></div>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label><textarea required rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm resize-none"></textarea></div>
                    <div className="pt-2 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg text-sm">Cancel</button><button disabled={loading} type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-sm shadow-sm flex items-center gap-2">{loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Ticket</button></div>
                </form>
            </div>
        </div>
    );
};

// 4. My Requests Modal (Linked to Bottom Card 3)
const MyRequestsModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="px-6 py-5 border-b border-slate-100 bg-emerald-50 flex justify-between items-center">
                    <div><h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-emerald-600" /> My Requests</h3><p className="text-emerald-800/70 text-sm mt-1">Track status of your open tickets.</p></div>
                    <button onClick={onClose}><X className="h-6 w-6 text-emerald-900/50 hover:text-emerald-900" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider"><tr><th className="px-6 py-3">Ticket ID</th><th className="px-6 py-3">Subject</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">{RECENT_TICKETS.map(ticket => (<tr key={ticket.id} className="hover:bg-slate-50 transition-colors cursor-pointer"><td className="px-6 py-4 font-mono font-bold text-slate-600">{ticket.id}</td><td className="px-6 py-4 font-medium text-slate-900">{ticket.subject}</td><td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${ticket.status==='Open'?'bg-blue-50 text-blue-700':ticket.status==='In Progress'?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700'}`}>{ticket.status}</span></td><td className="px-6 py-4 text-right"><button className="text-emerald-600 hover:text-emerald-800 font-bold text-xs hover:underline">View</button></td></tr>))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 5. NOC Hotline Modal
const NOCHotlineModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
            <div className="p-8">
                <div className="flex justify-between items-start mb-6"><div><h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><PhoneCall className="h-6 w-6 text-rose-600" /> NOC Hotline</h2><p className="text-slate-500 text-sm mt-1">24/7 Operations Center</p></div><button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600" /></button></div>
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="p-2 bg-white rounded-full text-rose-600 shadow-sm"><AlertTriangle className="h-5 w-5" /></div><div><p className="font-bold text-rose-900">Critical Incidents Only</p><p className="text-xs text-rose-700">System Outages</p></div></div><span className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg shadow-sm">+1 (800) 555-0199</span></div>
            </div>
        </div>
    </div>
);

// --- MAIN PAGE ---

const HelpDesk: React.FC = () => {
  const [services, setServices] = useState<SystemService[]>([]);
  const [messages, setMessages] = useState<{id: string, sender: string, text: string, timestamp: Date}[]>([{ id: '1', sender: 'bot', text: 'Hello. I am the OptiHealth AI Assistant. How can I assist you?', timestamp: new Date() }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // MODAL STATES
  const [selectedService, setSelectedService] = useState<SystemService | null>(null);
  const [isNOCOpen, setIsNOCOpen] = useState(false);
  const [isKBOpen, setIsKBOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  
  // TOOLS STATES
  const [diagStatus, setDiagStatus] = useState<'idle'|'running'|'done'>('idle');
  const [diagProgress, setDiagProgress] = useState(0);
  const [remoteCode, setRemoteCode] = useState<string | null>(null);
  const [remoteTimer, setRemoteTimer] = useState(300);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const fetchStatus = async () => { try { const data = await api.getSystemStatus(); setServices(data); } catch(e) {} }; fetchStatus(); const interval = setInterval(fetchStatus, 30000); return () => clearInterval(interval); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => { if (remoteCode && remoteTimer > 0) { const timer = setTimeout(() => setRemoteTimer(p => p - 1), 1000); return () => clearTimeout(timer); } else if (remoteTimer === 0) setRemoteCode(null); }, [remoteTimer, remoteCode]);

  const handleSend = async (e: React.FormEvent) => { e.preventDefault(); if (!inputText.trim()) return; const userMsg = { id: Date.now().toString(), sender: 'user', text: inputText, timestamp: new Date() }; setMessages(prev => [...prev, userMsg]); setInputText(''); setIsTyping(true); try { const replyText = await api.sendChatMessage(userMsg.text); setMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'bot', text: replyText, timestamp: new Date() }]); } catch (e) { setMessages(prev => [...prev, { id: 'err', sender: 'bot', text: "Connection error.", timestamp: new Date() }]); } finally { setIsTyping(false); } };
  const runDiagnostics = () => { setDiagStatus('running'); setDiagProgress(0); const interval = setInterval(() => { setDiagProgress(prev => { if (prev >= 100) { clearInterval(interval); setDiagStatus('done'); return 100; } return prev + 10; }); }, 200); };

  return (
    <div className="min-h-screen space-y-8 animate-in fade-in duration-500 pb-12 font-sans relative">
      
      {/* RENDER MODALS */}
      {selectedService && <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} />}
      {isNOCOpen && <NOCHotlineModal onClose={() => setIsNOCOpen(false)} />}
      {isKBOpen && <KnowledgeBaseModal onClose={() => setIsKBOpen(false)} />}
      {isReportOpen && <ReportIncidentModal onClose={() => setIsReportOpen(false)} />}
      {isRequestsOpen && <MyRequestsModal onClose={() => setIsRequestsOpen(false)} />}

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
          <div><h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5"><LifeBuoy className="h-7 w-7 text-teal-600" /> Technical Support Console</h2><p className="text-slate-500 mt-1 text-sm font-medium">Tier 1 Support for Clinical Field Operations</p></div>
          <div className="flex gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input type="text" placeholder="Quick Search..." className="w-64 pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" onClick={() => setIsKBOpen(true)} readOnly /></div><button onClick={() => setIsNOCOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-md"><PhoneCall className="h-4 w-4" /> NOC Hotline</button></div>
      </div>

      {/* SYSTEM STATUS GRID (TOP CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
              <div key={s.id} onClick={() => setSelectedService(s)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 cursor-pointer group transition-all relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${s.status === 'operational' ? 'bg-emerald-500' : s.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                  <div className="flex justify-between items-start pl-3"><div className="flex items-center gap-3"><div className={`p-2.5 rounded-lg ${s.status === 'operational' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><Server className="h-5 w-5" /></div><div><p className="text-sm font-bold text-slate-900 group-hover:text-teal-700">{s.name}</p><div className="flex items-center gap-2 mt-1"><span className={`w-2 h-2 rounded-full ${s.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span><span className="text-xs text-slate-500 font-medium capitalize">{s.status}</span></div></div></div><div className="text-right"><p className={`text-sm font-mono font-bold ${s.status === 'operational' ? 'text-emerald-600' : 'text-amber-600'}`}>{s.latency}ms</p><p className="text-[10px] text-slate-400 font-medium">Up: {s.uptime}</p></div></div>
              </div>
          ))}
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          <div className="lg:col-span-4 space-y-6 flex flex-col">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden group"><div className="flex justify-between items-center mb-6 relative z-10"><h3 className="font-bold flex items-center gap-2 text-lg"><Terminal className="h-5 w-5 text-teal-400" /> Diagnostics</h3>{diagStatus === 'idle' && <button onClick={runDiagnostics} className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold rounded-lg transition-colors shadow-lg">Run Check</button>}</div><div className="space-y-3 font-mono text-xs relative z-10 min-h-[100px]">{diagStatus === 'idle' && <p className="text-slate-400">Run system integrity check.</p>}{diagStatus === 'running' && (<div className="space-y-3 animate-in fade-in"><div className="flex justify-between text-teal-400 font-bold"><span>Running tests...</span><span>{diagProgress}%</span></div><div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-teal-500 transition-all duration-200" style={{width: `${diagProgress}%`}}></div></div></div>)}{diagStatus === 'done' && (<div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 animate-in zoom-in-95"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><div><p className="font-bold text-emerald-100">System Healthy</p></div></div>)}</div><Activity className="absolute -right-6 -bottom-6 h-40 w-40 text-slate-800/50 group-hover:text-slate-800/80 transition-colors" /></div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><div className="flex items-start gap-4 mb-5"><div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Smartphone className="h-6 w-6" /></div><div><h4 className="font-bold text-slate-900">Remote Assistance</h4><p className="text-xs text-slate-500 mt-1">Generate code for IT screen sharing.</p></div></div>{remoteCode ? (<div className="text-center bg-indigo-50 p-5 rounded-xl border border-indigo-100 animate-in zoom-in-95"><p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-2">Session Code</p><p className="text-4xl font-mono font-black text-indigo-600 tracking-wider mb-3">{remoteCode}</p><p className="text-xs text-indigo-400 flex items-center justify-center gap-1.5 font-medium"><Clock className="h-3 w-3" /> Expires in {Math.floor(remoteTimer/60)}:{(remoteTimer%60).toString().padStart(2,'0')}</p></div>) : (<button onClick={() => { setRemoteCode(Math.floor(100000 + Math.random() * 900000).toString()); setRemoteTimer(300); }} className="w-full py-3 border-2 border-indigo-100 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-50 flex items-center justify-center gap-2"><Zap className="h-4 w-4" /> Generate Secure Code</button>)}</div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col"><div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><h4 className="font-bold text-slate-900 text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-slate-500" /> Recent Tickets</h4><button onClick={() => setIsRequestsOpen(true)} className="text-xs font-bold text-teal-600 hover:text-teal-700">View All</button></div><div className="divide-y divide-slate-100 overflow-y-auto">{RECENT_TICKETS.map(t => (<div key={t.id} className="p-4 hover:bg-slate-50 cursor-pointer group transition-colors"><div className="flex justify-between items-center mb-1"><span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{t.id}</span><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.status==='Resolved'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{t.status}</span></div><p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-600 transition-colors">{t.subject}</p></div>))}</div></div>
          </div>
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[600px] lg:h-auto"><div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-10"><div className="flex items-center gap-4"><div className="relative"><div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg ring-4 ring-teal-50"><Bot className="h-6 w-6" /></div><span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span></div><div><h3 className="font-bold text-slate-900 text-lg">Virtual Operations Assistant</h3><p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> Powered by OptiHealth Knowledge Graph</p></div></div><button onClick={() => setMessages([])} className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-teal-600 transition-colors"><RefreshCw className="h-5 w-5" /></button></div><div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth">{messages.map((msg, i) => (<div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}><div className={`flex gap-4 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border ${msg.sender === 'user' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-teal-600'}`}>{msg.sender === 'user' ? <User className="h-4 w-4" /> : <Zap className="h-4 w-4" />}</div><div><div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>{msg.text}</div></div></div></div>))} {isTyping && (<div className="flex gap-4 max-w-[80%] animate-in fade-in"><div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-teal-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"><Zap className="h-4 w-4" /></div><div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-12"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span></div></div>)}<div ref={messagesEndRef} /></div><div className="p-5 bg-white border-t border-slate-100"><div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">{['Explain SHAP values', 'Reset my password', 'iPad sync failed', 'Report system outage'].map((s, i) => (<button key={i} onClick={() => setInputText(s)} className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-full text-xs font-bold text-slate-600 hover:text-teal-700 transition-all shadow-sm">{s}</button>))}</div><form onSubmit={handleSend} className="relative flex gap-3"><div className="relative flex-1"><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type your issue here..." className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm font-medium shadow-sm" /><button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><Paperclip className="h-5 w-5" /></button></div><button type="submit" disabled={!inputText.trim() || isTyping} className="w-14 h-14 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center active:scale-95"><Send className="h-6 w-6" /></button></form></div></div>
      </div>

      {/* FOOTER CARDS (BOTTOM) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => setIsKBOpen(true)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex items-center gap-5 relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div><div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Book className="h-7 w-7" /></div><div><h4 className="font-bold text-slate-900">Knowledge Base</h4><p className="text-sm text-slate-500 mt-0.5">Browse 450+ guides and protocols.</p></div><ArrowRight className="h-5 w-5 text-slate-300 ml-auto group-hover:text-blue-600 group-hover:translate-x-1 transition-all" /></div>
          <div onClick={() => setIsReportOpen(true)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex items-center gap-5 relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div><div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors"><AlertTriangle className="h-7 w-7" /></div><div><h4 className="font-bold text-slate-900">Report Incident</h4><p className="text-sm text-slate-500 mt-0.5">Log a hardware or software failure.</p></div><ArrowRight className="h-5 w-5 text-slate-300 ml-auto group-hover:text-amber-600 group-hover:translate-x-1 transition-all" /></div>
          <div onClick={() => setIsRequestsOpen(true)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex items-center gap-5 relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div><div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors"><CheckCircle2 className="h-7 w-7" /></div><div><h4 className="font-bold text-slate-900">My Requests</h4><p className="text-sm text-slate-500 mt-0.5">Track status of your 3 open tickets.</p></div><ArrowRight className="h-5 w-5 text-slate-300 ml-auto group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" /></div>
      </div>

    </div>
  );
};

export default HelpDesk;