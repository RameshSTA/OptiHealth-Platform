import React, { useState, useEffect } from 'react';
import { 
  Activity, BarChart2, ShieldCheck, Users, LifeBuoy, Menu, 
  BrainCircuit, Server, LogOut, ChevronRight, X 
} from 'lucide-react';
import { api } from '../services/api';

// --- READ VERSION ---
// @ts-ignore
const APP_VERSION = '2.4.1-prod'; 

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSystemOnline, setIsSystemOnline] = useState(false);
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error("Failed to parse user data"); }
    }
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
        try {
            if (api && api.checkHealth) {
                const online = await api.checkHealth();
                setIsSystemOnline(online);
            }
        } catch (e) { setIsSystemOnline(false); }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'patients', label: 'Patient Cohort', icon: Users },
    { id: 'risk', label: 'Risk Prediction', icon: BrainCircuit },
    { id: 'governance', label: 'Data Governance', icon: ShieldCheck },
    { id: 'support', label: 'Tech Support', icon: LifeBuoy },
    { id: 'system', label: 'Architecture', icon: Server },
  ];

  const getActiveLabel = () => navItems.find(n => n.id === activeTab)?.label;
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'OP';

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-white shadow-2xl transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div className={`flex items-center h-20 border-b border-slate-800 transition-all ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-gradient-to-tr from-teal-500 to-emerald-500 p-2 rounded-xl shadow-lg shadow-teal-900/50 flex-shrink-0">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">OptiHealth</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">AI Care Systems</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg"><X className="h-6 w-6" /></button>
          {!isSidebarCollapsed && <button onClick={() => setIsSidebarCollapsed(true)} className="hidden lg:block p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Menu className="h-5 w-5" /></button>}
        </div>
        
        {isSidebarCollapsed && <div className="hidden lg:flex justify-center py-4 border-b border-slate-800"><button onClick={() => setIsSidebarCollapsed(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Menu className="h-6 w-6" /></button></div>}
        
        <div className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <nav className="space-y-2">
            {navItems.map((item) => (
                <button key={item.id} onClick={() => handleNavClick(item.id)} title={isSidebarCollapsed ? item.label : ''} className={`flex items-center w-full gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${activeTab === item.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors`} />
                  <span className={`truncate transition-all duration-200 ${isSidebarCollapsed ? 'lg:hidden w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.label}</span>
                  {activeTab === item.id && !isSidebarCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse lg:block hidden"></div>}
                </button>
            ))}
            </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-default group ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-slate-900 group-hover:ring-slate-700 transition-all flex-shrink-0">{user ? getInitials(user.full_name) : 'OP'}</div>
            <div className={`flex-1 min-w-0 transition-all duration-200 ${isSidebarCollapsed ? 'lg:hidden w-0 opacity-0' : 'w-auto opacity-100'}`}>
                <p className="text-sm font-bold text-white truncate">{user ? user.full_name : 'Guest User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user ? user.role : 'Read Only'}</p>
            </div>
            <button onClick={() => { if(window.confirm("Logout?")) onLogout() }} className={`p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-rose-400 transition-colors ${isSidebarCollapsed ? 'hidden' : 'block'}`} title="Log Out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-slate-50 transition-all duration-300">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm lg:shadow-none">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-all"><Menu className="h-6 w-6" /></button>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:block bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider border border-teal-100 uppercase">OptiHealth</span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><ChevronRight className="hidden sm:block h-5 w-5 text-slate-300" />{getActiveLabel()}</h2>
                </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-xs font-medium text-slate-500">
                <span className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${isSystemOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSystemOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isSystemOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    </span>
                    {isSystemOnline ? 'Online' : 'Offline'}
                </span>
                <span className="border-l border-slate-300 pl-4 sm:pl-6 h-4 flex items-center"><span className="hidden sm:inline mr-1">Env:</span> <span className="font-mono font-bold text-slate-700">v{APP_VERSION}</span></span>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex-grow">
                {children}
            </div>

            {/* --- UPDATED FOOTER --- */}
            <footer className="mt-12 py-8 border-t border-slate-200 w-full bg-white/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <p className="font-semibold text-slate-700">&copy; 2025 OptiHealth AI Systems.</p>
                        <span className="hidden md:inline text-slate-300">|</span>
                        <p>
                          Designed and Engineered by <a href="https://www.linkedin.com/in/rameshsta/" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold hover:underline">Ramesh Shrestha</a>
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> HIPAA Compliant</span>
                        <span className="flex items-center gap-1"><Server className="h-3 w-3" /> v{APP_VERSION}</span>
                    </div>
                </div>
            </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;