# PayWorth Enterprise Architecture & Operations Manual

## 1. System Overview
PayWorth is a modern, enterprise-grade liquid-glass fintech and micro-task ledger platform powered by React 18, TypeScript, Vite, React Router v6, Tailwind CSS, and Supabase.

## 2. Directory & Modular Architecture
```
src/
├── app/
├── components/          # Reusable & Layout Components
│   ├── ui/             # Core UI Design System (Button, Card, SkeletonLoader, etc.)
│   ├── ErrorBoundary.tsx
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── SEOAndRouteManager.tsx
├── config/
│   └── screenRegistry.ts # Unified Router & SEO Navigation Authority
├── engines/            # Context & State Providers
│   └── StateContext.tsx
├── lib/                # Core Utility Modules
│   ├── diagnostics.ts   # Structured Logging & Performance Tracking
│   ├── security.ts      # Cryptographic PIN Hashing & Lockout Engine
│   └── supabase.ts      # Database & Auth Client
├── services/           # Business Logic Service Layer
│   ├── walletService.ts        # Atomic Transfers & Double-Entry Ledger
│   ├── notificationService.ts  # System Dispatch & Inbox
│   ├── searchService.ts        # Global Enterprise Search Engine
│   └── cacheService.ts         # Intelligent TTL Memory Cache
├── tests/
│   └── businessLogic.test.ts   # Automated Verification Test Suite
├── types.ts            # Platform TypeScript Definitions
└── vercel.json         # Production SPA Route Rewrite Rules
```

## 3. Router & Navigation Architecture
- **Single Authority**: Navigations are handled exclusively via React Router v6 (`BrowserRouter`, `useNavigate`, `useLocation`, `<Routes>`, `<Route>`).
- **Deep Linking & Rewrites**: Configured in `vercel.json` with `{"source": "/(.*)", "destination": "/index.html"}` to support direct page loads and refreshes across all routes (`/wallet`, `/marketplace`, `/profile`, `/admin`, etc.).
- **Code Splitting**: Major page views are lazy-loaded via `React.lazy()` and wrapped in `<Suspense fallback={<PageSkeleton />}>`.

## 4. Wallet, PIN Security & Double-Entry Ledger
- **PIN Verification**: Hashed with a unique per-user salt and SHA-256. Includes exponential lockout protections after 5 failed attempts.
- **Double-Entry Ledger**: Every financial transaction records matching `debit` and `credit` ledger entries containing exact timestamp, category, reference IDs, and resulting balances (`balanceAfter`).
- **Atomic Rollbacks**: Transactions validate authentication, account status, daily limits, and PIN before balance mutability. Failure at any step cancels the transaction.

## 5. Enterprise Diagnostics & Error Recovery
- **React Error Boundary**: Surrounds application root (`ErrorBoundary.tsx`). Component exceptions render a styled recovery dashboard with reload options and diagnostic log captures.
- **Diagnostics Logger**: `diagnostics.ts` intercepts global uncaught errors and promise rejections with performance timing helpers.

## 6. Global Search & Caching
- **Search Service**: `SearchService.query()` performs cross-index matching over navigation screens, active micro-tasks, marketplace campaigns, and mini-games.
- **TTL Cache**: `CacheManager` provides in-memory time-to-live cache storage with automatic stale key eviction.

## 7. Build & Deployment Guidelines
1. **Linting Verification**: `npm run lint` (`tsc --noEmit`)
2. **Production Bundle**: `npm run build` (`vite build`)
3. **Deployment**: Deploys seamlessly to Vercel or Cloud Run container environments binding to port 3000.
