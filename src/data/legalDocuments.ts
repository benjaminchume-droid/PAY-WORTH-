export interface LegalSection {
  id: string;
  title: string;
  level: number;
}

export interface LegalDocument {
  id: string;
  slug: string;
  title: string;
  category: 'Core Agreements' | 'Rewards & Marketplace' | 'Security & Compliance' | 'Policies & Terms';
  version: string;
  lastUpdated: string;
  summary: string;
  content: string;
  sections: LegalSection[];
  readingTimeMinutes: number;
}

export const OFFICIAL_LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'terms',
    slug: 'terms-of-service',
    title: 'Terms of Service',
    category: 'Core Agreements',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 8,
    summary: 'The primary legal agreement governing account usage, eligibility, PayWorth Coins (PWC), memberships, marketplace rules, and platform conduct.',
    sections: [
      { id: 'sec-1', title: '1. Acceptance of Terms', level: 2 },
      { id: 'sec-2', title: '2. About PayWorth', level: 2 },
      { id: 'sec-3', title: '3. Eligibility', level: 2 },
      { id: 'sec-4', title: '4. User Accounts', level: 2 },
      { id: 'sec-5', title: '5. PayWorth Coins (PWC)', level: 2 },
      { id: 'sec-6', title: '6. Memberships', level: 2 },
      { id: 'sec-7', title: '7. Tasks and Campaigns', level: 2 },
      { id: 'sec-8', title: '8. Marketplace', level: 2 },
      { id: 'sec-9', title: '9. Wallet, Deposits, and Withdrawals', level: 2 },
      { id: 'sec-10', title: '10. Referrals', level: 2 },
      { id: 'sec-11', title: '11. Trust Score & Levels', level: 2 },
      { id: 'sec-12', title: '12. Prohibited Conduct', level: 2 },
      { id: 'sec-13', title: '13. No Guaranteed Earnings', level: 2 },
      { id: 'sec-14', title: '14. Technical Issues', level: 2 },
      { id: 'sec-15', title: '15. Platform Availability', level: 2 },
      { id: 'sec-16', title: '16. Privacy', level: 2 },
      { id: 'sec-17', title: '17. Intellectual Property', level: 2 },
      { id: 'sec-18', title: '18. Suspension and Termination', level: 2 },
      { id: 'sec-19', title: '19. Limitation of Liability', level: 2 },
      { id: 'sec-20', title: '20. Changes to These Terms', level: 2 },
      { id: 'sec-21', title: '21. Governing Law', level: 2 },
      { id: 'sec-22', title: '22. Contact', level: 2 }
    ],
    content: `# PayWorth Terms of Service

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Acceptance of Terms
Welcome to PayWorth ("PayWorth," "we," "our," or "us"). By creating an account, accessing, or using our platform, website, services, wallet, marketplace, games, campaigns, memberships, rewards, or related features, you agree to these Terms of Service ("Terms"). If you do not agree, you must not use PayWorth.

---

## 2. About PayWorth
PayWorth is a digital rewards and task marketplace where users may earn **PayWorth Coins (PWC)** by completing eligible tasks, participating in campaigns, referrals, community activities, games, and promotional events. PWC may be redeemed according to PayWorth's current redemption rules.

PayWorth is **not** an employer, investment platform, savings platform, or financial institution.

---

## 3. Eligibility
To use PayWorth, you must:
* Meet the minimum age required by applicable law.
* Provide accurate and truthful information.
* Maintain only one personal account unless expressly authorized.
* Comply with all applicable laws and these Terms.

---

## 4. User Accounts
You are responsible for:
* Protecting your login credentials.
* Maintaining accurate account information.
* All activity occurring under your account.

Google Sign-In, email verification, phone verification, or identity verification may be required for certain features.

---

## 5. PayWorth Coins (PWC)
PWC is PayWorth's internal digital rewards currency.
PWC may be earned through approved platform activities and may be spent on eligible platform features or redeemed where permitted.

PWC:
* Is not legal tender.
* Does not represent ownership in PayWorth.
* Does not constitute an investment or financial product.
* Has no guaranteed monetary value outside PayWorth.

PayWorth may update redemption rules, earning methods, and platform features with reasonable notice.

---

## 6. Memberships
Memberships provide access to additional features, benefits, limits, and opportunities.
Purchasing a membership does **not** guarantee:
* Tasks
* Rewards
* Profit
* Income
* Withdrawal approval
* Financial success

Membership purchases are final unless required otherwise by applicable law or our Membership & Refund Policy.

---

## 7. Tasks and Campaigns
Rewards are earned only after successful completion and verification.
Tasks may require:
* Manual review
* Automated verification
* Third-party confirmation
* Additional information

PayWorth may reject, reverse, or remove rewards obtained through fraud, abuse, technical errors, policy violations, or incomplete submissions.

---

## 8. Marketplace
Users and businesses may create campaigns by funding a Reward Pool.
Campaign creators are responsible for:
* Campaign content.
* Instructions.
* Compliance with applicable laws.
* Sufficient campaign funding.

PayWorth may reject, suspend, edit, or remove campaigns at its discretion.

---

## 9. Wallet, Deposits, and Withdrawals
PayWorth Wallet records:
* PWC balance
* Pending rewards
* Transaction history
* Transfers
* Withdrawals

Withdrawals may require:
* Identity verification
* Fraud review
* Minimum withdrawal thresholds
* Scheduled settlement
* Compliance checks

Submission of a withdrawal request does not guarantee approval or immediate payment.

---

## 10. Referrals
Referral rewards are intended for genuine referrals only.
The following are prohibited:
* Self-referrals
* Fake accounts
* Referral farms
* Multiple accounts
* Automated registrations
* Any attempt to manipulate referral rewards

Referral rewards obtained through abuse may be removed.

---

## 11. Trust Score & Levels
PayWorth may maintain Trust Scores, XP, Levels, Memberships, Badges, Rankings, and Achievements.
These systems are determined solely by PayWorth and may change over time.

---

## 12. Prohibited Conduct
Users must not:
* Use bots, scripts, macros, or automation.
* Exploit bugs or vulnerabilities.
* Upload illegal or misleading content.
* Attempt unauthorized access.
* Manipulate tasks or campaigns.
* Submit false evidence.
* Buy, sell, or transfer accounts.
* Harass other users.
* Interfere with platform security.

Violations may result in warnings, suspension, permanent bans, reward reversals, or legal action.

---

## 13. No Guaranteed Earnings
PayWorth does not guarantee:
* Earnings.
* Income.
* Rewards.
* Tasks.
* Campaign availability.
* Membership benefits beyond those expressly stated.
* Withdrawal approval.

Earnings depend on task availability, eligibility, successful verification, platform activity, user conduct, advertiser demand, and compliance with these Terms.

Past performance does not guarantee future rewards.

---

## 14. Technical Issues
Occasionally, technical errors may affect balances, rewards, campaigns, transactions, or services.
PayWorth reserves the right to investigate and correct errors, including reversing incorrect credits or debits where appropriate.

---

## 15. Platform Availability
PayWorth may perform maintenance, updates, security improvements, or service modifications at any time.
Temporary interruptions do not create liability for PayWorth.

---

## 16. Privacy
Your use of PayWorth is also governed by our Privacy Policy.
By using PayWorth, you consent to the collection and processing of your information as described in that policy.

---

## 17. Intellectual Property
All PayWorth software, branding, logos, designs, interfaces, graphics, source code, content, trademarks, and platform assets remain the exclusive property of PayWorth or its licensors.
No rights are granted except as expressly provided in these Terms.

---

## 18. Suspension and Termination
PayWorth may suspend, restrict, or permanently terminate any account that:
* Violates these Terms.
* Engages in fraud.
* Creates security risks.
* Abuses the platform.
* Is required by law or a competent authority.

Rewards or balances obtained through violations may be forfeited where permitted by law.

---

## 19. Limitation of Liability
To the maximum extent permitted by law, PayWorth shall not be liable for indirect, incidental, consequential, special, or punitive damages arising from use of the platform.
Nothing in these Terms excludes liability that cannot legally be excluded.

---

## 20. Changes to These Terms
We may modify these Terms from time to time.
Material changes will be communicated through the website, application, or other appropriate channels.
Continued use of PayWorth after changes become effective constitutes acceptance of the updated Terms.

---

## 21. Governing Law
These Terms shall be governed by the applicable laws of the jurisdiction in which PayWorth is registered, unless otherwise required by applicable consumer protection laws.

---

## 22. Contact
For questions regarding these Terms, please contact PayWorth through the official support channels listed on our website or application.

By creating an account or using PayWorth, you acknowledge that you have read, understood, and agree to these Terms of Service.`
  },
  {
    id: 'privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    category: 'Core Agreements',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 7,
    summary: 'Explains how PayWorth collects, uses, stores, protects, and shares your information when using our website, apps, wallet, and services.',
    sections: [
      { id: 'sec-p1', title: '1. Introduction', level: 2 },
      { id: 'sec-p2', title: '2. Information We Collect', level: 2 },
      { id: 'sec-p3', title: '3. Why We Collect Your Information', level: 2 },
      { id: 'sec-p4', title: '4. Identity Verification (KYC)', level: 2 },
      { id: 'sec-p5', title: '5. Payment Providers', level: 2 },
      { id: 'sec-p6', title: '6. Cookies & Similar Technologies', level: 2 },
      { id: 'sec-p7', title: '7. Data Security', level: 2 },
      { id: 'sec-p8', title: '8. Fraud Prevention', level: 2 },
      { id: 'sec-p9', title: '9. Information Sharing', level: 2 },
      { id: 'sec-p10', title: '10. Data Retention', level: 2 },
      { id: 'sec-p11', title: '11. Your Rights', level: 2 },
      { id: 'sec-p12', title: '12. Third-Party Services', level: 2 },
      { id: 'sec-p13', title: '13. Children\'s Privacy', level: 2 },
      { id: 'sec-p14', title: '14. International Data Processing', level: 2 },
      { id: 'sec-p15', title: '15. Changes to This Policy', level: 2 },
      { id: 'sec-p16', title: '16. Contact Us', level: 2 }
    ],
    content: `# PayWorth Privacy Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Introduction
Welcome to PayWorth. Your privacy matters to us. This Privacy Policy explains how PayWorth ("PayWorth," "we," "our," or "us") collects, uses, stores, protects, and shares your information when you use our website, applications, services, wallet, marketplace, campaigns, memberships, games, and related features.

By using PayWorth, you agree to this Privacy Policy.

---

## 2. Information We Collect

### Account Information
We may collect:
* Full name
* Username
* Email address
* Phone number
* Date of birth (where required)
* Profile picture (optional)

### Authentication Data
* Google Sign-In information
* Login history
* Session identifiers
* Device identifiers
* Security logs

### Wallet Information
* PWC balance
* Deposits
* Withdrawals
* Transfers
* Reward history
* Transaction history

### Marketplace Data
* Campaigns created
* Campaign submissions
* Reward pools
* Marketplace analytics

### Technical Information
* Device model
* Browser type
* Operating system
* IP address
* Language
* Time zone
* Cookies and similar technologies

---

## 3. Why We Collect Your Information
We use your information to:
* Create and manage your account.
* Verify your identity where required.
* Process rewards and withdrawals.
* Operate the PayWorth Wallet.
* Deliver tasks and campaigns.
* Prevent fraud and abuse.
* Improve platform performance.
* Provide customer support.
* Send important updates.
* Comply with legal and regulatory obligations.

---

## 4. Identity Verification (KYC)
Certain features, including withdrawals and payment services, may require identity verification through licensed third-party providers.
We aim to collect only the information reasonably necessary for these purposes.

---

## 5. Payment Providers
Deposits, withdrawals, virtual accounts, and payment processing may be handled by licensed payment providers.
Those providers process your information according to their own privacy policies and applicable laws.

---

## 6. Cookies & Similar Technologies
PayWorth uses cookies and similar technologies to:
* Keep you signed in.
* Remember preferences.
* Improve security.
* Measure performance.
* Personalize your experience.

You may control cookies through your browser settings, though some features may not function properly if cookies are disabled.

---

## 7. Data Security
We implement reasonable technical and organizational safeguards, including:
* Encryption in transit.
* Secure authentication.
* Access controls.
* Security monitoring.
* Audit logging.
* Fraud detection.
* Regular security updates.

While we strive to protect your information, no online system can guarantee absolute security.

---

## 8. Fraud Prevention
To protect our users and platform, we may analyze account activity to detect:
* Multiple accounts
* Referral abuse
* Automated activity
* Suspicious transactions
* Unusual login behavior
* Fraudulent task submissions

Where necessary, accounts may be temporarily restricted while reviews are completed.

---

## 9. Information Sharing
We do **not** sell your personal information.
We may share information only when necessary with:
* Licensed payment providers
* Identity verification providers
* Cloud infrastructure providers
* Analytics providers
* Customer support providers
* Law enforcement or regulators where legally required

---

## 10. Data Retention
We retain information only for as long as necessary to:
* Operate PayWorth.
* Maintain security.
* Prevent fraud.
* Resolve disputes.
* Comply with legal obligations.

When information is no longer required, it will be securely deleted or anonymized where appropriate.

---

## 11. Your Rights
Subject to applicable law, you may have the right to:
* Access your personal information.
* Correct inaccurate information.
* Update your account.
* Request deletion of eligible data.
* Request a copy of your information.
* Withdraw consent where applicable.

Some requests may be limited where retention is required by law or necessary to protect the platform.

---

## 12. Third-Party Services
PayWorth may contain links or integrations with third-party services, including payment providers, advertisers, and partners.
We are not responsible for the privacy practices or content of third-party services.

---

## 13. Children's Privacy
PayWorth is intended only for users who meet the minimum age requirements set out in our Terms of Service and applicable law.
We do not knowingly collect personal information from individuals who are not legally permitted to use the platform.

---

## 14. International Data Processing
Your information may be stored or processed in countries where our service providers operate.
We take reasonable measures to ensure appropriate safeguards are in place for cross-border data transfers where required.

---

## 15. Changes to This Policy
We may update this Privacy Policy periodically.
Material changes will be communicated through the PayWorth platform, website, email, or other appropriate channels.
Continued use of PayWorth after updates become effective constitutes acceptance of the revised Privacy Policy.

---

## 16. Contact Us
If you have questions about this Privacy Policy, your personal information, or your privacy rights, please contact PayWorth through the official support channels listed on our website or application.`
  },
  {
    id: 'community',
    slug: 'community-guidelines',
    title: 'Community Guidelines',
    category: 'Policies & Terms',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 5,
    summary: 'Standards for honesty, respect, fair participation, single-account rules, and marketplace conduct for all members of PayWorth.',
    sections: [
      { id: 'sec-c1', title: '1. Be Honest', level: 2 },
      { id: 'sec-c2', title: '2. One Person, One Account', level: 2 },
      { id: 'sec-c3', title: '3. Respect Other Users', level: 2 },
      { id: 'sec-c4', title: '4. Fair Task Participation', level: 2 },
      { id: 'sec-c5', title: '5. Marketplace Rules', level: 2 },
      { id: 'sec-c6', title: '6. Referral Program', level: 2 },
      { id: 'sec-c7', title: '7. Games and Rewards', level: 2 },
      { id: 'sec-c8', title: '8. Trust & Reputation', level: 2 },
      { id: 'sec-c9', title: '9. Fraud & Abuse', level: 2 },
      { id: 'sec-c10', title: '10. Content Standards', level: 2 },
      { id: 'sec-c11', title: '11. Reporting Issues', level: 2 },
      { id: 'sec-c12', title: '12. Enforcement', level: 2 }
    ],
    content: `# PayWorth Community Guidelines

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## Welcome
PayWorth is built on trust, fairness, and genuine opportunities. These Community Guidelines help ensure that everyone has a safe, respectful, and rewarding experience.

---

# 1. Be Honest
Use PayWorth fairly and honestly.
Do not:
* Create fake accounts.
* Share false information.
* Submit fake screenshots or proofs.
* Impersonate another person.
* Misrepresent your identity or eligibility.

---

# 2. One Person, One Account
Unless expressly approved by PayWorth:
* One person may only own one personal account.
* Creating multiple accounts to gain additional rewards, referrals, or bonuses is prohibited.

---

# 3. Respect Other Users
Treat all members respectfully.
Do not:
* Harass or threaten others.
* Use abusive or discriminatory language.
* Spam chats or campaigns.
* Share offensive or illegal content.

---

# 4. Fair Task Participation
Only complete tasks that you genuinely qualify for. Do not submit fake proofs or use bots/automation.

---

# 5. Marketplace Rules
Campaign creators must provide clear instructions and review submissions fairly. Workers must follow instructions accurately and submit genuine work.

---

# 6. Referral Program
Referrals must represent genuine new users. Self-referrals, referral farms, and device farms are strictly prohibited.

---

# 7. Games and Rewards
Games are designed for entertainment and engagement. Cheating, bot usage, or code modification will result in account forfeiture.

---

# 8. Trust & Reputation
Your Trust Score reflects your behavior on PayWorth. Positive activity improves access to premium features.

---

# 9. Fraud & Abuse
PayWorth has zero tolerance for scams, identity theft, money laundering, and payment fraud.

---

# 10. Content Standards
Illegal, harmful, pornographic, violent, or deceptive content is banned.

---

# 11. Reporting Issues
Help keep PayWorth safe by reporting fraudulent campaigns, fake accounts, and vulnerabilities.

---

# 12. Enforcement
Violations result in warnings, reward removal, Trust Score reductions, suspension, or permanent account bans.`
  },
  {
    id: 'aup',
    slug: 'acceptable-use-policy',
    title: 'Acceptable Use Policy',
    category: 'Policies & Terms',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 5,
    summary: 'Defines permitted activities, prohibited conduct, security rules, automation restrictions, and enforcement mechanisms.',
    sections: [
      { id: 'sec-a1', title: '1. Purpose', level: 2 },
      { id: 'sec-a2', title: '2. Acceptable Use', level: 2 },
      { id: 'sec-a3', title: '3. Prohibited Activities', level: 2 },
      { id: 'sec-a4', title: '4. Fair Use', level: 2 },
      { id: 'sec-a5', title: '5. Third-Party Services', level: 2 },
      { id: 'sec-a6', title: '6. Monitoring', level: 2 },
      { id: 'sec-a7', title: '7. Enforcement', level: 2 }
    ],
    content: `# PayWorth Acceptable Use Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Purpose
This Acceptable Use Policy ("AUP") explains what is permitted when using PayWorth. It applies to all users, advertisers, campaign creators, and visitors.

---

# 2. Acceptable Use
You may use PayWorth to complete tasks, earn PWC, launch lawful campaigns, refer genuine users, purchase memberships, and utilize wallet services.

---

# 3. Prohibited Activities

### Fraud & Abuse
* Multiple accounts, account buying/selling, fake identities, false evidence, and system exploits.

### Automation
* Bots, scripts, auto-clickers, macros, browser automation, and AI farming.

### Security Attacks
* Unauthorized access, scanning, malware distribution, or denial-of-service attempts.

### Payments & Wallet
* Money laundering, stolen card usage, or unauthorized balance manipulation.

---

# 4. Fair Use
Platform resources are shared. Excessive or abusive traffic damaging platform stability will be throttled or blocked.

---

# 5. Monitoring
To protect users, PayWorth logs login history, device IDs, transaction footprints, and security events.

---

# 6. Enforcement
Actions include warnings, feature restrictions, reward forfeiture, account bans, or legal prosecution.`
  },
  {
    id: 'rewards',
    slug: 'reward-withdrawal-policy',
    title: 'Reward & Campaign Policy',
    category: 'Rewards & Marketplace',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 6,
    summary: 'Governs how PayWorth Coins (PWC) are earned, verified, held in pending status, spent, and settled via central withdrawals.',
    sections: [
      { id: 'sec-r1', title: '1. Purpose', level: 2 },
      { id: 'sec-r2', title: '2. Earning PayWorth Coins (PWC)', level: 2 },
      { id: 'sec-r3', title: '3. Reward Verification', level: 2 },
      { id: 'sec-r4', title: '4. Pending Rewards', level: 2 },
      { id: 'sec-r5', title: '5. Reward Adjustments', level: 2 },
      { id: 'sec-r6', title: '6. Wallet Balance', level: 2 },
      { id: 'sec-r7', title: '7. Withdrawals & Settlement', level: 2 }
    ],
    content: `# PayWorth Reward & Withdrawal Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Purpose
This Reward & Withdrawal Policy explains how users earn, receive, spend, transfer, and redeem **PayWorth Coins (PWC)** through the PayWorth platform.

---

# 2. Earning PayWorth Coins (PWC)
Users earn PWC through verified tasks, campaigns, referrals, daily check-ins, achievements, mini-games, and marketplace activities.

---

# 3. Reward Verification
Rewards undergo automated audit, manual review, or sponsor verification before clearing into spendable balances.

---

# 4. Pending Rewards
Pending balances cannot be spent or withdrawn until verification clears. Incomplete or fake submissions will be rejected.

---

# 5. Reward Adjustments
PayWorth reserves the right to correct or reverse rewards resulting from technical glitches, duplicate submissions, or fraud.

---

# 6. Withdrawals & Settlement
Eligible PWC can be converted to supported fiat or virtual accounts based on tier limits and KYC verification status. Central settlement operates on scheduled batches.`
  },
  {
    id: 'campaigns',
    slug: 'campaign-creator-policy',
    title: 'Campaign Creator Policy',
    category: 'Rewards & Marketplace',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 5,
    summary: 'Rules for campaign creation, reward pool funding, escrow management, submission review standards, and advertiser duties.',
    sections: [
      { id: 'sec-cmp1', title: '1. Purpose', level: 2 },
      { id: 'sec-cmp2', title: '2. Eligibility', level: 2 },
      { id: 'sec-cmp3', title: '3. Reward Pool & Escrow', level: 2 },
      { id: 'sec-cmp4', title: '4. Campaign Requirements', level: 2 },
      { id: 'sec-cmp5', title: '5. Prohibited Campaigns', level: 2 }
    ],
    content: `# PayWorth Campaign Creator Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Purpose
Governs the creation, escrow funding, management, and submission reviews for campaigns published on the PayWorth Marketplace.

---

# 2. Reward Pool & Escrow
Every campaign must be 100% funded in PWC escrow before going live. Unused funds from cancelled or expired campaigns are returned minus service fees.

---

# 3. Reviewing Submissions
Campaign creators must review worker submissions fairly and in good faith within the designated review timeframe.`
  },
  {
    id: 'membership',
    slug: 'membership-refund-policy',
    title: 'Membership & Refund Policy',
    category: 'Rewards & Marketplace',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 5,
    summary: 'Details membership tiers, multipliers, upgrade rules, finality of purchases, chargebacks, and refund exception criteria.',
    sections: [
      { id: 'sec-m1', title: '1. Membership Tiers', level: 2 },
      { id: 'sec-m2', title: '2. Benefits & Multipliers', level: 2 },
      { id: 'sec-m3', title: '3. No Guaranteed Earnings', level: 2 },
      { id: 'sec-m4', title: '4. Refund Policy & Exceptions', level: 2 }
    ],
    content: `# PayWorth Membership & Refund Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Membership Tiers
Offers 8 progressive tiers (Dark Bronze, Bright Iron, Shining Silver, Shimmering Gold, Aspiring Platinum, Resilient Diamond, Epic Legend, Mythical) with enhanced multipliers and limits.

---

## 2. Refund Policy
Membership purchases are generally final and non-refundable once activated, except in cases of billing duplication or unauthorized transactions verified by support.`
  },
  {
    id: 'fraud',
    slug: 'fraud-prevention-policy',
    title: 'Fraud Prevention Policy',
    category: 'Security & Compliance',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 6,
    summary: 'PayWorth zero-tolerance policy against fraudulent activity, automated earning, multi-accounting, and security exploitation.',
    sections: [
      { id: 'sec-f1', title: '1. Zero-Tolerance Approach', level: 2 },
      { id: 'sec-f2', title: '2. Prohibited Conduct', level: 2 },
      { id: 'sec-f3', title: '3. Detection & Investigation', level: 2 },
      { id: 'sec-f4', title: '4. Enforcement Actions', level: 2 }
    ],
    content: `# PayWorth Fraud Prevention Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Zero-Tolerance Policy
PayWorth maintains a zero-tolerance stance against reward manipulation, fake evidence, referral farming, and automated botting.

---

## 2. Detection & Enforcement
Automated risk scoring, IP analysis, device fingerprinting, and manual audits detect suspicious activity. Violations result in account termination and balance forfeiture.`
  },
  {
    id: 'cookies',
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    category: 'Security & Compliance',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 4,
    summary: 'Explains essential, functional, performance, security, and analytics cookie usage and preference controls.',
    sections: [
      { id: 'sec-ck1', title: '1. What Are Cookies', level: 2 },
      { id: 'sec-ck2', title: '2. Types of Cookies We Use', level: 2 },
      { id: 'sec-ck3', title: '3. Managing Cookie Preferences', level: 2 }
    ],
    content: `# PayWorth Cookie Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Types of Cookies
* **Essential:** Authentication, security, session tokens.
* **Performance & Analytics:** Usage patterns, crash reporting.
* **Functional & Marketing:** User preferences, personalized experiences.`
  },
  {
    id: 'retention',
    slug: 'data-retention-policy',
    title: 'Data Retention Policy',
    category: 'Security & Compliance',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 5,
    summary: 'Rules for how long user account data, transaction ledgers, audit logs, and security records are stored and safely erased.',
    sections: [
      { id: 'sec-dr1', title: '1. Data Storage Standards', level: 2 },
      { id: 'sec-dr2', title: '2. Retention Schedules', level: 2 },
      { id: 'sec-dr3', title: '3. Account Deletion & Erasure', level: 2 }
    ],
    content: `# PayWorth Data Retention Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Principles
Information is retained only as long as necessary for platform operation, legal compliance, fraud prevention, and audit obligations.`
  },
  {
    id: 'ip',
    slug: 'intellectual-property-policy',
    title: 'Intellectual Property Policy',
    category: 'Policies & Terms',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 4,
    summary: 'PayWorth brand asset ownership, limited usage licenses, user-generated content licensing, and copyright infringement reporting.',
    sections: [
      { id: 'sec-ip1', title: '1. Brand Ownership', level: 2 },
      { id: 'sec-ip2', title: '2. User Content License', level: 2 }
    ],
    content: `# PayWorth Intellectual Property Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

All PayWorth branding, code, logos, and UI designs belong exclusively to PayWorth or its licensors. Users retain ownership of submitted content while granting PayWorth operational hosting licenses.`
  },
  {
    id: 'security',
    slug: 'security-disclosure-policy',
    title: 'Security Disclosure Policy',
    category: 'Security & Compliance',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 4,
    summary: 'Guidelines for security researchers to responsibly test, report, and remediate platform vulnerabilities.',
    sections: [
      { id: 'sec-s1', title: '1. Responsible Disclosure', level: 2 },
      { id: 'sec-s2', title: '2. Prohibited Vulnerability Testing', level: 2 }
    ],
    content: `# PayWorth Security Disclosure Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

PayWorth welcomes good-faith security research. Reports must be transmitted confidentially through official channels before public disclosure.`
  },
  {
    id: 'disclaimer',
    slug: 'disclaimer',
    title: 'Disclaimer',
    category: 'Policies & Terms',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 3,
    summary: 'General platform disclaimers regarding no guaranteed income, non-investment status of PWC, and third-party integrations.',
    sections: [
      { id: 'sec-dc1', title: '1. General Information', level: 2 },
      { id: 'sec-dc2', title: '2. Non-Investment Notice', level: 2 }
    ],
    content: `# PayWorth Disclaimer

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

PayWorth is provided "as is". PayWorth Coins (PWC) and memberships are not securities, investments, or bank deposits.`
  },
  {
    id: 'kyc',
    slug: 'kyc-aml-policy',
    title: 'KYC & AML Policy',
    category: 'Security & Compliance',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 5,
    summary: 'Know Your Customer (KYC) and Anti-Money Laundering (AML) requirements, document verification tiers, and transaction monitoring.',
    sections: [
      { id: 'sec-kyc1', title: '1. Identity Verification Requirements', level: 2 },
      { id: 'sec-kyc2', title: '2. AML Transaction Audits', level: 2 }
    ],
    content: `# PayWorth KYC & AML Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

## 1. Verification Requirements
High-volume withdrawals and virtual bank accounts require valid government ID verification, selfie match, and phone validation.`
  },
  {
    id: 'api',
    slug: 'developer-api-terms',
    title: 'Developer & API Terms',
    category: 'Policies & Terms',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 4,
    summary: 'Terms governing third-party developer integrations, API rate limits, key security, webhooks, and acceptable technical use.',
    sections: [
      { id: 'sec-api1', title: '1. License & API Keys', level: 2 },
      { id: 'sec-api2', title: '2. Rate Limits & Security', level: 2 }
    ],
    content: `# PayWorth Developer & API Terms

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

Developers accessing PayWorth APIs must keep credentials secure, adhere to rate limits, and refrain from scraping or reverse-engineering.`
  },
  {
    id: 'data-processing',
    slug: 'data-processing-notice',
    title: 'Data Processing Notice',
    category: 'Security & Compliance',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 4,
    summary: 'Technical notice detailing data processing activities, cloud subprocessors, encryption parameters, and regional routing.',
    sections: [
      { id: 'sec-dp1', title: '1. Technical Subprocessors', level: 2 },
      { id: 'sec-dp2', title: '2. Security Encryption Specs', level: 2 }
    ],
    content: `# PayWorth Data Processing Notice

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

PayWorth processes user account information, verification proofs, and ledger transactions via encrypted TLS 1.3 connections and AES-256 encrypted database vaults.`
  },
  {
    id: 'copyright',
    slug: 'copyright-policy',
    title: 'Copyright Policy',
    category: 'Policies & Terms',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 3,
    summary: 'DMCA and Copyright notice submission procedures, counter-notices, and repeated infringer account termination rules.',
    sections: [
      { id: 'sec-cp1', title: '1. DMCA Notice Procedure', level: 2 },
      { id: 'sec-cp2', title: '2. Counter-Notice', level: 2 }
    ],
    content: `# PayWorth Copyright Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

If you believe content hosted on PayWorth infringes your copyright, submit a formal notice to our legal agent at legal@payworth.com.`
  },
  {
    id: 'account-termination',
    slug: 'account-termination-policy',
    title: 'Account Termination Policy',
    category: 'Policies & Terms',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 4,
    summary: 'Explains conditions under which accounts may be suspended, closed, or permanently terminated, and appeal procedures.',
    sections: [
      { id: 'sec-at1', title: '1. Voluntary Closure', level: 2 },
      { id: 'sec-at2', title: '2. Involuntary Suspension & Bans', level: 2 }
    ],
    content: `# PayWorth Account Termination Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

Accounts violating community guidelines, engaging in fraud, or using bots are subject to immediate termination and forfeiture of unverified rewards.`
  },
  {
    id: 'earning-rules',
    slug: 'earning-rules',
    title: 'Earning Rules',
    category: 'Rewards & Marketplace',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 4,
    summary: 'Detailed operational rules for task completion, proof formatting, maximum daily task limits, and multiplier calculations.',
    sections: [
      { id: 'sec-er1', title: '1. Task Proof Standards', level: 2 },
      { id: 'sec-er2', title: '2. Multipliers & Daily Caps', level: 2 }
    ],
    content: `# PayWorth Earning Rules

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

Task rewards are awarded upon submission of valid completion proofs. Multipliers apply to base task rewards up to tier daily limits.`
  },
  {
    id: 'pwc-policy',
    slug: 'pwc-policy',
    title: 'PWC Policy',
    category: 'Rewards & Marketplace',
    version: 'v2026.1',
    lastUpdated: 'July 21, 2026',
    readingTimeMinutes: 4,
    summary: 'Official specifications for PayWorth Coins (PWC), internal ledger mechanics, redemption parameters, and expiration conditions.',
    sections: [
      { id: 'sec-pwc1', title: '1. PWC Nature & Status', level: 2 },
      { id: 'sec-pwc2', title: '2. Redemption Rules', level: 2 }
    ],
    content: `# PayWorth Coin (PWC) Policy

**Effective Date:** July 21, 2026
**Last Updated:** July 21, 2026
**Version:** v2026.1

PWC is PayWorth\'s internal reward accounting token. PWC balances do not accrue interest and cannot be transferred outside approved platform features.`
  }
];

export const CURRENT_LEGAL_VERSION = 'v2026.1';
