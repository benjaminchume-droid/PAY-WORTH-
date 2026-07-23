// Primary IndexedDB Cache Storage for Fintech Application

export interface QueueItem {
  id: string; // UUID
  userId: string;
  operationType: string; // e.g. 'WALLET_TRANSFER' | 'TASK_SUBMIT' | 'PROFILE_UPDATE' | 'FORM_DRAFT'
  cipherText: string;
  iv: string;
  timestamp: string; // ISO String
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  version: number;
  integrityHash: string;
  idempotencyKey: string; // UUID for replay attack prevention
}

export interface AuditLogEntry {
  id: string;
  idempotencyKey: string;
  operationType: string;
  timestamp: string;
  status: 'QUEUED' | 'SYNCED' | 'FAILED' | 'REJECTED';
  details?: string;
}

const DB_NAME = 'payworth_cache_v2';
const DB_VERSION = 1;

export class CacheManager {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  public static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = req.result;
        if (!db.objectStoreNames.contains('pending_ops')) {
          const queueStore = db.createObjectStore('pending_ops', { keyPath: 'id' });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('idempotencyKey', 'idempotencyKey', { unique: true });
        }

        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('audit_logs')) {
          const auditStore = db.createObjectStore('audit_logs', { keyPath: 'id' });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.error('IndexedDB open error:', req.error);
        reject(req.error);
      };
    });

    return this.dbPromise;
  }

  // --- Queue Operations ---
  public static async enqueueOp(item: QueueItem): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['pending_ops', 'audit_logs'], 'readwrite');
      const store = tx.objectStore('pending_ops');
      const auditStore = tx.objectStore('audit_logs');

      store.put(item);

      auditStore.put({
        id: crypto.randomUUID(),
        idempotencyKey: item.idempotencyKey,
        operationType: item.operationType,
        timestamp: new Date().toISOString(),
        status: 'QUEUED',
        details: `Operation ${item.operationType} enqueued with ID ${item.id}`,
      } as AuditLogEntry);

      tx.oncomplete = () => {
        this.updateMetadataQueueSize();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public static async getPendingOps(): Promise<QueueItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_ops', 'readonly');
      const store = tx.objectStore('pending_ops');
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result || []) as QueueItem[];
        // Order sequentially by timestamp & version
        items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public static async updateOpStatus(
    id: string,
    status: QueueItem['status'],
    incrementRetry = false
  ): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_ops', 'readwrite');
      const store = tx.objectStore('pending_ops');
      const req = store.get(id);

      req.onsuccess = () => {
        const item = req.result as QueueItem;
        if (item) {
          item.status = status;
          if (incrementRetry) item.retryCount += 1;
          store.put(item);
        }
      };

      tx.oncomplete = () => {
        this.updateMetadataQueueSize();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public static async removeOp(id: string, idempotencyKey: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['pending_ops', 'audit_logs'], 'readwrite');
      const store = tx.objectStore('pending_ops');
      const auditStore = tx.objectStore('audit_logs');

      store.delete(id);

      auditStore.put({
        id: crypto.randomUUID(),
        idempotencyKey,
        operationType: 'SYNC_SUCCESS',
        timestamp: new Date().toISOString(),
        status: 'SYNCED',
        details: `Operation ${id} successfully synchronized and purged from local queue.`,
      } as AuditLogEntry);

      tx.oncomplete = () => {
        this.updateMetadataQueueSize();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  public static async clearQueue(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_ops', 'readwrite');
      const store = tx.objectStore('pending_ops');
      store.clear();
      tx.oncomplete = () => {
        this.updateMetadataQueueSize();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Cached Application State ---
  public static async saveState(key: string, data: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('app_state', 'readwrite');
      const store = tx.objectStore('app_state');
      store.put({ key, data, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public static async getState<T>(key: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('app_state', 'readonly');
      const store = tx.objectStore('app_state');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  }

  // --- Lightweight LocalStorage Metadata Only ---
  private static async updateMetadataQueueSize(): Promise<void> {
    try {
      const ops = await this.getPendingOps();
      const count = ops.filter((o) => o.status !== 'completed').length;
      localStorage.setItem('pw_meta_queue_length', String(count));
      window.dispatchEvent(new CustomEvent('pw_offline_queue_changed', { detail: { count } }));
    } catch (e) {}
  }

  public static setLastSyncedAt(timestamp: string): void {
    localStorage.setItem('pw_last_synced_at', timestamp);
  }

  public static getLastSyncedAt(): string | null {
    return localStorage.getItem('pw_last_synced_at');
  }

  // --- Cache Metrics & Health Monitoring ---
  public static async getCacheMetrics(): Promise<{
    queueLength: number;
    lastSynced: string | null;
    estimatedSizeKb: number;
  }> {
    const ops = await this.getPendingOps();
    const lastSynced = this.getLastSyncedAt();
    const queueLength = ops.length;
    const jsonStr = JSON.stringify(ops);
    const estimatedSizeKb = Math.round((jsonStr.length * 2) / 1024);

    return {
      queueLength,
      lastSynced,
      estimatedSizeKb,
    };
  }
}
