import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import DeleteAccountModal from './DeleteAccountModal';
import {
  User,
  Shield,
  Wallet,
  Gift,
  Bell,
  Moon,
  Eye,
  Globe,
  Lock,
  HelpCircle,
  Info,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  Key,
  LogOut,
  Sliders,
  FileText
} from 'lucide-react';

export default function SettingsView() {
  const { user, updateUser, signOut, setActiveMenuScreen } = usePayWorth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'general' | 'account' | 'wallet' | 'rewards' | 'notifications' | 'appearance' | 'accessibility' | 'language' | 'privacy' | 'security' | 'help' | 'about'
  >('general');

  // Form states
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+234 800 123 4567');
  const [country, setCountry] = useState('Nigeria');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password & Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);

  // Toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);

  // Appearance & Accessibility
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Language & Currency
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('PWC');

  // Privacy & Data
  const [dataSharing, setDataSharing] = useState(false);
  const [personalizedRecs, setPersonalizedRecs] = useState(true);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser({
        username,
        email,
        phone
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPwdSuccess(false), 2500);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PayWorth_UserData_${user?.id || 'export'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteAccountConfirm = async (password: string) => {
    await new Promise((res) => setTimeout(res, 1000));
    signOut();
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'about', label: 'About', icon: Info }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Settings & Preferences
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              Account Preferences
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Manage profile, security, wallet accounts, privacy controls, and legal preferences
          </p>
        </div>

        <button
          onClick={() => setActiveMenuScreen('legal_center')}
          className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <FileText className="w-4 h-4" /> Open Legal Repository
        </button>
      </div>

      {/* Main Settings Navigation + View Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav Menu */}
        <div className="md:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-2 space-y-1 self-start">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Settings updated successfully.</span>
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" /> General Profile
              </h2>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95"
              >
                Save General Changes
              </button>
            </form>
          )}

          {/* TAB 2: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Account Security & Sessions
              </h2>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Email Verification</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Verified email ensures secure password resets and account recovery.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono">
                    Verified
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Active Sessions & Devices</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      MacBook Pro (Chrome) • Current Session • Lagos, NG
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-700">
                    Revoke Other Sessions
                  </button>
                </div>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-400 block">Delete PayWorth Account</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Permanently delete account, remaining PWC balances, referrals, and transaction history.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WALLET */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" /> Virtual Bank & Settlement Details
              </h2>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Virtual Account Number</span>
                  <div className="text-sm font-bold font-mono text-emerald-400">9012 3456 7890 (Moniepoint MFB)</div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Deposits to this virtual account automatically top up your PWC wallet.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-white block">Daily Withdrawal Limits</span>
                <div className="text-xs text-slate-300 font-mono">
                  Current Tier: <strong className="text-amber-400">Level 2 Verified</strong> • Limit: ₦250,000 / day
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" /> Notification Preferences
              </h2>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Email Alerts</span>
                    <p className="text-[11px] text-slate-400">Receive withdrawal confirmations and task audit reports.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Campaign & Task Alerts</span>
                    <p className="text-[11px] text-slate-400">Instant alerts when high-reward campaigns go live.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={campaignAlerts}
                    onChange={(e) => setCampaignAlerts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Data Privacy & Consent Controls
              </h2>

              <div className="space-y-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Cookie Consent Preferences</span>
                    <p className="text-[11px] text-slate-400">Manage analytics, performance, and marketing cookies.</p>
                  </div>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open_cookie_preferences'))}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-bold rounded-xl border border-slate-700"
                  >
                    Edit Cookie Preferences
                  </button>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Export My Personal Data</span>
                    <p className="text-[11px] text-slate-400">Download a complete JSON record of your account profile and ledger activity.</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Export JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" /> About PayWorth Platform
              </h2>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span>App Version:</span>
                  <span className="text-emerald-400 font-bold">v2.4.0 (Build 1082)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Legal Compliance Build:</span>
                  <span className="text-amber-400 font-bold">v2026.1</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setActiveMenuScreen('legal_center')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md"
                >
                  Open Legal Center
                </button>
                <button
                  onClick={() => setActiveMenuScreen('about')}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  View Full About Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={handleDeleteAccountConfirm}
      />
    </div>
  );
}
