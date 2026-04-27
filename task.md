# FTD Implementation Tasks — Cập nhật 2026-04-27

## ✅ Đã hoàn thành

### Phase 1 – Bug Fixes
- [x] AuthContext.tsx: lazy init localStorage
- [x] Login.tsx: htmlFor/id, focus-visible, ellipsis, aria-live, spellCheck, Eye/EyeOff toggle
- [x] Register.tsx: same as Login + Eye/EyeOff toggle
- [x] Dashboard.tsx: useTranslation, Intl.DateTimeFormat, WelcomeBanner onboarding
- [x] index.css: touch-action, prefers-reduced-motion, color-scheme
- [x] MainLayout.tsx: sidebar collapse button (ChevronLeft/Right), collapsible to icon-only mode

### Phase 2 – Routing Restructure
- [x] App.tsx: routes under /app/*, / → landing (public), lazy loading all pages
- [x] MainLayout.tsx: all hrefs updated to /app/* prefix, aria-current, skip link
- [x] AuthContext: redirect logic (isAuthenticated → /app, guest → /login)

### Phase 3 – Landing Site
- [x] LandingLayout.tsx: sticky glass header + 4-column footer + mobile drawer
- [x] pages/landing/Home.tsx: hero, stats bar, features grid, how-it-works, testimonials, pricing preview, CTA
- [x] pages/landing/Features.tsx: alternating feature sections
- [x] pages/landing/Pricing.tsx: free/pro cards + FAQ accordion
- [x] pages/landing/About.tsx: mission + team
- [x] pages/landing/Privacy.tsx: GDPR-compliant 10-section policy
- [x] pages/landing/Terms.tsx: 13-section ToS
- [x] pages/landing/Help.tsx: FAQ accordion + 6 feature guides

### Phase 4 – P0/P1/P2/P3 Improvements
- [x] Receipts.tsx: full i18n (25+ keys), Intl locale-aware, toast, UpgradePrompt, IReceipt type
- [x] Subscriptions.tsx: full i18n, search filter, cycle tabs, Intl, focus-visible, aria-label
- [x] Analytics.tsx: stable Recharts dataKey constants, empty-state CTAs with Link buttons
- [x] Settings.tsx: 2-column responsive layout, password toggles, danger zone, plan section
- [x] ErrorBoundary.tsx: global React error boundary
- [x] WelcomeBanner.tsx: onboarding for zero-data users (dismissible, localStorage)
- [x] UpgradePrompt.tsx: shown when LIMIT_REACHED from API
- [x] Backend: rate limiting (authLimiter 20/15min, apiLimiter 300/15min)
- [x] Backend: DB indexes on Receipt, Subscription, Expense models
- [x] Backend: /api/health endpoint
- [x] Backend: planLimits middleware (50 receipts, 10 subs cap for Free)
- [x] Backend: deleteAccount endpoint (password-confirm + cascade cleanup)
- [x] Backend: User model extended with plan/billing/Stripe fields
- [x] Email: branded HTML templates (dark-mode, Intl formatters)
- [x] Cron: production schedule 08:00 daily, uses branded email templates
- [x] react-hot-toast: global Toaster in main.tsx
- [x] i18n: en.json + vi.json fully synced (receipts, settings, upgrade, onboarding, analytics keys)

---

## 🔄 Còn lại (ưu tiên cao → thấp)

### P1 — Performance
- [ ] Pagination: expense controller (page/limit query params)
- [ ] Pagination: receipt controller
- [ ] Pagination: subscription controller
- [ ] Pagination UI: Expenses page (Prev/Next buttons, page indicator)
- [ ] Pagination UI: Receipts page

### P2 — UX
- [ ] Drag-and-drop upload zone in Receipts (replace plain file input)
- [ ] Expenses.tsx: monthly trend fetch all expenses (not just current month filter)
- [ ] MainLayout.tsx notifications: translate "All clear" + "Mark all read" strings
- [ ] toast on Expenses add/delete/edit (currently silent)
- [ ] toast on Subscriptions edit (currently only add/delete have toast)

### P3 — Monetisation
- [ ] Stripe integration: create checkout session endpoint
- [ ] Stripe webhooks: handle subscription activated/cancelled events
- [ ] UpgradePrompt: wire "Upgrade" button → Stripe Checkout URL
- [ ] Settings: show real subscription period end date (from Stripe)
- [ ] Cron: send welcome email on user register

### P4 — Optional / Future
- [ ] Pagination: Analytics data (currently fetches all-time)
- [ ] Export: CSV export for expenses/receipts
- [ ] PWA: service worker + manifest for mobile install
- [ ] 2FA: TOTP-based two-factor authentication
- [ ] OAuth: Google / GitHub login
