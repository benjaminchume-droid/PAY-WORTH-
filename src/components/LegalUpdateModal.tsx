import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CURRENT_LEGAL_VERSION } from '../data/legalDocuments';
import { usePayWorth } from '../engines/StateContext';
import { ShieldAlert, CheckCircle2, ExternalLink, FileText, Lock } from 'lucide-react';

interface LegalUpdateModalProps {
  isOpen?: boolean;
  userCurrentAcceptedVersion?: string;
  onAccept?: (version: string) => void;
  onDecline?: () => void;
  onViewDoc?: (docId: string) => void;
}

export default function LegalUpdateModal({
  isOpen,
  userCurrentAcceptedVersion,
  onAccept,
  onDecline,
  onViewDoc
}: LegalUpdateModalProps) {
  const { currentUser, logout, setActiveMenuScreen } = usePayWorth();
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedRewards, setAgreedRewards] = useState(false);
  const [acceptedSelf, setAcceptedSelf] = useState(false);

  // Check if modal should display
  const userVersion = userCurrentAcceptedVersion || (currentUser as any)?.legalAcceptedVersion;
  const showModal = (isOpen !== undefined ? isOpen : (currentUser && userVersion !== CURRENT_LEGAL_VERSION)) && !acceptedSelf;

  if (!showModal) return null;

  const handleAccept = (v: string) => {
    if (onAccept) {
      onAccept(v);
    } else {
      setAcceptedSelf(true);
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline();
    } else {
      logout();
    }
  };

  const handleViewDoc = (docId: string) => {
    if (onViewDoc) {
      onViewDoc(docId);
    } else {
      setActiveMenuScreen('legal_center');
    }
  };

  const canProceed = agreedTerms && agreedPrivacy && agreedRewards;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Action Required
            </span>
            <h2 className="text-base font-bold text-white mt-1">
              Updated Legal Agreements
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Version upgrade to {CURRENT_LEGAL_VERSION}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          PayWorth has updated its core legal terms, privacy practices, and reward pool parameters to comply with current digital financial standards. Please review and accept the updated agreements to continue accessing your wallet, tasks, and account.
        </p>

        {/* Checkbox List */}
        <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <div className="text-xs space-y-0.5">
              <span className="text-white font-semibold flex items-center gap-1.5">
                I accept the updated Terms of Service ({CURRENT_LEGAL_VERSION})
                <button
                  type="button"
                  onClick={() => handleViewDoc('terms')}
                  className="text-emerald-400 hover:underline text-[11px] font-mono inline-flex items-center gap-0.5"
                >
                  [Read] <ExternalLink className="w-3 h-3" />
                </button>
              </span>
              <p className="text-slate-400 text-[11px] font-sans">
                Governs account usage, PWC rules, membership tiers, and marketplace conduct.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group pt-2 border-t border-slate-900">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => setAgreedPrivacy(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <div className="text-xs space-y-0.5">
              <span className="text-white font-semibold flex items-center gap-1.5">
                I accept the updated Privacy Policy ({CURRENT_LEGAL_VERSION})
                <button
                  type="button"
                  onClick={() => handleViewDoc('privacy')}
                  className="text-emerald-400 hover:underline text-[11px] font-mono inline-flex items-center gap-0.5"
                >
                  [Read] <ExternalLink className="w-3 h-3" />
                </button>
              </span>
              <p className="text-slate-400 text-[11px] font-sans">
                Explains data collection, identity verification (KYC), and encryption parameters.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group pt-2 border-t border-slate-900">
            <input
              type="checkbox"
              checked={agreedRewards}
              onChange={(e) => setAgreedRewards(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
            <div className="text-xs space-y-0.5">
              <span className="text-white font-semibold flex items-center gap-1.5">
                I acknowledge the Reward & Campaign Policy ({CURRENT_LEGAL_VERSION})
                <button
                  type="button"
                  onClick={() => handleViewDoc('rewards')}
                  className="text-emerald-400 hover:underline text-[11px] font-mono inline-flex items-center gap-0.5"
                >
                  [Read] <ExternalLink className="w-3 h-3" />
                </button>
              </span>
              <p className="text-slate-400 text-[11px] font-sans">
                Covers PWC earning verification, escrow pools, pending review times, and withdrawal settlement.
              </p>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-all"
          >
            Decline & Sign Out
          </button>
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => handleAccept(CURRENT_LEGAL_VERSION)}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept & Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}
