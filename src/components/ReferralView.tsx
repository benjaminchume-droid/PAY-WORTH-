import React, { useState } from 'react';
import { usePayWorth } from '../engines/StateContext';
import {
  Users,
  Copy,
  CheckCircle2,
  Share2,
  TrendingUp,
  Shield,
  Award,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  QrCode
} from 'lucide-react';

export default function ReferralView() {
  const { currentUser } = usePayWorth();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!currentUser) return null;

  const code = currentUser.referralCode || 'PAY-MEMBER1';
  const referralUrl = `https://payworth.app/r/${code}`;
  const deepLink = `payworth://ref/${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const dummyReferrals = [
    {
      id: 'ref_1',
      name: 'Michael O.',
      joined: '2026-07-20',
      type: 'Premium',
      tier: 'Shining Silver',
      reward: 300,
      status: 'approved',
      release: 'Released'
    },
    {
      id: 'ref_2',
      name: 'Sarah K.',
      joined: '2026-07-21',
      type: 'Standard',
      tier: 'Dark Bronze',
      reward: 50,
      status: 'pending',
      release: 'Holding Period (4 days remaining)'
    }
  ];

  return (
    <div className="p-4 max-w-xl mx-auto pb-28 space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-bold rounded-full mb-2 inline-block">
              🚀 Enterprise Referral & Growth Engine
            </span>
            <h2 className="text-2xl font-black text-white font-display">
              Invite &amp; Earn Bounties
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Earn 50 PWC for standard signups plus up to 1,000 PWC for every premium membership upgrade.
            </p>
          </div>
        </div>

        {/* Unique Link & Code Widget */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Your Permanent Referral Link</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 bg-slate-900 border border-white/10 text-xs text-emerald-400 font-mono p-2.5 rounded-xl outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 space-y-1 backdrop-blur-xl">
          <span className="text-[9px] text-slate-400 font-mono block">TOTAL CLICKS</span>
          <span className="text-lg font-bold text-white font-mono">142</span>
        </div>
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 space-y-1 backdrop-blur-xl">
          <span className="text-[9px] text-slate-400 font-mono block">QUALIFIED REFS</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">12</span>
        </div>
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 space-y-1 backdrop-blur-xl">
          <span className="text-[9px] text-slate-400 font-mono block">PREMIUM REFS</span>
          <span className="text-lg font-bold text-amber-400 font-mono">4</span>
        </div>
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 space-y-1 backdrop-blur-xl">
          <span className="text-[9px] text-slate-400 font-mono block">EARNED PWC</span>
          <span className="text-lg font-bold text-emerald-300 font-mono">1,450</span>
        </div>
      </div>

      {/* Fraud Detection & Protection Indicator */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
            <Shield className="w-4.5 h-4.5 text-emerald-400" /> Fraud Detection &amp; Holding Period
          </h3>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
            RISK SCORE: 0 (SAFE)
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          To protect platform financial integrity against automated bot loops and self-referrals, rewards undergo a 7-day security holding period before final release into main wallet balances.
        </p>
      </div>

      {/* Referral Activity List */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
          <Users className="w-4.5 h-4.5 text-amber-400" /> Referral Activity Ledger
        </h3>

        <div className="space-y-2.5">
          {dummyReferrals.map((r) => (
            <div key={r.id} className="p-3.5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white">{r.name}</h4>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    r.type === 'Premium' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {r.type} ({r.tier})
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{r.release}</p>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400 block">+${r.reward} PWC</span>
                <span className="text-[9px] text-slate-400 font-mono">{r.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
