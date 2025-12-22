
import React, { useState, useEffect } from 'react';
import { Profile } from '../types';

interface SettingsProps {
  profile: Profile;
  onUpdateProfile: (updates: Partial<Profile>) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
  const [isSmsEnabled, setIsSmsEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sync local state if props change externally
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleUpdateProfile = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onUpdateProfile(formData);
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 right-10 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10">
          <span className="material-symbols-outlined filled">check_circle</span>
          <span className="font-bold">Profile updated successfully!</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight">Settings</h2>
        <p className="text-text-secondary text-lg">Manage your shop profile and third-party integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          {/* SMS Gateway Section */}
          <section className="bg-white rounded-3xl border border-border-color p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-border-color pb-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">sms</span>
                </div>
                <div>
                  <h3 className="text-xl font-black">SMS Gateway</h3>
                  <p className="text-xs text-text-secondary font-medium">Configure Twilio or Vonage for SMS campaigns</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSmsEnabled(!isSmsEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isSmsEnabled ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isSmsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${isSmsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main">Provider</label>
                <select className="w-full rounded-xl border-border-color bg-background-light p-3 focus:ring-primary focus:border-primary font-medium">
                  <option>Twilio</option>
                  <option>Vonage</option>
                  <option>MessageBird</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main">Sender ID</label>
                <input type="text" className="w-full rounded-xl border-border-color bg-background-light p-3 focus:ring-primary focus:border-primary" placeholder="e.g. BEANLEAF" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-text-main">Account SID</label>
                <input type="password" title="SID" className="w-full rounded-xl border-border-color bg-background-light p-3 focus:ring-primary focus:border-primary" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-text-main">Auth Token</label>
                <input type="password" title="Auth Token" className="w-full rounded-xl border-border-color bg-background-light p-3 focus:ring-primary focus:border-primary" placeholder="••••••••••••••••••••••••••••••••" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 rounded-xl border border-border-color text-sm font-bold hover:bg-gray-50 transition-colors">Test Connection</button>
              <button className="px-6 py-2.5 rounded-xl bg-text-main text-white text-sm font-bold hover:bg-black transition-colors">Save Changes</button>
            </div>
          </section>

          {/* Email Gateway Section */}
          <section className="bg-white rounded-3xl border border-border-color p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-border-color pb-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h3 className="text-xl font-black">Email Gateway</h3>
                  <p className="text-xs text-text-secondary font-medium">Connect SendGrid or Mailgun for newsletters</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEmailEnabled(!isEmailEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isEmailEnabled ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isEmailEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${isEmailEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main">Provider</label>
                <select className="w-full rounded-xl border-border-color bg-background-light p-3 focus:ring-primary focus:border-primary font-medium">
                  <option>SendGrid</option>
                  <option>Mailgun</option>
                  <option>AWS SES</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-text-main">From Address</label>
                <input type="email" className="w-full rounded-xl border-border-color bg-background-light p-3 focus:ring-primary focus:border-primary" placeholder="hello@beanandleaf.com" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black text-text-main">API Key</label>
                <input type="password" title="Email API Key" className="w-full rounded-xl border-border-color bg-background-light p-3 focus:ring-primary focus:border-primary" placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2.5 rounded-xl border border-border-color text-sm font-bold hover:bg-gray-50 transition-colors">Test Connection</button>
              <button className="px-6 py-2.5 rounded-xl bg-text-main text-white text-sm font-bold hover:bg-black transition-colors">Save Changes</button>
            </div>
          </section>

        </div>

        <aside className="space-y-8">
          <section className="bg-white rounded-3xl border border-border-color p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-lg font-black border-b border-border-color pb-4">General Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Business Name</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-border-color bg-background-light p-3 text-sm focus:ring-primary" 
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Currency</label>
                <select 
                  className="w-full rounded-xl border-border-color bg-background-light p-3 text-sm focus:ring-primary"
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
                <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Timezone</label>
                <select 
                  className="w-full rounded-xl border-border-color bg-background-light p-3 text-sm focus:ring-primary"
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
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

          <section className="bg-primary/5 rounded-3xl border border-primary/20 p-8 flex flex-col gap-4">
            <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">help</span>
            </div>
            <h4 className="font-black text-text-main">Need assistance?</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
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
