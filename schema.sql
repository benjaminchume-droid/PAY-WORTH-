-- PayWorth Production Database Schema (Supabase PostgreSQL)
-- Highly optimized for direct full-stack security rules and real-time execution.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- TABLES DEFINITION
-- -------------------------------------------------------------

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
    "id" UUID PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "isVerified" BOOLEAN DEFAULT FALSE,
    "pwcBalance" NUMERIC DEFAULT 0.0,
    "pendingBalance" NUMERIC DEFAULT 0.0,
    "lockedBalance" NUMERIC DEFAULT 0.0,
    "lifetimeEarned" NUMERIC DEFAULT 0.0,
    "lifetimeWithdrawn" NUMERIC DEFAULT 0.0,
    "trustScore" INTEGER DEFAULT 50,
    "xp" INTEGER DEFAULT 0,
    "level" INTEGER DEFAULT 1,
    "membershipTier" TEXT DEFAULT 'Dark Bronze',
    "referralCode" TEXT UNIQUE NOT NULL,
    "referredBy" UUID,
    "onboardingCompleted" BOOLEAN DEFAULT FALSE,
    "welcomeCompleted" BOOLEAN DEFAULT FALSE,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    "achievementsClaimed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dailyRewardClaimedAt" TIMESTAMPTZ,
    "luckyWheelSpinsRemaining" INTEGER DEFAULT 1,
    "gamesPlayedToday" JSONB DEFAULT '{}'::JSONB,
    "selectedGamesToday" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completedWelcomeCampaigns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verifiedWelcomeCampaigns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kycStatus" TEXT DEFAULT 'unverified',
    "trustHistory" JSONB DEFAULT '[]'::JSONB,
    "virtualAccount" JSONB,
    "walletNumber" TEXT UNIQUE NOT NULL,
    "walletStatus" TEXT DEFAULT 'active',
    "walletPin" TEXT,
    "dailyLimit" NUMERIC DEFAULT 5000.0,
    "monthlyLimit" NUMERIC DEFAULT 50000.0,
    "spendingLimit" NUMERIC DEFAULT 2000.0,
    "walletLevel" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Ledger / Transactions Table
