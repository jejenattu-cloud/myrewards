
import React from 'react';
import { Reward } from '../types';

interface RewardsProps {
  rewards: Reward[];
  onUpdateRewards: (rewards: Reward[]) => void;
}

const Rewards: React.FC<RewardsProps> = ({ rewards, onUpdateRewards }) => {
  const handleDelete = (id: string) => {
    if(confirm('Delete this reward item?')) {
      onUpdateRewards(rewards.filter(r => r.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Reward Engine</h2>
          <p className="text-text-secondary dark:text-gray-400 text-lg">Manage loyalty incentives stored in your local store.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Add New Reward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map((reward) => (
          <div key={reward.id} className="group bg-white dark:bg-[#2a2018] rounded-[2rem] border border-border-color dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="relative h-40 overflow-hidden">
              <img src={reward.image} alt={reward.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                <span className="material-symbols-outlined text-primary text-[14px] filled">star</span>
                <span className="text-white text-[10px] font-black">{reward.points} Points</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-black text-text-main dark:text-white mb-1">{reward.name}</h3>
              <p className="text-text-secondary text-xs line-clamp-2 mb-4">{reward.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border-color dark:border-white/5">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{reward.status}</span>
                <button onClick={() => handleDelete(reward.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        <button className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border-4 border-dashed border-border-color dark:border-white/10 p-10 hover:border-primary transition-all group">
          <div className="size-12 rounded-full bg-white dark:bg-background-dark shadow-sm border border-border-color dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <span className="material-symbols-outlined">add</span>
          </div>
          <span className="font-black text-sm dark:text-gray-300">New Item</span>
        </button>
      </div>
    </div>
  );
};

export default Rewards;
