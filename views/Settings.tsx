
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
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emailProvider, setEmailProvider] = useState('Gmail');
  const [fromAddress, setFromAddress] = useState(''); 
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [authType, setAuthType] = useState<'oauth' | 'api_key' | 'credentials'>('oauth');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  
  // Custom Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState<'email' | 'password'>('email');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePass, setGooglePass] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
  };

  const handleEditGateway = (gw: IntegratedEmailGateway) => {
    setEditingId(gw.id);
    setEmailProvider(gw.provider);
    setFromAddress(gw.fromAddress);
    setEmailApiKey(gw.apiKey || '');
    setEmailPassword(gw.password || '');
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

  const openGoogleAuth = () => {
    setShowGoogleModal(true);
    setGoogleStep('email');
  };

  const handleGoogleNext = () => {
    if (googleStep === 'email') {
      if (!googleEmail.includes('@gmail.com') && !googleEmail.includes('@')) {
        showToast('Please enter a valid Gmail address', 'error');
        return;
      }
      setIsGoogleLoading(true);
      setTimeout(() => {
        setIsGoogleLoading(false);
        setGoogleStep('password');
      }, 1000);
    } else {
      if (!googlePass) {
        showToast('Password is required', 'error');
        return;
      }
      setIsGoogleLoading(true);
      setTimeout(() => {
        setIsGoogleLoading(false);
        setFromAddress(googleEmail);
        setEmailPassword(googlePass);
        setAuthType('oauth'); // Treated as authenticated in our system
        setShowGoogleModal(false);
        showToast('Google Account connected successfully!', 'success');
      }, 1500);
    }
  };

  const handleSaveEmailGateway = () => {
    if (!fromAddress) {
      showToast('Please provide a sender email address', 'error');
      return;
    }

    setIsSavingEmail(true);
    setTimeout(() => {
      const gatewayData: IntegratedEmailGateway = {
        id: editingId || Date.now().toString(),
        provider: emailProvider,
        fromAddress,
        apiKey: authType === 'api_key' ? emailApiKey : undefined,
        password: emailPassword || undefined,
        authType: authType,
        status: 'Active'
      };

      if (editingId) {
        onUpdateGateways(gateways.map(g => g.id === editingId ? gatewayData : g));
        showToast('Integration updated successfully!');
      } else {
        onUpdateGateways([...gateways, gatewayData]);
        showToast(`New ${emailProvider} Gateway integrated!`);
      }
      setIsSavingEmail(false);
      resetEmailForm();
    }, 1200);
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
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20 relative">
      {/* Google Sign-In Simulation Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center gap-4">
                <img src="https://www.google.com/favicon.ico" className="size-8" alt="Google" />
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-900">Sign in</h3>
                  <p className="text-sm text-gray-600 mt-1">to continue to Bean & Leaf</p>
                </div>
              </div>

              <div className="space-y-6">
                {googleStep === 'email' ? (
                  <div className="space-y-1 group">
                    <input 
                      type="email" 
                      placeholder="Email or phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      autoFocus
                    />
                    <button className="text-blue-600 text-sm font-medium hover:underline px-1">Forgot email?</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-1.5 border rounded-full bg-gray-50 border-gray-200">
                      <div className="size-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">{googleEmail[0].toUpperCase()}</div>
                      <span className="text-sm text-gray-700 truncate">{googleEmail}</span>
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="password" 
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900"
                        value={googlePass}
                        onChange={(e) => setGooglePass(e.target.value)}
                        autoFocus
                      />
                      <button className="text-blue-600 text-sm font-medium hover:underline px-1">Forgot password?</button>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 leading-relaxed">
                  Not your computer? Use Guest mode to sign in privately. <a href="#" className="text-blue-600 font-medium hover:underline">Learn more</a>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button onClick={() => setShowGoogleModal(false)} className="text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded transition-colors">Cancel</button>
                  <button 
                    onClick={handleGoogleNext}
                    disabled={isGoogleLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2 rounded transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isGoogleLoading ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : 'Next'}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 px-8 py-3 flex justify-between text-xs text-gray-500">
              <div className="flex gap-4">
                <span>English (United States)</span>
                <span className="material-symbols-outlined text-[12px]">arrow_drop_down</span>
              </div>
              <div className="flex gap-4">
                <a href="#" className="hover:underline">Help</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <p className="text-text-secondary dark:text-gray-400 text-lg font-medium">Manage your shop profile and third-party integrations.</p>
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
                  <h3 className="text-xl font-black dark:text-white">Email Integrations</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Configure how Bean & Leaf sends messages</p>
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
                            {gw.authType === 'oauth' && <span className="material-symbols-outlined text-[14px] text-blue-500 filled" title="Verified Integration">verified_user</span>}
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
                          <label className="text-[11px] font-black uppercase tracking-widest text-text-main dark:text-gray-300">Run Connectivity Test</label>
                          <div className="flex flex-col md:flex-row gap-3">
                            <input type="email" placeholder="Recipient email" className="flex-1 pl-4 pr-4 py-2.5 rounded-xl border border-border-color dark:border-white/10 bg-white dark:bg-background-dark text-xs focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner" value={testToEmail} onChange={(e) => setTestToEmail(e.target.value)} disabled={isSendingTest} />
                            <button onClick={() => handleSendTestEmail(gw)} disabled={isSendingTest} className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95">
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
                  <h3 className="text-xl font-black dark:text-white">{editingId ? 'Edit Integration' : 'New Integration'}</h3>
                  <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">Link your Gmail or external provider</p>
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
                      <h4 className="font-black text-base dark:text-white">Secure Google Login</h4>
                      <p className="text-xs text-text-secondary dark:text-gray-400 font-medium leading-relaxed">Connect your account using Google's secure authentication window. Use a standard password or an <strong>App Password</strong> for maximum security.</p>
                    </div>
                  </div>
                  {fromAddress && authType === 'oauth' ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-400/10 p-5 rounded-2xl border border-green-200 dark:border-green-400/20 shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-green-600 text-3xl filled">check_circle</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-green-800 dark:text-green-400">Account Ready</span>
                          <span className="text-xs text-green-600 dark:text-green-500 font-medium">{fromAddress}</span>
                        </div>
                      </div>
                      <button onClick={resetEmailForm} className="text-xs font-black text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-all">CHANGE</button>
                    </div>
                  ) : (
                    <button 
                      onClick={openGoogleAuth}
                      className="w-full py-4 rounded-2xl border border-border-color bg-white dark:bg-background-dark text-sm font-black flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-lg active:scale-[0.98]"
                    >
                      <img src="https://www.google.com/favicon.ico" className="size-5" alt="G" />
                      <span>Sign in with Google Account</span>
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
                {isSavingEmail ? 'Saving...' : editingId ? 'Update Integration' : 'Save & Connect'}
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
            <h4 className="font-black text-base dark:text-white">Secure Access</h4>
            <p className="text-xs text-text-secondary dark:text-gray-400 font-medium leading-relaxed">
              We recommend using a Google <strong>App Password</strong> for this integration. This allows Bean & Leaf to send emails without needing your primary account password.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
