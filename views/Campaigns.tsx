
import React, { useState } from 'react';
import { Campaign } from '../types';
import { generateCampaignCopy } from '../services/geminiService';

interface CampaignsProps {
  campaigns: Campaign[];
  onSaveCampaign: (campaign: Campaign) => void;
}

const Campaigns: React.FC<CampaignsProps> = ({ campaigns, onSaveCampaign }) => {
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('Flash Sale! ☕️ Get 20% off all lattes this weekend at Cafe Aroma. Show this text to redeem. Valid until Sunday 5PM. See you there!');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [offerType, setOfferType] = useState('Percentage Off');

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    const result = await generateCampaignCopy(prompt || "a weekend latte discount", offerType);
    setMessage(result);
    setIsGenerating(false);
  };

  const handleLaunch = () => {
    setIsSaving(true);
    setTimeout(() => {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: prompt || 'New AI Campaign',
        channel: 'SMS',
        status: 'Active',
        reach: '0 Sent',
        engagementRate: 0,
        ends: 'Just started',
        image: 'https://picsum.photos/seed/' + Date.now() + '/200/200'
      };
      onSaveCampaign(newCampaign);
      setIsSaving(false);
      setPrompt('');
      alert('Campaign launched and saved to database!');
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
      <div className="flex-1 flex flex-col gap-8 max-w-3xl">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-black tracking-tight dark:text-white">Campaign Builder</h1>
          <p className="text-text-secondary dark:text-gray-400 text-lg font-medium">Design AI-powered promotional messages saved to your local database.</p>
        </div>

        <section className="rounded-3xl bg-white dark:bg-[#2a2018] p-8 shadow-sm border border-border-color dark:border-white/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-border-color dark:border-white/10 pb-4">
            <h2 className="text-2xl font-black dark:text-white">1. Configure Offer</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Percentage Off', 'Fixed Amount', 'BOGO Free'].map((type) => (
              <label key={type} className="relative cursor-pointer group">
                <input type="radio" name="offer" className="peer sr-only" checked={offerType === type} onChange={() => setOfferType(type)} />
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border-color dark:border-white/10 p-6 text-center transition-all peer-checked:border-primary peer-checked:bg-primary/5 group-hover:border-primary/50">
                  <span className={`material-symbols-outlined text-4xl mb-3 ${offerType === type ? 'text-primary' : 'text-text-secondary dark:text-gray-500'}`}>
                    {type === 'Percentage Off' ? 'percent' : type === 'Fixed Amount' ? 'attach_money' : 'coffee'}
                  </span>
                  <span className="text-sm font-bold dark:text-gray-200">{type}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white dark:bg-[#2a2018] p-8 shadow-sm border border-border-color dark:border-white/5 space-y-8">
          <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-4">
            <h2 className="text-2xl font-black dark:text-white">2. Craft Message</h2>
            <button onClick={handleAiGenerate} disabled={isGenerating} className="text-xs font-bold text-primary uppercase tracking-widest disabled:opacity-50 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">{isGenerating ? 'refresh' : 'auto_awesome'}</span>
              AI Re-write
            </button>
          </div>
          <div className="space-y-4">
            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full rounded-xl border-border-color dark:border-white/10 p-4 bg-background-light dark:bg-background-dark dark:text-white outline-none" placeholder="Describe your goal..." />
            <textarea className="h-32 w-full resize-none rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-4 text-base focus:ring-primary outline-none" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 rounded-3xl bg-white/80 dark:bg-[#2a2018]/80 p-6 shadow-xl backdrop-blur-md sticky bottom-6 z-10">
          <button onClick={handleLaunch} disabled={isSaving} className="flex items-center gap-3 rounded-xl bg-primary px-10 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-orange-600 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-xl">{isSaving ? 'sync' : 'rocket_launch'}</span>
            {isSaving ? 'Saving to DB...' : 'Save & Launch'}
          </button>
        </div>
      </div>

      <div className="hidden lg:flex w-[360px] flex-col shrink-0">
         <div className="sticky top-28 bg-gray-900 rounded-[3rem] p-4 border-[8px] border-black shadow-2xl h-[640px] overflow-hidden flex flex-col">
            <div className="bg-[#f9f9f9] rounded-[2rem] h-full flex flex-col p-4 text-xs">
               <div className="flex items-center gap-2 border-b pb-2 mb-4">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-[10px]">B&L</div>
                  <span className="font-black text-black">Preview Message</span>
               </div>
               <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border text-black leading-relaxed">
                  {message}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Campaigns;
