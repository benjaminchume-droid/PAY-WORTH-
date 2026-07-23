// Conflict Resolution Engine using Timestamps & Version Vectors

export interface ConflictResolutionResult<T> {
  resolvedData: T;
  hasConflict: boolean;
  resolutionStrategy: 'SERVER_WINS' | 'LOCAL_WINS' | 'DELTA_MERGE';
  conflictReason?: string;
}

export class ConflictResolver {
  /**
   * Resolves conflicts between local queued changes and remote server data.
   * Rules:
   * 1. Financial/Wallet operations: SERVER IS ALWAYS SINGLE SOURCE OF TRUTH for balances.
   * 2. Non-financial fields (e.g. profile metadata, theme settings, form drafts):
   *    If local timestamp is newer, apply local changes or perform delta merge.
   */
  public static resolve<T extends Record<string, any>>(
    localData: T,
    serverData: T,
    isFinancial: boolean = false
  ): ConflictResolutionResult<T> {
    if (isFinancial) {
      return {
        resolvedData: serverData,
        hasConflict: true,
        resolutionStrategy: 'SERVER_WINS',
        conflictReason: 'Financial balances and verified transactions are authoritative on the server.',
      };
    }

    const localTime = new Date(localData.updatedAt || localData.timestamp || 0).getTime();
    const serverTime = new Date(serverData.updatedAt || serverData.timestamp || 0).getTime();

    if (localTime > serverTime) {
      // Delta merge non-null local fields onto server object
      const merged: Record<string, any> = { ...serverData };
      let updatedCount = 0;

      for (const [key, val] of Object.entries(localData)) {
        if (val !== undefined && val !== null && key !== 'id') {
          if (merged[key] !== val) {
            merged[key] = val;
            updatedCount++;
          }
        }
      }

      return {
        resolvedData: merged as T,
        hasConflict: updatedCount > 0,
        resolutionStrategy: 'DELTA_MERGE',
        conflictReason: `Delta merged ${updatedCount} field(s) based on newer local timestamp.`,
      };
    }

    return {
      resolvedData: serverData,
      hasConflict: localTime < serverTime,
      resolutionStrategy: 'SERVER_WINS',
      conflictReason: 'Server record contains a newer timestamp.',
    };
  }
}
