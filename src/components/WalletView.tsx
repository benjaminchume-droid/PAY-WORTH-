import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { LedgerEntry } from '../types';
import {
  Wallet,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Copy,
  CheckCircle,
  Clock,
  Send,
  Building,
  Hash,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function WalletView() {
  const {
    currentUser,
    state,
    requestWithdrawal,
    depositSimulate,
    sendTransfer,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  const [activeSubAction, setActiveSubAction] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  
  // Deposit simulation state
  const [depositAmount, setDepositAmount] = useState('500');
  const [copiedVA, setCopiedVA] = useState(false);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Transfer form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferring, setTransferring] = useState(false);

  // User transaction history ledger
  const historyList = currentUser ? (state.ledger[currentUser.id] || []) : [];

  const handleCopyVA = () => {
    if (currentUser?.virtualAccount) {
      navigator.clipboard.writeText(currentUser.virtualAccount.accountNumber);
      setCopiedVA(true);
      setTimeout(() => setCopiedVA(false), 2000);
    }
  };

  const handleSimulateDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    clearMessages();
    await depositSimulate(amt);
    setActiveSubAction(null);
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || !bankName || !accountNumber) return;

    setWithdrawing(true);
    clearMessages();
    const res = await requestWithdrawal(amt, bankName, accountNumber);
    setWithdrawing(false);

    if (res.success) {
      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setActiveSubAction(null);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || !recipientEmail) return;

    setTransferring(true);
    clearMessages();
    const res = await sendTransfer(recipientEmail, amt, transferNote || undefined);
    setTransferring(false);

    if (res.success) {
      setTransferAmount('');
      setRecipientEmail('');
      setTransferNote('');
      setActiveSubAction(null);
    }
  };

  // Live fee calculations for withdrawals (Standard Bronze fee 10%, Silver 5%, Diamond 0%)
  const calculateFee = () => {
    const amt = parseFloat(withdrawAmount) || 0;
    let feePercent = 0.10;
    if (currentUser?.membershipTier === 'Shining Silver') feePercent = 0.05;
    else if (currentUser?.membershipTier === 'Shimmering Gold') feePercent = 0.02;
    else if (currentUser?.membershipTier === 'Resilient Diamond' || currentUser?.membershipTier === 'Epic Legend' || currentUser?.membershipTier === 'Mythical') feePercent = 0.0;
    
    const fee = Math.round(amt * feePercent);
    const receive = Math.max(0, amt - fee);
    return { fee, receive };
  };

  const { fee, receive } = calculateFee();

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Wallet className="text-emerald-400 w-5.5 h-5.5" /> Secure Wallet & Ledger
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your immutable ledger entries, initiate P2P transfers, view settlements, or deposit virtual currency.
        </p>
      </div>

      {/* CORE WALLET BALANCES CARD - GLASS */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />

        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">LEDGER BALANCE</span>
            <span className="text-xl font-extrabold text-white mt-1 font-sans block truncate">
              {currentUser?.pwcBalance.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">PENDING CLEAR</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1 font-sans block truncate">
              {currentUser?.pendingBalance.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">LOCKED SETTLE</span>
            <span className="text-xl font-extrabold text-indigo-400 mt-1 font-sans block truncate">
              {currentUser?.lockedBalance.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/5 text-xs">
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">LIFETIME EARNED</span>
            <span className="text-sm font-semibold text-slate-300 mt-1 block">
              {currentUser?.lifetimeEarned.toLocaleString()} PWC
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">LIFETIME WITHDRAWN</span>
            <span className="text-sm font-semibold text-slate-300 mt-1 block">
              {currentUser?.lifetimeWithdrawn.toLocaleString()} PWC
            </span>
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={() => { clearMessages(); setActiveSubAction(activeSubAction === 'deposit' ? null : 'deposit'); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              activeSubAction === 'deposit'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Deposit
          </button>

          <button
            onClick={() => { clearMessages(); setActiveSubAction(activeSubAction === 'withdraw' ? null : 'withdraw'); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              activeSubAction === 'withdraw'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </button>

          <button
            onClick={() => { clearMessages(); setActiveSubAction(activeSubAction === 'transfer' ? null : 'transfer'); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              activeSubAction === 'transfer'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfer
          </button>
        </div>
      </div>

      {/* SUB-ACTIONS EXPANSION SLIDER */}
      <AnimatePresence mode="wait">
        {activeSubAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-5 overflow-hidden backdrop-blur-md"
          >
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">
                {successMessage}
              </div>
            )}

            {/* DEPOSIT DRAWER */}
            {activeSubAction === 'deposit' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Deposit Virtual Accounts Integration</h4>
                <p className="text-xs text-slate-400">
                  Transfer funds to your personalized deposit virtual account bank. Wire receipts auto-settle PWC into your ledger instantly.
                </p>

                {/* Virtual account detail card */}
                <div className="bg-black/35 border border-white/5 p-4 rounded-2xl space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">BANK PARTNER:</span>
                    <span className="text-white font-bold">Silicon Ledger Bank</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ACCOUNT NUMBER:</span>
                    <span className="text-white font-bold flex items-center gap-2">
                      {currentUser?.virtualAccount?.accountNumber || 'VA-994112450'}
                      <button onClick={handleCopyVA} className="hover:bg-white/5 p-1 rounded">
                        {copiedVA ? 'Copied' : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">HOLDER:</span>
                    <span className="text-white font-bold">{currentUser?.username.toUpperCase()} (PW)</span>
                  </div>
                </div>

                {/* Simulate Deposit Slider */}
                <div className="pt-2 border-t border-white/5 space-y-2.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Simulation Wire Amount (PWC)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl font-mono"
                    />
                    <button
                      onClick={handleSimulateDeposit}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 rounded-xl"
                    >
                      Process Wire
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WITHDRAWAL DRAWER */}
            {activeSubAction === 'withdraw' && (
              <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5">
                <h4 className="text-sm font-semibold text-white">Secure Settlement Wire Out</h4>
                <p className="text-xs text-slate-400">
                  Withdraw PWC to your real bank account. Minimum settlement cashout limit is <strong className="text-white">100 PWC</strong>. Trust Score above 60% required.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Cashout Amount (PWC)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Min 100 PWC"
                    required
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. JPMorgan Chase"
                      required
                      className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="10-12 digits"
                      required
                      className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* Real-time fee breakdowns */}
                {parseFloat(withdrawAmount) > 0 && (
                  <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">SETTLEMENT DATE:</span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">AUDITOR SYSTEM FEE:</span>
                      <span className="text-red-400">-{fee} PWC</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5 font-bold">
                      <span className="text-slate-400">ESTIMATED DISBURSE:</span>
                      <span className="text-emerald-400">{receive} PWC</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawing || (currentUser && currentUser.trustScore < 60)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {withdrawing ? 'Validating Ledger Limits...' : 'Request Wire Settlement'}
                </button>
              </form>
            )}

            {/* P2P TRANSFER DRAWER */}
            {activeSubAction === 'transfer' && (
              <form onSubmit={handleTransferSubmit} className="space-y-3.5">
                <h4 className="text-sm font-semibold text-white">Peer-to-Peer Transfer Pipeline</h4>
                <p className="text-xs text-slate-400">
                  Transmit PWC instantly to another verified PayWorth member ledger. Zero peer fees.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. companion@payworth.com"
                    required
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    PWC Coins Amount
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Specify sum"
                    required
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Optional Reference Note
                  </label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="e.g. Design consulting payout"
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={transferring}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-md"
                >
                  {transferring ? 'Transmitting Coins safely...' : 'Initiate Secure Transfer'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMMUTABLE TRANSACTION HISTORY LEDGER */}
      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" /> Immutable Transaction Ledger
        </h3>

        <div className="space-y-3">
          {historyList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[11px] text-slate-500 font-mono">No transaction logs registered on your ledger yet.</p>
            </div>
          ) : (
            historyList.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  className="bg-white/2 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'completed'
                            ? 'bg-emerald-500'
                            : tx.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-semibold text-white">{tx.description}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">
                      ID: {tx.id} • {new Date(tx.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCredit ? '+' : '-'}{tx.amount} PWC
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      Bal: {tx.balanceAfter} PWC
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
