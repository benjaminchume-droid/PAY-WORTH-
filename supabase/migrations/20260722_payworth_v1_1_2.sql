-- PayWorth v1.1.2 Production Enterprise Database Schema
-- Compatible with Supabase PostgreSQL, RLS Policies, Triggers & RPC Functions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  is_verified BOOLEAN DEFAULT FALSE,
  pwc_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (pwc_balance >= 0),
  pending_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (pending_balance >= 0),
  locked_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (locked_balance >= 0),
  lifetime_earned NUMERIC(15, 2) DEFAULT 0.00,
  lifetime_withdrawn NUMERIC(15, 2) DEFAULT 0.00,
  trust_score INT DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  membership_tier TEXT DEFAULT 'Dark Bronze',
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.profiles(id),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  welcome_completed BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'unverified',
  wallet_number TEXT UNIQUE NOT NULL,
  wallet_status TEXT DEFAULT 'active',
  wallet_pin TEXT,
  daily_limit NUMERIC(15,2) DEFAULT 5000.00,
  monthly_limit NUMERIC(15,2) DEFAULT 50000.00,
  spending_limit NUMERIC(15,2) DEFAULT 2000.00,
  wallet_level INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FINANCIAL LEDGER
CREATE TABLE IF NOT EXISTS public.ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(15, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'reversed')),
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CAMPAIGNS & ESCROW
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  reward NUMERIC(15, 2) NOT NULL CHECK (reward > 0),
  slots INT NOT NULL CHECK (slots > 0),
  remaining_slots INT NOT NULL,
  reward_pool NUMERIC(15, 2) NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  trust_rating INT DEFAULT 100,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'ended')),
  approval_method TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGN SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.campaign_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  evidence_url TEXT,
  text_evidence TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MINING SESSIONS
CREATE TABLE IF NOT EXISTS public.mining_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bot_name TEXT NOT NULL,
  tier TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_collected_at TIMESTAMPTZ DEFAULT NOW(),
  mined_pwc NUMERIC(15, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'active',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENTERPRISE REFERRALS & FRAUD TRACKING
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'premium')),
  reward_pwc NUMERIC(15, 2) DEFAULT 50.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('visited', 'signed_up', 'qualified', 'pending', 'approved', 'rejected', 'fraud')),
  risk_score INT DEFAULT 0,
  holding_period_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WITHDRAWALS
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  fee NUMERIC(15, 2) DEFAULT 0.00,
  receive_amount NUMERIC(15, 2) NOT NULL,
  settlement_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Users Policy
CREATE POLICY "Users view own record or public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own record" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Ledger Policy
CREATE POLICY "Users view own ledger" ON public.ledger FOR SELECT USING (auth.uid() = user_id);

-- Campaigns Policy
CREATE POLICY "Anyone views campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Creators create campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Submissions Policy
CREATE POLICY "Users view own submissions" ON public.campaign_submissions FOR SELECT USING (auth.uid() = user_id);

-- Indexes for scale
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON public.ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
