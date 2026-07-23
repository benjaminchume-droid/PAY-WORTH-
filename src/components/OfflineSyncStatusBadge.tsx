import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle, Cloud, HardDrive, ShieldCheck } from 'lucide-react';
import { NetworkMonitor, NetworkStatus } from '../lib/offline/NetworkMonitor';
import { SyncManager, SyncState } from '../lib/offline/SyncManager';
import { CacheManager } from '../lib/offline/CacheManager';

export interface OfflineSyncStatusBadgeProps {
  compact?: boolean;
  className?: string;
}

export default function OfflineSyncStatusBadge({
  compact = false,
  className = '',
}: OfflineSyncStatusBadgeProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(NetworkMonitor.getStatus());
  const [syncState, setSyncState] = useState<SyncState>(SyncManager.getState());
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSynced, setLastSynced] = useState<string | null>(CacheManager.getLastSyncedAt());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    // Subscribe to network monitor
    const unsubNet = NetworkMonitor.subscribe((st) => setNetworkStatus(st));

    // Subscribe to sync manager
    const unsubSync = SyncManager.subscribe((st, meta) => {
      setSyncState(st);
      if (meta && typeof meta.pendingCount === 'number') {
        setPendingCount(meta.pendingCount);
      }
      setLastSynced(CacheManager.getLastSyncedAt());
    });

    // Listen to custom queue length events
    const handleQueueChange = (e: any) => {
      if (e.detail && typeof e.detail.count === 'number') {
        setPendingCount(e.detail.count);
      }
    };
    window.addEventListener('pw_offline_queue_changed', handleQueueChange);

    // Initial metrics fetch
    CacheManager.getCacheMetrics().then((m) => setPendingCount(m.queueLength));

    return () => {
      unsubNet();
      unsubSync();
      window.removeEventListener('pw_offline_queue_changed', handleQueueChange);
    };
  }, []);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await SyncManager.processQueue();
    const metrics = await CacheManager.getCacheMetrics();
    setPendingCount(metrics.queueLength);
    setLastSynced(metrics.lastSynced);
    setIsManualSyncing(false);
  };

  const isOffline = networkStatus === 'offline';

  // State formatting rules
  let badgeText = 'Saved';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let Icon = CheckCircle;
  let animateIcon = false;

  if (isOffline) {
    badgeText = pendingCount > 0 ? `Offline (${pendingCount} queued)` : 'Offline';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    Icon = WifiOff;
  } else if (syncState === 'saving') {
    badgeText = 'Saving...';
    badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    Icon = HardDrive;
    animateIcon = true;
  } else if (syncState === 'syncing' || isManualSyncing) {
    badgeText = pendingCount > 0 ? `Syncing (${pendingCount})...` : 'Syncing...';
    badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    Icon = RefreshCw;
    animateIcon = true;
  } else if (syncState === 'error' || pendingCount > 0) {
    badgeText = `Retry Required (${pendingCount})`;
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    Icon = AlertTriangle;
  } else if (syncState === 'synced') {
    badgeText = 'Sync Complete';
    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    Icon = ShieldCheck;
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handleManualSync}
          title={isOffline ? 'Working offline. Changes stored in encrypted cache.' : 'Click to force sync pending updates'}
          className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${badgeColor}`}
        >
          <Icon className={`w-3 h-3 ${animateIcon ? 'animate-spin' : ''}`} />
          <span>{badgeText}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-950/80 border border-white/10 rounded-2xl p-3 flex items-center justify-between backdrop-blur-xl shadow-lg ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${badgeColor}`}
        >
          <Icon className={`w-4 h-4 ${animateIcon ? 'animate-spin' : ''}`} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-tight">{badgeText}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-white/5 border border-white/5 text-slate-400">
              AES-256 Encrypted
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {isOffline
              ? 'Changes buffered in IndexedDB. Will sync when back online.'
              : pendingCount > 0
              ? `${pendingCount} item(s) pending background server commit.`
              : lastSynced
              ? `Last synced: ${new Date(lastSynced).toLocaleTimeString()}`
              : 'IndexedDB cache active & verified.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleManualSync}
          disabled={isOffline || isManualSyncing}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  );
}
