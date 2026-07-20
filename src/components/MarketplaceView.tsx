import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { Campaign, CampaignSubmission } from '../types';
import {
  ShoppingBag,
  Search,
  Filter,
  PlusCircle,
  Megaphone,
  User,
  ShieldCheck,
  Coins,
  ChevronDown,
  Calendar,
  Layers,
  Award,
  AlertTriangle,
  Share2,
  ExternalLink,
  ClipboardList
} from 'lucide-react';

export default function MarketplaceView() {
  const {
    state,
    currentUser,
    createCampaign,
    submitCampaign,
    reviewCampaignSubmission,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'featured' | 'creator'>('all');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'explore' | 'submissions'>('explore');

  // New Campaign Form State
  const [createOpen, setCreateOpen] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campCat, setCampCat] = useState('Advertiser');
  const [campReward, setCampReward] = useState('');
  const [campSlots, setCampSlots] = useState('');
  const [approvalMethod, setApprovalMethod] = useState<'auto' | 'manual'>('manual');
  const [campDeadline, setCampDeadline] = useState('2026-08-30');
  const [publishing, setPublishing] = useState(false);

  // Submit Evidence Form State
  const [activeJoinCampaign, setActiveJoinCampaign] = useState<Campaign | null>(null);
  const [textProof, setTextProof] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  // Escrow live calculations
  const calculateEscrow = () => {
    const reward = parseFloat(campReward) || 0;
    const slots = parseFloat(campSlots) || 0;
    return reward * slots;
  };
  const escrowTotal = calculateEscrow();

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reward = parseFloat(campReward);
    const slots = parseFloat(campSlots);
    if (!campTitle || !campDesc || isNaN(reward) || isNaN(slots) || reward <= 0 || slots <= 0) return;

    setPublishing(true);
    clearMessages();
    const ok = await createCampaign({
      title: campTitle,
      description: campDesc,
      category: campCat,
      reward,
      slots,
      rewardPool: reward * slots,
      approvalMethod,
      deadline: campDeadline,
    });
    setPublishing(false);

    if (ok) {
      setCampTitle('');
      setCampDesc('');
      setCampReward('');
      setCampSlots('');
      setCreateOpen(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJoinCampaign || !textProof.trim()) return;

    setSubmittingProof(true);
    clearMessages();
    const ok = await submitCampaign(activeJoinCampaign.id, textProof, proofUrl || undefined);
    setSubmittingProof(false);

    if (ok) {
      setTextProof('');
      setProofUrl('');
      setActiveJoinCampaign(null);
    }
  };

  const handleCampaignReport = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Thank you. Campaign: "${title}" has been flagged for advertiser compliance audit.`);
  };

  // Filter campaigns
  const filteredCampaigns = state.campaigns.filter((camp) => {
    const matchSearch =
      camp.title.toLowerCase().includes(search.toLowerCase()) ||
      camp.description.toLowerCase().includes(search.toLowerCase());
    
    if (selectedFilter === 'creator') {
      return matchSearch && camp.creatorId === currentUser?.id;
    }
    return matchSearch;
  });

  // Collect submissions for campaigns created by current user so they can review them!
  const myCampaignIds = state.campaigns
    .filter((c) => c.creatorId === currentUser?.id)
    .map((c) => c.id);

  const pendingReviews = state.campaignSubmissions.filter(
    (s) => myCampaignIds.includes(s.campaignId) && s.status === 'pending'
  );

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-emerald-400 w-5.5 h-5.5" /> Advertiser Marketplace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse crowd-sourced advertiser briefs or deposit PWC to lock escrow, launch campaigns, and gather verified reports.
          </p>
        </div>
        <button
          onClick={() => { clearMessages(); setCreateOpen(true); }}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1 text-xs font-bold shrink-0 shadow-md"
        >
          <PlusCircle className="w-4.5 h-4.5" /> Launch Brief
        </button>
      </div>

      {/* Workspace toggle: Explore vs Created Campaign reviews */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl mb-4 text-xs font-semibold text-center border border-white/5">
        <button
          onClick={() => setActiveWorkspaceTab('explore')}
          className={`py-2 rounded-lg transition-all ${
            activeWorkspaceTab === 'explore' ? 'bg-white/5 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Explore Briefs
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('submissions')}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeWorkspaceTab === 'submissions' ? 'bg-white/5 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Review Submissions
          {pendingReviews.length > 0 && (
            <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingReviews.length}
            </span>
          )}
        </button>
      </div>

      {activeWorkspaceTab === 'explore' ? (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search advertiser briefs..."
                className="w-full bg-slate-900 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs pl-10 pr-4 py-3 rounded-xl transition-all"
              />
            </div>

            <div className="flex gap-2 text-[10px] font-semibold text-slate-400">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                    : 'border-white/5 bg-white/2 hover:text-white'
                }`}
              >
                All Campaigns
              </button>
              <button
                onClick={() => setSelectedFilter('creator')}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  selectedFilter === 'creator'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                    : 'border-white/5 bg-white/2 hover:text-white'
                }`}
              >
                My Launches
              </button>
            </div>
          </div>

          {/* Campaigns Lists */}
          <div className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12 bg-white/2 border border-white/5 rounded-2xl p-6">
                <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-white font-medium text-sm">No marketplace briefs live</h4>
                <p className="text-[10px] text-slate-500 mt-1">
                  Be the first advertiser to lock escrow and commission verifiable tasks!
                </p>
              </div>
            ) : (
              filteredCampaigns.map((camp) => {
                const userSubmitted = state.campaignSubmissions.find(
                  (s) => s.campaignId === camp.id && s.userId === currentUser?.id
                );

                return (
                  <div
                    key={camp.id}
                    className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-full font-mono uppercase">
                          {camp.category}
                        </span>
                        <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-emerald-300 transition-all">
                          {camp.title}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-emerald-400 font-mono">
                          +{camp.reward} PWC
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          Per Unit Approved
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {camp.description}
                    </p>

                    {/* Stats bar */}
                    <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-white/5 font-mono text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-500" /> Slots left: {camp.remainingSlots} / {camp.slots}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-slate-500" /> Reward Escrow Pool: {camp.rewardPool} PWC
                      </span>
                      <span className="flex items-center gap-1 col-span-2 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-500" /> Brief Creator: {camp.creatorName} ({camp.trustRating}% Rating)
                      </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleCampaignReport(camp.title, e)}
                          className="p-2 border border-white/5 hover:bg-white/5 rounded-xl text-slate-400 transition-all"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>

                      {camp.creatorId === currentUser?.id ? (
                        <span className="text-xs font-bold text-slate-500 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl font-mono">
                          Owner
                        </span>
                      ) : userSubmitted ? (
                        <span
                          className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 font-mono ${
                            userSubmitted.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : userSubmitted.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {userSubmitted.status === 'approved'
                            ? 'Approved'
                            : userSubmitted.status === 'rejected'
                            ? 'Rejected'
                            : 'Submitted'}
                        </span>
                      ) : (
                        <button
                          onClick={() => { clearMessages(); setActiveJoinCampaign(camp); }}
                          disabled={camp.remainingSlots <= 0 || camp.status !== 'active'}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-40"
                        >
                          {camp.remainingSlots <= 0 ? 'Saturated' : 'Join Campaign'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* CREATOR SUBMISSION REVIEWS INTERFACE */
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Campaign Worker Submissions Queue
          </h3>
          <p className="text-[11px] text-slate-400 leading-normal">
            Below is the work proof pipeline submitted by crowd operatives for your active Escrowed campaigns. Review and authorize coin disbursement. Rejections penalize spam worker trust scores.
          </p>

          <div className="space-y-4">
            {pendingReviews.length === 0 ? (
              <div className="text-center py-10 bg-white/2 border border-white/5 rounded-2xl">
                <p className="text-xs text-slate-500 font-mono">No work proofs currently awaiting review in queue.</p>
              </div>
            ) : (
              pendingReviews.map((sub) => {
                const campaign = state.campaigns.find((c) => c.id === sub.campaignId);
                return (
                  <div
                    key={sub.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block">CAMPAIGN:</span>
                        <span className="font-semibold text-white">{campaign?.title}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono block">SUBMITTED BY:</span>
                        <span className="font-semibold text-slate-300">{sub.userName}</span>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-slate-300">
                      <span className="text-[10px] text-slate-500 font-mono block mb-1">EVIDENCE REPORT TEXT:</span>
                      <p className="font-sans leading-relaxed break-all whitespace-pre-line">{sub.textEvidence}</p>
                      {sub.evidenceUrl && (
                        <a
                          href={sub.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 hover:underline"
                        >
                          Open Evidence URL <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => reviewCampaignSubmission(sub.id, 'approved')}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all active:scale-95"
                      >
                        Approve & Release Funds
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt('Enter audit rejection reason (rejections penalize user trust):');
                          if (note !== null) {
                            reviewCampaignSubmission(sub.id, 'rejected', note || undefined);
                          }
                        }}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs px-4 py-2 rounded-xl transition-all border border-red-500/15"
                      >
                        Reject Spam
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* OVERLAY SHEET - CREATE CAMPAIGN BRIEF FORM */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-slate-900 border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Megaphone className="w-4.5 h-4.5 text-emerald-400" /> Commission Crowd Brief
                  </h3>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Creator ID: {currentUser?.id}</span>
                </div>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="text-xs text-slate-400 hover:text-white bg-white/5 px-2.5 py-1 rounded-lg"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateCampaignSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Campaign Title</label>
                  <input
                    type="text"
                    value={campTitle}
                    onChange={(e) => setCampTitle(e.target.value)}
                    placeholder="e.g. Subscribe to Tech Channel"
                    required
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Detailed Instructions</label>
                  <textarea
                    value={campDesc}
                    onChange={(e) => setCampDesc(e.target.value)}
                    placeholder="Explain the required steps, and state what screenshot or link workers must submit as proof..."
                    required
                    rows={3}
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Category</label>
                    <select
                      value={campCat}
                      onChange={(e) => setCampCat(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl"
                    >
                      <option value="Advertiser">Advertiser</option>
                      <option value="Community">Community</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Deadline</label>
                    <input
                      type="date"
                      value={campDeadline}
                      onChange={(e) => setCampDeadline(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Worker Reward (PWC)</label>
                    <input
                      type="number"
                      value={campReward}
                      onChange={(e) => setCampReward(e.target.value)}
                      placeholder="e.g. 50"
                      required
                      className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Total Slots (Workers)</label>
                    <input
                      type="number"
                      value={campSlots}
                      onChange={(e) => setCampSlots(e.target.value)}
                      placeholder="e.g. 100"
                      required
                      className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* Live Escrow Calculator */}
                {escrowTotal > 0 && (
                  <div className="bg-black/35 border border-white/5 p-3 rounded-xl space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>REQUIRED ESCROW:</span>
                      <span className="text-emerald-400 font-bold">{escrowTotal.toLocaleString()} PWC</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>YOUR LEDGER BALANCE:</span>
                      <span className="text-white font-semibold">{currentUser?.pwcBalance.toLocaleString()} PWC</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={publishing}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md mt-2"
                >
                  {publishing ? 'Locking Escrow coins...' : 'Publish Campaign Brief'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY SHEET - JOIN CAMPAIGN PROOF SUBMISSION FORM */}
      <AnimatePresence>
        {activeJoinCampaign && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-slate-900 border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">UPLOAD CAMPAIGN PROOF</span>
                  <h3 className="text-sm font-bold text-white mt-1">{activeJoinCampaign.title}</h3>
                </div>
                <button
                  onClick={() => setActiveJoinCampaign(null)}
                  className="text-xs text-slate-400 hover:text-white bg-white/5 px-2.5 py-1 rounded-lg"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-xl p-3 mb-4 text-xs text-slate-300 leading-normal">
                {activeJoinCampaign.description}
              </div>

              <form onSubmit={handleSubmitWork} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Proof Text / URL Submission (Mandatory)
                  </label>
                  <textarea
                    value={textProof}
                    onChange={(e) => setTextProof(e.target.value)}
                    placeholder="Provide detailed proof that you completed this Advertiser brief. E.g., Your profile handle, subscription post link, or verification answers..."
                    required
                    rows={4}
                    className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs p-3.5 rounded-xl resize-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Screenshot / Image link (Optional)
                  </label>
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="e.g. https://imgur.com/screenshot.png"
                    className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl font-mono"
                  />
                </div>

                {error && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingProof}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md"
                >
                  {submittingProof ? 'Uploading Proof Hashing...' : 'Submit Proof of Work'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
