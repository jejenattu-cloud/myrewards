
import React, { useState, useEffect } from 'react';
import { Profile, IntegratedEmailGateway } from '../types';
import { EmailService } from '../services/emailService';

interface SettingsProps {
  profile: Profile;
  onUpdateProfile: (updates: Partial<Profile>) => void;
  gateways: IntegratedEmailGateway[];
  onUpdateGateways: (gateways: IntegratedEmailGateway[]) => void;
  settings: { isSmsEnabled: boolean; isEmailEnabled: boolean };
  onUpdateSettings: (updates: Partial<{ isSmsEnabled: boolean; isEmailEnabled: boolean }>) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  profile, 
  onUpdateProfile, 
  gateways, 
  onUpdateGateways,
  settings,
  onUpdateSettings
}) => {
  // Profile form state
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  
  // SMS Gateway state
  const [smsProvider, setSmsProvider] = useState('Twilio');
  const [smsSenderId, setSmsSenderId] = useState('BEANLEAF');
  const [isSavingSms, setIsSavingSms] = useState(false);

  // Email Integration state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emailProvider, setEmailProvider] = useState('Gmail');
  const [fromAddress, setFromAddress] = useState('hello@beanandleaf.com');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [authType, setAuthType] = useState<'oauth' | 'api_key' | 'credentials'>('oauth');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isOAuthConnecting, setIsOAuthConnecting] = useState(false);
  const [oAuthToken, setOAuthToken] = useState<string | undefined>(undefined);

  // Test Email Modal/Expand state
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [testToEmail, setTestToEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
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
    setEmailPassword('');
    setOAuthToken(undefined);
    setAuthType('api_key');
  };

  const handleEditGateway = (gw: IntegratedEmailGateway) => {
    setEditingId(gw.id);
    setEmailProvider(gw.provider);
    setFromAddress(gw.fromAddress);
    setEmailApiKey(gw.apiKey || '');
    setEmailPassword(gw.password || '');
    setOAuthToken(gw.accessToken);
    setAuthType(gw.authType);
    document.getElementById('email-config-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRemoveGateway = (id: string) => {
    if (confirm('Are you sure you want to remove this gateway integration?')) {
      onUpdateGateways(gateways.filter(g => g.id !== id));
      showToast('Integration removed successfully');
      if (editingId === id) resetEmailForm();
    }
  };

  const handleGoogleOAuth = () => {
    setIsOAuthConnecting(true);
    // Simulate Google OAuth Popup with default user email
    setTimeout(() => {
      setIsOAuthConnecting(false);
      setOAuthToken('MOCK_OAUTH_TOKEN_NASHAUBROWN');
      setFromAddress('nashaubrown@gmail.com');
      setAuthType('oauth');
      showToast('Successfully authorized via Google OAuth (nashaubrown@gmail.com)', 'success');
    }, 1500);
  };

  const handleSaveEmailGateway = () => {
    if (authType === 'oauth' && !oAuthToken) {
      showToast('Please authorize your Google account first', 'error');
      return;
    }

    if (authType === 'credentials' && (!fromAddress || !emailPassword)) {
      showToast('Email and Password are required for direct login', 'error');
      return;
    }

    if (authType === 'api_key' && !emailApiKey) {
      showToast('API Key is required to save configuration', 'error');
      return;
    }
    
    setIsSavingEmail(true);
    setTimeout(() => {
      const gatewayData: Partial<IntegratedEmailGateway> = {
        provider: emailProvider,
        fromAddress,
        apiKey: authType === 'api_key' ? emailApiKey : undefined,
        accessToken: authType === 'oauth' ? oAuthToken : undefined,
        password: authType === 'credentials' ? emailPassword : undefined,
        authType: authType,
        status: 'Active'
      };

      if (editingId) {
        onUpdateGateways(gateways.map(g => g.id === editingId ? { ...g, ...gatewayData } : g));
        showToast('Integration updated successfully!');
      } else {
        const newGateway: IntegratedEmailGateway = {
          id: Date.now().toString(),
          ...gatewayData as any
        };
        onUpdateGateways([...gateways, newGateway]);
        showToast(`New ${emailProvider} Gateway integrated!`);
      }
      setIsSavingEmail(false);
      resetEmailForm();
    }, 1200);
  };

  const handleTestEmailConnection = () => {
    setIsTestingEmail(true);
    setTimeout(() => {
      setIsTestingEmail(false);
      showToast(`Successfully verified ${emailProvider} connection!`, 'success');
    }, 2000);
  };

  const handleSendTestEmail = async (gw: IntegratedEmailGateway) => {
    if (!testToEmail || !testToEmail.includes('@')) {
      showToast('Please enter a valid recipient email address', 'error');
      return;
    }

    setIsSendingTest(true);
    try {
      const result = await EmailService.sendTestEmail(gw, testToEmail);
      if (result.success) {
        showToast(result.message, 'success');
        setActiveTestId(null);
        setTestToEmail('');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred while sending the test email.', 'error');
    } finally {
      setIsSendingTest(false);
    }
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
        <p className="text-text-secondary dark:text-gray-400 text-lg">Manage your shop profile and secure third-party integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
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
            </div>

            <div className="space-y-3">
              {gateways.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border-color dark:border-white/5 rounded-2xl">
                  <p className="text-text-secondary dark:text-gray-500 italic">No gateways connected yet.</p>
                </div>
              ) : (
                gateways.map((gw) => (
                  <div key={gw.id} className="flex flex-col overflow-hidden rounded-2xl border border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark/50 transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between p-4 group">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-xl flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 ${
                          gw.provider === 'Gmail' ? 'bg-red-100 text-red-600' : 
                          gw.provider === 'SendGrid' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'
                        }`}>
                          {gw.provider[0]}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-bold dark:text-white flex items-center gap-2 text-sm md:text-base">
                            {gw.provider}
                            {gw.authType === 'oauth' && <span className="material-symbols-outlined text-[14px] text-blue-500 filled" title="OAuth Secured">verified_user</span>}
                            {gw.authType === 'credentials' && <span className="material-symbols-outlined text-[14px] text-orange-500 filled" title="Direct Login">key</span>}
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                          </h4>
                          <p className="text-xs text-text-secondary dark:text-gray-400 truncate max-w-[150px] md:max-w-none">{gw.fromAddress}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setActiveTestId(activeTestId === gw.id ? null : gw.id)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-text-secondary dark:text-gray-400 hover:text-primary">
                          <span className="material-symbols-outlined text-[20px] font-bold">forward_to_inbox</span>
                        </button>
                        <button onClick={() => handleEditGateway(gw)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary dark:text-gray-400 hover:text-primary transition-all">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleRemoveGateway(gw.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-text-secondary dark:text-gray-400 hover:text-red-600 transition-all">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                    {activeTestId === gw.id && (
                      <div className="p-4 pt-0 border-t border-border-color dark:border-white/5 animate-in slide-in-from-top-2 bg-background-light/30 dark:bg-white/5">
                        <div className="p-4 rounded-xl space-y-4">
                          <label className="text-[11px] font-black uppercase tracking-widest text-text-main dark:text-gray-300">Run Connectivity Test</label>
                          <div className="flex flex-col md:flex-row gap-3">
                            <input type="email" placeholder="Recipient email" className="flex-1 pl-4 pr-4 py-2.5 rounded-xl border border-border-color dark:border-white/10 bg-white dark:bg-background-dark text-xs focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" value={testToEmail} onChange={(e) => setTestToEmail(e.target.value)} disabled={isSendingTest} />
                            <button onClick={() => handleSendTestEmail(gw)} disabled={isSendingTest} className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                              {isSendingTest ? 'Sending...' : 'Execute Test'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="email-config-form" className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 p-8 shadow-sm space-y-8 transition-all relative">
            {editingId && <div className="absolute top-0 left-0 w-full h-1.5 bg-primary animate-pulse rounded-t-3xl" />}
            <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">{editingId ? 'Edit Integration' : 'New Gateway'}</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Connect Gmail or external API gateways</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Provider</label>
                <select className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={emailProvider} onChange={(e) => {
                  setEmailProvider(e.target.value);
                  if(e.target.value === 'Gmail') setAuthType('oauth');
                  else setAuthType('api_key');
                }}>
                  <option>Gmail</option>
                  <option>SendGrid</option>
                  <option>Mailgun</option>
                </select>
              </div>

              {emailProvider === 'Gmail' && (
                <div className="space-y-2">
                  <label className="text-sm font-black text-text-main dark:text-gray-300">Integration Method</label>
                  <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-border-color dark:border-white/10">
                    <button onClick={() => setAuthType('oauth')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${authType === 'oauth' ? 'bg-white dark:bg-background-dark shadow-sm text-primary' : 'text-text-secondary'}`}>Google OAuth</button>
                    <button onClick={() => setAuthType('credentials')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${authType === 'credentials' ? 'bg-white dark:bg-background-dark shadow-sm text-primary' : 'text-text-secondary'}`}>Direct Login</button>
                  </div>
                </div>
              )}

              {authType === 'oauth' && emailProvider === 'Gmail' ? (
                <div className="md:col-span-2 p-6 rounded-2xl border-2 border-dashed border-border-color dark:border-white/5 bg-gray-50/50 dark:bg-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <img src="https://www.google.com/favicon.ico" className="size-6" alt="Google" />
                    <div>
                      <h4 className="font-black text-sm dark:text-white">Secure Google Connection</h4>
                      <p className="text-xs text-text-secondary dark:text-gray-400">One-click authorization (Defaults to nashaubrown@gmail.com)</p>
                    </div>
                  </div>
                  {oAuthToken ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-400/10 p-4 rounded-xl border border-green-200 dark:border-green-400/20">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-600 filled">check_circle</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-green-700 dark:text-green-400">Connected</span>
                          <span className="text-[10px] text-green-600 dark:text-green-500 font-medium">{fromAddress}</span>
                        </div>
                      </div>
                      <button onClick={() => setOAuthToken(undefined)} className="text-[10px] font-black text-red-600 hover:underline">Disconnect</button>
                    </div>
                  ) : (
                    <button onClick={handleGoogleOAuth} disabled={isOAuthConnecting} className="w-full py-4 rounded-xl border border-border-color bg-white dark:bg-background-dark text-sm font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
                      {isOAuthConnecting ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span>Connect with Google</span>}
                    </button>
                  )}
                </div>
              ) : authType === 'credentials' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-text-main dark:text-gray-300">Email Address</label>
                    <input type="email" placeholder="you@gmail.com" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-text-main dark:text-gray-300">Password / App Password</label>
                    <input type="password" placeholder="••••••••••••" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-text-main dark:text-gray-300">From Address</label>
                    <input type="email" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-black text-text-main dark:text-gray-300">API Key</label>
                    <input type="password" placeholder="API Key" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={emailApiKey} onChange={(e) => setEmailApiKey(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={handleTestEmailConnection} disabled={isTestingEmail} className="px-6 py-2.5 rounded-xl border border-border-color dark:border-white/10 text-sm font-bold dark:text-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50">
                {isTestingEmail ? 'Testing...' : 'Test Connection'}
              </button>
              <button onClick={handleSaveEmailGateway} disabled={isSavingEmail} className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-orange-600 transition-all disabled:opacity-50">
                {isSavingEmail ? 'Saving...' : editingId ? 'Update' : 'Integrate'}
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 p-8 shadow-sm flex flex-col gap-6 transition-colors">
            <h3 className="text-lg font-black border-b dark:text-white pb-4">General Profile</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Business Name</label>
                <input type="text" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 text-sm focus:ring-primary outline-none" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <button onClick={handleUpdateProfile} disabled={isSaving} className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-70 shadow-lg shadow-primary/20">
                {isSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </section>
          
          <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 space-y-4">
            <span className="material-symbols-outlined text-primary text-3xl">lightbulb</span>
            <h4 className="font-black text-sm dark:text-white">Admin Tip</h4>
            <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">OAuth is the safest way to connect Gmail. If you prefer using your own email/password, please ensure you use an <strong>App Password</strong> if 2FA is enabled.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
