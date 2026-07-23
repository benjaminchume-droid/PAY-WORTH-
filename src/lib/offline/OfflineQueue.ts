import { CacheManager, QueueItem } from './CacheManager';
import { EncryptionService } from './EncryptionService';

export interface EnqueueOperationParams {
  userId: string;
  operationType: string;
  payload: Record<string, any>;
  isFinancial?: boolean;
}

export class OfflineQueue {
  /**
   * Enqueues an operation into the encrypted IndexedDB queue with idempotency protection.
   */
  public static async enqueue(params: EnqueueOperationParams): Promise<QueueItem> {
    const idempotencyKey = crypto.randomUUID();
    const operationId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Attach idempotency & timestamp metadata to payload
    const enrichedPayload = {
      ...params.payload,
      _idempotencyKey: idempotencyKey,
      _enqueuedAt: timestamp,
      _isFinancial: Boolean(params.isFinancial),
    };

    const { cipherText, iv, integrityHash } = await EncryptionService.encryptData(enrichedPayload);

    const queueItem: QueueItem = {
      id: operationId,
      userId: params.userId,
      operationType: params.operationType,
      cipherText,
      iv,
      timestamp,
      retryCount: 0,
      status: 'pending',
      version: 1,
      integrityHash,
      idempotencyKey,
    };

    await CacheManager.enqueueOp(queueItem);
    return queueItem;
  }

  /**
   * Gets all pending operations queued for background synchronization.
   */
  public static async getPending(): Promise<QueueItem[]> {
    return CacheManager.getPendingOps();
  }

  /**
   * Updates status of an operation item (e.g., 'syncing', 'failed').
   */
  public static async setStatus(
    id: string,
    status: QueueItem['status'],
    incrementRetry: boolean = false
  ): Promise<void> {
    await CacheManager.updateOpStatus(id, status, incrementRetry);
  }

  /**
   * Safe purging of completed operations after verified server sync.
   */
  public static async remove(id: string, idempotencyKey: string): Promise<void> {
    await CacheManager.removeOp(id, idempotencyKey);
  }
}
