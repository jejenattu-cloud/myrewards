
import React, { useState } from 'react';
import { Customer } from '../types';

interface CustomersProps {
  customers: Customer[];
  onUpdateCustomers: (customers: Customer[]) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onUpdateCustomers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to delete this customer record?')) {
      onUpdateCustomers(customers.filter(c => c.id !== id));
    }
  };

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
            <p className="text-text-secondary dark:text-gray-400 font-medium">Total Records</p>
          </div>
          <p className="text-4xl font-black dark:text-white">{customers.length}</p>
        </div>
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-2 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-text-secondary dark:text-gray-400 font-medium">Subscribers</p>
          </div>
          <p className="text-4xl font-black dark:text-white">{customers.filter(c => c.status === 'Subscribed').length}</p>
        </div>
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-2 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-text-secondary dark:text-gray-400 font-medium">VIP Tier</p>
          </div>
          <p className="text-4xl font-black dark:text-white">{customers.filter(c => c.tier === 'Gold').length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-6 border-b border-border-color dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 w-full md:max-w-xl gap-4">
            <div className="relative flex-1 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="Search database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-border-color dark:border-white/10">
              <tr>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Customer</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Status</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Points</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Tags</th>
                <th className="p-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color dark:divide-white/5">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={cust.avatar} className="size-10 rounded-full object-cover" alt={cust.name} />
                      <div className="flex flex-col text-sm">
                        <span className="font-bold dark:text-white">{cust.name}</span>
                        <span className="text-xs text-text-secondary">{cust.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${cust.status === 'Subscribed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-bold text-primary">{cust.points}</td>
                  <td className="p-6">
                    <div className="flex gap-1 flex-wrap">
                      {cust.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-50 dark:bg-white/5 rounded text-[9px] uppercase font-black text-text-secondary">{t}</span>)}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => handleDelete(cust.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
