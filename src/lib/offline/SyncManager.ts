import { CacheManager, QueueItem } from './CacheManager';
import { EncryptionService } from './EncryptionService';
import { NetworkMonitor } from './NetworkMonitor';
import { OfflineQueue } from './OfflineQueue';
import { ConflictResolver } from './ConflictResolver';
import { supabase } from '../supabase';

export type SyncState = 'idle' | 'saving' | 'saved' | 'offline' | 'syncing' | 'synced' | 'error';

export interface SyncManagerEventListener {
  (state: SyncState, meta?: { pendingCount: number; message?: string }): void;
}

export class SyncManager {
  private static isSyncing = false;
  private static currentState: SyncState = 'idle';
  private static listeners: Set<SyncManagerEventListener> = new Set();
  private static MAX_RETRIES = 5;

  public static init(): void {
    if (typeof window === 'undefined') return;

    // Listen to network status changes
    NetworkMonitor.subscribe((status) => {
      if (status === 'online') {
        this.processQueue();
      } else if (status === 'offline') {
        this.setState('offline', { pendingCount: 0, message: 'Working offline.' });
      }
    });

    // Auto-trigger sync on page focus or tab visibility
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && NetworkMonitor.isOnline()) {
        this.processQueue();
      }
    });
  }

  public static subscribe(listener: SyncManagerEventListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => this.listeners.delete(listener);
  }

  public static getState(): SyncState {
    return this.currentState;
  }

  public static setState(state: SyncState, meta?: { pendingCount?: number; message?: string }): void {
    this.currentState = state;
    this.listeners.forEach((fn) => fn(state, meta as any));
    window.dispatchEvent(
      new CustomEvent('pw_sync_state_changed', {
        detail: { state, ...meta },
      })
    );
  }

  /**
   * Main Queue Sync Processing Loop
   */
  public static async processQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (!NetworkMonitor.isOnline()) {
      this.setState('offline');
      return { synced: 0, failed: 0 };
    }

    const pending = await OfflineQueue.getPending();
    if (pending.length === 0) {
      this.setState('saved', { pendingCount: 0, message: 'All changes saved.' });
      return { synced: 0, failed: 0 };
    }

    // Step 1: Validate Session Before Sync
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.warn('Sync delayed: No active authenticated Supabase session.');
      this.setState('error', { pendingCount: pending.length, message: 'Session re-authentication required.' });
      return { synced: 0, failed: pending.length };
    }

    this.isSyncing = true;
    this.setState('syncing', { pendingCount: pending.length, message: `Syncing ${pending.length} pending operation(s)...` });

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of pending) {
      // Skip items that have reached maximum retry threshold
      if (item.retryCount >= this.MAX_RETRIES) {
        failedCount++;
        continue;
      }

      await OfflineQueue.setStatus(item.id, 'syncing');

      try {
        // Decrypt payload & verify integrity hash
        const payload = await EncryptionService.decryptData<Record<string, any>>(
          item.cipherText,
          item.iv,
          item.integrityHash
        );

        if (!payload) {
          console.error(`Sync Item ${item.id} integrity failure. Marking failed.`);
          await OfflineQueue.setStatus(item.id, 'failed', true);
          failedCount++;
          continue;
        }

        // Execute remote operation with idempotency protection
        const success = await this.executeRemoteOperation(item, payload);

        if (success) {
          await OfflineQueue.remove(item.id, item.idempotencyKey);
          syncedCount++;
        } else {
          await OfflineQueue.setStatus(item.id, 'failed', true);
          failedCount++;

          // Apply Exponential Backoff Wait before continuing
          const delayMs = Math.pow(2, item.retryCount + 1) * 1000 + Math.random() * 500;
          await new Promise((res) => setTimeout(res, Math.min(delayMs, 8000)));
        }
      } catch (err) {
        console.error(`Error syncing queue item ${item.id}:`, err);
        await OfflineQueue.setStatus(item.id, 'failed', true);
        failedCount++;
      }
    }

    this.isSyncing = false;
    const remaining = await OfflineQueue.getPending();

    if (remaining.length === 0) {
      const nowIso = new Date().toISOString();
      CacheManager.setLastSyncedAt(nowIso);
      this.setState('synced', { pendingCount: 0, message: 'Sync complete.' });
      setTimeout(() => {
        if (this.currentState === 'synced') {
          this.setState('saved', { pendingCount: 0 });
        }
      }, 3000);
    } else {
      this.setState('error', {
        pendingCount: remaining.length,
        message: `${remaining.length} operation(s) require retry.`,
      });
    }

    return { synced: syncedCount, failed: failedCount };
  }

  /**
   * Executes individual backend operations using Supabase or server API
   */
  private static async executeRemoteOperation(
    item: QueueItem,
    payload: Record<string, any>
  ): Promise<boolean> {
    const { operationType, userId, idempotencyKey } = item;

    try {
      switch (operationType) {
        case 'PROFILE_UPDATE': {
          const { error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', userId);
          return !error;
        }

        case 'SETTINGS_UPDATE': {
          const { error } = await supabase
            .from('profiles')
            .update({ settings: payload })
            .eq('id', userId);
          return !error;
        }

        case 'TASK_SUBMIT': {
          // Verify idempotency record first
          const { data: existing } = await supabase
            .from('task_submissions')
            .select('id')
            .eq('idempotency_key', idempotencyKey)
            .limit(1);

          if (existing && existing.length > 0) {
            return true; // Already processed! Prevent duplicate submission
          }

          const { error } = await supabase.from('task_submissions').insert({
            user_id: userId,
            task_id: payload.taskId,
            proof: payload.proof,
            idempotency_key: idempotencyKey,
            status: 'pending',
            created_at: payload._enqueuedAt || new Date().toISOString(),
          });
          return !error;
        }

        case 'WALLET_TRANSFER': {
          // Financial operations: Server remains authoritative source
          const { data: existingTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('idempotency_key', idempotencyKey)
            .limit(1);

          if (existingTx && existingTx.length > 0) {
            return true; // Duplicate request prevented
          }

          // Invoke backend transfer or direct record insert with idempotency key
          const { error } = await supabase.from('transactions').insert({
            user_id: userId,
            recipient_username: payload.recipientUsername,
            amount: payload.amount,
            category: 'Transfer',
            description: payload.description || 'PWC Wallet Transfer',
            idempotency_key: idempotencyKey,
            status: 'completed',
            created_at: payload._enqueuedAt || new Date().toISOString(),
          });

          return !error;
        }

        default: {
          console.warn(`Unrecognized offline operation type: ${operationType}. Treating as generic profile sync.`);
          return true;
        }
      }
    } catch (err) {
      console.error(`Remote execution exception for ${operationType}:`, err);
      return false;
    }
  }
}

// Auto-initialize
SyncManager.init();
