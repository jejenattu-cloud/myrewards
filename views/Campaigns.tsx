
import React, { useState, useEffect } from 'react';
import { generateCampaignCopy } from '../services/geminiService';

const Campaigns: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('Flash Sale! ☕️ Get 20% off all lattes this weekend at Cafe Aroma. Show this text to redeem. Valid until Sunday 5PM. See you there!');
  const [isGenerating, setIsGenerating] = useState(false);
  const [offerType, setOfferType] = useState('Percentage Off');

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    const result = await generateCampaignCopy(prompt || "a weekend latte discount", offerType);
    setMessage(result);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
      <div className="flex-1 flex flex-col gap-8 max-w-3xl">
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider group w-fit">
            <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-black tracking-tight dark:text-white">Create New Promotion</h1>
          <p className="text-text-secondary dark:text-gray-400 text-lg font-medium">Configure your discount campaign details and target audience.</p>
        </div>

        <section className="rounded-3xl bg-white dark:bg-[#2a2018] p-8 shadow-sm border border-border-color dark:border-white/5 space-y-8 transition-colors">
          <div className="flex items-center gap-4 border-b border-border-color dark:border-white/10 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-black">1</div>
            <h2 className="text-2xl font-black dark:text-white">The Offer</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Percentage Off', 'Fixed Amount', 'BOGO Free'].map((type) => (
              <label key={type} className="relative cursor-pointer group">
                <input 
                  type="radio" 
                  name="offer" 
                  className="peer sr-only" 
                  checked={offerType === type}
                  onChange={() => setOfferType(type)}
                />
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border-color dark:border-white/10 p-6 text-center transition-all peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/20 group-hover:border-primary/50">
                  <span className={`material-symbols-outlined text-4xl mb-3 ${offerType === type ? 'text-primary' : 'text-text-secondary dark:text-gray-500'}`}>
                    {type === 'Percentage Off' ? 'percent' : type === 'Fixed Amount' ? 'attach_money' : 'coffee'}
                  </span>
                  <span className="text-sm font-bold dark:text-gray-200">{type}</span>
                </div>
                {offerType === type && (
                  <div className="absolute top-3 right-3 text-primary">
                    <span className="material-symbols-outlined text-2xl filled">check_circle</span>
                  </div>
                )}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold block dark:text-gray-300">Discount Value</label>
              <div className="relative">
                <input type="text" className="w-full rounded-xl border-border-color dark:border-white/10 p-4 bg-background-light dark:bg-background-dark dark:text-white focus:ring-primary focus:border-primary font-bold outline-none transition-colors" placeholder="e.g. 20" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold block dark:text-gray-300">Item Name (Optional)</label>
              <input type="text" className="w-full rounded-xl border-border-color dark:border-white/10 p-4 bg-background-light dark:bg-background-dark dark:text-white focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="e.g. All Lattes" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white dark:bg-[#2a2018] p-8 shadow-sm border border-border-color dark:border-white/5 space-y-8 transition-colors">
          <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-black">2</div>
              <h2 className="text-2xl font-black dark:text-white">The Message</h2>
            </div>
            <button 
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">{isGenerating ? 'refresh' : 'auto_awesome'}</span>
              {isGenerating ? 'Thinking...' : 'Regenerate with AI'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold dark:text-gray-300">What is this campaign about?</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-xl border-border-color dark:border-white/10 p-4 bg-background-light dark:bg-background-dark dark:text-white focus:ring-primary focus:border-primary pr-24 outline-none transition-colors"
                  placeholder="Describe your goals for the AI..."
                />
                <button 
                  onClick={handleAiGenerate}
                  className="absolute right-2 top-2 h-10 px-4 bg-primary text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold block dark:text-gray-300">Final Message Content</label>
              <textarea 
                className="h-32 w-full resize-none rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-4 text-base leading-relaxed focus:ring-primary focus:border-primary outline-none transition-colors"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex justify-between text-xs text-text-secondary dark:text-gray-500">
                <span>1 segment, {message.length} characters</span>
                <span>Max 160 characters</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 rounded-3xl bg-white/80 dark:bg-[#2a2018]/80 p-6 shadow-xl backdrop-blur-md border border-border-color dark:border-white/5 sticky bottom-6 z-10 animate-in fade-in zoom-in duration-1000 transition-colors">
          <button className="rounded-xl px-8 py-3 text-sm font-bold text-text-main dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Save Draft</button>
          <button className="flex items-center gap-3 rounded-xl bg-primary px-10 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-orange-600 transition-all hover:scale-105">
            <span className="material-symbols-outlined text-xl">rocket_launch</span>
            Launch Promotion
          </button>
        </div>
      </div>

      <div className="hidden lg:flex w-[400px] flex-col shrink-0">
        <div className="sticky top-28 flex flex-col gap-6">
          <div className="px-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-500">Live Preview</h3>
            <p className="text-xs text-text-secondary dark:text-gray-600 mt-1">Real-time visualization of your campaign</p>
          </div>

          <div className="relative mx-auto h-[740px] w-[360px] rounded-[4rem] border-[12px] border-gray-900 dark:border-black bg-gray-900 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 w-full px-10 pt-4 flex justify-between items-center text-[11px] font-bold text-black z-20 bg-white/80 backdrop-blur-sm h-12">
              <span>9:41</span>
              <div className="flex gap-1.5 items-center">
                <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                <span className="material-symbols-outlined text-[14px]">wifi</span>
                <span className="material-symbols-outlined text-[14px]">battery_full</span>
              </div>
            </div>

            <div className="h-full w-full bg-[#f2f2f7] pt-12 flex flex-col">
              <div className="flex items-center gap-3 border-b border-gray-200 bg-[#f9f9f9]/90 px-5 py-4 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">B&L</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-black">Bean & Leaf Cafe</span>
                  <span className="text-[10px] text-gray-400 font-medium">Text Message • Today 9:41 AM</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                <div className="max-w-[85%] self-start rounded-3xl rounded-tl-none bg-white px-5 py-4 text-sm text-black shadow-sm">
                  <p>Welcome to our new rewards program! Enjoy your coffee. ☕️</p>
                </div>

                <div className="group relative max-w-[85%] self-start rounded-3xl rounded-tl-none bg-primary text-white px-5 py-4 text-sm shadow-xl animate-in zoom-in duration-500">
                  <p className="leading-relaxed">{message}</p>
                  <div className="mt-3 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <img src="https://picsum.photos/seed/promo-coffee/400/250" className="h-28 w-full object-cover opacity-90" alt="Preview" />
                    <div className="p-3">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-80">BEANANDLEAF.COM</div>
                      <div className="text-xs font-bold mt-0.5">Redeem your offer now</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 border-t border-gray-200">
                <div className="bg-white rounded-full h-10 flex items-center px-4 text-gray-300 text-sm italic">Text Message</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
