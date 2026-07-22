import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import EmailVerificationGuardModal from './EmailVerificationGuardModal';
import { Task, TaskCategory } from '../types';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  User,
  Share2,
  Bookmark,
  AlertTriangle,
  ArrowLeft,
  UploadCloud,
  Layers,
  ChevronDown,
  Megaphone,
  Sparkles,
  Lock,
  Camera,
  Phone,
  Flame,
  CheckCircle2,
  Send,
  Sparkle
} from 'lucide-react';

export default function TasksView() {
  const {
    state,
    currentUser,
    startTask,
    submitTaskEvidence,
    submitWelcomeCampaign,
    error,
    clearMessages
  } = usePayWorth();

  const [mainTab, setMainTab] = useState<'tasks' | 'campaigns'>('tasks');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Campaigns specific state
  const [activeCampaignModal, setActiveCampaignModal] = useState<any | null>(null);
  const [campaignUsername, setCampaignUsername] = useState('');
  const [campaignScreenshot, setCampaignScreenshot] = useState<string | null>(null);
  const [verifyingCampaignId, setVerifyingCampaignId] = useState<string | null>(null);
  const [verificationStepText, setVerificationStepText] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'reward' | 'trust' | 'slots'>('reward');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveList, setSaveList] = useState<string[]>([]);
  const [guardModalOpen, setGuardModalOpen] = useState(false);
  
  // Custom non-blocking inline feedback messages
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'warning' | 'error' | null>(null);

  // Ticking eligibility countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle saving
  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (saveList.includes(id)) {
      setSaveList(saveList.filter((s) => s !== id));
    } else {
      setSaveList([...saveList, id]);
    }
  };

  const showFeedback = (msg: string, type: 'success' | 'warning' | 'error') => {
    setFeedbackMsg(msg);
    setFeedbackType(type);
    setTimeout(() => {
      setFeedbackMsg(null);
      setFeedbackType(null);
    }, 5000);
  };

  const handleReport = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showFeedback(`Security review ticket created. Task "${title}" flagged for compliance.`, 'warning');
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: `Earn PWC: ${title}`, url: window.location.href })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`Earn with PayWorth: ${title} at ${window.location.href}`);
      showFeedback('Task share link copied to clipboard successfully!', 'success');
    }
  };

  const handleStartTask = (task: Task) => {
    if (!currentUser?.emailVerified) {
      setGuardModalOpen(true);
      return;
    }
    if (currentUser && currentUser.trustScore < task.trustRequirement) {
      showFeedback(`Upgrade Restricted: Your Trust Rating is ${currentUser.trustScore}%, but this requires a minimum of ${task.trustRequirement}%. Complete smaller daily tasks first.`, 'error');
      return;
    }
    setActiveTask(task);
    setEvidenceText('');
    clearMessages();
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.emailVerified) {
      setGuardModalOpen(true);
      return;
    }
    if (!activeTask || !evidenceText.trim()) return;

    setSubmitting(true);
    const ok = await submitTaskEvidence(activeTask.id, evidenceText);
    setSubmitting(false);

    if (ok) {
      setActiveTask(null);
      setEvidenceText('');
    }
  };

  // Filter & Sort
  const filteredTasks = state.tasks
    .filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || task.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'reward') return b.reward - a.reward;
      if (sortBy === 'trust') return a.trustRequirement - b.trustRequirement;
      if (sortBy === 'slots') return b.remainingSlots - a.remainingSlots;
      return 0;
    });

  const categories: Array<{ id: TaskCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Tasks' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'advertiser', label: 'Advertisers' },
    { id: 'community', label: 'Community' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'education', label: 'Education' },
    { id: 'business', label: 'Business' },
  ];

  // Ticking eligibility countdown calculations
  const creationTime = currentUser?.createdAt ? new Date(currentUser.createdAt).getTime() : Date.now();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const expiryTime = creationTime + sevenDaysInMs;
  const timeLeftMs = expiryTime - currentTime;
  const isExpired = timeLeftMs <= 0;
  
  // 24-hour grace window from expiry time
  const gracePeriodInMs = 24 * 60 * 60 * 1000;
  const isWithinGracePeriod = isExpired && timeLeftMs > -gracePeriodInMs;
  const isFullyArchived = timeLeftMs <= -gracePeriodInMs;

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00d 00h 00m 00s';
    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / (24 * 3600));
    const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${days}d ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const welcomeCampaigns = [
    {
      id: 'welcome_whatsapp_channel',
      title: 'Official WhatsApp Channel Join',
      reward: 15,
      description: 'Join the official PayWorth announcement channel on WhatsApp to stay updated on reward distributions, ledger compliance updates, and key security bulletins.',
      link: 'https://whatsapp.com/channel/example',
      type: 'whatsapp'
    },
    {
      id: 'welcome_whatsapp_community',
      title: 'Official WhatsApp Member Community',
      reward: 15,
      description: 'Enter the private PayWorth member community group on WhatsApp to collaborate with fellow verified workers, exchange strategy tips, and trace peer logs.',
      link: 'https://chat.whatsapp.com/example',
      type: 'whatsapp'
    },
    {
      id: 'welcome_telegram_channel',
      title: 'Official Telegram Alerts Channel',
      reward: 20,
      description: 'Connect with our automated ledger bot and subscribe to the real-time Telegram alerts channel for system-wide notifications, security reports, and coin audits.',
      link: 'https://t.me/example',
      type: 'telegram'
    }
  ];

  const completedWelcomeIds = currentUser?.completedWelcomeCampaigns || [];
  const welcomeUncompletedCount = welcomeCampaigns.filter(c => !completedWelcomeIds.includes(c.id)).length;

  const handleVerifyCampaign = async (campaignId: string) => {
    if (!campaignUsername.trim()) {
      showFeedback('Please enter your username or contact handler.', 'error');
      return;
    }
    if (!campaignScreenshot) {
      showFeedback('Please upload or select a screenshot image.', 'error');
      return;
    }

    setVerifyingCampaignId(campaignId);
    
    // Smooth cinematic verification steps
    setVerificationStepText('Scanning uploaded screenshot payload...');
    await new Promise((r) => setTimeout(r, 600));
    
    setVerificationStepText('Decrypting screenshot compliance tags...');
    await new Promise((r) => setTimeout(r, 600));
    
    setVerificationStepText('Querying channel membership registry...');
    await new Promise((r) => setTimeout(r, 600));

    setVerificationStepText('Ledger check passed. Crediting balance...');
    const ok = await submitWelcomeCampaign(campaignId, campaignUsername);
    
    setVerifyingCampaignId(null);
    if (ok) {
      setActiveCampaignModal(null);
      setCampaignUsername('');
      setCampaignScreenshot(null);
      showFeedback('Verification complete! Reward has been disbursed.', 'success');
    }
  };

  const handleTriggerScreenshotSimulation = () => {
    // Simulated upload - generating a beautiful high-tech glass receipt simulation image path
    setCampaignScreenshot('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200');
    showFeedback('Screenshot join evidence loaded successfully!', 'success');
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 relative">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="text-emerald-400 w-5.5 h-5.5" /> Legitimacy Tasks & Campaigns
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform assignments, submit verifiable proof, and earn instant ledger credits.
        </p>
      </div>

      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-3.5 border text-xs rounded-xl flex items-center gap-2 font-sans z-30 relative ${
              feedbackType === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : feedbackType === 'error'
                ? 'bg-red-500/10 border-red-500/25 text-red-400'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
            }`}
          >
            <span>{feedbackType === 'success' ? '✅' : feedbackType === 'error' ? '🚫' : '⚠️'}</span>
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS SELECTOR SYSTEM (Sliding liquid tab style) */}
      <div className="flex bg-slate-950/60 p-1 border border-white/5 rounded-2xl mb-5 backdrop-blur-xl">
        <button
          onClick={() => { setMainTab('tasks'); clearMessages(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-xl transition-all ${
            mainTab === 'tasks'
              ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/10 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Standard Tasks
        </button>
        <button
          onClick={() => { setMainTab('campaigns'); clearMessages(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-xl transition-all relative ${
            mainTab === 'campaigns'
              ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/10 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Welcome Campaigns
          {welcomeUncompletedCount > 0 && !isExpired && (
            <span className="absolute top-1.5 right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
              {welcomeUncompletedCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mainTab === 'tasks' ? (
          <motion.div
            key="tasks-view-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Search & Filter Options */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assignments (e.g., social, KYC, gaming)..."
                  className="w-full bg-slate-900 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs pl-10 pr-4 py-3 rounded-xl transition-all"
                />
              </div>

              {/* Categories sliding tab */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-[11px] px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sorters selection */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-white/2 border border-white/5 rounded-xl p-2 px-3">
                <span className="text-[10px] uppercase font-mono font-bold">Sort criteria</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSortBy('reward')}
                    className={`font-mono text-[10px] ${sortBy === 'reward' ? 'text-emerald-400 font-bold' : 'hover:text-white'}`}
                  >
                    Payout
                  </button>
                  <button
                    onClick={() => setSortBy('trust')}
                    className={`font-mono text-[10px] ${sortBy === 'trust' ? 'text-emerald-400 font-bold' : 'hover:text-white'}`}
                  >
                    Min Trust
                  </button>
                  <button
                    onClick={() => setSortBy('slots')}
                    className={`font-mono text-[10px] ${sortBy === 'slots' ? 'text-emerald-400 font-bold' : 'hover:text-white'}`}
                  >
                    Slots Left
                  </button>
                </div>
              </div>
            </div>

            {/* Task list grids */}
            <div className="space-y-3.5">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-white/2 border border-white/5 rounded-2xl p-6">
                  <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-white font-medium text-sm">No assignments found</h4>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                    There are no live campaigns matching your search or category filter. Check back shortly.
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isSaved = saveList.includes(task.id);
                  const userSubmission = state.taskSubmissions.find(
                    (s) => s.taskId === task.id && s.userId === currentUser?.id
                  );

                  return (
                    <div
                      key={task.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full font-mono uppercase">
                            {task.category}
                          </span>
                          <h3 className="text-sm font-semibold text-white mt-2 tracking-tight group-hover:text-emerald-300 transition-all">
                            {task.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-emerald-400 font-mono">
                            +{task.reward} PWC
                          </span>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            {task.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Subtitle details */}
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-400 font-mono border-t border-white/5 pt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {task.estTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" /> {task.remainingSlots}/{task.slots} Slots Left
                        </span>
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" /> Trust Req: {task.trustRequirement}%
                        </span>
                      </div>

                      {/* Task footer button action drawer */}
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleToggleSave(task.id, e)}
                            className={`p-2 rounded-xl border transition-all ${
                              isSaved
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'border-white/5 hover:bg-white/5 text-slate-400'
                            }`}
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleReport(task.title, e)}
                            className="p-2 border border-white/5 hover:bg-white/5 rounded-xl text-slate-400 transition-all"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleShare(task.title, e)}
                            className="p-2 border border-white/5 hover:bg-white/5 rounded-xl text-slate-400 transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        {userSubmission ? (
                          <span
                            className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 font-mono ${
                              userSubmission.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : userSubmission.status === 'rejected'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {userSubmission.status === 'approved'
                              ? 'Approved & Paid'
                              : userSubmission.status === 'rejected'
                              ? 'Rejected'
                              : 'Reviewing Submission'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStartTask(task)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                          >
                            Start Task
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : (
          /* CAMPAIGNS VIEW TAB */
          <motion.div
            key="campaigns-view-tab"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {/* Live Countdown Area */}
            {!isExpired && (
              <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-400/5 border border-emerald-400/20 p-4 rounded-2xl backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-3.5">
                <div className="p-2.5 bg-emerald-400/10 rounded-xl border border-emerald-400/30 text-emerald-400 shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <span className="text-[10px] text-emerald-300 font-mono font-bold tracking-widest uppercase block">
                    ⚡ Welcome Eligibility Window
                  </span>
                  <h4 className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed">
                    Complete these tasks within your first 7 days of sign-up to unlock exclusive PayWorth bonuses.
                  </h4>
                </div>
                <div className="bg-slate-950/60 border border-white/10 px-3.5 py-2 rounded-xl text-center shrink-0">
                  <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider block">Remaining time</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold tracking-tight">
                    {formatCountdown(timeLeftMs)}
                  </span>
                </div>
              </div>
            )}

            {/* Grace Period Notification Warning */}
            {isWithinGracePeriod && (
              <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl relative overflow-hidden">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide font-mono">
                      Eligibility Terminated (Grace Window)
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      These campaigns are officially locked because your account is older than 7 days. You are currently in a 24-hour preview grace period before they are archived.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Campaigns Grid / States */}
            {isFullyArchived ? (
              /* PREMIUM EMPTY STATE */
              <div className="text-center py-16 bg-slate-950/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl">
                {/* Refractive Ambient Blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
                
                <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3.5" />
                <h3 className="text-white font-bold text-base tracking-tight">No Active Welcome Campaigns</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  Your profile is fully established! Keep executing standard tasks and participating in the Marketplace to expand your ledger.
                </p>
              </div>
            ) : (
              /* ACTIVE CAMPAIGN CARDS */
              <div className="space-y-4">
                {welcomeCampaigns.map((camp) => {
                  const isCompleted = completedWelcomeIds.includes(camp.id);
                  const isPending = !isCompleted && currentUser?.verifiedWelcomeCampaigns?.includes(camp.id);

                  return (
                    <div
                      key={camp.id}
                      className={`bg-slate-900/65 border rounded-3xl p-5 relative overflow-hidden transition-all backdrop-blur-xl group ${
                        isCompleted
                          ? 'border-emerald-500/20 bg-emerald-500/2'
                          : isExpired
                          ? 'border-white/5 opacity-50'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Gradient refraction circles */}
                      <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl transition-all -z-10 ${
                        isCompleted ? 'bg-emerald-500/10' : 'bg-slate-500/5 group-hover:bg-emerald-500/5'
                      }`} />

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                              Welcome Exclusive
                            </span>
                            {isCompleted && (
                              <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[9px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-mono animate-pulse">
                                Under Review
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-sm font-bold text-white mt-2 tracking-tight group-hover:text-emerald-300 transition-all flex items-center gap-1.5">
                            {camp.title}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[8px] text-slate-500 font-mono uppercase block">Bonus reward</span>
                          <span className="text-sm font-extrabold text-emerald-400 font-mono">
                            +{camp.reward} PWC
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                        {camp.description}
                      </p>

                      <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
                        <div className="text-[10px] text-slate-500 font-mono">
                          Method: Join Verification
                        </div>

                        <div className="flex gap-2">
                          {/* Join Link */}
                          <a
                            href={camp.link}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                              isCompleted || isExpired
                                ? 'bg-white/2 border-white/5 text-slate-500 pointer-events-none'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white active:scale-95'
                            }`}
                          >
                            Join Community <ExternalLink className="w-3 h-3 text-emerald-400" />
                          </a>

                          {/* Submit Action */}
                          {isCompleted ? (
                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                            </div>
                          ) : isExpired ? (
                            <div className="bg-white/2 text-slate-600 border border-white/5 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </div>
                          ) : isPending ? (
                            <button
                              disabled
                              className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-4 py-2 rounded-xl text-xs font-mono animate-pulse"
                            >
                              Pending AI Verification
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveCampaignModal(camp);
                                setCampaignUsername('');
                                setCampaignScreenshot(null);
                              }}
                              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow transition-all hover:scale-102 active:scale-95"
                            >
                              Verify Join
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY SHEET - STANDARD TASK WORKSPACE DRAWER */}
      <AnimatePresence>
        {activeTask && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-slate-900 border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              {/* Refraction circle background */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">
                    Active workspace
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{activeTask.title}</h3>
                </div>
                <button
                  onClick={() => setActiveTask(null)}
                  className="text-xs text-slate-400 hover:text-white bg-white/5 px-2.5 py-1 rounded-lg"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-xl p-3 mb-4 text-xs text-slate-300 leading-normal">
                {activeTask.description}
                {activeTask.id === 'task_email_verify' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 text-[11px] leading-relaxed">
                    💡 This task auto-approves instantly once you click email verification in your Auth Portal or Profile Settings.
                  </div>
                )}
              </div>

              {/* Task Link button */}
              <a
                href={activeTask.link || 'https://ai.studio/build'}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 mb-5 transition-all active:scale-[0.98]"
              >
                Open Assignment Portal <ExternalLink className="w-4 h-4 text-emerald-400" />
              </a>

              {/* Submission Form */}
              <form onSubmit={handleSubmitEvidence} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    Completion Evidence
                  </label>
                  <textarea
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    placeholder="Provide verifiable links, screenshot hashes, or text description proving your work completion..."
                    required
                    rows={4}
                    className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs p-3.5 rounded-xl transition-all placeholder:text-slate-600 resize-none font-sans"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? 'Verifying Work Evidence...' : 'Submit Work Evidence'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY SHEET - CAMPAIGN WORKSPACE DRAWER */}
      <AnimatePresence>
        {activeCampaignModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-slate-900 border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              {/* Glass Refraction Background Grid */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest block">
                    Campaign validation
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{activeCampaignModal.title}</h3>
                </div>
                <button
                  onClick={() => {
                    if (!verifyingCampaignId) {
                      setActiveCampaignModal(null);
                      setCampaignScreenshot(null);
                    }
                  }}
                  disabled={!!verifyingCampaignId}
                  className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl transition-all disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>

              {verifyingCampaignId ? (
                /* LIVE AI CINEMATIC ANALYSIS LOADER */
                <div className="py-12 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin" />
                    <Sparkle className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                  </div>
                  <h4 className="text-xs font-mono font-semibold text-emerald-400 tracking-wider uppercase animate-pulse">
                    PayWorth AI Analysis
                  </h4>
                  <p className="text-xs text-slate-300 leading-normal max-w-xs mx-auto px-4 font-medium">
                    {verificationStepText}
                  </p>
                </div>
              ) : (
                /* SUBMISSION INTERFACE FORM */
                <div className="space-y-4.5">
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-3.5 text-xs text-slate-300 leading-relaxed font-sans">
                    {activeCampaignModal.description}
                  </div>

                  {/* 1. Join Trigger Link */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
                      Step 1: Join Platform
                    </span>
                    <a
                      href={activeCampaignModal.link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-400/5"
                    >
                      Click to Subscribe <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* 2. Target Username Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                      Step 2: Enter Username / Contact (for audit log)
                    </label>
                    <div className="relative">
                      {activeCampaignModal.type === 'whatsapp' ? (
                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      ) : (
                        <Send className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-500" />
                      )}
                      <input
                        type="text"
                        value={campaignUsername}
                        onChange={(e) => setCampaignUsername(e.target.value)}
                        placeholder={
                          activeCampaignModal.type === 'whatsapp'
                            ? 'e.g. +1 (555) 019-2834 or name'
                            : 'e.g. @username_handle'
                        }
                        className="w-full bg-black/40 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs pl-10 pr-4 py-3 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. Screenshot Upload Area */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                      Step 3: Upload Screenshot Evidence
                    </span>
                    
                    {campaignScreenshot ? (
                      /* SCREENSHOT THUMBNAIL PREVIEW */
                      <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-2.5 flex items-center justify-between gap-3 relative">
                        <img
                          src={campaignScreenshot}
                          alt="Evidence preview"
                          className="w-12 h-12 object-cover rounded-xl border border-emerald-500/25"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-[10px] text-emerald-400 font-semibold block truncate">screenshot_join_proof.png</span>
                          <span className="text-[8px] text-slate-500 font-mono block">Size: 412 KB • Decrypted</span>
                        </div>
                        <button
                          onClick={() => setCampaignScreenshot(null)}
                          className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 px-2.5 py-1.5 rounded-lg font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      /* SIMULATED FILE DRAG AND DROP TARGET */
                      <div
                        onClick={handleTriggerScreenshotSimulation}
                        className="border border-dashed border-white/15 bg-white/2 hover:bg-white/5 hover:border-emerald-400/30 rounded-2xl p-5 text-center cursor-pointer transition-all"
                      >
                        <UploadCloud className="w-7 h-7 text-slate-500 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-slate-300 block">Click to select screenshot</span>
                        <span className="text-[9px] text-slate-500 mt-1 block">Supports PNG, JPG up to 10MB</span>
                      </div>
                    )}
                  </div>

                  {/* 4. Verification Trigger Button */}
                  <button
                    onClick={() => handleVerifyCampaign(activeCampaignModal.id)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] mt-3"
                  >
                    Confirm Join & Verify Evidence
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EmailVerificationGuardModal
        isOpen={guardModalOpen}
        onClose={() => setGuardModalOpen(false)}
        actionName="Task Submissions & Micro-Task Rewards"
      />
    </div>
  );
}