CREATE TABLE IF NOT EXISTS public.ledger (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "timestamp" TIMESTAMPTZ DEFAULT NOW(),
    "type" TEXT NOT NULL, -- 'credit', 'debit'
    "amount" NUMERIC NOT NULL,
    "balanceAfter" NUMERIC NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT DEFAULT 'completed',
    "referenceId" TEXT
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reward" NUMERIC NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estTime" TEXT NOT NULL,
    "slots" INTEGER NOT NULL,
    "remainingSlots" INTEGER NOT NULL,
    "trustRequirement" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Task Submissions Table
CREATE TABLE IF NOT EXISTS public.task_submissions (
    "id" TEXT PRIMARY KEY,
    "taskId" TEXT NOT NULL REFERENCES public.tasks("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "evidence" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    "feedback" TEXT,
    "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reward" NUMERIC NOT NULL,
    "slots" INTEGER NOT NULL,
    "remainingSlots" INTEGER NOT NULL,
    "rewardPool" NUMERIC NOT NULL,
    "creatorId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "creatorName" TEXT NOT NULL,
    "trustRating" INTEGER NOT NULL,
    "deadline" TEXT NOT NULL,
    "status" TEXT DEFAULT 'active',
    "approvalMethod" TEXT DEFAULT 'manual',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Submissions Table
CREATE TABLE IF NOT EXISTS public.campaign_submissions (
    "id" TEXT PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES public.campaigns("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "textEvidence" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "status" TEXT DEFAULT 'pending',
    "reviewNote" TEXT,
    "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "read" BOOLEAN DEFAULT FALSE,
    "date" TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "amount" NUMERIC NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Funding Requests Table
CREATE TABLE IF NOT EXISTS public.funding_requests (
    "id" TEXT PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "amount" NUMERIC NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "feedback" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals Association Table
CREATE TABLE IF NOT EXISTS public.referrals (
    "id" SERIAL PRIMARY KEY,
    "referrerId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "referredId" UUID NOT NULL REFERENCES public.users("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("referrerId", "referredId")
);

-- -------------------------------------------------------------
-- DATABASE HELPER FUNCTIONS
-- -------------------------------------------------------------

-- 1. generate_account_number()
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT AS $$
DECLARE
    v_acc TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_acc := '412' || floor(random() * (9999999 - 1000000 + 1) + 1000000)::TEXT;
        SELECT EXISTS(SELECT 1 FROM public.users WHERE "walletNumber" = v_acc) INTO v_exists;
        IF NOT v_exists THEN
            RETURN v_acc;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. generate_referral_code()
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
    v_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
BEGIN
    LOOP
        v_code := 'PW_';
        FOR i IN 1..6 LOOP
            v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::INTEGER, 1);
        END LOOP;
        SELECT EXISTS(SELECT 1 FROM public.users WHERE "referralCode" = v_code) INTO v_exists;
        IF NOT v_exists THEN
            RETURN v_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. create_wallet()
CREATE OR REPLACE FUNCTION public.create_wallet(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET 
        "walletNumber" = public.generate_account_number(),
        "walletStatus" = 'active',
        "walletLevel" = 1,
        "dailyLimit" = 5000.0,
        "monthlyLimit" = 50000.0,
        "spendingLimit" = 2000.0
    WHERE "id" = p_user_id AND "walletNumber" IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. create_transaction()
CREATE OR REPLACE FUNCTION public.create_transaction(
    p_user_id UUID,
    p_type TEXT,
    p_amount NUMERIC,
    p_description TEXT,
    p_category TEXT,
    p_status TEXT,
    p_reference_id TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_tx_id TEXT;
    v_balance NUMERIC;
BEGIN
    SELECT "pwcBalance" INTO v_balance FROM public.users WHERE "id" = p_user_id;
    v_tx_id := 'tx_' || extract(epoch from now())::TEXT || '_' || floor(random()*10000)::TEXT;
    
    INSERT INTO public.ledger (
        "id", "userId", "type", "amount", "balanceAfter", "description", "category", "status", "referenceId"
    ) VALUES (
        v_tx_id, p_user_id, p_type, p_amount, v_balance, p_description, p_category, p_status, p_reference_id
    );
    
    RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. credit_wallet()
CREATE OR REPLACE FUNCTION public.credit_wallet(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT,
    p_category TEXT,
    p_reference_id TEXT DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Credit amount must be positive';
    END IF;

    UPDATE public.users
    SET 
        "pwcBalance" = "pwcBalance" + p_amount,
        "lifetimeEarned" = "lifetimeEarned" + p_amount
    WHERE "id" = p_user_id
    RETURNING "pwcBalance" INTO v_new_balance;

    PERFORM public.create_transaction(
        p_user_id, 'credit', p_amount, p_description, p_category, 'completed', p_reference_id
    );

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. debit_wallet()
CREATE OR REPLACE FUNCTION public.debit_wallet(
    p_user_id UUID,
    p_amount NUMERIC,
    p_description TEXT,
    p_category TEXT,
    p_reference_id TEXT DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
    v_balance NUMERIC;
    v_status TEXT;
    v_limit NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Debit amount must be positive';
    END IF;

    SELECT "pwcBalance", "walletStatus", "dailyLimit" 
    INTO v_balance, v_status, v_limit 
    FROM public.users WHERE "id" = p_user_id;

    IF v_status != 'active' THEN
        RAISE EXCEPTION 'Wallet is not active';
    END IF;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance to complete debit';
    END IF;

    UPDATE public.users
    SET "pwcBalance" = "pwcBalance" - p_amount
    WHERE "id" = p_user_id
    RETURNING "pwcBalance" INTO v_new_balance;

    PERFORM public.create_transaction(
        p_user_id, 'debit', p_amount, p_description, p_category, 'completed', p_reference_id
    );

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. transfer_wallet()
CREATE OR REPLACE FUNCTION public.transfer_wallet(
    p_sender_id UUID,
    p_recipient_id UUID,
    p_amount NUMERIC,
    p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sender_username TEXT;
    v_recipient_username TEXT;
BEGIN
    SELECT "username" INTO v_sender_username FROM public.users WHERE "id" = p_sender_id;
    SELECT "username" INTO v_recipient_username FROM public.users WHERE "id" = p_recipient_id;

    -- Perform debit
    PERFORM public.debit_wallet(
        p_sender_id, p_amount, 'Transfer to ' || v_recipient_username || ': ' || p_description, 'transfer_sent'
    );

    -- Perform credit
    PERFORM public.credit_wallet(
        p_recipient_id, p_amount, 'Transfer from ' || v_sender_username || ': ' || p_description, 'transfer_received'
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. create_notification()
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_category TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_notif_id TEXT;
BEGIN
    v_notif_id := 'n_' || extract(epoch from now())::TEXT || '_' || floor(random()*1000000)::TEXT;
    INSERT INTO public.notifications (
        "id", "userId", "title", "message", "category", "read", "date"
    ) VALUES (
        v_notif_id, p_user_id, p_title, p_message, p_category, FALSE, NOW()
    );
    RETURN v_notif_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. join_welcome_campaign()
CREATE OR REPLACE FUNCTION public.join_welcome_campaign(
    p_user_id UUID,
    p_campaign_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_completed TEXT[];
BEGIN
    SELECT "completedWelcomeCampaigns" INTO v_completed FROM public.users WHERE "id" = p_user_id;
    
    IF p_campaign_id = ANY(v_completed) THEN
        RETURN FALSE;
    END IF;

    UPDATE public.users
    SET 
        "completedWelcomeCampaigns" = array_append("completedWelcomeCampaigns", p_campaign_id),
        "verifiedWelcomeCampaigns" = array_append("verifiedWelcomeCampaigns", p_campaign_id)
    WHERE "id" = p_user_id;

    -- Standard welcome campaign reward of 100 PWC
    PERFORM public.credit_wallet(
        p_user_id, 100.0, 'Welcome Campaign Reward: ' || p_campaign_id, 'campaign_escrow'
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. create_profile()
CREATE OR REPLACE FUNCTION public.create_profile(
    p_user_id UUID,
    p_email TEXT,
    p_username TEXT,
    p_avatar TEXT,
    p_referred_by UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_ref_code TEXT;
    v_wallet TEXT;
BEGIN
    v_ref_code := public.generate_referral_code();
    v_wallet := public.generate_account_number();

    INSERT INTO public.users (
        "id", "email", "username", "avatar", "referralCode", "referredBy", "walletNumber"
    ) VALUES (
        p_user_id, p_email, p_username, p_avatar, v_ref_code, p_referred_by, v_wallet
    );

    -- Apply Referral Credit
    IF p_referred_by IS NOT NULL THEN
        -- Insert into referral association
        INSERT INTO public.referrals ("referrerId", "referredId") VALUES (p_referred_by, p_user_id);
        
        -- Give referred user signup bonus
        PERFORM public.credit_wallet(p_user_id, 50.0, 'Referred Sign Up bonus', 'referral');
        
        -- Give referrer user invite bonus
        PERFORM public.credit_wallet(p_referred_by, 100.0, 'Referral Reward for inviting ' || p_username, 'referral');
        
        -- Create referrer notification
        PERFORM public.create_notification(
            p_referred_by, '👥 New Active Referral', 'Your referral code was claimed by ' || p_username || '. 100 PWC credited!', 'reward'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------
-- SECURITY TRIGGERS FOR PROFILE CREATION ON USER SIGNUP
-- -------------------------------------------------------------

-- Create user profile automatically when a user registers on Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_avatar TEXT;
    v_referred_by UUID;
BEGIN
    -- Extract user metadata
    v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
    v_avatar := COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200');
    v_referred_by := (new.raw_user_meta_data->>'referredBy')::UUID;

    -- Create profile utilizing helper function
    PERFORM public.create_profile(new.id, new.email, v_username, v_avatar, v_referred_by);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users (re-run as superuser on Supabase console)
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- -------------------------------------------------------------
-- UPDATED_AT TRIGGER DEFINITION
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set update triggers for tables
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE TRIGGER update_task_submissions_modtime BEFORE UPDATE ON public.task_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE TRIGGER update_campaigns_modtime BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE TRIGGER update_campaign_submissions_modtime BEFORE UPDATE ON public.campaign_submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE TRIGGER update_withdrawals_modtime BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
CREATE TRIGGER update_funding_requests_modtime BEFORE UPDATE ON public.funding_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
