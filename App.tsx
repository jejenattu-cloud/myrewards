
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Customers from './views/Customers';
import Campaigns from './views/Campaigns';
import Rewards from './views/Rewards';
import Settings from './views/Settings';
import { View, Profile } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  // Global Profile State
  const [profile, setProfile] = useState<Profile>({
    businessName: 'Bean & Leaf',
    currency: 'USD ($)',
    timezone: 'Pacific Standard Time (PST)'
  });

  // Sync document title with business name
  useEffect(() => {
    document.title = `${profile.businessName} Admin`;
  }, [profile.businessName]);

  const handleUpdateProfile = (updates: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard businessName={profile.businessName} />;
      case View.CUSTOMERS: return <Customers />;
      case View.CAMPAIGNS: return <Campaigns />;
      case View.REWARDS: return <Rewards />;
      case View.SETTINGS: return <Settings profile={profile} onUpdateProfile={handleUpdateProfile} />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <span className="material-symbols-outlined text-6xl text-text-secondary">construction</span>
          <h2 className="text-2xl font-black">{currentView} View is under construction</h2>
          <button 
            onClick={() => setCurrentView(View.DASHBOARD)}
            className="text-primary font-bold hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light font-sans text-text-main">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        businessName={profile.businessName} 
      />
      
      <main className="flex-1 overflow-y-auto max-h-screen scroll-smooth">
        <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-8 py-4 border-b border-border-color flex justify-end gap-4">
          <button title="Notifications" className="p-2 rounded-xl hover:bg-gray-100 text-text-secondary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button title="Quick Settings" onClick={() => setCurrentView(View.SETTINGS)} className="p-2 rounded-xl hover:bg-gray-100 text-text-secondary transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20" 
               style={{ backgroundImage: 'url("https://picsum.photos/seed/admin-avatar/100/100")' }} />
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
