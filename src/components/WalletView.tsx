import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { LedgerEntry, User } from '../types';
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
  AlertCircle,
  Lock,
  Unlock,
  Settings,
  RefreshCw,
  UserCheck,
  Sparkles,
  Check,
  CreditCard,
  ShoppingBag,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function WalletView() {
  const {
    currentUser,
    state,
    setWalletPin,
    updateWalletLimits,
    updateWalletStatus,
    fundWallet,
    payMerchant,
    sendWalletTransfer,
    reverseTransaction,
    submitKyc,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  // Tab selections
  const [activeSubAction, setActiveSubAction] = useState<'fund' | 'transfer' | 'merchant' | 'settings' | null>(null);
  
  // Security PIN states
  const [pinMode, setPinMode] = useState<'setup' | 'verify' | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Funding simulation states
  const [fundAmount, setFundAmount] = useState('1000');
  const [selectedProvider, setSelectedProvider] = useState<'Moniepoint' | 'Paystack' | 'Flutterwave'>('Moniepoint');
  const [fundingInProgress, setFundingInProgress] = useState(false);

  // P2P transfer states
  const [recipientWallet, setRecipientWallet] = useState('');
  const [resolvedRecipient, setResolvedRecipient] = useState<User | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [authorizedAction, setAuthorizedAction] = useState<(() => Promise<void>) | null>(null);

  // Merchant payment states
  const [selectedMerchant, setSelectedMerchant] = useState<{ id: string; name: string; category: string } | null>(null);
  const [merchantAmount, setMerchantAmount] = useState('250');
  const [merchantDescription, setMerchantDescription] = useState('Core Cloud API Access');
  const [payingMerchant, setPayingMerchant] = useState(false);

  // Custom limits states
  const [customDaily, setCustomDaily] = useState(5000);
  const [customMonthly, setCustomMonthly] = useState(50000);
  const [customSpending, setCustomSpending] = useState(2000);
  const [updatingLimits, setUpdatingLimits] = useState(false);

  // Ledger detail focus modal
  const [focusedTx, setFocusedTx] = useState<LedgerEntry | null>(null);
  const [reversingTxId, setReversingTxId] = useState<string | null>(null);
  
  // Copy indicators
  const [copiedWalletNum, setCopiedWalletNum] = useState(false);

  // Sync state limits when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setCustomDaily(currentUser.dailyLimit);
      setCustomMonthly(currentUser.monthlyLimit);
      setCustomSpending(currentUser.spendingLimit);
    }
  }, [currentUser]);

  // Recipient resolution lookup
  useEffect(() => {
    const cleaned = recipientWallet.trim();
    if (cleaned.length === 10) {
      const recipient = (Object.values(state.users) as User[]).find((u) => u.walletNumber === cleaned);
      if (recipient) {
        setResolvedRecipient(recipient);
      } else {
        setResolvedRecipient(null);
      }
    } else {
      setResolvedRecipient(null);
    }
  }, [recipientWallet, state.users]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/20 rounded-full p-4 mb-4">
          <AlertCircle className="text-red-400 w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-white">Unauthenticated Session</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-xs">
          Please sign in to your PayWorth account to register or access your secure virtual ledger and transaction wallet.
        </p>
      </div>
    );
  }

  const handleCopyWalletNum = () => {
    navigator.clipboard.writeText(currentUser.walletNumber);
    setCopiedWalletNum(true);
    setTimeout(() => setCopiedWalletNum(false), 2000);
  };

  // Setup security transaction PIN
  const handlePinSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4 || isNaN(Number(pinInput))) {
      setPinError('PIN must be exactly 4 numeric digits.');
      return;
    }

    if (!tempPin) {
      // First phase
      setTempPin(pinInput);
      setPinInput('');
      setPinError(null);
    } else {
      // Confirm phase
      if (pinInput !== tempPin) {
        setPinError('PIN mismatch. Please verify matching sequences.');
        setPinInput('');
        return;
      }
      clearMessages();
      const success = await setWalletPin(pinInput);
      if (success) {
        setPinInput('');
        setTempPin('');
        setPinError(null);
        setPinMode(null);
        // If there was an authorized action queued, proceed to verify it
        if (authorizedAction) {
          setPinMode('verify');
        }
      }
    }
  };

  // Verify PIN before acting
  const handlePinVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput !== currentUser.walletPin) {
      setPinError('Incorrect security PIN credentials.');
      setPinInput('');
      return;
    }
    
    setPinError(null);
    setPinMode(null);
    setPinInput('');
    
    if (authorizedAction) {
      await authorizedAction();
      setAuthorizedAction(null);
    }
  };

  const queueWithPin = (action: () => Promise<void>) => {
    clearMessages();
    setAuthorizedAction(() => action);
    if (!currentUser.walletPin) {
      setPinMode('setup');
    } else {
      setPinMode('verify');
    }
  };

  // Fund Wallet PWW Implementation
  const handleFundWalletSubmit = async () => {
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) return;
    setFundingInProgress(true);
    clearMessages();
    const success = await fundWallet(amt, selectedProvider);
    setFundingInProgress(false);
    if (success) {
      setActiveSubAction(null);
    }
  };

  // Send Wallet Transfer PWW Implementation
  const handleTransferSubmit = async () => {
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || recipientWallet.length !== 10) return;
    setTransferring(true);
    clearMessages();
    const success = await sendWalletTransfer(recipientWallet, amt, transferNote || undefined);
    setTransferring(false);
    if (success) {
      setTransferAmount('');
      setRecipientWallet('');
      setTransferNote('');
      setActiveSubAction(null);
    }
  };

  // Merchant Pay Implementation
  const handleMerchantPaySubmit = async () => {
    if (!selectedMerchant) return;
    const amt = parseFloat(merchantAmount);
    if (isNaN(amt) || amt <= 0) return;
    setPayingMerchant(true);
    clearMessages();
    const success = await payMerchant(selectedMerchant.name, amt, merchantDescription);
    setPayingMerchant(false);
    if (success) {
      setSelectedMerchant(null);
      setActiveSubAction(null);
    }
  };

  // Lock status modifier
  const toggleWalletStatus = async () => {
    const nextStatus = currentUser.walletStatus === 'active' ? 'locked' : 'active';
    queueWithPin(async () => {
      await updateWalletStatus(nextStatus);
    });
  };

  // Custom limits updater
  const handleUpdateLimitsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingLimits(true);
    clearMessages();
    const success = await updateWalletLimits(customDaily, customMonthly, customSpending);
    setUpdatingLimits(false);
    if (success) {
      setActiveSubAction(null);
    }
  };

  // Transaction Dispute Reversal Implementation
  const handleRequestReversal = async (txId: string) => {
    setReversingTxId(txId);
    clearMessages();
    const success = await reverseTransaction(txId);
    setReversingTxId(null);
    if (success) {
      setFocusedTx(null);
    }
  };

  // Mock verified merchants available for interactive simulations
  const VERIFIED_MERCHANTS = [
    { id: 'm_refraction', name: 'Liquid Refractions Ltd', category: 'Creative & Design' },
    { id: 'm_silicon', name: 'Silicon Core API Gateway', category: 'Infrastructure' },
    { id: 'm_apple', name: 'Apple Cinematic Subscriptions', category: 'Entertainment' },
    { id: 'm_worth', name: 'Worth Logistics', category: 'E-commerce' }
  ];

  // User transaction history ledger from State
  const historyList = state.ledger[currentUser.id] || [];

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 space-y-5">
      
      {/* HEADER SECTION */}
      <div className="mb-2 flex justify-between items-start">
        <div>
          <h2 id="pww-title" className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Wallet className="text-emerald-400 w-5 h-5" />
            </span>
            PayWorth Wallet (PWW)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise-grade virtual bank account built with dual-ledger audit logs & 2FA security.
          </p>
        </div>
        
        {/* WALLET STATUS BADGE */}
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full font-mono uppercase tracking-wider border ${
          currentUser.walletStatus === 'active'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {currentUser.walletStatus}
        </span>
      </div>

      {/* SYSTEM MESSAGES IN LIQUID GLASS */}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-2xl flex items-start gap-2 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-2xl flex items-start gap-2 backdrop-blur-md">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* LIQUID GLASS BANK ACCOUNT CARD */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* BANK TOP BRANDING */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5">
            <Coins className="text-emerald-400 w-4 h-4" />
            <span className="text-[10px] font-extrabold text-white tracking-widest font-mono">PAYWORTH CORE</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">LEVEL {currentUser.walletLevel} • {currentUser.membershipTier.toUpperCase()}</span>
        </div>

        {/* 10-DIGIT ACCOUNT NUMBER BLOCK */}
        <div className="mb-6">
          <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block">PAYWORTH WALLET ID</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-slate-200 font-mono tracking-wider">
              {currentUser.walletNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
            </span>
            <button
              onClick={handleCopyWalletNum}
              className="p-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 transition-colors"
              title="Copy account number"
            >
              {copiedWalletNum ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ACCOUNT BALANCES GAUGE */}
        <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">LEDGER BALANCE</span>
            <span className="text-xl font-black text-white mt-1 font-mono block truncate">
              {currentUser.pwcBalance.toLocaleString()}
            </span>
            <span className="text-[8px] text-slate-400 font-mono block">PWC</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">PENDING CLEAR</span>
            <span className="text-xl font-black text-amber-400 mt-1 font-mono block truncate">
              {currentUser.pendingBalance.toLocaleString()}
            </span>
            <span className="text-[8px] text-slate-400 font-mono block">PWC</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">ESCROWED LOCKS</span>
            <span className="text-xl font-black text-blue-400 mt-1 font-mono block truncate">
              {currentUser.lockedBalance.toLocaleString()}
            </span>
            <span className="text-[8px] text-slate-400 font-mono block">PWC</span>
          </div>
        </div>

        {/* LIMITS AND STATS INDICATORS */}
        <div className="mt-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400/80" />
            <span>Daily Spend: {currentUser.dailyLimit.toLocaleString()} Max</span>
          </div>
          <div>
            <span>Verified: {currentUser.kycStatus.toUpperCase()}</span>
          </div>
        </div>

        {/* MAIN QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-3">
          <button
            onClick={() => { clearMessages(); setActiveSubAction(activeSubAction === 'fund' ? null : 'fund'); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
              activeSubAction === 'fund'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg'
                : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Fund</span>
          </button>

          <button
            onClick={() => { clearMessages(); setActiveSubAction(activeSubAction === 'transfer' ? null : 'transfer'); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
              activeSubAction === 'transfer'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg'
                : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>P2P Pay</span>
          </button>

          <button
            onClick={() => { clearMessages(); setActiveSubAction(activeSubAction === 'merchant' ? null : 'merchant'); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
              activeSubAction === 'merchant'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg'
                : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Merchant</span>
          </button>

          <button
            onClick={() => { clearMessages(); setActiveSubAction(activeSubAction === 'settings' ? null : 'settings'); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
              activeSubAction === 'settings'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg'
                : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Manage</span>
          </button>
        </div>
      </div>

      {/* PIN SECURITY AUTHORIZATION OVERLAYS */}
      <AnimatePresence>
        {pinMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-3xl w-full max-w-xs space-y-4 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2">
                  <Lock className="text-emerald-400 w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {pinMode === 'setup'
                    ? tempPin
                      ? 'Confirm Transaction PIN'
                      : 'Set 4-Digit Security PIN'
                    : 'Authorize Transaction'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {pinMode === 'setup'
                    ? tempPin
                      ? 'Re-type the 4-digit security code to confirm registration.'
                      : 'Create a permanent PIN to authorize transfers and merchant settlements.'
                    : 'Enter your 4-digit wallet security PIN to complete action.'}
                </p>
              </div>

              {pinError && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono rounded-xl text-center">
                  {pinError}
                </div>
              )}

              <form
                onSubmit={pinMode === 'setup' ? handlePinSetupSubmit : handlePinVerifySubmit}
                className="space-y-3"
              >
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d{4}"
                  inputMode="numeric"
                  placeholder="• • • •"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black/40 border border-white/5 outline-none text-white text-lg tracking-widest text-center p-3 rounded-xl font-mono"
                  autoFocus
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setPinMode(null); setPinInput(''); setTempPin(''); setPinError(null); setAuthorizedAction(null); }}
                    className="flex-1 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl"
                  >
                    {pinMode === 'setup' ? (tempPin ? 'Confirm' : 'Continue') : 'Verify'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC ACTION WORKSPACES */}
      <AnimatePresence mode="wait">
        {activeSubAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-5 overflow-hidden backdrop-blur-md space-y-4"
          >
            
            {/* 1. FUND WALLET WORKSPACE */}
            {activeSubAction === 'fund' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Dynamic Funding Portal</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Fund your virtual bank account through simulated processing channels.
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold text-emerald-400 font-mono">+1% CASHBACK</span>
                </div>

                {/* Gateway selection */}
                <div className="grid grid-cols-3 gap-2">
                  {(['Moniepoint', 'Paystack', 'Flutterwave'] as const).map((prov) => (
                    <button
                      key={prov}
                      onClick={() => setSelectedProvider(prov)}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                        selectedProvider === prov
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md'
                          : 'bg-black/20 border-white/5 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{prov}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">FUNDING AMOUNT (PWC)</label>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl font-mono"
                    placeholder="Enter sum"
                  />
                  {parseFloat(fundAmount) > 0 && (
                    <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Promotion Active: Receives +{Math.round(parseFloat(fundAmount) * 0.01)} PWC cashback!</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleFundWalletSubmit}
                  disabled={fundingInProgress}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {fundingInProgress ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Connecting Payment Gateway...
                    </>
                  ) : (
                    `Simulate Gateway Deposit`
                  )}
                </button>
              </div>
            )}

            {/* 2. P2P TRANSFERS WORKSPACE */}
            {activeSubAction === 'transfer' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Secure Instant P2P Transfer Pipeline</h4>
                <p className="text-[11px] text-slate-400">
                  Transmit coins directly to any member’s 10-digit virtual bank number with zero fees.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">RECIPIENT WALLET NUMBER (10 DIGITS)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={recipientWallet}
                    onChange={(e) => setRecipientWallet(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 4125839471"
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl font-mono"
                  />

                  {/* Dynamic user lookup card */}
                  <AnimatePresence>
                    {recipientWallet.length === 10 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {resolvedRecipient ? (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2">
                            <UserCheck className="text-emerald-400 w-4 h-4 shrink-0" />
                            <div>
                              <span className="font-bold text-white block">Recipient Verified</span>
                              <span className="text-[10px] text-slate-400 block">{resolvedRecipient.username} ({resolvedRecipient.email})</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Destination record not found in PayWorth directories.</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">AMOUNT (PWC)</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">REFERENCE NOTE</label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="Description / Reason"
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl"
                  />
                </div>

                <button
                  onClick={() => queueWithPin(handleTransferSubmit)}
                  disabled={transferring || resolvedRecipient === null || !transferAmount || parseFloat(transferAmount) <= 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {transferring ? 'Transmitting Assets...' : 'Authorize Secure Transfer'}
                </button>
              </div>
            )}

            {/* 3. MERCHANT PAYMENTS WORKSPACE */}
            {activeSubAction === 'merchant' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Verified Merchant Purchases</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pay partners immediately. Purchases receive **2% cashback rewards** credited to your ledger.
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold text-emerald-400 font-mono">+2% CASHBACK</span>
                </div>

                {/* Merchant Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {VERIFIED_MERCHANTS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMerchant(m);
                        if (m.id === 'm_refraction') { setMerchantAmount('250'); setMerchantDescription('Liquid visual assets'); }
                        else if (m.id === 'm_silicon') { setMerchantAmount('500'); setMerchantDescription('API queries bundle'); }
                        else if (m.id === 'm_apple') { setMerchantAmount('120'); setMerchantDescription('Premium monthly billing'); }
                        else { setMerchantAmount('300'); setMerchantDescription('Product distribution logistics'); }
                      }}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        selectedMerchant?.id === m.id
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : 'bg-black/20 border-white/5 text-slate-400 hover:bg-black/30'
                      }`}
                    >
                      <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider block">{m.category}</span>
                      <span className="text-xs font-bold block mt-1 truncate">{m.name}</span>
                    </button>
                  ))}
                </div>

                {selectedMerchant && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-3 border-t border-white/5"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">PAYMENT COST (PWC)</label>
                      <input
                        type="number"
                        value={merchantAmount}
                        onChange={(e) => setMerchantAmount(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">PURCHASE DESCRIPTION</label>
                      <input
                        type="text"
                        value={merchantDescription}
                        onChange={(e) => setMerchantDescription(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-3 rounded-xl"
                      />
                    </div>

                    <button
                      onClick={() => queueWithPin(handleMerchantPaySubmit)}
                      disabled={payingMerchant || !merchantAmount || parseFloat(merchantAmount) <= 0}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md disabled:opacity-40"
                    >
                      {payingMerchant ? 'Settling Payment...' : `Complete Merchant Payment (-${merchantAmount} PWC)`}
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* 4. SETTINGS & LIMITS WORKSPACE */}
            {activeSubAction === 'settings' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Wallet Security & Transaction Rules</h4>
                <p className="text-[11px] text-slate-400">
                  Manage lock toggles, custom limits thresholds, and registration of security authentication codes.
                </p>

                {/* Secure Pin Register indicator */}
                <div className="bg-black/30 border border-white/5 p-3.5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Security PIN Code</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {currentUser.walletPin ? 'Securely configured (2FA active)' : 'Not configured (Highly vulnerable!)'}
                    </span>
                  </div>
                  <button
                    onClick={() => { clearMessages(); setPinMode('setup'); }}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5 text-slate-200 transition-colors"
                  >
                    {currentUser.walletPin ? 'Reset PIN' : 'Register PIN'}
                  </button>
                </div>

                {/* Wallet lock state switch */}
                <div className="bg-black/30 border border-white/5 p-3.5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Virtual Lock State</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {currentUser.walletStatus === 'locked' ? 'All outgoing pipeline transmissions blocked' : 'Wallet active and operational'}
                    </span>
                  </div>
                  <button
                    onClick={toggleWalletStatus}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                      currentUser.walletStatus === 'locked'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {currentUser.walletStatus === 'locked' ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Unlock
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Lock Wallet
                      </>
                    )}
                  </button>
                </div>

                {/* Dynamic Verify level indicators */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-0.5">
                    <UserCheck className="text-emerald-400 w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Verification Level: Level {currentUser.walletLevel}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {currentUser.walletLevel === 1 ? (
                        <>
                          You are currently on Level 1 (Unverified). Complete KYC legal credentials submission to elevate to Level 2 (25k PWC limit limit).
                        </>
                      ) : (
                        <>
                          You are currently on Level 2 (KYC Verified). High-limit tier active and fully authorized for withdrawal wiring!
                        </>
                      )}
                    </span>
                    {currentUser.walletLevel === 1 && (
                      <button
                        onClick={async () => {
                          clearMessages();
                          await submitKyc('VIB-PW-LICENSE-CLEAR');
                        }}
                        className="mt-3 text-xs font-bold text-emerald-400 flex items-center gap-1 hover:underline"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Auto-Verify KYC Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Limits sliders */}
                <form onSubmit={handleUpdateLimitsSubmit} className="space-y-4 pt-3 border-t border-white/5">
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">Customize Active Limits</span>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">DAILY SPEND LIMIT:</span>
                      <span className="text-white font-bold">{customDaily.toLocaleString()} PWC</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={currentUser.walletLevel === 1 ? 5000 : 25000}
                      step={100}
                      value={customDaily}
                      onChange={(e) => setCustomDaily(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">SINGLE TX LIMIT:</span>
                      <span className="text-white font-bold">{customSpending.toLocaleString()} PWC</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={currentUser.walletLevel === 1 ? 2000 : 15000}
                      step={50}
                      value={customSpending}
                      onChange={(e) => setCustomSpending(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingLimits}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md"
                  >
                    Save Customized Limit Rules
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DOUBLE-ENTRY TRANSACTION LEDGER WITH REVERSALS AUDITING */}
      <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-4 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" /> Audited Transaction Ledger
        </h3>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {historyList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[11px] text-slate-500 font-mono">No transaction records written to the ledger yet.</p>
            </div>
          ) : (
            historyList.map((tx) => {
              const isCredit = tx.type === 'credit';
              const isReversible = tx.status === 'completed' && (tx.category === 'transfer_sent' || tx.category === 'transfer_received' || tx.category === 'merchant_payment');
              return (
                <div
                  key={tx.id}
                  onClick={() => setFocusedTx(focusedTx?.id === tx.id ? null : tx)}
                  className={`border rounded-2xl p-3 flex flex-col transition-all cursor-pointer ${
                    tx.status === 'reversed'
                      ? 'bg-slate-500/5 border-slate-500/10 opacity-65'
                      : 'bg-white/2 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === 'completed'
                              ? 'bg-emerald-500'
                              : tx.status === 'reversed'
                              ? 'bg-amber-400'
                              : 'bg-red-500'
                          }`}
                        />
                        <span className="font-semibold text-white">{tx.description}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">
                        {tx.category.toUpperCase().replace('_', ' ')} • {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isCredit ? '+' : '-'}{tx.amount} PWC
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        Bal: {tx.balanceAfter}
                      </span>
                    </div>
                  </div>

                  {/* Expanded detail box */}
                  <AnimatePresence>
                    {focusedTx?.id === tx.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/5 space-y-2.5 text-[10px] font-mono text-slate-400"
                      >
                        <div className="flex justify-between">
                          <span>TRANSACTION ID:</span>
                          <span className="text-slate-300">{tx.id}</span>
                        </div>
                        {tx.referenceId && (
                          <div className="flex justify-between">
                            <span>REFERENCE ID:</span>
                            <span className="text-slate-300">{tx.referenceId}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>LEDGER TIMELINE STATUS:</span>
                          <span className={`font-bold ${tx.status === 'completed' ? 'text-emerald-400' : tx.status === 'reversed' ? 'text-amber-400' : 'text-red-400'}`}>
                            {tx.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Reversal trigger */}
                        {isReversible && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestReversal(tx.id);
                            }}
                            disabled={reversingTxId === tx.id}
                            className="w-full mt-1.5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            {reversingTxId === tx.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Reversing Ledger entries...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3" />
                                Dispute & Trigger Instant Reversal
                              </>
                            )}
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
