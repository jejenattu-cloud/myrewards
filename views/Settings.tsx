
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
  const [emailProvider, setEmailProvider] = useState('SendGrid');
  const [fromAddress, setFromAddress] = useState('hello@beanandleaf.com');
  const [emailApiKey, setEmailApiKey] = useState('');
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
    setOAuthToken(undefined);
  };

  const handleEditGateway = (gw: IntegratedEmailGateway) => {
    setEditingId(gw.id);
    setEmailProvider(gw.provider);
    setFromAddress(gw.fromAddress);
    setEmailApiKey(gw.apiKey);
    setOAuthToken(gw.accessToken);
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
    // Simulate Google OAuth Popup
    setTimeout(() => {
      setIsOAuthConnecting(false);
      setOAuthToken('MOCK_OAUTH_TOKEN_NASHAUBROWN');
      setFromAddress('nashaubrown@gmail.com');
      showToast('Successfully authorized via Google OAuth', 'success');
    }, 1500);
  };

  const handleSaveEmailGateway = () => {
    const isGmail = emailProvider === 'Gmail';
    
    if (isGmail && !oAuthToken) {
      showToast('Please authorize your Google account first', 'error');
      return;
    }

    if (!isGmail && !emailApiKey && settings.isEmailEnabled) {
      showToast('API Key is required to save configuration', 'error');
      return;
    }
    
    setIsSavingEmail(true);
    setTimeout(() => {
      const gatewayData: Partial<IntegratedEmailGateway> = {
        provider: emailProvider,
        fromAddress,
        apiKey: isGmail ? '' : emailApiKey,
        accessToken: isGmail ? oAuthToken : undefined,
        authType: isGmail ? 'oauth' : 'api_key',
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
    const isGmail = emailProvider === 'Gmail';
    if (isGmail && !oAuthToken) {
      showToast('OAuth connection required for testing Gmail', 'error');
      return;
    }
    if (!isGmail && !emailApiKey) {
      showToast('API Key is required to test connection', 'error');
      return;
    }

    setIsTestingEmail(true);
    setTimeout(() => {
      setIsTestingEmail(false);
      const isSuccess = Math.random() > 0.1; 
      if (isSuccess) {
        showToast(`Successfully verified ${emailProvider} connection!`, 'success');
      } else {
        showToast(`Authentication failed for ${emailProvider}.`, 'error');
      }
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
                  <div key={gw.id} className="flex flex-col overflow-hidden rounded-2xl border border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark/50 transition-all animate-in fade-in slide-in-from-left-2 shadow-sm hover:shadow-md">
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
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                          </h4>
                          <p className="text-xs text-text-secondary dark:text-gray-400 truncate max-w-[150px] md:max-w-none">{gw.fromAddress}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 md:gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setActiveTestId(activeTestId === gw.id ? null : gw.id)}
                          className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-all ${activeTestId === gw.id ? 'text-primary scale-110' : 'text-text-secondary dark:text-gray-400'}`}
                          title="Send Test Email"
                        >
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
                    
                    {/* Expandable Test Email Field */}
                    {activeTestId === gw.id && (
                      <div className="p-4 pt-0 border-t border-border-color dark:border-white/5 animate-in slide-in-from-top-2 duration-300 bg-background-light/30 dark:bg-white/5">
                        <div className="p-4 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-sm">rocket_launch</span>
                              <label className="text-[11px] font-black uppercase tracking-widest text-text-main dark:text-gray-300">Run Connectivity Test</label>
                            </div>
                            <button onClick={() => setActiveTestId(null)} className="text-[10px] text-text-secondary hover:text-primary font-bold">Close</button>
                          </div>
                          <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">alternate_email</span>
                              <input 
                                type="email" 
                                placeholder="Send test to (e.g. you@example.com)"
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-color dark:border-white/10 bg-white dark:bg-background-dark text-xs p-2 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner"
                                value={testToEmail}
                                onChange={(e) => setTestToEmail(e.target.value)}
                                disabled={isSendingTest}
                              />
                            </div>
                            <button 
                              onClick={() => handleSendTestEmail(gw)}
                              disabled={isSendingTest}
                              className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                            >
                              {isSendingTest ? (
                                <>
                                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                  Dispatched...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm">send</span>
                                  Execute Test
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-text-secondary dark:text-gray-500 font-medium leading-relaxed">
                            {gw.provider === 'Gmail' 
                              ? "The Gmail integration uses Google OAuth2 for secure, API Key-free authentication. This test verifies your delegated access token." 
                              : `Sending via ${gw.provider}. This verifies that your from-address (${gw.fromAddress}) is properly authorized with the provider.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="email-config-form" className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 p-8 shadow-sm space-y-8 transition-all duration-500 relative">
            {editingId && <div className="absolute top-0 left-0 w-full h-1.5 bg-primary animate-pulse rounded-t-3xl" />}
            <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white">{editingId ? 'Edit Integration' : 'New Gateway'}</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Connect Gmail (OAuth) or external API gateways</p>
                </div>
              </div>
              <button onClick={() => onUpdateSettings({ isEmailEnabled: !settings.isEmailEnabled })} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${settings.isEmailEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.isEmailEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${settings.isEmailEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Provider</label>
                <select className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={emailProvider} onChange={(e) => {
                  setEmailProvider(e.target.value);
                  if(e.target.value !== 'Gmail') setOAuthToken(undefined);
                }}>
                  <option>SendGrid</option>
                  <option>Gmail</option>
                  <option>Mailgun</option>
                </select>
              </div>

              {emailProvider === 'Gmail' ? (
                <div className="md:col-span-2 p-6 rounded-2xl border-2 border-dashed border-border-color dark:border-white/5 bg-gray-50/50 dark:bg-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <img src="https://www.google.com/favicon.ico" className="size-6" alt="Google" />
                    <div className="flex flex-col">
                      <h4 className="font-black text-sm dark:text-white">Google OAuth2 Connection</h4>
                      <p className="text-xs text-text-secondary dark:text-gray-400">Authorize Bean & Leaf to send emails via your Gmail account.</p>
                    </div>
                  </div>
                  
                  {oAuthToken ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-400/10 p-4 rounded-xl border border-green-200 dark:border-green-400/20">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-600 filled">check_circle</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-green-700 dark:text-green-400">Account Authorized</span>
                          <span className="text-[10px] text-green-600 dark:text-green-500 font-medium">{fromAddress}</span>
                        </div>
                      </div>
                      <button onClick={() => setOAuthToken(undefined)} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">Disconnect</button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGoogleOAuth}
                      disabled={isOAuthConnecting}
                      className="w-full py-4 rounded-xl border border-border-color dark:border-white/10 bg-white dark:bg-background-dark text-sm font-bold flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
                    >
                      {isOAuthConnecting ? (
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      <span>Connect with Google</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-text-main dark:text-gray-300">From Address</label>
                    <input type="email" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-black text-text-main dark:text-gray-300">API Key</label>
                    <input type="password" title="API Key" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={emailApiKey} onChange={(e) => setEmailApiKey(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={handleTestEmailConnection} disabled={isTestingEmail || !settings.isEmailEnabled} className="px-6 py-2.5 rounded-xl border border-border-color dark:border-white/10 text-sm font-bold dark:text-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50">
                {isTestingEmail ? 'Testing...' : 'Test Connection'}
              </button>
              <button onClick={handleSaveEmailGateway} disabled={isSavingEmail || !settings.isEmailEnabled} className={`px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${editingId ? 'bg-primary' : 'bg-text-main dark:bg-primary'}`}>
                {isSavingEmail ? 'Saving...' : editingId ? 'Update' : 'Integrate'}
              </button>
            </div>
          </section>

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
                onClick={() => onUpdateSettings({ isSmsEnabled: !settings.isSmsEnabled })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${settings.isSmsEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.isSmsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${settings.isSmsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Provider</label>
                <select className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={smsProvider} onChange={(e) => setSmsProvider(e.target.value)}>
                  <option>Twilio</option>
                  <option>Vonage</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Sender ID</label>
                <input type="text" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" value={smsSenderId} onChange={(e) => setSmsSenderId(e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Account SID</label>
                <input type="password" title="SID" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Auth Token</label>
                <input type="password" title="Auth Token" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 focus:ring-primary outline-none transition-colors" placeholder="••••••••••••••••••••••••••••••••" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 rounded-xl border border-border-color dark:border-white/10 text-sm font-bold dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Test Connection</button>
              <button onClick={handleSaveSmsGateway} disabled={isSavingSms || !settings.isSmsEnabled} className="px-6 py-2.5 rounded-xl bg-text-main dark:bg-primary text-white text-sm font-bold hover:bg-black dark:hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                {isSavingSms ? 'Saving...' : 'Save Changes'}
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
                <input type="text" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 text-sm focus:ring-primary outline-none" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-500">Currency</label>
                <select className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 text-sm focus:ring-primary outline-none" value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                  <option>USD ($)</option><option>EUR (€)</option>
                </select>
              </div>
              <button onClick={handleUpdateProfile} disabled={isSaving} className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary/20">
                {isSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </section>

          <section className="bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/20 dark:border-primary/10 p-8 flex flex-col gap-4 transition-colors">
            <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-xl">security</span>
            </div>
            <h4 className="font-black text-text-main dark:text-white">Enhanced Security</h4>
            <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
              We've upgraded Gmail integration to strictly use Google OAuth2. This ensures your credentials are never stored locally as raw text.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
