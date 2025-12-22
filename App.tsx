
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Customers from './views/Customers';
import Campaigns from './views/Campaigns';
import Rewards from './views/Rewards';
import Settings from './views/Settings';
import { View, Profile, IntegratedEmailGateway, IntegratedSmsGateway, Customer, Campaign, Reward } from './types';
import { StorageService, AppDatabase, DEFAULT_DB } from './services/storage';

const App: React.FC = () => {
  const [db, setDb] = useState<AppDatabase | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);

  // Initial cloud hydration
  useEffect(() => {
    const hydrate = async () => {
      try {
        const cloudData = await StorageService.init();
        setDb(cloudData);
      } catch (err) {
        console.error("Hydration error:", err);
        setDb(DEFAULT_DB);
      } finally {
        // Minimum loading time for smooth transition feel
        setTimeout(() => setIsLoading(false), 1200);
      }
    };
    hydrate();
  }, []);

  // Sync dark mode class and title
  useEffect(() => {
    if (!db) return;
    if (db.settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.title = `${db.profile.businessName} Admin`;
  }, [db?.settings.isDarkMode, db?.profile.businessName]);

  const updateDb = (updates: Partial<AppDatabase>) => {
    if (!db) return;
    const newDb = { ...db, ...updates };
    setDb(newDb);
    // Optimistic background save
    StorageService.save(newDb).catch(err => {
      console.error("Critical: Failed to sync with Cloud SQL", err);
    });
  };

  const handleUpdateProfile = (updates: Partial<Profile>) => {
    if (!db) return;
    updateDb({ profile: { ...db.profile, ...updates } });
  };

  const toggleDarkMode = () => {
    if (!db) return;
    updateDb({ 
      settings: { ...db.settings, isDarkMode: !db.settings.isDarkMode } 
    });
  };

  if (isLoading || !db) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative bg-center bg-no-repeat bg-cover rounded-full size-24 border-4 border-primary shadow-2xl animate-pulse-soft" 
               style={{ backgroundImage: 'url("https://picsum.photos/seed/cafe-logo/200/200")' }} />
        </div>
        <h2 className="text-2xl font-black text-text-main dark:text-white tracking-tight animate-bounce">Bean & Leaf</h2>
        <div className="mt-6 flex flex-col items-center gap-2">
           <div className="w-48 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[loading-progress_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
           </div>
           <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">Initializing Cloud SQL Bridge...</p>
        </div>
        <style>{`
          @keyframes loading-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
      </div>
    );
  }

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
            smsGateways={db.smsGateways || []}
            onUpdateSmsGateways={(smsGateways) => updateDb({ smsGateways })}
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
          <div className="mr-auto hidden md:flex items-center gap-3 text-[10px] font-black text-text-secondary/60 uppercase tracking-widest">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <span>Cloud SQL Sync Active</span>
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
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20 cursor-pointer hover:scale-110 transition-transform" 
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
