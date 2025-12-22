
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  businessName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, businessName }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
    { id: View.CAMPAIGNS, label: 'Campaigns', icon: 'campaign' },
    { id: View.CUSTOMERS, label: 'Customer Database', icon: 'groups' },
    { id: View.REWARDS, label: 'Reward Engine', icon: 'monetization_on' },
    { id: View.SETTINGS, label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 h-screen border-r border-border-color dark:border-white/5 bg-background-light dark:bg-background-dark flex flex-col justify-between shrink-0 sticky top-0 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => setCurrentView(View.DASHBOARD)}>
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shadow-sm border-2 border-primary transition-transform group-hover:scale-105" 
               style={{ backgroundImage: 'url("https://picsum.photos/seed/cafe-logo/100/100")' }} />
          <div>
            <h1 className="text-lg font-bold leading-tight truncate w-32 dark:text-white">{businessName}</h1>
            <p className="text-text-secondary dark:text-text-secondary text-xs font-medium">Owner Admin</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold shadow-sm'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined ${currentView === item.id ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-border-color dark:border-white/5">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl h-12 px-4 bg-gray-200 dark:bg-white/5 text-text-main dark:text-gray-300 text-sm font-bold hover:bg-gray-300 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
