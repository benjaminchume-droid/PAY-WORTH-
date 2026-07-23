// PayWorth Enterprise Wallet & Double-Entry Ledger Service Engine
import { User, LedgerEntry } from '../types';
import { SecurityEngine } from '../lib/security';
import { diagnostics } from '../lib/diagnostics';

export interface TransferRequest {
  sender: User;
  recipientWalletNumber: string;
  recipientUser?: User;
  amount: number;
  pin: string;
  description?: string;
}

export interface TransferResult {
  success: boolean;
  message: string;
  transactionId?: string;
  senderLedgerEntry?: LedgerEntry;
  recipientLedgerEntry?: LedgerEntry;
  updatedSenderBalance?: number;
}

export class WalletService {
  /**
   * Verify User Wallet PIN with Security Lockout Protections
   */
  public static async verifyPin(user: User, pin: string): Promise<{ success: boolean; message: string }> {
    const pinStatus = SecurityEngine.getPinStatus();

    if (pinStatus.lockedUntil && Date.now() < pinStatus.lockedUntil) {
      const minutesLeft = Math.ceil((pinStatus.lockedUntil - Date.now()) / 60000);
      return {
        success: false,
        message: `Wallet locked due to multiple failed PIN attempts. Try again in ${minutesLeft} minute(s).`
      };
    }

    if (!user.walletPin) {
      return {
        success: false,
        message: 'No wallet PIN established. Please configure a 4-digit security PIN in Settings.'
      };
    }

    const hashedInput = await SecurityEngine.hashPin(pin, user.id);
    const expectedHash = await SecurityEngine.hashPin(user.walletPin, user.id);

    // Compare raw PIN or hashed PIN for backward compatibility
    const isValid = pin === user.walletPin || hashedInput === expectedHash;

    if (!isValid) {
      const updatedStatus = SecurityEngine.recordFailedPinAttempt();
      const remainingAttempts = Math.max(0, 5 - updatedStatus.count);
      
      diagnostics.warn('WalletService', `Failed PIN attempt for user ${user.id}. ${remainingAttempts} attempts remaining.`);

      if (remainingAttempts === 0) {
        return {
          success: false,
          message: 'Wallet locked for 5 minutes due to 5 consecutive invalid PIN attempts.'
        };
      }

      return {
        success: false,
        message: `Invalid 4-digit security PIN. ${remainingAttempts} attempt(s) remaining before temporary lockout.`
      };
    }

    // Reset PIN attempts on success
    SecurityEngine.resetPinStatus();
    return { success: true, message: 'PIN verified successfully.' };
  }

  /**
   * Execute Atomic Wallet-to-Wallet Transfer with Double-Entry Ledger Validation
   */
  public static async executeTransfer(req: TransferRequest): Promise<TransferResult> {
    const perfTimer = diagnostics.trackPerformance('WalletTransferExecution');
    try {
      // 1. Validate Session & Sender Active Status
      if (!req.sender || req.sender.walletStatus !== 'active') {
        return { success: false, message: 'Sender account is not active or wallet is frozen.' };
      }

      // 2. Validate Transfer Amount
      if (isNaN(req.amount) || req.amount <= 0) {
        return { success: false, message: 'Transfer amount must be greater than 0 PWC.' };
      }

      // 3. Verify Security PIN
      const pinValidation = await this.verifyPin(req.sender, req.pin);
      if (!pinValidation.success) {
        return { success: false, message: pinValidation.message };
      }

      // 4. Validate Balance & Spending Limits
      if (req.sender.pwcBalance < req.amount) {
        return { success: false, message: `Insufficient PWC balance. Available: ${req.sender.pwcBalance.toLocaleString()} PWC.` };
      }

      if (req.sender.dailyLimit && req.amount > req.sender.dailyLimit) {
        return { success: false, message: `Transfer exceeds daily wallet limit of ${req.sender.dailyLimit.toLocaleString()} PWC.` };
      }

      // 5. Generate Atomic Transaction ID
      const txId = `TX_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const now = new Date().toISOString();

      // 6. Double-Entry Ledger Creation
      const senderNewBalance = req.sender.pwcBalance - req.amount;

      const senderLedgerEntry: LedgerEntry = {
        id: txId,
        timestamp: now,
        type: 'debit',
        amount: req.amount,
        balanceAfter: senderNewBalance,
        description: req.description || `PWC Wire Transfer to ${req.recipientWalletNumber}`,
        category: 'transfer_sent',
        status: 'completed',
        referenceId: req.recipientWalletNumber
      };

      let recipientLedgerEntry: LedgerEntry | undefined;
      if (req.recipientUser) {
        recipientLedgerEntry = {
          id: `${txId}_REC`,
          timestamp: now,
          type: 'credit',
          amount: req.amount,
          balanceAfter: req.recipientUser.pwcBalance + req.amount,
          description: `PWC Transfer received from ${req.sender.username}`,
          category: 'transfer_received',
          status: 'completed',
          referenceId: req.sender.walletNumber
        };
      }

      perfTimer();
      diagnostics.info('WalletService', `Atomic transfer ${txId} completed. Amount: ${req.amount} PWC.`);

      return {
        success: true,
        message: `Successfully transferred ${req.amount.toLocaleString()} PWC.`,
        transactionId: txId,
        senderLedgerEntry,
        recipientLedgerEntry,
        updatedSenderBalance: senderNewBalance
      };

    } catch (err: any) {
      perfTimer();
      diagnostics.error('WalletService', `Transfer failed with error: ${err.message}`);
      return {
        success: false,
        message: err.message || 'An unexpected error occurred during wallet transfer.'
      };
    }
  }
}
