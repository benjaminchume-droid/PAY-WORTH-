// PayWorth Cryptographic & Security Assistant Engine
import { diagnostics } from './diagnostics';

const PIN_ATTEMPTS_KEY = 'pw_pin_attempts_v2';
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface PinAttemptRecord {
  count: number;
  lockedUntil: number | null;
}

export class SecurityEngine {
  /**
   * Get current PIN attempt status from storage
   */
  public static getPinStatus(): PinAttemptRecord {
    try {
      const data = localStorage.getItem(PIN_ATTEMPTS_KEY);
      if (!data) return { count: 0, lockedUntil: null };
      const parsed: PinAttemptRecord = JSON.parse(data);
      
      // Check if lockout expired
      if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
        this.resetPinStatus();
        return { count: 0, lockedUntil: null };
      }
      return parsed;
    } catch {
      return { count: 0, lockedUntil: null };
    }
  }

  /**
   * Record a failed PIN attempt
   */
  public static recordFailedPinAttempt(): PinAttemptRecord {
    const status = this.getPinStatus();
    const newCount = status.count + 1;
    let lockedUntil = status.lockedUntil;

    if (newCount >= MAX_PIN_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      diagnostics.warn('SecurityEngine', 'PIN lockout triggered due to maximum attempts');
    }

    const updated: PinAttemptRecord = { count: newCount, lockedUntil };
    try {
      localStorage.setItem(PIN_ATTEMPTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage error:', e);
    }
    return updated;
  }

  /**
   * Reset PIN attempt status after successful verification
   */
  public static resetPinStatus() {
    try {
      localStorage.removeItem(PIN_ATTEMPTS_KEY);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  /**
   * Client-side verification helper using SHA-256 fallback + salt
   */
  public static async hashPin(pin: string, userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`pw_salt_${userId}_${pin}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
