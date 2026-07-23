import { SyncManager } from './SyncManager';
import { OfflineQueue } from './OfflineQueue';
import { NetworkMonitor } from './NetworkMonitor';
import { CacheManager } from './CacheManager';

export interface AutoSaveOptions {
  userId?: string;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (err: any) => void;
}

export class AutoSaveEngine {
  private static debounceTimer: any = null;
  private static checkpointTimer: any = null;
  private static isInitialized = false;
  private static pendingState: { userId?: string; payload?: Record<string, any>; operationType?: string } | null = null;

  public static init(options: AutoSaveOptions = {}): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.isInitialized = true;

    // 1. Safety Checkpoint every 60 seconds
    if (!this.checkpointTimer) {
      this.checkpointTimer = setInterval(() => {
        this.flushPendingSave('SAFETY_CHECKPOINT');
      }, 60000);
    }

    // 2. Page Unload / Background transition listener
    const handleUnloadOrBackground = () => {
      this.flushPendingSave('PAGE_UNLOAD');
    };

    window.addEventListener('beforeunload', handleUnloadOrBackground);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnloadOrBackground();
      }
    });

    // 3. Network Status listener
    NetworkMonitor.subscribe((status) => {
      if (status === 'online') {
        this.flushPendingSave('NETWORK_RECONNECT');
        SyncManager.processQueue();
      }
    });
  }

  /**
   * Schedule debounced auto-save (triggers after 1s inactivity)
   */
  public static scheduleSave(
    userId: string,
    operationType: string,
    payload: Record<string, any>,
    debounceMs: number = 1000
  ): void {
    this.pendingState = { userId, operationType, payload };

    SyncManager.setState('saving', { message: 'Saving changes...' });

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushPendingSave('DEBOUNCED_INACTIVITY');
    }, debounceMs);
  }

  /**
   * Immediately save & queue operation without debounce delay
   */
  public static async saveImmediately(
    userId: string,
    operationType: string,
    payload: Record<string, any>,
    isFinancial: boolean = false
  ): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.pendingState = null;

    SyncManager.setState('saving', { message: 'Saving immediately...' });

    try {
      // 1. Write encrypted payload to IndexedDB Offline Queue
      await OfflineQueue.enqueue({
        userId,
        operationType,
        payload,
        isFinancial,
      });

      // 2. Cache local state snapshot
      await CacheManager.saveState(`user_state_${userId}`, payload);

      SyncManager.setState('saved', { message: 'Changes saved locally.' });

      // 3. If online, process queue immediately
      if (NetworkMonitor.isOnline()) {
        await SyncManager.processQueue();
      }
    } catch (err) {
      console.error('Save immediately error:', err);
      SyncManager.setState('error', { message: 'Failed to auto-save change.' });
    }
  }

  /**
   * Flush pending debounced auto-save payload to Queue
   */
  public static async flushPendingSave(reason: string = 'MANUAL_FLUSH'): Promise<void> {
    if (!this.pendingState || !this.pendingState.userId || !this.pendingState.payload) {
      return;
    }

    const { userId, operationType, payload } = this.pendingState;
    this.pendingState = null;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    try {
      await OfflineQueue.enqueue({
        userId,
        operationType: operationType || 'PROFILE_UPDATE',
        payload,
      });

      await CacheManager.saveState(`user_state_${userId}`, payload);

      if (NetworkMonitor.isOnline()) {
        SyncManager.processQueue();
      } else {
        SyncManager.setState('saved', { message: 'Saved offline.' });
      }
    } catch (err) {
      console.error(`Flush pending save failed (${reason}):`, err);
    }
  }
}

// Auto-initialize
AutoSaveEngine.init();
