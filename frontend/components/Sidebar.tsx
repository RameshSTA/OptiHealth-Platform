import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Activity, ShieldCheck, 
  LifeBuoy, Layers, LogOut, User as UserIcon 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void; // Added logout prop
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  // 1. State for User Data
  const [user, setUser] = useState<{ full_name: string; role: string; hospital_id: string } | null>(null);

  // 2. Load User from LocalStorage on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  // 3. Handle Logout Logic
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Trigger parent logout handler or reload page to force login view
      if (onLogout) {
        onLogout();
      } else {
        window.location.reload(); 
      }
    }
  };

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'OP';
  };

  const navItems = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Cohort', icon: Users },
    { id: 'risk', label: 'ML Risk Prediction', icon: Activity },
    { id: 'governance', label: 'Data Governance', icon: ShieldCheck },
    { id: 'support', label: 'Tech Support', icon: LifeBuoy },
    { id: 'system', label: 'System Arch', icon: Layers },
  ];

  return (
    <div className="w-72 bg-slate-900 text-white flex flex-col h-full shadow-xl border-r border-slate-800">
      
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/20">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">OptiHealth</h1>
          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">AI Care Systems</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20 font-medium' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-teal-400 transition-colors'}`} />
              <span className="relative z-10">{item.label}</span>
              {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white/20 rounded-l-full"></div>}
            </button>
          );
        })}
      </nav>

      {/* Dynamic User Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group cursor-default">
          
          {/* User Avatar (Initials) */}
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-indigo-500 group-hover:border-indigo-400 transition-colors">
            {user ? getInitials(user.full_name) : <UserIcon className="h-5 w-5" />}
          </div>
          
          {/* User Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {user ? user.full_name : 'Guest User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user ? user.role : 'Read Only'}
            </p>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;