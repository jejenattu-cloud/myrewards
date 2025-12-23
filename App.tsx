
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  // Initial cloud hydration
  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      // Failsafe timer: if DB takes way too long, use local/defaults
      const failsafe = setTimeout(() => {
        if (mounted && isLoading && connectionStatus === 'connecting') {
          console.warn("Cloud connection timeout. Falling back.");
          setConnectionStatus('offline');
        }
      }, 12000);

      try {
        const cloudData = await StorageService.init();
        if (mounted) {
          setDb(cloudData);
          setConnectionStatus('connected');
          clearTimeout(failsafe);
          // Small delay for branding visibility
          setTimeout(() => setIsLoading(false), 1200);
        }
      } catch (err) {
        console.error("Hydration failed:", err);
        if (mounted) {
          setDb(DEFAULT_DB);
          setConnectionStatus('offline');
          setIsLoading(false);
        }
      }
    };

    hydrate();
    return () => { mounted = false; };
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
      console.error("Sync Error:", err);
      setConnectionStatus('offline');
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-500 p-6 text-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse"></div>
          <div className="relative bg-center bg-no-repeat bg-cover rounded-[2.5rem] size-28 border-[6px] border-white dark:border-white/10 shadow-2xl animate-pulse-soft" 
               style={{ backgroundImage: 'url("https://picsum.photos/seed/cafe-logo/200/200")' }} />
        </div>
        
        <h2 className="text-3xl font-black text-text-main dark:text-white tracking-tight mb-2">Bean & Leaf</h2>
        <p className="text-text-secondary dark:text-gray-400 text-sm font-medium mb-8">Official Admin Console</p>

        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
           <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-primary animate-[loading-progress_2.5s_ease-in-out_infinite]"></div>
           </div>
           
           <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[18px] animate-spin ${connectionStatus === 'offline' ? 'text-red-500' : 'text-primary'}`}>
                {connectionStatus === 'offline' ? 'cloud_off' : 'database'}
              </span>
              <p className="text-[10px] font-black text-text-secondary dark:text-gray-500 uppercase tracking-[0.25em]">
                {connectionStatus === 'offline' 
                  ? "Instance Unreachable • Local Mode" 
                  : "Connecting to Cloud SQL..."}
              </p>
           </div>
        </div>

        <div className="mt-12 opacity-40">
           <p className="text-[9px] font-bold text-text-secondary dark:text-gray-600 uppercase tracking-widest">
             Instance: gen-lang-client-...-instance
           </p>
        </div>

        <style>{`
          @keyframes loading-progress {
            0% { width: 0%; transform: translateX(-100%); }
            50% { width: 60%; }
            100% { width: 100%; transform: translateX(100%); }
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
            gateways={db.gateways}
            smsGateways={db.smsGateways || []}
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
            {connectionStatus === 'offline' ? (
              <div className="flex items-center gap-2 text-red-500">
                 <span className="material-symbols-outlined text-[14px]">cloud_off</span>
                 <span>Local Only • Cloud Disconnected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span className="text-green-600 dark:text-green-400">Cloud SQL (PostgreSQL) Live</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={toggleDarkMode}
            title="Toggle Theme"
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-text-secondary dark:text-gray-400 transition-all active:scale-90"
          >
            <span className={`material-symbols-outlined transition-transform duration-500 ${db.settings.isDarkMode ? 'rotate-[360deg]' : 'rotate-0'}`}>
              {db.settings.isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <div className="h-6 w-px bg-border-color dark:bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-black dark:text-white uppercase leading-none">Admin</span>
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-tighter">Owner Access</span>
            </div>
            <div className="bg-center bg-no-repeat bg-cover rounded-2xl size-10 ring-4 ring-primary/10 cursor-pointer hover:scale-105 transition-transform" 
                 style={{ backgroundImage: 'url("https://picsum.photos/seed/admin-avatar/100/100")' }} />
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
