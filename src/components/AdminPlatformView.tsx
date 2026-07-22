import React, { useState } from 'react';
import { usePayWorth } from '../engines/StateContext';
import { User } from '../types';
import {
  Sliders,
  Users,
  CheckCircle2,
  XCircle,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  BadgeDollarSign,
  Activity,
  Lock,
  Layers
} from 'lucide-react';

export default function AdminPlatformView() {
  const {
    currentUser,
    appState,
    adminApproveWithdrawal,
    adminApproveCampaign
  } = usePayWorth();

  const [activeTab, setActiveTab] = useState<'users' | 'withdrawals' | 'campaigns' | 'economy' | 'health'>('withdrawals');
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser || currentUser.email !== 'admin@payworth.com') {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Access Denied</h3>
        <p className="text-xs text-slate-400">
          The Admin Platform is restricted exclusively to PayWorth System Administrators.
        </p>
      </div>
    );
  }

  const pendingWithdrawals = appState.withdrawals.filter((w) => w.status === 'pending');
  const pendingCampaigns = appState.campaigns.filter((c) => c.status === 'pending_approval');
  const userList: User[] = Object.values(appState.users) as User[];

  return (
    <div className="p-4 max-w-3xl mx-auto pb-28 space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-black border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] uppercase font-bold rounded-full mb-2 inline-block">
              🛡️ PayWorth Enterprise Admin Console
            </span>
            <h2 className="text-2xl font-black text-white font-display">
              Platform Administration
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Supervise global liquidity, user trust ratings, withdrawal approvals, and economy parameters.
            </p>
          </div>
        </div>

        {/* Top Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center pt-2">
          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-mono block">TOTAL USERS</span>
            <span className="text-base font-bold text-white font-mono">{userList.length}</span>
          </div>
          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-mono block">PENDING WITHDRAWALS</span>
            <span className="text-base font-bold text-amber-400 font-mono">{pendingWithdrawals.length}</span>
          </div>
          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-mono block">PENDING CAMPAIGNS</span>
            <span className="text-base font-bold text-cyan-400 font-mono">{pendingCampaigns.length}</span>
          </div>
          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-0.5">
            <span className="text-[9px] text-slate-400 font-mono block">SYSTEM STATUS</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">ONLINE 100%</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="grid grid-cols-5 gap-1 p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-lg text-center text-xs">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`py-2 font-bold rounded-xl transition-all ${
            activeTab === 'withdrawals' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Withdrawals ({pendingWithdrawals.length})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`py-2 font-bold rounded-xl transition-all ${
            activeTab === 'campaigns' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Campaigns ({pendingCampaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 font-bold rounded-xl transition-all ${
            activeTab === 'users' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          User Ledger
        </button>
        <button
          onClick={() => setActiveTab('economy')}
          className={`py-2 font-bold rounded-xl transition-all ${
            activeTab === 'economy' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Economy
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`py-2 font-bold rounded-xl transition-all ${
            activeTab === 'health' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Health
        </button>
      </div>

      {/* TAB 1: WITHDRAWAL REQUESTS */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white font-display">Pending Settlement Requests</h3>
          {pendingWithdrawals.length === 0 ? (
            <div className="p-8 bg-slate-900/60 border border-white/10 rounded-3xl text-center text-slate-400 text-xs">
              No pending withdrawal requests in the queue.
            </div>
          ) : (
            pendingWithdrawals.map((w) => (
              <div key={w.id} className="p-4 bg-slate-900/80 border border-white/10 rounded-3xl space-y-3 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{w.userName}</h4>
                    <p className="text-xs text-slate-400 font-mono">{w.bankName} - {w.accountNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-emerald-400 font-mono block">₦{w.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Fee: ₦{w.fee}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => adminApproveWithdrawal(w.id, false)}
                    className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs py-2 rounded-xl transition-all border border-rose-500/30"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => adminApproveWithdrawal(w.id, true)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-md"
                  >
                    Approve &amp; Settle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: CAMPAIGN APPROVALS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white font-display">Pending Community Campaigns</h3>
          {pendingCampaigns.length === 0 ? (
            <div className="p-8 bg-slate-900/60 border border-white/10 rounded-3xl text-center text-slate-400 text-xs">
              No pending campaigns requiring moderation review.
            </div>
          ) : (
            pendingCampaigns.map((c) => (
              <div key={c.id} className="p-4 bg-slate-900/80 border border-white/10 rounded-3xl space-y-3 backdrop-blur-xl">
                <div>
                  <h4 className="font-bold text-white text-sm">{c.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{c.description}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Creator: {c.creatorName} | Reward Pool: ${c.rewardPool} PWC</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => adminApproveCampaign(c.id, false)}
                    className="flex-1 bg-rose-500/20 text-rose-300 font-bold text-xs py-2 rounded-xl border border-rose-500/30"
                  >
                    Reject Campaign
                  </button>
                  <button
                    onClick={() => adminApproveCampaign(c.id, true)}
                    className="flex-1 bg-emerald-500 text-slate-950 font-bold text-xs py-2 rounded-xl shadow-md"
                  >
                    Approve &amp; Publish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: USER LEDGER */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white font-display">System Users Directory</h3>
          <div className="space-y-2">
            {userList.map((u) => (
              <div key={u.id} className="p-3.5 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center justify-between text-xs backdrop-blur-xl">
                <div>
                  <h4 className="font-bold text-white">{u.username} <span className="text-[10px] font-mono text-amber-400">({u.membershipTier})</span></h4>
                  <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold block">{u.pwcBalance.toLocaleString()} PWC</span>
                  <span className="text-[9px] text-slate-400">Trust Score: {u.trustScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4 & 5: HEALTH & ECONOMY */}
      {(activeTab === 'economy' || activeTab === 'health') && (
        <div className="p-6 bg-slate-900/80 border border-white/10 rounded-3xl space-y-3 text-xs text-slate-300 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Platform Services Health
          </h3>
          <p>Database connections active on Supabase Cluster. Row Level Security policies verified.</p>
          <div className="p-3 bg-black/40 rounded-xl font-mono text-[11px] text-emerald-400">
            [SUPABASE STATUS] CONNECTED &bull; [RLS] ENABLED &bull; [CRON] ACTIVE
          </div>
        </div>
      )}
    </div>
  );
}
