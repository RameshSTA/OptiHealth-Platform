import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RiskPrediction from './pages/RiskPrediction';
import DataGovernance from './pages/DataGovernance';
import PatientsList from './pages/PatientsList';
import HelpDesk from './pages/HelpDesk';
import SystemArchitecture from './pages/SystemArchitecture';
import Login from './pages/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // 1. Check for existing session on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // 2. Handle Logout Logic
  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state to force Login screen
    setIsAuthenticated(false);
    setActiveTab('dashboard'); // Reset tab for next login
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'patients': return <PatientsList />;
      case 'risk': return <RiskPrediction />; // Ensure ID matches Sidebar
      case 'governance': return <DataGovernance />;
      case 'support': return <HelpDesk />; // Ensure ID matches Sidebar
      case 'system': return <SystemArchitecture />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  // 3. Render Login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // 4. Pass handleLogout to Layout
  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={handleLogout} // <--- Pass the logout handler here
    >
      {renderContent()}
    </Layout>
  );
};

export default App;