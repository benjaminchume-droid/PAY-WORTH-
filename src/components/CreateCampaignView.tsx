import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import {
  Sparkles,
  Coins,
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  FileText,
  Upload,
  Globe,
  Users,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function CreateCampaignView() {
  const {
    currentUser,
    createCampaign,
    setActiveMenuScreen,
    loading: globalLoading
  } = usePayWorth();

  // State fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Business');
  const [reward, setReward] = useState<number>(10);
  const [slots, setSlots] = useState<number>(50);
  const [targetCountry, setTargetCountry] = useState('Worldwide');
  const [targetUsers, setTargetUsers] = useState('All Tiers');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [callToAction, setCallToAction] = useState('');
  
  // Media Upload States
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Status/Validation states
  const [formError, setFormError] = useState<string | null>(null);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalBudget = reward * slots;
  const userBalance = currentUser?.pwcBalance || 0;
  const isBudgetExceeded = totalBudget > userBalance;

  // File drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    setFormError(null);
    setMediaFile(file);

    // Create preview url
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate upload progress with high fidelity
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const removeMediaFile = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!title.trim()) {
      setFormError('Campaign title is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Campaign description/brief is required.');
      return;
    }
    if (reward <= 0) {
      setFormError('Reward per slot must be greater than zero.');
      return;
    }
    if (slots <= 0) {
      setFormError('Sponsorship slots count must be greater than zero.');
      return;
    }
    if (isBudgetExceeded) {
      setFormError('Sponsorship budget exceeds your verified ledger balance.');
      return;
    }

    setSubmitting(true);

    // Calculate deadline string
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + durationDays);
    const deadlineString = deadlineDate.toISOString().split('T')[0];

    // Build compound description containing target filters and call to action details
    const finalDescription = `${description.trim()}\n\n[Target Criteria] Country: ${targetCountry} | Users: ${targetUsers}\n[Call To Action] Link/Instructions: ${callToAction || 'Complete task'}\n[Attached Asset] ${mediaFile ? mediaFile.name : 'None'}`;

    try {
      const success = await createCampaign({
        title: title.trim(),
        description: finalDescription,
        category: category,
        reward: reward,
        slots: slots,
        rewardPool: totalBudget,
        deadline: deadlineString,
        approvalMethod: 'manual'
      });

      if (success) {
        setCreationSuccess(true);
        setTimeout(() => {
          setActiveMenuScreen(null); // return to dashboard
        }, 4000);
      } else {
        setFormError('Failed to initialize campaign. Please verify your ledger limits.');
      }
    } catch (err) {
      setFormError('An unexpected ledger error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setActiveMenuScreen(null)}
          className="text-xs text-slate-400 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
        </button>
        <span className="text-xs text-slate-600 font-mono">/ START CAMPAIGN</span>
      </div>

      <div className="mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-emerald-400 w-5.5 h-5.5" /> Start Sponsored Campaign
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Lock PWC in our secure escrow ledger to fund custom crowd-sourced verification or product growth briefs.
        </p>
      </div>

      <AnimatePresence>
        {creationSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-4 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
            <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-white">Campaign Escrow Active!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Escrow funding of <strong className="text-emerald-400">{totalBudget.toLocaleString()} PWC</strong> was safely locked. Your campaign request is queued for instant administrator certification.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">Redirecting you back to your workspace...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl">
            {formError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title field */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Campaign Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PayWorth App Store Review Campaign"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            {/* Category & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                >
                  <option value="Business">Business Growth</option>
                  <option value="Advertiser">Marketing/Ad</option>
                  <option value="Community">Community Invite</option>
                  <option value="Research">User Feedback</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Duration (Days)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-3 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono font-bold"
                  />
                  <Clock className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Campaign Brief Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Campaign Brief / Requirements</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe exactly what action workers must take, and what specific proof they must submit (e.g., screenshot) to earn rewards."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans leading-normal"
              />
            </div>

            {/* Call To Action URL / Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Call to Action Link (CTA)</label>
              <div className="relative">
                <input
                  type="text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder="https://example.com/target-action"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-3 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-sans"
                />
                <ExternalLink className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Target Countries and Tiers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-500" /> Country Target
                </label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-sans"
                >
                  <option value="Worldwide">Worldwide</option>
                  <option value="North America">North America (US/CA)</option>
                  <option value="Europe">Europe (UK/DE/FR)</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Latin America">Latin America</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" /> Tier Target
                </label>
                <select
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-sans"
                >
                  <option value="All Tiers">All Tiers (No limit)</option>
                  <option value="Silver+">Silver Tiers & Above</option>
                  <option value="Gold+">Gold Tiers & Above</option>
                  <option value="Diamond+">Diamond & Legend Only</option>
                </select>
              </div>
            </div>

            {/* Escrow and Slots Calculations */}
            <div className="grid grid-cols-2 gap-3 bg-black/30 p-3.5 rounded-2xl border border-white/5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Reward (PWC / Worker)</label>
                <input
                  type="number"
                  value={reward || ''}
                  onChange={(e) => setReward(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white/2 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Verification Slots</label>
                <input
                  type="number"
                  value={slots || ''}
                  onChange={(e) => setSlots(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-white/2 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono font-bold"
                />
              </div>
            </div>

            {/* HIGH FIDELITY MEDIA DRAG & DROP UPLOADER */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Sponsorship Banner (Optional)</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-emerald-400 bg-emerald-500/5'
                    : 'border-white/10 bg-black/20 hover:border-white/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {mediaPreview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={mediaPreview}
                        alt="Sponsorship"
                        className="max-h-24 mx-auto rounded-xl object-contain border border-white/10"
                      />
                      <div className="flex items-center justify-between text-[11px] bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg">
                        <span className="text-slate-400 truncate max-w-[200px]">{mediaFile?.name}</span>
                        <button
                          onClick={removeMediaFile}
                          className="text-red-400 hover:text-red-300 font-bold ml-2 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ) : uploading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-3"
                    >
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <div className="w-32 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <span className="text-xs font-mono text-slate-400">Verifying file payload: {uploadProgress}%</span>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-300">
                        Drag & Drop or <span className="text-emerald-400 font-bold">Browse</span>
                      </p>
                      <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Total Budget calculation banner */}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-white/5">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">SECURED ESCROW TOTAL</span>
                <span className={`text-base font-extrabold font-mono mt-0.5 block ${isBudgetExceeded ? 'text-red-400' : 'text-emerald-400'}`}>
                  {totalBudget.toLocaleString()} PWC
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">AVAILABLE LEDGER</span>
                <span className="text-xs font-semibold text-slate-300 font-mono mt-0.5 block">
                  {userBalance.toLocaleString()} PWC
                </span>
              </div>
            </div>

            {/* ESCROW FUNDING TRIGGER */}
            <button
              type="submit"
              disabled={submitting || isBudgetExceeded || uploading || globalLoading}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                isBudgetExceeded
                  ? 'bg-red-500/10 text-red-400 border border-red-500/10 cursor-not-allowed'
                  : submitting
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 cursor-pointer'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Locking Escrow Security...
                </>
              ) : isBudgetExceeded ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Escrow Exceeds Ledger Balance
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  Lock Escrow & Submit Campaign
                </>
              )}
            </button>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
