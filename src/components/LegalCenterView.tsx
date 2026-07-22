import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OFFICIAL_LEGAL_DOCUMENTS, LegalDocument, CURRENT_LEGAL_VERSION } from '../data/legalDocuments';
import { usePayWorth } from '../engines/StateContext';
import {
  ShieldCheck,
  Search,
  Bookmark,
  Share2,
  Printer,
  Download,
  Clock,
  FileText,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Copy,
  Info,
  Calendar,
  Layers,
  ArrowLeft,
  X,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface LegalCenterViewProps {
  initialDocId?: string;
  onClose?: () => void;
}

export default function LegalCenterView({ initialDocId, onClose }: LegalCenterViewProps) {
  const { setActiveMenuScreen } = usePayWorth();
  
  // Selected document state
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocId || 'terms'
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('payworth_legal_bookmarks');
      return saved ? JSON.parse(saved) : ['terms', 'privacy'];
    } catch {
      return ['terms', 'privacy'];
    }
  });

  // UI States
  const [copiedLink, setCopiedLink] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Categories list
  const categories = ['All', 'Core Agreements', 'Rewards & Marketplace', 'Security & Compliance', 'Policies & Terms', 'Bookmarks'];

  // Current active document object
  const currentDoc = useMemo(() => {
    return OFFICIAL_LEGAL_DOCUMENTS.find((doc) => doc.id === selectedDocId || doc.slug === selectedDocId) || OFFICIAL_LEGAL_DOCUMENTS[0];
  }, [selectedDocId]);

  // Filtered documents list
  const filteredDocs = useMemo(() => {
    return OFFICIAL_LEGAL_DOCUMENTS.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === 'All') return matchesSearch;
      if (selectedCategory === 'Bookmarks') return matchesSearch && bookmarks.includes(doc.id);
      return matchesSearch && doc.category === selectedCategory;
    });
  }, [searchQuery, selectedCategory, bookmarks]);

  // Handle bookmark toggle
  const toggleBookmark = (docId: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId];
      try {
        localStorage.setItem('payworth_legal_bookmarks', JSON.stringify(next));
      } catch (err) {
        console.error('Saved bookmark error:', err);
      }
      return next;
    });
  };

  // Scroll reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('legal-content-container');
      if (container) {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        if (scrollHeight > 0) {
          setReadingProgress(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)));
        }
      }
    };

    const container = document.getElementById('legal-content-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [selectedDocId]);

  // Handle Share link
  const handleShare = () => {
    const url = `${window.location.origin}/#legal?doc=${currentDoc.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Handle Download File
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([currentDoc.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `PayWorth_${currentDoc.slug}_${currentDoc.version}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Contact Legal Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setShowContactModal(false);
      setContactMessage('');
      setContactSubject('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onClose ? onClose() : setActiveMenuScreen(null))}
            className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                PayWorth Legal Center
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  {CURRENT_LEGAL_VERSION}
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Official Compliance, Terms & Governance Repository
              </p>
            </div>
          </div>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionModal(true)}
            className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/50 text-[11px] font-mono flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Revisions</span>
          </button>
          
          <button
            onClick={() => setShowContactModal(true)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact Legal</span>
          </button>
        </div>
      </header>

      {/* Reading Progress Line */}
      <div className="h-0.5 bg-slate-900 w-full relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto">
        {/* Left Sidebar: Documents Navigator */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col space-y-3 shrink-0 max-h-[40vh] md:max-h-none overflow-y-auto">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legal documents..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories Pill Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat} {cat === 'Bookmarks' && `(${bookmarks.length})`}
              </button>
            ))}
          </div>

          {/* Documents Tree List */}
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No matching legal documents found.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = doc.id === currentDoc.id;
                const isBookmarked = bookmarks.includes(doc.id);

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between group ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <h3 className="text-xs font-bold leading-tight line-clamp-1">{doc.title}</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                        {doc.summary}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 pt-0.5">
                        <span>{doc.readingTimeMinutes} min read</span>
                        <span>•</span>
                        <span>{doc.version}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(doc.id);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        isBookmarked ? 'text-amber-400 hover:text-amber-300' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main Content Viewport */}
        <main
          id="legal-content-container"
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-950"
        >
          {/* Document Header Panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                  {currentDoc.category}
                </span>
                <h1 className="text-xl md:text-2xl font-extrabold text-white mt-2">
                  {currentDoc.title}
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
                  {currentDoc.summary}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleBookmark(currentDoc.id)}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                    bookmarks.includes(currentDoc.id)
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white'
                  }`}
                  title="Bookmark Document"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentDoc.id) ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">Bookmark</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  title="Share Document Link"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  title="Download File"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  title="Print Document"
                >
                  <Printer className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Est. Reading Time: <strong>{currentDoc.readingTimeMinutes} mins</strong></span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Updated: <strong>{currentDoc.lastUpdated}</strong></span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Document Code: <strong>{currentDoc.slug}</strong></span>
              </div>
            </div>
          </div>

          {/* Table of Contents Header Links */}
          {currentDoc.sections && currentDoc.sections.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Document Sections
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentDoc.sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="text-[11px] bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/40 px-2.5 py-1 rounded-lg transition-all"
                  >
                    {sec.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rendered Markdown Body */}
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-emerald-400 prose-hr:border-slate-800 text-sm leading-relaxed space-y-4 font-sans bg-slate-900/20 border border-slate-800/40 p-6 rounded-2xl">
            {currentDoc.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={idx} className="text-2xl font-bold text-white pb-2 border-b border-slate-800">{paragraph.replace('# ', '')}</h1>;
              }
              if (paragraph.startsWith('## ')) {
                const titleText = paragraph.replace('## ', '');
                const secMatch = currentDoc.sections.find((s) => s.title.includes(titleText) || titleText.includes(s.title));
                return (
                  <h2 id={secMatch?.id} key={idx} className="text-lg font-bold text-emerald-400 pt-4 border-t border-slate-800/60 scroll-mt-20">
                    {titleText}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={idx} className="text-sm font-bold text-teal-300 pt-2">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1 text-slate-300">
                    {paragraph.split('\n').map((item, i) => (
                      <li key={i}>{item.replace(/^[*|-]\s*/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx} className="text-slate-300 leading-relaxed">{paragraph}</p>;
            })}
          </div>

          {/* Document Acceptance Stamp Footer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official PayWorth Legal Registry Entry • {currentDoc.version}</span>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              Have a legal query about this document?
            </button>
          </div>
        </main>
      </div>

      {/* CONTACT LEGAL TEAM MODAL */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full relative shadow-2xl space-y-4"
            >
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Contact PayWorth Legal Team</h3>
                  <p className="text-xs text-slate-400 font-mono">Inquiry regarding: {currentDoc.title}</p>
                </div>
              </div>

              {contactSuccess ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Inquiry Transmitted</h4>
                  <p className="text-xs text-slate-300">
                    Your legal query has been submitted directly to the PayWorth Compliance Desk. Ticket ID: <strong>LEG-{Math.floor(Math.random() * 89999 + 10000)}</strong>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Subject / Query Topic</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder={`Question regarding ${currentDoc.title}`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Message Details</label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Specify your inquiry, jurisdiction, or legal clarification required..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500/50 resize-none font-sans"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    Submit Legal Inquiry
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VERSION REVISIONS MODAL */}
      <AnimatePresence>
        {showVersionModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full relative shadow-2xl space-y-4"
            >
              <button
                onClick={() => setShowVersionModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Legal Version Release History</h3>
                  <p className="text-xs text-slate-400 font-mono">Current active build: {CURRENT_LEGAL_VERSION}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-mono font-bold text-emerald-400">
                    <span>{CURRENT_LEGAL_VERSION} (Active)</span>
                    <span>July 21, 2026</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Comprehensive overhaul of all PayWorth legal policies including Reward Pool escrow, PWC parameters, KYC tier limits, and Acceptable Use.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1 opacity-70">
                  <div className="flex justify-between font-mono text-slate-400">
                    <span>v2025.4 (Archived)</span>
                    <span>December 10, 2025</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Initial beta terms for micro-tasks and referral bonuses.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowVersionModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Close Version History
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
