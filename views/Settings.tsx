
import React, { useState, useEffect } from 'react';
import { Profile, IntegratedEmailGateway } from '../types';

interface SettingsProps {
  profile: Profile;
  onUpdateProfile: (updates: Partial<Profile>) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
  const [isSmsEnabled, setIsSmsEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);
  
  // Profile form state
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  
  // SMS Gateway state
  const [smsProvider, setSmsProvider] = useState('Twilio');
  const [smsSenderId, setSmsSenderId] = useState('BEANLEAF');
  const [isSavingSms, setIsSavingSms] = useState(false);

  // Integrated Gateways List
  const [gateways, setGateways] = useState<IntegratedEmailGateway[]>([
    { id: '1', provider: 'SendGrid', fromAddress: 'hello@beanandleaf.com', apiKey: 'SG.default_key', status: 'Active' }
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Email Configuration form state
  const [emailProvider, setEmailProvider] = useState('SendGrid');
  const [fromAddress, setFromAddress] = useState('hello@beanandleaf.com');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateProfile(formData);
      setIsSaving(false);
      showToast('Profile updated successfully!');
    }, 800);
  };

  const handleSaveSmsGateway = () => {
    setIsSavingSms(true);
    setTimeout(() => {
      setIsSavingSms(false);
      showToast('SMS Gateway configuration saved!');
    }, 1000);
  };

  const resetEmailForm = () => {
    setEditingId(null);
    setEmailProvider('SendGrid');
    setFromAddress('hello@beanandleaf.com');
    setEmailApiKey('');
  };

  const handleEditGateway = (gw: IntegratedEmailGateway) => {
    setEditingId(gw.id);
    setEmailProvider(gw.provider);
    setFromAddress(gw.fromAddress);
    setEmailApiKey(gw.apiKey);
    // Scroll to form smoothly
    document.getElementById('email-config-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRemoveGateway = (id: string) => {
    if (confirm('Are you sure you want to remove this gateway integration?')) {
      setGateways(prev => prev.filter(g => g.id !== id));
      showToast('Integration removed successfully');
      if (editingId === id) resetEmailForm();
    }
  };

  const handleSaveEmailGateway = () => {
    if (!emailApiKey && isEmailEnabled) {
      showToast('API Key is required to save configuration', 'error');
      return;
    }
    
    setIsSavingEmail(true);
    setTimeout(() => {
      if (editingId) {
        setGateways(prev => prev.map(g => g.id === editingId ? { ...g, provider: emailProvider, fromAddress, apiKey: emailApiKey } : g));
        showToast('Integration updated successfully!');
      } else {
        const newGateway: IntegratedEmailGateway = {
          id: Date.now().toString(),
          provider: emailProvider,
          fromAddress,
          apiKey: emailApiKey,
          status: 'Active'
        };
        setGateways(prev => [...prev, newGateway]);
        showToast('New Email Gateway integrated!');
      }
      setIsSavingEmail(false);
      resetEmailForm();
    }, 1200);
  };

  const handleTestEmailConnection = () => {
    if (!emailApiKey) {
      showToast('API Key is required to test connection', 'error');
      return;
    }
    if (!fromAddress.includes('@')) {
      showToast('Please provide a valid From Address', 'error');
      return;
    }

    setIsTestingEmail(true);
    setTimeout(() => {
      setIsTestingEmail(false);
      const isSuccess = Math.random() > 0.1; 
      if (isSuccess) {
        showToast(`Successfully connected to ${emailProvider} gateway!`, 'success');
      } else {
        showToast(`Failed to authenticate with ${emailProvider}. Check your API credentials.`, 'error');
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20 relative">
      {toast && (
        <div className={`fixed bottom-10 right-10 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 transition-colors duration-300 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span className="material-symbols-outlined filled">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight dark:text-white">Settings</h2>
        <p className="text-text-secondary dark:text-gray-400 text-lg">Manage your shop profile and third-party integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Active Email Integrations Section */}
          <section className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 p-8 shadow-sm space-y-6 transition-colors overflow-hidden">
            <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-green-100 dark:bg-green-400/10 flex items-center justify-center text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-2xl">hub</span>
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">Active Integrations</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Currently connected email delivery systems</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                {gateways.length} Connected
              </span>
            </div>

            <div className="space-y-3">
              {gateways.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border-color dark:border-white/5 rounded-2xl">
                  <p className="text-text-secondary dark:text-gray-500 italic">No gateways connected yet.</p>
                </div>
              ) : (
                gateways.map((gw) => (
                  <div key={gw.id} className="flex items-center justify-between p-4 rounded-2xl border border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark/50 hover:shadow-md transition-all group animate-in fade-in slide-in-from-left-2">
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-xl flex items-center justify-center font-bold ${
                        gw.provider === 'Gmail' ? 'bg-red-100 text-red-600' : 
                        gw.provider === 'SendGrid' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'
                      }`}>
                        {gw.provider[0]}
                      </div>
                      <div>
                        <h4 className="font-bold dark:text-white flex items-center gap-2">
                          {gw.provider}
                          <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                        </h4>
                        <p className="text-xs text-text-secondary dark:text-gray-400">{gw.fromAddress}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditGateway(gw)}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleRemoveGateway(gw.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-text-secondary dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SMS Gateway Section */}
          <section className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 p-8 shadow-sm space-y-8 transition-colors">
            <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">sms</span>
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">SMS Gateway</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Configure Twilio or Vonage for SMS campaigns</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSmsEnabled(!isSmsEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isSmsEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isSmsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${isSmsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Provider</label>
                <select 
                  className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary focus:border-primary font-medium outline-none transition-colors"
                  value={smsProvider}
                  onChange={(e) => setSmsProvider(e.target.value)}
                >
                  <option>Twilio</option>
                  <option>Vonage</option>
                  <option>MessageBird</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Sender ID</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary focus:border-primary outline-none transition-colors" 
                  placeholder="e.g. BEANLEAF" 
                  value={smsSenderId}
                  onChange={(e) => setSmsSenderId(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Account SID</label>
                <input type="password" title="SID" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Auth Token</label>
                <input type="password" title="Auth Token" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="••••••••••••••••••••••••••••••••" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 rounded-xl border border-border-color dark:border-white/10 text-sm font-bold dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Test Connection</button>
              <button 
                onClick={handleSaveSmsGateway}
                disabled={isSavingSms || !isSmsEnabled}
                className="px-6 py-2.5 rounded-xl bg-text-main dark:bg-primary text-white text-sm font-bold hover:bg-black dark:hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingSms ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </section>

          {/* Email Configuration Form Section */}
          <section id="email-config-form" className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 p-8 shadow-sm space-y-8 transition-all duration-500 relative">
            {editingId && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary animate-pulse rounded-t-3xl" />
            )}
            
            <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">
                    {editingId ? 'Edit Email Integration' : 'Configure New Email Gateway'}
                  </h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Connect SendGrid, Gmail, or Mailgun for newsletters</p>
                </div>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <button 
                    onClick={resetEmailForm}
                    className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button 
                  onClick={() => setIsEmailEnabled(!isEmailEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isEmailEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isEmailEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${isEmailEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Provider</label>
                <select 
                  className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary focus:border-primary font-medium outline-none transition-colors"
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value)}
                >
                  <option>SendGrid</option>
                  <option>Gmail</option>
                  <option>Mailgun</option>
                  <option>AWS SES</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">From Address</label>
                <input 
                  type="email" 
                  className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary focus:border-primary outline-none transition-colors" 
                  placeholder="hello@beanandleaf.com" 
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">
                  {emailProvider === 'Gmail' ? 'App Password / API Key' : 'API Key'}
                </label>
                <input 
                  type="password" 
                  title="Email API Key" 
                  className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary focus:border-primary outline-none transition-colors" 
                  placeholder={emailProvider === 'Gmail' ? 'xxxx xxxx xxxx xxxx' : 'SG.xxxxxxxxxxxxxxxxxxxxxxxx'} 
                  value={emailApiKey}
                  onChange={(e) => setEmailApiKey(e.target.value)}
                />
                {emailProvider === 'Gmail' && (
                  <p className="text-[10px] text-text-secondary dark:text-gray-500 italic mt-1">
                    Tip: Use an App Password if you have 2FA enabled on your Gmail account.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={handleTestEmailConnection}
                disabled={isTestingEmail || !isEmailEnabled}
                className="px-6 py-2.5 rounded-xl border border-border-color dark:border-white/10 text-sm font-bold dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isTestingEmail ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    Testing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">network_ping</span>
                    Test Connection
                  </>
                )}
              </button>
              <button 
                onClick={handleSaveEmailGateway}
                disabled={isSavingEmail || !isEmailEnabled}
                className={`px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${
                  editingId ? 'bg-primary hover:bg-orange-600' : 'bg-text-main hover:bg-black dark:bg-primary dark:hover:bg-orange-600'
                }`}
              >
                {isSavingEmail ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    {editingId ? 'Updating...' : 'Integrating...'}
                  </>
                ) : editingId ? 'Update Integration' : 'Integrate Gateway'}
              </button>
            </div>
          </section>

        </div>

        <aside className="space-y-8">
          <section className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 p-8 shadow-sm flex flex-col gap-6 transition-colors">
            <h3 className="text-lg font-black border-b border-border-color dark:border-white/10 pb-4 dark:text-white">General Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-500">Business Name</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 text-sm focus:ring-primary outline-none transition-colors" 
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-500">Currency</label>
                <select 
                  className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 text-sm focus:ring-primary outline-none transition-colors"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-500">Timezone</label>
                <select 
                  className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 text-sm focus:ring-primary outline-none transition-colors"
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                >
                  <option>Pacific Standard Time (PST)</option>
                  <option>Eastern Standard Time (EST)</option>
                  <option>Greenwich Mean Time (GMT)</option>
                  <option>Central European Time (CET)</option>
                </select>
              </div>
              <button 
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Saving...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </section>

          <section className="bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/20 dark:border-primary/10 p-8 flex flex-col gap-4 transition-colors">
            <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">help</span>
            </div>
            <h4 className="font-black text-text-main dark:text-white">Need assistance?</h4>
            <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
              If you're having trouble connecting your gateways, please check our documentation or contact our engineering team at dev-support@beanandleaf.com.
            </p>
            <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline mt-2 flex items-center gap-1">
              Read Documentation
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
