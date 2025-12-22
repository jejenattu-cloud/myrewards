
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Customers from './views/Customers';
import Campaigns from './views/Campaigns';
import Rewards from './views/Rewards';
import Settings from './views/Settings';
import { View, Profile, IntegratedEmailGateway, Customer, Campaign, Reward } from './types';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [db, setDb] = useState(() => StorageService.init());
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  // Sync dark mode class
  useEffect(() => {
    if (db.settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.title = `${db.profile.businessName} Admin`;
  }, [db.settings.isDarkMode, db.profile.businessName]);

  const updateDb = (updates: Partial<typeof db>) => {
    const newDb = { ...db, ...updates };
    setDb(newDb);
    StorageService.save(newDb);
  };

  const handleUpdateProfile = (updates: Partial<Profile>) => {
    updateDb({ profile: { ...db.profile, ...updates } });
  };

  const toggleDarkMode = () => {
    updateDb({ 
      settings: { ...db.settings, isDarkMode: !db.settings.isDarkMode } 
    });
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD: 
        return <Dashboard businessName={db.profile.businessName} campaigns={db.campaigns} />;
      case View.CUSTOMERS: 
        return (
          <Customers 
            customers={db.customers} 
            onUpdateCustomers={(customers) => updateDb({ customers })} 
          />
        );
      case View.CAMPAIGNS: 
        return (
          <Campaigns 
            campaigns={db.campaigns} 
            onSaveCampaign={(newCamp) => updateDb({ campaigns: [newCamp, ...db.campaigns] })} 
          />
        );
      case View.REWARDS: 
        return (
          <Rewards 
            rewards={db.rewards} 
            onUpdateRewards={(rewards) => updateDb({ rewards })} 
          />
        );
      case View.SETTINGS: 
        return (
          <Settings 
            profile={db.profile} 
            onUpdateProfile={handleUpdateProfile}
            gateways={db.gateways}
            onUpdateGateways={(gateways) => updateDb({ gateways })}
            settings={db.settings}
            onUpdateSettings={(settings) => updateDb({ settings: { ...db.settings, ...settings } })}
          />
        );
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <span className="material-symbols-outlined text-6xl text-text-secondary">construction</span>
          <h2 className="text-2xl font-black dark:text-white">{currentView} View is under construction</h2>
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
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-sans text-text-main transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        businessName={db.profile.businessName} 
      />
      
      <main className="flex-1 overflow-y-auto max-h-screen scroll-smooth">
        <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-4 border-b border-border-color dark:border-white/5 flex justify-end items-center gap-4">
          <div className="mr-auto hidden md:flex items-center gap-2 text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Local Database Connected
          </div>
          
          <button 
            onClick={toggleDarkMode}
            title="Toggle Theme"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-text-secondary dark:text-gray-400 transition-all active:scale-90"
          >
            <span className={`material-symbols-outlined transition-transform duration-500 ${db.settings.isDarkMode ? 'rotate-[360deg]' : 'rotate-0'}`}>
              {db.settings.isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button title="Notifications" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-text-secondary dark:text-gray-400 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button title="Quick Settings" onClick={() => setCurrentView(View.SETTINGS)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-text-secondary dark:text-gray-400 transition-colors">
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
