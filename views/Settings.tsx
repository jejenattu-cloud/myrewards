
import React, { useState, useEffect } from 'react';
import { Profile, IntegratedEmailGateway, IntegratedSmsGateway } from '../types';
import { EmailService } from '../services/emailService';
import { SmsService } from '../services/smsService';

const GOOGLE_CLIENT_ID = '959648036352-k0lsvj8gbsj30dnjpvfqd7mbnnpat2eb.apps.googleusercontent.com';

interface SettingsProps {
  profile: Profile;
  onUpdateProfile: (updates: Partial<Profile>) => void;
  gateways: IntegratedEmailGateway[];
  onUpdateGateways: (gateways: IntegratedEmailGateway[]) => void;
  smsGateways: IntegratedSmsGateway[];
  onUpdateSmsGateways: (gateways: IntegratedSmsGateway[]) => void;
  settings: { isSmsEnabled: boolean; isEmailEnabled: boolean };
  onUpdateSettings: (updates: Partial<{ isSmsEnabled: boolean; isEmailEnabled: boolean }>) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  profile, 
  onUpdateProfile, 
  gateways, 
  onUpdateGateways,
  smsGateways,
  onUpdateSmsGateways,
  settings,
  onUpdateSettings
}) => {
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  
  // Email state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emailProvider, setEmailProvider] = useState('Gmail');
  const [fromAddress, setFromAddress] = useState(''); 
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [authType, setAuthType] = useState<'oauth' | 'api_key' | 'credentials'>('oauth');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isOAuthConnecting, setIsOAuthConnecting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [testToEmail, setTestToEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // SMS state
  const [smsEditingId, setSmsEditingId] = useState<string | null>(null);
  const [smsProvider, setSmsProvider] = useState<'Textflow' | 'Twilio' | 'Generic'>('Textflow');
  const [smsApiKey, setSmsApiKey] = useState('');
  const [isSavingSms, setIsSavingSms] = useState(false);
  const [activeSmsTestId, setActiveSmsTestId] = useState<string | null>(null);
  const [testToPhone, setTestToPhone] = useState('');
  const [isSendingSmsTest, setIsSendingSmsTest] = useState(false);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const resetEmailForm = () => {
    setEditingId(null);
    setEmailProvider('Gmail');
    setFromAddress('');
    setEmailApiKey('');
    setEmailPassword('');
    setAuthType('oauth');
    setAccessToken(undefined);
  };

  const resetSmsForm = () => {
    setSmsEditingId(null);
    setSmsApiKey('');
    setSmsProvider('Textflow');
  };

  const handleEditSmsGateway = (gw: IntegratedSmsGateway) => {
    setSmsEditingId(gw.id);
    setSmsProvider(gw.provider);
    setSmsApiKey(gw.apiKey);
    document.getElementById('sms-config-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRemoveSmsGateway = (id: string) => {
    if (confirm('Are you sure you want to remove this SMS gateway integration?')) {
      onUpdateSmsGateways(smsGateways.filter(g => g.id !== id));
      showToast('SMS Gateway removed successfully');
      if (smsEditingId === id) resetSmsForm();
    }
  };

  const handleSaveSmsGateway = () => {
    if (!smsApiKey) {
      showToast('Textflow Service Key is required.', 'error');
      return;
    }
    setIsSavingSms(true);
    setTimeout(() => {
      const gw: IntegratedSmsGateway = {
        id: smsEditingId || Date.now().toString(),
        provider: smsProvider,
        apiKey: smsApiKey,
        status: 'Active'
      };
      if (smsEditingId) {
        onUpdateSmsGateways(smsGateways.map(g => g.id === smsEditingId ? gw : g));
        showToast('SMS Gateway updated!');
      } else {
        onUpdateSmsGateways([...smsGateways, gw]);
        showToast('RapidAPI Textflow Gateway connected!');
      }
      setIsSavingSms(false);
      resetSmsForm();
    }, 800);
  };

  const handleSendTestSms = async (gw: IntegratedSmsGateway) => {
    if (!testToPhone || testToPhone.length < 8) {
      showToast('Please enter a valid phone number (e.g. +60...)', 'error');
      return;
    }
    setIsSendingSmsTest(true);
    try {
      const res = await SmsService.sendSms(gw, testToPhone, `Bean & Leaf: Connection Success! Your RapidAPI Textflow bridge is active. ☕️`);
      if (res.success) {
        showToast(res.message);
        setActiveSmsTestId(null);
        setTestToPhone('');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('SMS Test failed. Please check your service credentials.', 'error');
    } finally {
      setIsSendingSmsTest(false);
    }
  };

  const handleEditGateway = (gw: IntegratedEmailGateway) => {
    setEditingId(gw.id);
    setEmailProvider(gw.provider);
    setFromAddress(gw.fromAddress);
    setEmailApiKey(gw.apiKey || '');
    setEmailPassword(gw.password || '');
    setAuthType(gw.authType);
    setAccessToken(gw.accessToken);
    document.getElementById('email-config-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRemoveGateway = (id: string) => {
    if (confirm('Remove this Email gateway?')) {
      onUpdateGateways(gateways.filter(g => g.id !== id));
      showToast('Email Gateway removed');
    }
  };

  const initiateGoogleOAuth = () => {
    if (!(window as any).google) {
      showToast('Google Identity library not found. Check your index.html.', 'error');
      return;
    }
    setIsOAuthConnecting(true);
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email profile',
        callback: async (response: any) => {
          if (response.error) {
            setIsOAuthConnecting(false);
            showToast(`Auth Error: ${response.error}`, 'error');
            return;
          }
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          }).then(r => r.json());
          setAccessToken(response.access_token);
          setFromAddress(userInfo.email);
          setAuthType('oauth');
          setIsOAuthConnecting(false);
          showToast(`Linked: ${userInfo.email}`);
        },
      });
      client.requestAccessToken();
    } catch (err) {
      setIsOAuthConnecting(false);
      showToast('OAuth failed to initialize.', 'error');
    }
  };

  const handleSaveEmailGateway = () => {
    if (authType === 'oauth' && !accessToken) { showToast('Auth with Google first', 'error'); return; }
    if (!fromAddress) { showToast('Sender address required', 'error'); return; }
    setIsSavingEmail(true);
    setTimeout(() => {
      const gw: IntegratedEmailGateway = {
        id: editingId || Date.now().toString(), provider: emailProvider, fromAddress,
        apiKey: authType === 'api_key' ? emailApiKey : undefined,
        password: authType === 'credentials' ? emailPassword : undefined,
        accessToken: authType === 'oauth' ? accessToken : undefined,
        authType, status: 'Active'
      };
      if (editingId) onUpdateGateways(gateways.map(g => g.id === editingId ? gw : g));
      else onUpdateGateways([...gateways, gw]);
      setIsSavingEmail(false);
      resetEmailForm();
      showToast('Email Gateway Saved');
    }, 800);
  };

  const handleSendTestEmail = async (gw: IntegratedEmailGateway) => {
    if (!testToEmail.includes('@')) { showToast('Please enter a valid email address.', 'error'); return; }
    setIsSendingTest(true);
    const res = await EmailService.sendTestEmail(gw, testToEmail);
    if (res.success) { showToast(res.message); setActiveTestId(null); }
    else showToast(res.message, 'error');
    setIsSendingTest(false);
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20 relative">
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[110] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 transition-colors duration-300 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span className="material-symbols-outlined filled">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight dark:text-white">Settings</h2>
        <p className="text-text-secondary dark:text-gray-400 text-lg font-medium">Manage your cafe profile and communication bridges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          {/* SMS GATEWAY CONFIGURATION */}
          <section className="bg-white dark:bg-[#2a2018] rounded-[2rem] border border-border-color dark:border-white/5 p-8 shadow-sm space-y-8 relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <span className="material-symbols-outlined text-3xl">sms</span>
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">SMS Gateway</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-bold uppercase tracking-widest">RapidAPI Textflow Integration</p>
                </div>
              </div>
            </div>

            {/* List existing gateways */}
            <div className="space-y-4">
              {smsGateways.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-border-color dark:border-white/5 rounded-[2rem] text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-white/10 mb-2">cell_tower</span>
                  <p className="text-sm text-text-secondary dark:text-gray-500 font-medium italic">No active SMS gateways connected.</p>
                </div>
              ) : (
                smsGateways.map(gw => (
                  <div key={gw.id} className="group relative border border-border-color dark:border-white/10 rounded-2xl bg-background-light dark:bg-background-dark/30 transition-all hover:border-primary/50">
                    <div className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl shadow-inner">
                          {gw.provider[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-sm dark:text-white flex items-center gap-2">
                            {gw.provider} Provider
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          </span>
                          <span className="text-[10px] text-text-secondary font-mono bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded mt-1">
                            Service Key: ••••••••••••{gw.apiKey.slice(-4)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={() => setActiveSmsTestId(activeSmsTestId === gw.id ? null : gw.id)} 
                          className={`p-2 rounded-xl transition-all ${activeSmsTestId === gw.id ? 'bg-primary text-white' : 'hover:bg-primary/10 text-primary'}`}
                          title="Execute Real Test SMS"
                        >
                          <span className="material-symbols-outlined text-xl font-bold">send</span>
                        </button>
                        <button onClick={() => handleEditSmsGateway(gw)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-text-secondary transition-all" title="Edit Configuration">
                          <span className="material-symbols-outlined text-xl">settings</span>
                        </button>
                        <button onClick={() => handleRemoveSmsGateway(gw.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-red-500 transition-all" title="Remove Integration">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Test SMS Overlay */}
                    {activeSmsTestId === gw.id && (
                      <div className="px-5 pb-5 animate-in slide-in-from-top-4 duration-300">
                        <div className="p-5 bg-white dark:bg-black/40 rounded-2xl border border-primary/20 shadow-inner space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary">RapidAPI Test Dispatch</label>
                            <span className="text-[9px] text-text-secondary dark:text-gray-500 font-medium">Using Textflow logic via RapidAPI.</span>
                          </div>
                          <div className="flex flex-col md:flex-row gap-3">
                            <input 
                              type="tel" 
                              placeholder="+6011..." 
                              value={testToPhone} 
                              onChange={(e) => setTestToPhone(e.target.value)} 
                              className="flex-1 rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner" 
                            />
                            <button 
                              onClick={() => handleSendTestSms(gw)} 
                              disabled={isSendingSmsTest} 
                              className="px-8 py-3 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-primary/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {isSendingSmsTest ? (
                                <span className="animate-spin material-symbols-outlined text-lg">sync</span>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-lg filled">electric_bolt</span>
                                  <span>Send Test SMS</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add / Edit Form */}
            <div id="sms-config-form" className="p-8 border-2 border-dashed border-border-color dark:border-white/5 rounded-[2rem] bg-gray-50/50 dark:bg-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
                <h4 className="text-base font-black dark:text-white uppercase tracking-tight">
                  {smsEditingId ? 'Modify SMS Configuration' : 'Link New SMS Provider'}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Gateway Provider</label>
                  <select 
                    value={smsProvider} 
                    onChange={(e) => setSmsProvider(e.target.value as any)} 
                    className="w-full rounded-xl border-border-color dark:border-white/10 bg-white dark:bg-background-dark dark:text-white p-3.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                  >
                    <option value="Textflow">Textflow (RapidAPI)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-secondary dark:text-gray-400">Textflow Service Key</label>
                  <input 
                    type="password" 
                    value={smsApiKey} 
                    onChange={(e) => setSmsApiKey(e.target.value)} 
                    className="w-full rounded-xl border-border-color dark:border-white/10 bg-white dark:bg-background-dark dark:text-white p-3.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-mono" 
                    placeholder="Enter your api_key here..." 
                  />
                  <p className="text-[9px] text-text-secondary mt-1">Note: RapidAPI headers are managed automatically.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={resetSmsForm} className="px-6 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-gray-100 transition-all uppercase tracking-widest">Clear</button>
                <button 
                  onClick={handleSaveSmsGateway} 
                  disabled={isSavingSms} 
                  className="px-10 py-3 bg-text-main dark:bg-white text-white dark:text-background-dark text-xs font-black rounded-xl shadow-xl hover:bg-black dark:hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                >
                  {isSavingSms ? 'Syncing...' : smsEditingId ? 'Update Bridge' : 'Connect Gateway'}
                </button>
              </div>
            </div>
          </section>

          {/* EMAIL INTEGRATIONS */}
          <section className="bg-white dark:bg-[#2a2018] rounded-[2rem] border border-border-color dark:border-white/5 p-8 shadow-sm space-y-8 transition-all hover:shadow-md">
            <div className="flex items-center justify-between border-b border-border-color dark:border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-3xl">alternate_email</span>
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Email Channels</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-bold uppercase tracking-widest">Official Gmail Bridge</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {gateways.map(gw => (
                <div key={gw.id} className="group relative border border-border-color dark:border-white/10 rounded-2xl bg-background-light dark:bg-background-dark/30 transition-all hover:border-blue-500/50">
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">G</div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm dark:text-white flex items-center gap-2">
                          {gw.provider} 
                          <span className="size-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        </span>
                        <span className="text-[10px] text-text-secondary dark:text-gray-400 truncate max-w-[180px]">{gw.fromAddress}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => setActiveTestId(activeTestId === gw.id ? null : gw.id)} className={`p-2 rounded-xl transition-all ${activeTestId === gw.id ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 text-blue-600'}`}>
                        <span className="material-symbols-outlined text-xl font-bold">send</span>
                      </button>
                      <button onClick={() => handleEditGateway(gw)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-text-secondary transition-all">
                        <span className="material-symbols-outlined text-xl">settings</span>
                      </button>
                      <button onClick={() => handleRemoveGateway(gw.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-red-500 transition-all">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                  {activeTestId === gw.id && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-4">
                      <div className="p-5 bg-white dark:bg-black/40 rounded-2xl border border-blue-500/20 shadow-inner space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Send Test Email</label>
                        <div className="flex gap-2">
                          <input type="email" placeholder="recipient@example.com" value={testToEmail} onChange={(e) => setTestToEmail(e.target.value)} className="flex-1 rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                          <button onClick={() => handleSendTestEmail(gw)} disabled={isSendingTest} className="px-6 py-3 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20">{isSendingTest ? '...' : 'Send Test'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div id="email-config-form" className="p-8 border-2 border-dashed border-border-color dark:border-white/5 rounded-[2rem] bg-gray-50/50 dark:bg-white/5 space-y-6">
               <div className="flex items-center gap-3">
                 <img src="https://www.google.com/favicon.ico" className="size-6" alt="G" />
                 <h4 className="text-base font-black dark:text-white uppercase tracking-tight">Authorize Google Account</h4>
               </div>
               <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed font-medium">
                 Connect Bean & Leaf directly to your Gmail account using secure OAuth 2.0. This allows the system to send personalized loyalty emails to your customers directly from your business address.
               </p>
               {accessToken ? (
                 <div className="flex items-center justify-between bg-green-50 dark:bg-green-500/10 p-4 rounded-xl border border-green-200 dark:border-green-500/30">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase">Authenticated As</span>
                      <span className="text-sm font-bold dark:text-white">{fromAddress}</span>
                   </div>
                   <button onClick={resetEmailForm} className="text-xs font-black text-red-500 hover:underline">Change</button>
                 </div>
               ) : (
                 <button onClick={initiateGoogleOAuth} disabled={isOAuthConnecting} className="w-full py-4 bg-white dark:bg-background-dark border border-border-color dark:border-white/10 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-lg active:scale-95 group">
                    <img src="https://www.google.com/favicon.ico" className="size-5 transition-transform group-hover:scale-110" alt="G" />
                    <span>{isOAuthConnecting ? 'Opening Auth Dialog...' : 'Sign in with Google'}</span>
                 </button>
               )}
               <div className="flex justify-end pt-4 border-t border-border-color dark:border-white/10">
                  <button onClick={handleSaveEmailGateway} disabled={isSavingEmail} className="px-10 py-3 bg-primary text-white text-xs font-black rounded-xl shadow-xl shadow-primary/30 transition-all hover:bg-orange-600">
                    {isSavingEmail ? 'Saving...' : 'Finalize Email Settings'}
                  </button>
               </div>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="bg-white dark:bg-[#2a2018] rounded-[2rem] border border-border-color dark:border-white/5 p-8 shadow-sm space-y-6 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b dark:border-white/10 pb-4">
               <span className="material-symbols-outlined text-primary">storefront</span>
               <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">Cafe Identity</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Business Name</label>
                <input type="text" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all font-bold shadow-inner" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <button onClick={() => { setIsSaving(true); setTimeout(() => { onUpdateProfile(formData); setIsSaving(false); showToast('Profile updated!'); }, 800); }} disabled={isSaving} className="w-full bg-primary text-white font-black py-4 rounded-2xl transition-all text-sm shadow-xl shadow-primary/30 hover:bg-orange-600 active:scale-95">
                {isSaving ? 'Synchronizing...' : 'Update Shop Identity'}
              </button>
            </div>
          </section>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-8 border border-primary/20 dark:border-primary/5 space-y-4">
            <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40">
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
            <h4 className="font-black text-base dark:text-white uppercase tracking-tight">Privacy Notice</h4>
            <p className="text-[11px] text-text-secondary dark:text-gray-400 font-medium leading-relaxed">
              SMS and Email integrations use secure endpoints. Your RapidAPI keys and Google OAuth tokens are stored locally on this machine and never transmitted to our servers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
