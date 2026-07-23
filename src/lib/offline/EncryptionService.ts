// Web Crypto AES-GCM 256-bit Encryption Service with SHA-256 Integrity Verification

const KEY_DB_NAME = 'payworth_security_keystore';
const KEY_STORE_NAME = 'keys';
const MASTER_KEY_ALIAS = 'device_master_key_v1';

// Never cache sensitive security credentials in plaintext
const SENSITIVE_KEYS = new Set([
  'password', 'confirmPassword', 'currentPassword', 'newPassword',
  'otp', 'otpCode', 'pin', 'walletPin', 'token', 'refreshToken',
  'cvv', 'secretKey', 'privateKey', 'apiKey'
]);

export class EncryptionService {
  private static cryptoKey: CryptoKey | null = null;

  /**
   * Initializes or retrieves persistent AES-GCM 256-bit key stored securely in IndexedDB KeyStore.
   */
  public static async getMasterKey(): Promise<CryptoKey> {
    if (this.cryptoKey) return this.cryptoKey;

    try {
      const db = await this.openKeyDB();
      const storedKey = await this.getKeyFromDB(db, MASTER_KEY_ALIAS);

      if (storedKey) {
        this.cryptoKey = storedKey;
        return storedKey;
      }

      // Generate a new 256-bit AES-GCM key
      const newKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false, // non-extractable for security
        ['encrypt', 'decrypt']
      );

      await this.saveKeyToDB(db, MASTER_KEY_ALIAS, newKey);
      this.cryptoKey = newKey;
      return newKey;
    } catch (err) {
      console.warn('CryptoKey storage fallback to volatile session key:', err);
      // Fallback in case IndexedDB key store is blocked
      this.cryptoKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      return this.cryptoKey;
    }
  }

  /**
   * Sanitizes payload by stripping secret security fields prior to caching.
   */
  public static sanitizePayload<T extends Record<string, any>>(payload: T): T {
    if (!payload || typeof payload !== 'object') return payload;

    const cleaned: Record<string, any> = Array.isArray(payload) ? [] : {};
    for (const [key, val] of Object.entries(payload)) {
      if (SENSITIVE_KEYS.has(key)) {
        continue; // strip password/otp/cvv
      }
      if (val && typeof val === 'object') {
        cleaned[key] = this.sanitizePayload(val);
      } else {
        cleaned[key] = val;
      }
    }
    return cleaned as T;
  }

  /**
   * Computes SHA-256 hash for integrity & tamper verification
   */
  public static async computeIntegrityHash(dataString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypts plaintext data object using Web Crypto AES-GCM
   */
  public static async encryptData<T>(data: T): Promise<{ cipherText: string; iv: string; integrityHash: string }> {
    const key = await this.getMasterKey();
    const sanitized = this.sanitizePayload(data as any);
    const jsonString = JSON.stringify(sanitized);

    const integrityHash = await this.computeIntegrityHash(jsonString);

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(jsonString);

    // 12-byte IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    const cipherArray = Array.from(new Uint8Array(encryptedBuffer));
    const cipherText = btoa(String.fromCharCode(...cipherArray));
    const ivString = btoa(String.fromCharCode(...iv));

    return {
      cipherText,
      iv: ivString,
      integrityHash,
    };
  }

  /**
   * Decrypts AES-GCM encrypted payload and verifies integrity hash
   */
  public static async decryptData<T>(
    cipherText: string,
    ivString: string,
    expectedIntegrityHash?: string
  ): Promise<T | null> {
    try {
      const key = await this.getMasterKey();

      const cipherBytes = new Uint8Array(
        atob(cipherText)
          .split('')
          .map((c) => c.charCodeAt(0))
      );
      const ivBytes = new Uint8Array(
        atob(ivString)
          .split('')
          .map((c) => c.charCodeAt(0))
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        key,
        cipherBytes
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedBuffer);

      if (expectedIntegrityHash) {
        const computedHash = await this.computeIntegrityHash(jsonString);
        if (computedHash !== expectedIntegrityHash) {
          throw new Error('Integrity check failed: Payload has been tampered with or corrupted.');
        }
      }

      return JSON.parse(jsonString) as T;
    } catch (err) {
      console.error('Decryption / integrity check failed:', err);
      return null;
    }
  }

  // --- Private IndexedDB KeyStore helpers ---
  private static openKeyDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(KEY_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
          db.createObjectStore(KEY_STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private static getKeyFromDB(db: IDBDatabase, alias: string): Promise<CryptoKey | null> {
    return new Promise((resolve) => {
      const tx = db.transaction(KEY_STORE_NAME, 'readonly');
      const store = tx.objectStore(KEY_STORE_NAME);
      const req = store.get(alias);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  private static saveKeyToDB(db: IDBDatabase, alias: string, key: CryptoKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(KEY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(KEY_STORE_NAME);
      const req = store.put(key, alias);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
