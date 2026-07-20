import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import {
  Menu,
  MoreVertical,
  Home,
  ClipboardList,
  Wallet,
  ShoppingBag,
  Coins,
  ChevronRight,
  User,
  ShieldCheck,
  Award,
  Bell,
  Sliders,
  LogOut,
  Sparkles,
  Trophy,
  Users,
  Gamepad2,
  PieChart,
  HelpCircle,
  FileText,
  BadgeDollarSign
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    activeMenuScreen,
    setActiveMenuScreen,
    logout,
  } = usePayWorth();

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);

  // Unread notifications count
  const userNotifs = currentUser ? (usePayWorth().state.notifications[currentUser.id] || []) : [];
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleMenuClick = (screen: string | null) => {
    setActiveMenuScreen(screen);
    setLeftDrawerOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Admin Panel', icon: Sliders, requiresAdmin: true },
    { id: 'membership', label: 'Membership Tiers', icon: Sparkles },
    { id: 'create_campaign', label: 'Start Campaign', icon: BadgeDollarSign },
    { id: 'leaderboard', label: 'Leaderboards', icon: Trophy },
    { id: 'wheel', label: 'Lucky Wheel', icon: Coins },
    { id: 'games', label: 'Mini Games', icon: Gamepad2 },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'referrals', label: 'Referrals Network', icon: Users },
    { id: 'payfunds', label: 'Pay Funds Application', icon: BadgeDollarSign },
    { id: 'statistics', label: 'Wallet Statistics', icon: PieChart },
    { id: 'notifications', label: 'In-app Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'settings', label: 'Engine Settings', icon: Sliders },
  ];

  const rightItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'help', label: 'System Help Center', icon: HelpCircle },
    { id: 'privacy', label: 'Privacy Standards', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Use', icon: FileText },
    { id: 'about', label: 'About PayWorth', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Absolute background effects */}
      <div className="fixed top-[-20%] left-[-20%] w-[100%] h-[60%] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[80%] h-[50%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* PERSISTENT HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-md border-b border-white/5 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="btn_hamburger"
            onClick={() => setLeftDrawerOpen(true)}
            className="p-2 hover:bg-white/5 active:scale-95 rounded-xl border border-white/5 transition-all text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* PayWorth branding */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { setActiveMenuScreen(null); setActiveTab('home'); }}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
              <Coins className="text-slate-950 w-4 h-4" />
            </div>
            <span className="text-sm font-extrabold tracking-wider font-mono bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              PAYWORTH
            </span>
          </div>
        </div>

        {/* Balance Counter and Profile Options */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div
              onClick={() => { setActiveMenuScreen(null); setActiveTab('wallet'); }}
              className="bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-white leading-none">
                {currentUser.pwcBalance.toLocaleString()} <span className="text-[10px] text-emerald-400 font-medium">PWC</span>
              </span>
            </div>
          )}

          <button
            id="btn_more"
            onClick={() => setRightDropdownOpen(!rightDropdownOpen)}
            className="p-2 hover:bg-white/5 active:scale-95 rounded-xl border border-white/5 transition-all text-slate-300"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* CORE VIEWPORT FOR CHILD CONTENT */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>

      {/* PERSISTENT BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-xl border-t border-white/5 py-2 px-6 flex items-center justify-around">
        <button
          onClick={() => { setActiveMenuScreen(null); setActiveTab('home'); }}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl ${
            activeTab === 'home' && !activeMenuScreen
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Home</span>
        </button>

        <button
          onClick={() => { setActiveMenuScreen(null); setActiveTab('tasks'); }}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl ${
            activeTab === 'tasks' && !activeMenuScreen
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Tasks</span>
        </button>

        <button
          onClick={() => { setActiveMenuScreen(null); setActiveTab('wallet'); }}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl ${
            activeTab === 'wallet' && !activeMenuScreen
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Wallet</span>
        </button>

        <button
          onClick={() => { setActiveMenuScreen(null); setActiveTab('marketplace'); }}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl ${
            activeTab === 'marketplace' && !activeMenuScreen
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Marketplace</span>
        </button>
      </nav>

      {/* LEFT HAMBURGER MENU DRAWER */}
      <AnimatePresence>
        {leftDrawerOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLeftDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Slide-out drawer content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-slate-900 border-r border-white/10 z-50 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Profile header on drawer */}
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <img
                    src={currentUser?.avatar}
                    alt="User profile"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border border-emerald-400/30"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                      {currentUser?.username}
                      {currentUser?.emailVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                      )}
                    </h4>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-mono mt-1 inline-block">
                      {currentUser?.membershipTier}
                    </span>
                  </div>
                </div>

                {/* Left Drawer Links */}
                <div className="p-3 space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest px-3 mb-2 block">
                    Navigation Engines
                  </span>

                  {menuItems.map((item) => {
                    const isSelected = activeMenuScreen === item.id;
                    const Icon = item.icon;

                    // Skip Admin Panel if user is not the admin
                    if (item.requiresAdmin && currentUser?.email !== 'admin@payworth.com') {
                      return null;
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className="bg-red-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer footer containing logout */}
              <div className="p-4 border-t border-white/5 bg-black/20">
                <button
                  onClick={() => {
                    setLeftDrawerOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold py-2.5 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" /> Secure Logout
                </button>
                <div className="text-[9px] text-slate-500 text-center mt-3 font-mono">
                  PAYWORTH CORE v1.0 • GLASSLINE
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RIGHT DROPDOWN OPTIONS OVERLAY */}
      <AnimatePresence>
        {rightDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setRightDropdownOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-4 top-14 w-52 bg-slate-900 border border-white/10 rounded-2xl p-2 z-50 shadow-2xl backdrop-blur-xl"
            >
              {rightItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleMenuClick(item.id);
                      setRightDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 p-2 hover:bg-white/5 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs transition-all"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
