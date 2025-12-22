
import React, { useState } from 'react';
import { MOCK_CUSTOMERS } from '../constants';

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-left-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Customer Database</h2>
          <p className="text-text-secondary dark:text-gray-400 text-lg">Manage your contacts and organize targeted promotions.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-2 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-text-secondary dark:text-gray-400 font-medium">Total Customers</p>
            <span className="bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> 5%
            </span>
          </div>
          <p className="text-4xl font-black dark:text-white">2,450</p>
        </div>
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-2 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-text-secondary dark:text-gray-400 font-medium">Active Subscribers</p>
            <span className="bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> 12%
            </span>
          </div>
          <p className="text-4xl font-black dark:text-white">1,240</p>
        </div>
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-2 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-text-secondary dark:text-gray-400 font-medium">New This Week</p>
            <span className="bg-primary/10 dark:bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full">Recent</span>
          </div>
          <p className="text-4xl font-black dark:text-white">+15</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-6 border-b border-border-color dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 w-full md:max-w-xl gap-4">
            <div className="relative flex-1 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="px-6 py-3 rounded-xl border border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-gray-300 focus:ring-2 focus:ring-primary outline-none font-medium transition-colors">
              <option>All Customers</option>
              <option>Subscribed</option>
              <option>VIP Members</option>
            </select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border-color dark:border-white/10 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-colors">
              <span className="material-symbols-outlined text-[20px]">upload</span>
              <span>Import</span>
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border-color dark:border-white/10 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm transition-colors">
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-border-color dark:border-white/10">
              <tr>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Customer</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Status</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Points</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Last Visit</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Tags</th>
                <th className="p-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color dark:divide-white/5">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={cust.avatar} className="size-12 rounded-full object-cover ring-2 ring-primary/20" alt={cust.name} />
                      <div className="flex flex-col">
                        <span className="font-bold text-text-main dark:text-white">{cust.name}</span>
                        <span className="text-xs text-text-secondary dark:text-gray-500">{cust.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      cust.status === 'Subscribed' ? 'bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      <div className={`size-1.5 rounded-full ${cust.status === 'Subscribed' ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-500'}`} />
                      {cust.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 font-bold text-primary">
                        <span className="material-symbols-outlined text-[18px] filled">star</span>
                        {cust.points.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-black uppercase text-text-secondary dark:text-gray-500">{cust.tier} Member</span>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-text-main dark:text-gray-300 font-medium">
                    {cust.lastVisit}
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      {cust.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-background-light dark:bg-background-dark border border-border-color dark:border-white/10 text-[10px] font-black uppercase text-text-secondary dark:text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-text-secondary dark:text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="p-2 text-text-secondary dark:text-gray-400 hover:text-red-600 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-border-color dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5 transition-colors">
          <p className="text-sm text-text-secondary dark:text-gray-500">
            Showing <span className="font-bold text-text-main dark:text-gray-300">1-4</span> of <span className="font-bold text-text-main dark:text-gray-300">2,450</span> customers
          </p>
          <div className="flex items-center gap-2">
            <button className="size-10 flex items-center justify-center rounded-xl border border-border-color dark:border-white/10 bg-white dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-300 disabled:opacity-30">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="size-10 flex items-center justify-center rounded-xl bg-primary text-white font-black text-sm">1</button>
            <button className="size-10 flex items-center justify-center rounded-xl border border-border-color dark:border-white/10 bg-white dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-bold dark:text-gray-300">2</button>
            <button className="size-10 flex items-center justify-center rounded-xl border border-border-color dark:border-white/10 bg-white dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-300">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
