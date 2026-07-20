import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
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
  ChevronDown
} from 'lucide-react';

export default function TasksView() {
  const { state, currentUser, startTask, submitTaskEvidence, error, clearMessages } = usePayWorth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'reward' | 'trust' | 'slots'>('reward');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveList, setSaveList] = useState<string[]>([]);

  // Toggle saving
  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (saveList.includes(id)) {
      setSaveList(saveList.filter((s) => s !== id));
    } else {
      setSaveList([...saveList, id]);
    }
  };

  const handleReport = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Thank you. A security review has been flagged for task: "${title}".`);
  };

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: `Earn PWC: ${title}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`Earn with PayWorth: ${title} at ${window.location.href}`);
      alert('Task share credentials copied to clipboard!');
    }
  };

  const handleStartTask = (task: Task) => {
    if (currentUser && currentUser.trustScore < task.trustRequirement) {
      alert(`Upgrade Restricted: Your current Trust Rating is ${currentUser.trustScore}%, but this task requires a minimum of ${task.trustRequirement}%. Complete smaller verification tasks first.`);
      return;
    }
    setActiveTask(task);
    setEvidenceText('');
    clearMessages();
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 relative">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="text-emerald-400 w-5.5 h-5.5" /> Legitimacy Tasks Ledger
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform assignments, submit verifiable screenshots, links or proof, and claim instant ledger credits.
        </p>
      </div>

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

      {/* OVERLAY SHEET - TASK WORKSPACE DRAWER */}
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
    </div>
  );
}
