# AGENTS.md — FTD Agent Operating Manual

> **Read this file in full before writing a single line of code.**
> This document defines the non-negotiable workflow every AI agent must follow when working on the FTD codebase. It was derived from real development sessions on this project and reflects what actually works here.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Layout](#2-repository-layout)
3. [Tech Stack & Versions](#3-tech-stack--versions)
4. [Development Server Rules](#4-development-server-rules)
5. [Before You Write Code](#5-before-you-write-code)
6. [Coding Standards](#6-coding-standards)
7. [TypeScript Rules](#7-typescript-rules)
8. [React / Frontend Rules](#8-react--frontend-rules)
9. [Backend Rules](#9-backend-rules)
10. [i18n Rules](#10-i18n-rules)
11. [Build & Verification](#11-build--verification)
12. [Git Commit Convention](#12-git-commit-convention)
13. [GitHub Push Workflow](#13-github-push-workflow)
14. [UX Audit Checklist](#14-ux-audit-checklist)
15. [Common Pitfalls (Learned the Hard Way)](#15-common-pitfalls-learned-the-hard-way)

---

## 1. Project Overview

**FTD (Finance Trusted Documents)** is a personal finance management web app with:

- **Receipt Vault** — digitise and track warranties
- **Subscription Guillotine** — track recurring charges, get renewal alerts
- **Expense Tracker** — daily spending log by category
- **Smart Analytics** — charts, projections, burn rate
- **Multi-language** — English and Vietnamese (`i18next`)

**Primary GitHub remote:** `https://github.com/Nhanduc2912/FTD`

---

## 2. Repository Layout

```
FTD/
├── frontend/                  # Vite + React + TypeScript
│   ├── src/
│   │   ├── api.ts             # Axios instance (baseURL from VITE_API_URL)
│   │   ├── App.tsx            # Route definitions (React Router v6)
│   │   ├── index.css          # Global styles (Tailwind v4 @theme tokens)
│   │   ├── main.tsx           # Entry — AuthProvider > BrowserRouter > App
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useNotifications.ts
│   │   ├── i18n/
│   │   │   ├── index.ts       # i18next config
│   │   │   ├── en.json        # English translations (source of truth)
│   │   │   └── vi.json        # Vietnamese translations
│   │   ├── layouts/
│   │   │   ├── LandingLayout.tsx  # Public pages header/footer
│   │   │   └── MainLayout.tsx     # Protected app shell (sidebar)
│   │   └── pages/
│   │       ├── landing/       # Public marketing pages (no auth)
│   │       │   ├── Home.tsx
│   │       │   ├── Features.tsx
│   │       │   ├── Pricing.tsx
│   │       │   ├── About.tsx
│   │       │   ├── Privacy.tsx
│   │       │   ├── Terms.tsx
│   │       │   └── Help.tsx
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       ├── NotFound.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Receipts.tsx
│   │       ├── Subscriptions.tsx
│   │       ├── Analytics.tsx
│   │       ├── Expenses.tsx
│   │       └── Settings.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── jobs/
│   └── package.json
├── .agents/skills/            # Agent skill definitions
├── PROJECT_CONTEXT.md         # High-level project context
└── AGENTS.md                  # ← this file
```

### Route Structure (IMPORTANT)

```
/                 → LandingLayout > Home       (public)
/features         → LandingLayout > Features   (public)
/pricing          → LandingLayout > Pricing    (public)
/about            → LandingLayout > About      (public)
/privacy          → LandingLayout > Privacy    (public)
/terms            → LandingLayout > Terms      (public)
/help             → LandingLayout > Help       (public)
/login            → Login                      (public, no layout)
/register         → Register                   (public, no layout)
/app              → MainLayout > Dashboard     (protected)
/app/receipts     → MainLayout > Receipts      (protected)
/app/subscriptions→ MainLayout > Subscriptions (protected)
/app/analytics    → MainLayout > Analytics     (protected)
/app/expenses     → MainLayout > Expenses      (protected)
/app/settings     → MainLayout > Settings      (protected)
*                 → NotFound                   (catch-all)
```

> **Never** create routes at the old flat paths (`/dashboard`, `/receipts`, etc.). Legacy redirects exist for backward compatibility but new links must use `/app/*`.

---

## 3. Tech Stack & Versions

| Layer     | Technology          | Notes |
|-----------|---------------------|-------|
| Frontend  | React 19 + Vite 8   | `npm run dev` → port 5173 |
| Styling   | Tailwind CSS v4     | Uses `@theme` tokens in `index.css`, NOT `tailwind.config.js` |
| Animation | Framer Motion       | **Do not pass `ease: 'easeOut'` as a string** — TS error. Omit `ease` or use cubic-bezier array |
| Charts    | Recharts            | `ResponsiveContainer` wraps all charts |
| i18n      | react-i18next       | `useTranslation()` hook everywhere |
| Auth      | JWT in localStorage | Key: `token`. Context: `AuthContext` |
| HTTP      | Axios               | Instance in `src/api.ts` auto-attaches `Authorization: Bearer` |
| Backend   | Express + TypeScript| Port 5000 |
| DB        | MongoDB Atlas       | Mongoose ODM |
| Runtime   | Node + ts-node-dev  | `npm run dev` in `/backend` |

---

## 4. Development Server Rules

### Starting both servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Expected: "Server FTD đang chạy tại http://localhost:5000" + "MongoDB Connected"

# Terminal 2 — Frontend
cd frontend
npm run dev
# Expected: "VITE ready in Xms → Local: http://localhost:5173/"
```

### PowerShell execution policy

On Windows with PowerShell, `npm` may fail due to script restrictions:

```bash
# WRONG — will fail with "running scripts is disabled"
npm run dev

# CORRECT — wrap in cmd
cmd /c "npm run dev"
```

**Always use `cmd /c "..."` when running npm scripts on this machine.**

### Port conflicts

If port 5173 is busy, Vite auto-increments to 5174, 5175, etc. Check the terminal output for the actual port before opening the browser.

---

## 5. Before You Write Code

Run this checklist mentally before touching any file:

1. **Read relevant existing files first.** Never assume what a file contains.
2. **Check `en.json`** — if you need translated text, the key must already exist or you must add it to *both* `en.json` and `vi.json`.
3. **Confirm the route** — all app pages live under `/app/*`. Public pages have no `/app` prefix.
4. **Check for `useTranslation`** — every page/component that renders user-visible text must use `const { t, i18n } = useTranslation()`.
5. **Check for `Intl` usage** — never hardcode date or currency formats. Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with `i18n.language`.
6. **No `transition: all`** — always list specific properties: `transition-[color,background-color,border-color]`.

---

## 6. Coding Standards

### Naming

- **Files:** PascalCase for components (`Dashboard.tsx`), camelCase for utils/hooks (`useNotifications.ts`)
- **Variables/functions:** camelCase
- **Types/Interfaces:** PascalCase, prefixed `I` for Mongoose models (`IExpense`)
- **i18n keys:** dot-notation namespaces (`expenses.totalThisMonth`)

### File size

- Keep components under **300 lines**. If longer, extract sub-components into the same file (hoisted below the main export) or a separate file.

### Comments

- Only comment non-obvious logic. Don't comment what the code obviously does.
- Use `// ── Section Name ─────────────────` horizontal rules to separate major sections in long files.

### Imports

- No barrel (`index.ts`) re-exports for components. Import directly:
  ```ts
  // ✅ Correct
  import Dashboard from './pages/Dashboard';
  // ❌ Wrong
  import { Dashboard } from './pages';
  ```
- Group imports: React → third-party → local, separated by blank lines.

---

## 7. TypeScript Rules

### Strict mode is ON

`tsconfig.json` uses strict TypeScript. The following patterns cause build failures:

```ts
// ❌ TS2322 — t() returns TFunctionReturn, not string
<span>{t('some.key', fallback)}</span>

// ✅ Fix — cast explicitly
<span>{String(t('some.key', fallback))}</span>

// ❌ TS error — framer-motion ease string
transition={{ duration: 0.5, ease: 'easeOut' }}

// ✅ Fix — omit ease (default is fine) or use array
transition={{ duration: 0.5 }}
transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}

// ❌ Reading localStorage during useState() call
const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

// ✅ Lazy initializer
const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
```

### No `any` without justification

Use `any[]` only for dynamic API responses. Add a comment explaining why.

---

## 8. React / Frontend Rules

### Data fetching

```ts
// ✅ ALWAYS parallel-fetch independent data (async-parallel rule)
const [subsRes, receiptsRes, expensesRes] = await Promise.all([
  api.get('/subscriptions'),
  api.get('/receipts'),
  api.get('/expenses'),
]);

// ❌ Sequential waterfall is forbidden for independent calls
const subsRes = await api.get('/subscriptions');
const receiptsRes = await api.get('/receipts'); // waits unnecessarily
```

### Memoization

```ts
// Currency/date formatters: always memo on i18n.language
const fmt = useMemo(
  () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD' }),
  [i18n.language]
);
```

### Sub-components

```ts
// ✅ Hoist sub-components BELOW main export (rerender-no-inline-components)
export default function Dashboard() { ... }

function StatCard({ ... }: any) { ... }  // hoisted, not defined inside Dashboard
```

### Static data

```ts
// ✅ Hoist static arrays/objects outside the component (rendering-hoist-jsx)
const FEATURES = [ ... ]; // defined at module level
const fadeUp = { initial: ..., animate: ... }; // motion variants at module level

export default function Home() {
  // component just references FEATURES and fadeUp — no recreation on each render
}
```

### Lazy loading (all app pages)

```ts
// In App.tsx — ALL protected pages must be lazy-loaded
const Dashboard = lazy(() => import('./pages/Dashboard'));
// Wrap in Suspense with a spinner fallback
<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
```

### Accessibility must-haves

Every PR must pass this mental checklist:

- `<label htmlFor="input-id">` linked to `<input id="input-id">`
- Decorative icons: `aria-hidden="true"`
- Interactive icons/buttons without visible text: `aria-label="..."`
- Error messages: `role="alert"` + `aria-live="polite"`
- `focus-visible:ring-2` NOT `focus:ring-2` (avoid ring on mouse click)
- `<button>` for actions, `<a>` / `<Link>` for navigation — never swap them
- Submit buttons: `aria-busy={isSubmitting}` during loading state
- Modals/drawers: `style={{ overscrollBehavior: 'contain' }}`

### Styling rules

```css
/* ❌ Forbidden */
transition: all 0.3s;

/* ✅ Required — list specific properties */
transition-property: color, background-color, border-color;
/* or Tailwind shorthand */
className="transition-[color,background-color]"
```

- Use CSS variables from `@theme` in `index.css` — **never** hardcode hex colors
- `glass` class = glassmorphism card (defined in `index.css`)
- `gradient-text` class = purple→indigo→cyan gradient text
- `card-hover` class = translateY(-4px) lift on hover

---

## 9. Backend Rules

### API-first

Always define the Mongoose schema and Express route **before** building the frontend UI for that feature.

### Controller pattern

```ts
// All controllers follow: req, res, try/catch, structured JSON response
export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await Expense.find({ user: req.user!._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### Auth middleware

All protected routes use `protect` middleware from `src/middleware/authMiddleware.ts`. The decoded user is at `req.user`.

### Running backend

```bash
cd backend
cmd /c "npm run dev"
# ts-node-dev will restart automatically on file changes
```

---

## 10. i18n Rules

### Translation file structure

`src/i18n/en.json` is the **source of truth**. Vietnamese translations in `vi.json` must mirror the exact same key structure.

### Namespaces (current)

| Namespace | Usage |
|-----------|-------|
| `nav.*` | Sidebar navigation labels |
| `dashboard.*` | Dashboard page |
| `receipts.*` | Receipts page |
| `subscriptions.*` | Subscriptions page |
| `expenses.*` | Expenses page |
| `analytics.*` | Analytics page |
| `settings.*` | Settings page |
| `common.*` | Shared: loading, error, categories |

### Rules

1. **Every user-visible string must use `t()`** — no hardcoded English text in components.
2. Add new keys to BOTH `en.json` and `vi.json` in the same commit.
3. Dynamic keys must cast to `String()` in JSX: `{String(t(`prefix.${variable}`))}`.
4. Language is persisted to `localStorage` under key `ftd_language`.
5. Language switcher lives in **Settings page** (`/app/settings`).

---

## 11. Build & Verification

### Mandatory before every commit

```bash
# 1. TypeScript type-check + production build
cd frontend
cmd /c "npm run build"
# Must exit code 0. If exit code 1 — fix ALL errors before committing.

# 2. Verify in browser (dev server)
cmd /c "npm run dev"
# Open http://localhost:5173 (or next available port shown in terminal)
```

### What to check in the browser

- [ ] Landing page `/` loads without login
- [ ] Login redirects to `/app` after success
- [ ] Sidebar active state highlights correct item
- [ ] Language switch (Settings → Tiếng Việt) updates all labels immediately
- [ ] No console errors (open DevTools → Console)
- [ ] Charts render (Recharts needs data — add a test expense/subscription if needed)

### Backend verification

```bash
cd backend
cmd /c "npm run dev"
# Check: "MongoDB Connected" appears. If not, check .env MONGO_URI.
```

---

## 12. Git Commit Convention

Follow **Conventional Commits** with scope. Match the style of existing commits in this repo:

```
type(scope): short imperative summary (max 72 chars)

- Bullet describing a specific change
- Another change detail
- Use present tense: "add", "fix", "remove" — not "added", "fixed"

Refs: #issue (if applicable)
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or page |
| `fix` | Bug fix |
| `refactor` | Code restructure without behavior change |
| `perf` | Performance improvement |
| `style` | CSS/styling only, no logic change |
| `docs` | Documentation only |
| `chore` | Build config, dependencies, tooling |
| `a11y` | Accessibility improvements |
| `i18n` | Translation additions or changes |

### Scopes (use the most specific)

`auth`, `routing`, `landing`, `dashboard`, `receipts`, `subscriptions`, `analytics`, `expenses`, `settings`, `a11y`, `i18n`, `perf`, `backend`, `api`, `cron`, `build`

### Real examples from this repo

```
feat(landing): add complete multi-page marketing site

- Home: hero, stats bar, 6-feature grid, 3-step how-it-works, testimonials
- Features: alternating text/visual layout per module
- Pricing: free/pro cards with FAQ accordion
- Privacy: 10-section GDPR-compliant policy
- Terms: 13-section ToS
- Help: 6 accordion feature guides + troubleshooting FAQ
- LandingLayout: sticky glass header, mobile drawer, 4-column footer
```

```
fix(auth,a11y,perf): resolve UX audit findings across core pages

- AuthContext: lazy-init localStorage to avoid re-reads on every render
- Login/Register: htmlFor+id, focus-visible, aria-live, spellCheck=false
- Dashboard: useTranslation, Intl.NumberFormat/DateTimeFormat, parallel fetch
- index.css: touch-action, prefers-reduced-motion, focus-visible baseline
```

```
refactor(routing): restructure all app routes under /app/* prefix

- App.tsx: move protected routes to /app/*, add lazy() for bundle splitting
- MainLayout: update all links to /app/*, aria-current, skip-to-content
- Add legacy redirects /receipts → /app/receipts for backward compat
```

### Commit message file workflow (avoid escaping hell on Windows)

When the commit message is multi-line, **never** try to inline it in `cmd /c`. Instead:

```bash
# Step 1: write message to temp file
# (agent creates .commit_msg.txt with full message)

# Step 2: commit using -F flag
cmd /c "git add <files> && git commit -F .commit_msg.txt"

# Step 3: delete temp file
cmd /c "del .commit_msg.txt"
```

---

## 13. GitHub Push Workflow

### After each completed feature or bug fix

```bash
# 1. Stage only the files changed for this feature
cmd /c "git add frontend/src/pages/Dashboard.tsx frontend/src/i18n/en.json frontend/src/i18n/vi.json"

# 2. Commit (use message file for multi-line)
cmd /c "git commit -F .commit_msg.txt"

# 3. Push
cmd /c "git push origin main"

# 4. Verify output shows: "main -> main" with commit hashes
```

### Commit granularity rules

| Scope of change | Commits |
|----------------|---------|
| Bug fixes across multiple files | 1 commit with `fix(scope1,scope2)` |
| Routing restructure | Separate commit `refactor(routing)` |
| New feature (page + API) | 1 commit `feat(feature-name)` |
| New landing section | Grouped with other landing in 1 `feat(landing)` |
| i18n keys added for existing feature | Squash into the feature commit |
| i18n keys added as standalone update | `i18n: add missing Vietnamese translations` |

**Never** mix unrelated changes in a single commit.

### What NOT to commit

```gitignore
node_modules/
dist/
.env
*.commit_msg*.txt     # temp commit message files
fix-*.ps1             # temp scripts
```

---

## 14. UX Audit Checklist

Run this before every PR. Based on [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines).

### Forms

- [ ] Every `<input>` has a paired `<label htmlFor="id">`
- [ ] `type="email"` inputs have `spellCheck={false}` and `autoComplete="email"`
- [ ] Password inputs have `autoComplete="current-password"` or `"new-password"`
- [ ] Error message has `role="alert"` and `aria-live="polite"`
- [ ] Submit button has `aria-busy={isSubmitting}` and stays enabled until request starts
- [ ] Loading state uses `…` (ellipsis U+2026), not `...` (three periods)

### Focus & Keyboard

- [ ] No `focus:ring-*` — use `focus-visible:ring-*` instead
- [ ] Never `outline-none` without a focus-visible replacement
- [ ] Skip-to-content link on every layout

### Animation

- [ ] All animated components respect `prefers-reduced-motion` (handled globally in `index.css`)
- [ ] Animate only `transform` and `opacity` (compositor-friendly)
- [ ] No `transition: all`

### Content

- [ ] No hardcoded date/number formats — use `Intl.DateTimeFormat` / `Intl.NumberFormat`
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Flex children that may contain long text have `min-w-0` to allow truncation
- [ ] Numbers in tables use `tabular-nums` class

### Destructive actions

- [ ] Delete/cancel buttons show a confirmation dialog/modal before executing
- [ ] Never delete immediately on first click

---

## 15. Common Pitfalls (Learned the Hard Way)

### 1. framer-motion `ease` string causes TS build failure

```ts
// ❌ Causes: Type 'string' is not assignable to type 'Easing | Easing[]'
transition={{ duration: 0.5, ease: 'easeOut' }}

// ✅ Simply omit ease — framer-motion default is fine
transition={{ duration: 0.5 }}
```

### 2. `t()` return type in JSX

```tsx
// ❌ Causes TS2322: Type 'object' not assignable to ReactI18NextChildren
<td>{t(`ns.${dynamicKey}`, fallback)}</td>

// ✅ Cast explicitly
<td>{String(t(`ns.${dynamicKey}`, fallback))}</td>
```

### 3. `useState(localStorage.getItem(...))` is not lazy

```ts
// ❌ Reads localStorage on every render cycle
const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

// ✅ Lazy initializer — reads once on mount
const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
```

### 4. npm on PowerShell is blocked

```powershell
# ❌ npm : File cannot be loaded because running scripts is disabled
npm run dev

# ✅ Always use cmd wrapper
cmd /c "npm run dev"
```

### 5. Multi-line git commit on Windows

```bash
# ❌ Escaping nightmare in cmd/PowerShell
git commit -m "feat: line1\nline2"

# ✅ Write to file, commit with -F
# (create .commit_msg.txt → git commit -F .commit_msg.txt → del .commit_msg.txt)
```

### 6. Verifying the correct dev server port

After `npm run dev`, **read the terminal output** — don't assume port 5173. If it says `5174`, open that.

### 7. `transition-all` is banned

Tailwind's `transition` class = `transition: all` → violates animation guidelines. Always be explicit:

```
transition-colors        = color, background-color, border-color, text-decoration-color, fill, stroke
transition-[opacity,transform]  = opacity and transform only
```

### 8. Active sidebar route matching

```ts
// ❌ startsWith('/app') matches ALL /app/* routes including /app/receipts for the Dashboard link
const isActive = (path: string) => location.pathname.startsWith(path);

// ✅ Exact match for index, prefix for children
const isActive = (path: string) =>
  path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path);
```

### 9. Static data inside components causes re-renders

```ts
// ❌ Array recreated on every render
export default function Home() {
  const FEATURES = [ ... ]; // new reference every render
}

// ✅ Hoist to module level
const FEATURES = [ ... ]; // created once

export default function Home() { ... }
```

### 10. Recharts needs a string key that matches data property exactly

```ts
// If data looks like: [{ month: 'Jan', 'Expenses': 120 }]
// The Bar dataKey must be exactly the same string:
<Bar dataKey={t('nav.expenses')} /> // ← will break if t() returns something different!

// ✅ Use a stable string key in your data object
const trendKey = 'amount';
const data = months.map(m => ({ month: m.label, [trendKey]: total }));
<Bar dataKey={trendKey} />
```

---

## Quick Reference Card

```
START WORK:
  1. Read affected files
  2. Check en.json for i18n keys
  3. Confirm route structure (/app/* for protected)

WRITE CODE:
  4. Follow TypeScript strict rules
  5. Use useTranslation() for all text
  6. Parallel fetch with Promise.all()
  7. Hoist static data outside components
  8. Never transition:all

BUILD CHECK:
  9. cmd /c "npm run build" → exit 0 required
  10. Fix ALL TypeScript errors before commit

COMMIT:
  11. Write .commit_msg.txt
  12. git add <specific files only>
  13. git commit -F .commit_msg.txt
  14. del .commit_msg.txt
  15. git push origin main

VERIFY:
  16. git log --oneline -3 (confirm commits look right)
  17. Check GitHub repo URL to confirm push
```
