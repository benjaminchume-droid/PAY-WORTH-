import React, { useState } from 'react';
import { motion } from 'motion/react';
import { OFFICIAL_LEGAL_DOCUMENTS, LegalDocument, CURRENT_LEGAL_VERSION } from '../data/legalDocuments';
import {
  ShieldCheck,
  FileText,
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Layers,
  BarChart2,
  Lock,
  X
} from 'lucide-react';

export default function AdminLegalDashboard() {
  const [activeTab, setActiveTab] = useState<'documents' | 'audit_logs' | 'analytics'>('documents');
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVersion, setEditVersion] = useState(CURRENT_LEGAL_VERSION);
  const [searchAudit, setSearchAudit] = useState('');

  // Sample Audit Logs Data for Admin Tracking
  const [auditLogs] = useState([
    {
      id: 'log-101',
      userId: 'usr_882910',
      userEmail: 'alex.dev@gmail.com',
      ip: '102.89.23.14',
      country: 'NG',
      acceptedVersion: CURRENT_LEGAL_VERSION,
      acceptedAt: '2026-07-22 01:14:20',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    {
      id: 'log-102',
      userId: 'usr_771029',
      userEmail: 'sampaul@yahoo.com',
      ip: '197.210.45.12',
      country: 'NG',
      acceptedVersion: CURRENT_LEGAL_VERSION,
      acceptedAt: '2026-07-22 00:52:10',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X)'
    },
    {
      id: 'log-103',
      userId: 'usr_991204',
      userEmail: 'chioma.k@outlook.com',
      ip: '105.112.89.30',
      country: 'NG',
      acceptedVersion: CURRENT_LEGAL_VERSION,
      acceptedAt: '2026-07-21 23:40:02',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  ]);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.userId.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.ip.includes(searchAudit)
  );

  const handleEditClick = (doc: LegalDocument) => {
    setSelectedDoc(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content);
    setEditVersion(doc.version);
    setIsEditing(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoc) {
      selectedDoc.title = editTitle;
      selectedDoc.content = editContent;
      selectedDoc.version = editVersion;
      selectedDoc.lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Admin Title Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Admin Legal & Compliance Operations</h2>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Manage documents, scheduled updates, and user legal acceptance logs
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents ({OFFICIAL_LEGAL_DOCUMENTS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit_logs'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Compliance Stats</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DOCUMENTS MANAGEMENT */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OFFICIAL_LEGAL_DOCUMENTS.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase bg-slate-800 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded-md">
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {doc.version}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{doc.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 font-sans">{doc.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Updated: {doc.lastUpdated}</span>
                  <button
                    onClick={() => handleEditClick(doc)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Legal Consent Audit Trail</h3>
              <p className="text-xs text-slate-400 font-mono">Immutable user acceptance records</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                placeholder="Search user ID, email, IP..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="p-3">User ID & Email</th>
                  <th className="p-3">Accepted Version</th>
                  <th className="p-3">IP & Country</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="p-3">
                      <div className="font-bold text-white">{log.userId}</div>
                      <div className="text-[10px] text-slate-400">{log.userEmail}</div>
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">{log.acceptedVersion}</td>
                    <td className="p-3">
                      {log.ip} ({log.country})
                    </td>
                    <td className="p-3 text-slate-400">{log.acceptedAt}</td>
                    <td className="p-3 text-[10px] text-slate-500 max-w-xs truncate">{log.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATS & COMPLIANCE */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-mono">Legal Acceptance Rate</span>
            <div className="text-2xl font-black text-emerald-400">99.8%</div>
            <p className="text-[11px] text-slate-400 font-sans">
              100% of active users have signed version {CURRENT_LEGAL_VERSION}.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-mono">Active Version</span>
            <div className="text-2xl font-black text-amber-400">{CURRENT_LEGAL_VERSION}</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Enforced on all sign-ups and wallet withdrawals.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-mono">Total Legal Documents</span>
            <div className="text-2xl font-black text-teal-400">{OFFICIAL_LEGAL_DOCUMENTS.length}</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Fully indexed and searchable in Legal Center.
            </p>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditing && selectedDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full relative shadow-2xl space-y-4">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">Edit Document Revision: {selectedDoc.title}</h3>

            <form onSubmit={handleSaveDoc} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono uppercase block">Version Tag</label>
                  <input
                    type="text"
                    value={editVersion}
                    onChange={(e) => setEditVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Markdown Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono leading-relaxed resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg"
                >
                  Save & Publish Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
