// Form Draft, Onboarding Recovery & Readable Username Generator Engine

export interface OnboardingDraft {
  email: string;
  username: string;
  referralCode: string;
  step: number;
  otpCountdown?: number;
  updatedAt: string;
}

export interface FormDrafts {
  registration?: { email?: string; username?: string; referralCode?: string };
  profileCompletion?: { username?: string; displayName?: string; referralCode?: string };
  kyc?: { docType?: string; docRef?: string };
  support?: { subject?: string; message?: string };
  savings?: { targetAmount?: number; durationDays?: number };
  billPayment?: { billType?: string; accountNumber?: string; amount?: number };
}

const ONBOARDING_DRAFT_KEY = 'payworth_onboarding_draft';
const FORM_DRAFTS_KEY = 'payworth_form_drafts';

export function saveOnboardingDraft(draft: Partial<OnboardingDraft>): void {
  try {
    const existing = getOnboardingDraft() || { email: '', username: '', referralCode: '', step: 1, updatedAt: '' };
    const updated = { ...existing, ...draft, updatedAt: new Date().toISOString() };
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save onboarding draft', e);
  }
}

export function getOnboardingDraft(): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearOnboardingDraft(): void {
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch (e) {}
}

export function saveFormDraft<K extends keyof FormDrafts>(formKey: K, data: FormDrafts[K]): void {
  try {
    const existing = getFormDrafts();
    const updated = { ...existing, [formKey]: data };
    localStorage.setItem(FORM_DRAFTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save form draft', e);
  }
}

export function getFormDrafts(): FormDrafts {
  try {
    const raw = localStorage.getItem(FORM_DRAFTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function clearFormDraft<K extends keyof FormDrafts>(formKey: K): void {
  try {
    const existing = getFormDrafts();
    delete existing[formKey];
    localStorage.setItem(FORM_DRAFTS_KEY, JSON.stringify(existing));
  } catch (e) {}
}

// Generate premium readable usernames: adjective + noun
export function generateReadableUsername(): string {
  const adjectives = [
    'emerald', 'spring', 'atlas', 'lunar', 'velvet', 'cosmic', 'silver', 'golden',
    'neon', 'aurora', 'solar', 'amber', 'crystal', 'ruby', 'sapphire', 'swift',
    'prime', 'vivid', 'noble', 'zenith', 'shadow', 'stellar', 'canyon', 'harbor'
  ];
  const nouns = [
    'horizon', 'lemon', 'river', 'anchor', 'orbit', 'pulse', 'crest', 'beacon',
    'breeze', 'stride', 'echo', 'summit', 'spark', 'haven', 'vault', 'phoenix',
    'titan', 'voyage', 'nexus', 'prism', 'matrix', 'stream', 'crown', 'falcon'
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}`;
}
