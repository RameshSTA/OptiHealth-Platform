import React, { useState } from 'react';
import { 
    Activity, Lock, Mail, ArrowRight, ShieldCheck, HeartPulse, 
    BrainCircuit, Database, CheckCircle2, Zap, User, Building2, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const APP_VERSION = import.meta.env.PACKAGE_VERSION || '1.0.0';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [hospitalId, setHospitalId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
        if (isLogin) {
            const data = await api.login({ email, password });
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin();
        } else {
            await api.signup({ email, password, full_name: fullName, hospital_id: hospitalId });
            setSuccessMsg("Account created successfully! Please sign in.");
            setIsLogin(true);
            setPassword('');
        }
    } catch (err: any) {
        console.error("Auth Failed:", err);
        let msg = "Connection failed. Please check your network.";
        if (err.message && typeof err.message === 'string') {
            msg = err.message.includes('[object Object]') ? "Invalid credentials or data format." : err.message;
        }
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsLogin(!isLogin);
      setError(null);
      setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 lg:p-0 font-sans relative overflow-hidden select-none">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0L19.515 8.485 18.1 9.9l8.9-8.9h.999zm5.657 0L25.172 8.485 26.586 9.9l9.9-9.9h-1.415zm5.657 0L30.828 8.485 32.243 9.9l10.9-10.9h-1.914zm5.657 0L36.485 8.485 37.9 9.9l11.9-11.9h-2.414zm5.657 0L42.142 8.485 43.557 9.9l12.9-12.9h-2.914zM60 0h-2.828l-2.9-2.9 1.415-1.414L60 0zM0 0h2.828l2.9-2.9-1.415-1.414L0 0z' fill='%230f766e' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E')"}}></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-7xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[800px] relative z-10 mx-4 lg:mx-0 border border-white/20 animate-in fade-in zoom-in-95 duration-700">
        
        {/* LEFT SIDE */}
        <div className="hidden lg:flex lg:w-3/5 relative flex-col p-16 overflow-hidden bg-slate-50/80">
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-12 animate-in slide-in-from-left-10 fade-in duration-700">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3.5 rounded-2xl shadow-lg shadow-teal-900/20">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <span className="text-3xl font-extrabold text-slate-900 tracking-tight block leading-none">OptiHealth</span>
                            <span className="text-sm font-bold text-teal-600 uppercase tracking-[0.25em]">AI Care Systems</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 leading-[1.1] mb-6 animate-in slide-in-from-left-10 fade-in duration-700 delay-150">
                        Redefining Patient Care with <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 animate-gradient-x">Predictive AI.</span>
                    </h1>
                    <p className="text-slate-600 text-lg leading-relaxed max-w-xl mb-12 animate-in slide-in-from-left-10 fade-in duration-700 delay-300">
                        A clinical-grade decision support system that fuses real-time telemetry, EMR data, and advanced machine learning to predict deterioration hours before it occurs.
                    </p>
                    <div className="space-y-5 animate-in slide-in-from-left-10 fade-in duration-700 delay-500">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6">
                            <Zap className="h-4 w-4 text-teal-500" /> Core Platform Capabilities
                        </h3>
                        <FeatureItem icon={HeartPulse} color="rose" title="Early Deterioration Detection" desc="Continuous monitoring of vitals to flag at-risk patients instantly." />
                        <FeatureItem icon={Database} color="blue" title="Seamless EMR Integration" desc="Unified ingestion of structured records and unstructured clinical notes." />
                        <FeatureItem icon={BrainCircuit} color="purple" title="Explainable Clinical Insights" desc="Transparent AI risk scoring (XGBoost) backed by SHAP value analysis." />
                    </div>
                </div>
                
                {/* BRANDING FOOTER */}
                <div className="animate-in slide-in-from-bottom-10 fade-in duration-700 delay-700 pt-6">
                    <div className="text-xs text-slate-400 font-medium">
                        Designed and engineered by <a href="https://www.linkedin.com/in/rameshsta/" target="_blank" rel="noreferrer" className="text-teal-600 font-bold hover:underline hover:text-teal-700 transition-colors">Ramesh Shrestha</a>
                    </div>
                </div>
            </div>
        </div>
        
        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative bg-white border-l border-slate-100">
            <div className="max-w-md w-full mx-auto">
                <div className="flex items-center gap-3 mb-10 lg:hidden">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-md">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-extrabold text-slate-900">OptiHealth</span>
                </div>

                <div className="mb-10">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                        {isLogin ? 'Welcome Back.' : 'Join the Future.'}
                    </h2>
                    <p className="text-slate-500 text-lg">
                        {isLogin ? 'Securely access your clinical dashboard.' : 'Create your provider account to get started.'}
                    </p>
                </div>

                {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-sm font-medium text-rose-700 animate-in slide-in-from-top-2"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
                {successMsg && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-sm font-medium text-emerald-700 animate-in slide-in-from-top-2"><CheckCircle2 className="h-5 w-5 shrink-0" />{successMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className={`grid grid-cols-2 gap-4 overflow-hidden transition-all duration-500 ease-in-out ${!isLogin ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <InputField icon={User} label="Full Name" type="text" value={fullName} onChange={setFullName} required={!isLogin} placeholder="Dr. Jane Doe" />
                        <InputField icon={Building2} label="Hospital ID" type="text" value={hospitalId} onChange={setHospitalId} required={!isLogin} placeholder="H-4921" />
                    </div>
                    <InputField icon={Mail} label="Email Address" type="email" value={email} onChange={setEmail} required placeholder="name@hospital.org" />
                    <InputField icon={Lock} label="Password" type="password" value={password} onChange={setPassword} required placeholder="••••••••" />

                    {isLogin && (
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                                <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Remember device</span>
                            </label>
                            <a href="#" className="text-teal-600 font-bold hover:text-teal-700 hover:underline">Forgot password?</a>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-teal-900/20 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/0 via-teal-600/30 to-teal-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span className="relative z-10">{isLogin ? 'Sign In to Dashboard' : 'Create Provider Account'}</span> <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" /></>}
                    </button>
                </form>
                
                <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                    <p className="text-slate-600 text-base font-medium">
                        {isLogin ? "New to OptiHealth?" : "Already have an account?"} 
                        <button onClick={toggleMode} className="ml-2 font-bold text-teal-700 hover:text-teal-800 hover:underline outline-none transition-colors">{isLogin ? 'Request access' : 'Log in here'}</button>
                    </p>
                </div>
                <div className="mt-12 text-center">
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                        Protected by enterprise-grade security. By continuing, you agree to our <a href="#" className="underline hover:text-slate-500">Terms</a> & <a href="#" className="underline hover:text-slate-500">Privacy Policy</a>.
                        <br/><span className="opacity-70 mt-3 block font-mono">v{APP_VERSION} (Stable Build)</span>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, color, title, desc }: any) => {
    const colorClasses: any = {
        rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    };
    return (
        <div className="flex gap-5 p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-300/50 transition-all duration-300 group hover:-translate-y-1">
            <div className={`p-3.5 rounded-xl ${colorClasses[color]} transition-colors shadow-sm`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{title}</h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

const InputField = ({ icon: Icon, label, type, value, onChange, required, placeholder }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" />
            </div>
            <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:border-teal-500 focus:ring-0 outline-none transition-all duration-300 text-sm hover:border-slate-300" />
        </div>
    </div>
);

export default Login;