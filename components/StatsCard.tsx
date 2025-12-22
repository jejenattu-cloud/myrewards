
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  change: string;
  icon: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, change, icon }) => {
  return (
    <div className="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <p className="text-text-secondary dark:text-gray-400 text-sm font-medium">{label}</p>
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-text-main dark:text-white text-3xl font-black">{value}</p>
        <span className="text-[#07880e] dark:text-green-400 text-sm font-bold bg-green-100 dark:bg-green-400/10 px-2 py-0.5 rounded-full">
          {change}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;
