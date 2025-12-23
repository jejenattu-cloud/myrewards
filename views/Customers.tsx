
import React, { useState } from 'react';
import { Customer, IntegratedEmailGateway, IntegratedSmsGateway } from '../types';
import { EmailService } from '../services/emailService';
import { SmsService } from '../services/smsService';

interface CustomersProps {
  customers: Customer[];
  onUpdateCustomers: (customers: Customer[]) => void;
  gateways: IntegratedEmailGateway[];
  smsGateways: IntegratedSmsGateway[];
}

const Customers: React.FC<CustomersProps> = ({ customers, onUpdateCustomers, gateways, smsGateways }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingSms, setIsTestingSms] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStatus, setNewStatus] = useState<'Subscribed' | 'Unsubscribed'>('Subscribed');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to delete this customer record?')) {
      onUpdateCustomers(customers.filter(c => c.id !== id));
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewStatus('Subscribed');
    setIsModalOpen(false);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate DB latency
    setTimeout(() => {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: newName,
        email: newEmail,
        phone: newPhone,
        status: newStatus,
        points: 0,
        tier: 'Bronze',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        lastVisit: 'Never',
        tags: ['New'],
        avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
      };

      onUpdateCustomers([newCustomer, ...customers]);
      setIsSubmitting(false);
      resetForm();
    }, 1000);
  };

  const handleTestEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Please enter a valid email address first.');
      return;
    }
    const gateway = gateways.find(g => g.status === 'Active');
    if (!gateway) {
      alert('No active Email Gateway found. Please configure one in Settings.');
      return;
    }

    setIsTestingEmail(true);
    const res = await EmailService.sendTestEmail(gateway, newEmail);
    alert(res.message);
    setIsTestingEmail(false);
  };

  const handleTestSms = async () => {
    if (!newPhone || newPhone.length < 8) {
      alert('Please enter a valid mobile number (+60...) first.');
      return;
    }
    const gateway = smsGateways.find(g => g.status === 'Active');
    if (!gateway) {
      alert('No active SMS Gateway found. Please configure one in Settings.');
      return;
    }

    setIsTestingSms(true);
    const res = await SmsService.sendSms(gateway, newPhone, "Bean & Leaf: Welcome to our loyalty program! ☕️");
    alert(res.message);
    setIsTestingSms(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-left-4 duration-700 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Customer Database</h2>
          <p className="text-text-secondary dark:text-gray-400 text-lg">Manage your contacts and organize targeted promotions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>New Customer</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="group bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-2 transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <p className="text-text-secondary dark:text-gray-400 font-medium">Total Records</p>
            <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">database</span>
          </div>
          <p className="text-4xl font-black dark:text-white">{customers.length}</p>
        </div>
        <div className="group bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-2 transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <p className="text-text-secondary dark:text-gray-400 font-medium">Subscribers</p>
            <span className="material-symbols-outlined text-green-500/40 group-hover:text-green-500 transition-colors">check_circle</span>
          </div>
          <p className="text-4xl font-black dark:text-white">{customers.filter(c => c.status === 'Subscribed').length}</p>
        </div>
        <div className="group bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-2 transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <p className="text-text-secondary dark:text-gray-400 font-medium">VIP Tier</p>
            <span className="material-symbols-outlined text-yellow-500/40 group-hover:text-yellow-500 transition-colors">workspace_premium</span>
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
                placeholder="Search by name, email or phone..."
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
              {filteredCustomers.length > 0 ? filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={cust.avatar} className="size-10 rounded-full object-cover shadow-sm border border-border-color dark:border-white/10" alt={cust.name} />
                        <div className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-background-dark ${cust.status === 'Subscribed' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      <div className="flex flex-col text-sm">
                        <span className="font-bold dark:text-white">{cust.name}</span>
                        <span className="text-xs text-text-secondary flex items-center gap-2">
                           {cust.email} 
                           <span className="size-1 rounded-full bg-gray-300" />
                           {cust.phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-tighter ${cust.status === 'Subscribed' ? 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'}`}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-bold text-primary">{cust.points}</td>
                  <td className="p-6">
                    <div className="flex gap-1 flex-wrap">
                      {cust.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-50 dark:bg-white/5 rounded text-[9px] uppercase font-black text-text-secondary border border-border-color/30">{t}</span>)}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="text-gray-400 hover:text-primary transition-all p-1">
                          <span className="material-symbols-outlined text-xl">edit</span>
                       </button>
                       <button onClick={() => handleDelete(cust.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                          <span className="material-symbols-outlined text-xl">delete</span>
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <span className="material-symbols-outlined text-6xl">person_search</span>
                       <p className="font-bold uppercase tracking-widest text-sm">No customers found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#2a2018] w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-border-color dark:border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-border-color dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-2xl font-black dark:text-white tracking-tight uppercase">New Customer Profile</h3>
                <p className="text-xs text-text-secondary dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Manual Database Entry</p>
              </div>
              <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-text-secondary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-gray-400 ml-1">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">person</span>
                    <input 
                      required
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold shadow-inner" 
                      placeholder="e.g. Michael Scott"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-gray-400 ml-1">Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">alternate_email</span>
                      <input 
                        required
                        type="email" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold shadow-inner" 
                        placeholder="mike@dundermifflin.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary dark:text-gray-400 ml-1">Mobile Number</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">smartphone</span>
                      <input 
                        required
                        type="tel" 
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all font-bold shadow-inner" 
                        placeholder="+60..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-border-color dark:border-white/5">
                   <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">notifications_active</span>
                      <span className="text-xs font-black uppercase tracking-tight dark:text-white">Subscription Status</span>
                   </div>
                   <div className="flex bg-white dark:bg-background-dark p-1 rounded-xl shadow-inner border border-border-color/50">
                      <button 
                        type="button"
                        onClick={() => setNewStatus('Subscribed')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${newStatus === 'Subscribed' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5'}`}
                      >
                        Subscribed
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewStatus('Unsubscribed')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${newStatus === 'Unsubscribed' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5'}`}
                      >
                        Opted Out
                      </button>
                   </div>
                </div>
              </div>

              {/* Communication Testing */}
              <div className="pt-4 border-t border-border-color dark:border-white/10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary text-center">Verify Integration Hooks</p>
                <div className="flex flex-col sm:flex-row gap-3">
                   <button 
                    type="button"
                    onClick={handleTestEmail}
                    disabled={isTestingEmail}
                    className="flex-1 py-3 px-4 border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                   >
                     <span className="material-symbols-outlined text-lg filled">{isTestingEmail ? 'sync' : 'mail'}</span>
                     {isTestingEmail ? 'Sending...' : 'Test Real Email'}
                   </button>
                   <button 
                    type="button"
                    onClick={handleTestSms}
                    disabled={isTestingSms}
                    className="flex-1 py-3 px-4 border border-orange-500/20 bg-orange-500/5 text-orange-600 dark:text-orange-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                   >
                     <span className="material-symbols-outlined text-lg filled">{isTestingSms ? 'sync' : 'sms'}</span>
                     {isTestingSms ? 'Blasting...' : 'Test Real SMS'}
                   </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-text-secondary rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-orange-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-xl">sync</span>
                      Saving to Postgres...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">save</span>
                      Commit to Database
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
