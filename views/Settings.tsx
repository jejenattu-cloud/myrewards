
import React, { useState, useEffect } from 'react';
import { Profile, IntegratedEmailGateway } from '../types';
import { EmailService } from '../services/emailService';

// Updated with your real Client ID
const GOOGLE_CLIENT_ID = '959648036352-k0lsvj8gbsj30dnjpvfqd7mbnnpat2eb.apps.googleusercontent.com';

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
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
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
    if (confirm('Are you sure you want to remove this gateway integration?')) {
      onUpdateGateways(gateways.filter(g => g.id !== id));
      showToast('Integration removed successfully');
      if (editingId === id) resetEmailForm();
    }
  };

  /**
   * Real Google OAuth Flow
   * This uses the Google Identity Services (GIS) library to request an access token.
   * Make sure your Origin (e.g., http://localhost:xxxx) is added to the 
   * "Authorized JavaScript origins" in your Google Cloud Console.
   */
  const initiateGoogleOAuth = () => {
    if (!(window as any).google) {
      showToast('Google Identity library not found. Please ensure the script is loaded in index.html.', 'error');
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
            console.error('OAuth Error:', response);
            showToast(`Auth Error: ${response.error_description || response.error}`, 'error');
            return;
          }

          try {
            // Fetch real user info to confirm the email address automatically
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });

            if (!userInfoResponse.ok) throw new Error('Failed to fetch user profile');

            const userInfo = await userInfoResponse.json();

            setAccessToken(response.access_token);
            setFromAddress(userInfo.email);
            setAuthType('oauth');
            setIsOAuthConnecting(false);
            showToast(`Connected as ${userInfo.email}`, 'success');
          } catch (err) {
            console.error('Profile fetch error:', err);
            setIsOAuthConnecting(false);
            showToast('Authenticated, but failed to retrieve your email address.', 'error');
          }
        },
      });

      client.requestAccessToken();
    } catch (err) {
      console.error('GIS Initialization Error:', err);
      setIsOAuthConnecting(false);
      showToast('Failed to initialize Google login flow.', 'error');
    }
  };

  const handleSaveEmailGateway = () => {
    if (authType === 'oauth' && !accessToken) {
      showToast('Please authenticate with Google first', 'error');
      return;
    }
    
    if (!fromAddress) {
      showToast('Sender address is required', 'error');
      return;
    }

    setIsSavingEmail(true);
    // Simulating a brief DB save delay
    setTimeout(() => {
      const gatewayData: IntegratedEmailGateway = {
        id: editingId || Date.now().toString(),
        provider: emailProvider,
        fromAddress,
        apiKey: authType === 'api_key' ? emailApiKey : undefined,
        password: authType === 'credentials' ? emailPassword : undefined,
        accessToken: authType === 'oauth' ? accessToken : undefined,
        authType: authType,
        status: 'Active'
      };

      if (editingId) {
        onUpdateGateways(gateways.map(g => g.id === editingId ? gatewayData : g));
        showToast('Integration updated successfully!');
      } else {
        onUpdateGateways([...gateways, gatewayData]);
        showToast(`New ${emailProvider} integration saved and active!`);
      }
      setIsSavingEmail(false);
      resetEmailForm();
    }, 800);
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
      console.error('Test Send Error:', error);
      showToast('An unexpected error occurred during testing.', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20 relative">
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[110] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 transition-colors duration-300 ${
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
        <p className="text-text-secondary dark:text-gray-400 text-lg font-medium">Manage your shop profile and secure third-party integrations.</p>
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
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Manage your connected email services</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {gateways.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-border-color dark:border-white/5 rounded-3xl">
                  <div className="size-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <span className="material-symbols-outlined">link_off</span>
                  </div>
                  <p className="text-text-secondary dark:text-gray-500 italic font-medium">No gateways connected yet.</p>
                </div>
              ) : (
                gateways.map((gw) => (
                  <div key={gw.id} className="flex flex-col overflow-hidden rounded-2xl border border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark/50 transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between p-4 group">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-xl flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 ${
                          gw.provider === 'Gmail' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                        }`}>
                          {gw.provider[0]}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-bold dark:text-white flex items-center gap-2 text-sm md:text-base">
                            {gw.provider}
                            {gw.authType === 'oauth' && <span className="material-symbols-outlined text-[14px] text-blue-500 filled" title="OAuth Enabled">verified_user</span>}
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                          </h4>
                          <p className="text-xs text-text-secondary dark:text-gray-400 truncate max-w-[150px] md:max-w-none font-medium">{gw.fromAddress}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setActiveTestId(activeTestId === gw.id ? null : gw.id)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary dark:text-gray-400 hover:text-primary transition-all">
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
                          <label className="text-[11px] font-black uppercase tracking-widest text-text-main dark:text-gray-300">Run Connectivity Test (Real Dispatch)</label>
                          <div className="flex flex-col md:flex-row gap-3">
                            <input type="email" placeholder="Recipient email" className="flex-1 pl-4 pr-4 py-2.5 rounded-xl border border-border-color dark:border-white/10 bg-white dark:bg-background-dark text-xs focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner" value={testToEmail} onChange={(e) => setTestToEmail(e.target.value)} disabled={isSendingTest} />
                            <button onClick={() => handleSendTestEmail(gw)} disabled={isSendingTest} className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95">
                              {isSendingTest ? 'Sending...' : 'Send Test'}
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
                  <h3 className="text-xl font-black dark:text-white">{editingId ? 'Edit Integration' : 'New Integration'}</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Link your account via official Google Auth</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main dark:text-gray-300">Email Provider</label>
                <select className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3.5 focus:ring-primary outline-none transition-colors font-medium" value={emailProvider} onChange={(e) => {
                  setEmailProvider(e.target.value);
                  if (e.target.value === 'Gmail') setAuthType('oauth');
                  else setAuthType('api_key');
                }}>
                  <option>Gmail</option>
                  <option>SendGrid</option>
                  <option>Mailgun</option>
                </select>
              </div>

              {emailProvider === 'Gmail' ? (
                <div className="md:col-span-2 p-8 rounded-3xl border-2 border-dashed border-border-color dark:border-white/5 bg-gray-50/50 dark:bg-white/5 space-y-6">
                  <div className="flex items-center gap-5">
                    <img src="https://www.google.com/favicon.ico" className="size-8" alt="G" />
                    <div>
                      <h4 className="font-black text-base dark:text-white">Sign in with Google</h4>
                      <p className="text-xs text-text-secondary dark:text-gray-400 font-medium leading-relaxed">Connect securely using Google's official authorization flow. We only request permission to send emails on your behalf via the Gmail API.</p>
                    </div>
                  </div>
                  {accessToken ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-400/10 p-5 rounded-2xl border border-green-200 dark:border-green-400/20 shadow-sm animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-green-600 text-3xl filled">check_circle</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-green-800 dark:text-green-400">Authenticated</span>
                          <span className="text-xs text-green-600 dark:text-green-500 font-medium">{fromAddress}</span>
                        </div>
                      </div>
                      <button onClick={resetEmailForm} className="text-xs font-black text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-all">CHANGE ACCOUNT</button>
                    </div>
                  ) : (
                    <button 
                      onClick={initiateGoogleOAuth}
                      disabled={isOAuthConnecting}
                      className="w-full py-4 rounded-2xl border border-border-color bg-white dark:bg-background-dark text-sm font-black flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                    >
                      <img src="https://www.google.com/favicon.ico" className="size-5" alt="G" />
                      <span>{isOAuthConnecting ? 'Opening Google Auth...' : 'Connect Google Account'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-text-main dark:text-gray-300">Sender Email</label>
                    <input type="email" placeholder="e.g. hello@yourcafe.com" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3.5 focus:ring-primary outline-none transition-colors font-medium" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-black text-text-main dark:text-gray-300">API Key</label>
                    <input type="password" placeholder="Enter service API key" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3.5 focus:ring-primary outline-none transition-colors font-medium" value={emailApiKey} onChange={(e) => setEmailApiKey(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border-color dark:border-white/10">
              <button onClick={resetEmailForm} className="px-6 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:bg-gray-100 transition-all">Cancel</button>
              <button onClick={handleSaveEmailGateway} disabled={isSavingEmail} className="px-8 py-3 rounded-2xl bg-primary text-white text-sm font-black hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95">
                {isSavingEmail ? 'Saving...' : editingId ? 'Update Integration' : 'Confirm & Save'}
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
                <input type="text" className="w-full rounded-xl border-border-color dark:border-white/10 bg-background-light dark:bg-background-dark dark:text-white p-3.5 text-sm focus:ring-primary outline-none font-medium" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <button onClick={() => { setIsSaving(true); setTimeout(() => { onUpdateProfile(formData); setIsSaving(false); showToast('Profile updated!'); }, 800); }} disabled={isSaving} className="w-full bg-primary hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all text-sm shadow-lg active:scale-95">
                {isSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </section>
          
          <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-8 border border-primary/20 space-y-4 hover:shadow-lg transition-all">
            <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
            <h4 className="font-black text-base dark:text-white">Secure Connection</h4>
            <p className="text-xs text-text-secondary dark:text-gray-400 font-medium leading-relaxed">
              Google OAuth ensures that your primary password is never shared. The Gmail API access token is stored locally in your browser's persistent storage.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
