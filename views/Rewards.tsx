
import React from 'react';
import { MOCK_REWARDS } from '../constants';

const Rewards: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Reward Engine</h2>
          <p className="text-text-secondary dark:text-gray-400 text-lg">Design and manage your customer loyalty incentives.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Create New Reward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm transition-colors">
          <p className="text-text-secondary dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Active Rewards</p>
          <p className="text-3xl font-black text-text-main dark:text-white">12</p>
        </div>
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm transition-colors">
          <p className="text-text-secondary dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Points Issued</p>
          <p className="text-3xl font-black text-text-main dark:text-white">45.2k</p>
        </div>
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm transition-colors">
          <p className="text-text-secondary dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Redemption Rate</p>
          <p className="text-3xl font-black text-[#07880e] dark:text-green-400">68%</p>
        </div>
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm transition-colors">
          <p className="text-text-secondary dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Total Redeemed</p>
          <p className="text-3xl font-black text-text-main dark:text-white">842</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_REWARDS.map((reward) => (
          <div key={reward.id} className="group bg-white dark:bg-[#2a2018] rounded-[2rem] border border-border-color dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img src={reward.image} alt={reward.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  reward.status === 'Available' ? 'bg-green-500 text-white' : 'bg-gray-400 dark:bg-white/20 text-white'
                }`}>
                  {reward.status}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <span className="material-symbols-outlined text-primary text-[18px] filled">star</span>
                <span className="text-white text-sm font-black">{reward.points} Points</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-text-main dark:text-white mb-2">{reward.name}</h3>
              <p className="text-text-secondary dark:text-gray-400 text-sm line-clamp-2 mb-6">
                {reward.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border-color dark:border-white/5">
                <button className="text-text-main dark:text-gray-300 font-bold text-sm hover:text-primary transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit
                </button>
                <div className="flex gap-2">
                  <button className="size-9 rounded-full border border-border-color dark:border-white/10 flex items-center justify-center text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  <button className="size-9 rounded-full border border-border-color dark:border-white/10 flex items-center justify-center text-text-secondary dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Placeholder for New Reward */}
        <button className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border-4 border-dashed border-border-color dark:border-white/10 p-12 text-text-secondary dark:text-gray-500 hover:border-primary dark:hover:border-primary hover:text-primary transition-all group bg-gray-50/50 dark:bg-white/5">
          <div className="size-16 rounded-full bg-white dark:bg-background-dark shadow-sm border border-border-color dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="text-center">
            <span className="block font-black text-lg dark:text-gray-300">Add New Reward</span>
            <span className="text-sm opacity-60">Croissants, Lattes, and more...</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Rewards;
