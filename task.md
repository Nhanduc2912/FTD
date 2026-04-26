# FTD Implementation Tasks

## Phase 1 – Bug Fixes
- [x] AuthContext.tsx: lazy init localStorage
- [ ] Login.tsx: htmlFor/id, focus-visible, ellipsis, aria-live, spellCheck
- [ ] Register.tsx: same as Login
- [ ] Dashboard.tsx: useTranslation, Intl.DateTimeFormat, aria-hidden icons
- [ ] index.css: touch-action, prefers-reduced-motion
- [ ] MainLayout.tsx: translate notification strings, fix Expenses monthly trend API call
- [ ] Expenses.tsx: fetch all-time data for trend chart

## Phase 2 – Routing Restructure
- [ ] App.tsx: move app routes to /app/*, / → landing
- [ ] MainLayout.tsx: update all hrefs to /app/ prefix
- [ ] AuthContext: redirect logic

## Phase 3 – Landing Site
- [ ] LandingLayout.tsx: header + footer
- [ ] pages/landing/Home.tsx: hero, features, social proof, pricing, CTA
- [ ] pages/landing/Features.tsx
- [ ] pages/landing/Pricing.tsx
- [ ] pages/landing/About.tsx
- [ ] pages/landing/Privacy.tsx
- [ ] pages/landing/Terms.tsx
- [ ] pages/landing/Help.tsx

## Phase 4 – Git Commits
- [ ] commit: fix(auth,a11y,i18n): bug fixes phase 1
- [ ] commit: refactor(routing): restructure to /app/* prefix
- [ ] commit: feat(landing): multi-page marketing site
