import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ── Landing (public) ─────────────────────────────────────────
import LandingLayout from './layouts/LandingLayout';
import LandingHome    from './pages/landing/Home';
import Features       from './pages/landing/Features';
import Pricing        from './pages/landing/Pricing';
import About          from './pages/landing/About';
import Privacy        from './pages/landing/Privacy';
import Terms          from './pages/landing/Terms';
import Help           from './pages/landing/Help';

// ── Auth ─────────────────────────────────────────────────────
import Login    from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// ── App (protected) — lazy-loaded for better bundle splitting ─
import MainLayout from './layouts/MainLayout';
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const Receipts      = lazy(() => import('./pages/Receipts'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Analytics     = lazy(() => import('./pages/Analytics'));
const Expenses      = lazy(() => import('./pages/Expenses'));
const Settings      = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center" aria-label="Loading page…" aria-busy="true">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* ── Public landing ──────────────────────────────────── */}
      <Route element={<LandingLayout />}>
        <Route path="/"          element={<LandingHome />} />
        <Route path="/features"  element={<Features />} />
        <Route path="/pricing"   element={<Pricing />} />
        <Route path="/about"     element={<About />} />
        <Route path="/privacy"   element={<Privacy />} />
        <Route path="/terms"     element={<Terms />} />
        <Route path="/help"      element={<Help />} />
      </Route>

      {/* ── Auth ────────────────────────────────────────────── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Protected app (all under /app/*) ────────────────── */}
      <Route path="/app" element={<MainLayout />}>
        <Route index                  element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="receipts"        element={<Suspense fallback={<PageLoader />}><Receipts /></Suspense>} />
        <Route path="subscriptions"   element={<Suspense fallback={<PageLoader />}><Subscriptions /></Suspense>} />
        <Route path="analytics"       element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
        <Route path="expenses"        element={<Suspense fallback={<PageLoader />}><Expenses /></Suspense>} />
        <Route path="settings"        element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
      </Route>

      {/* Legacy redirect: old routes → new /app prefix */}
      <Route path="/dashboard"      element={<Navigate to="/app" replace />} />
      <Route path="/receipts"       element={<Navigate to="/app/receipts" replace />} />
      <Route path="/subscriptions"  element={<Navigate to="/app/subscriptions" replace />} />
      <Route path="/analytics"      element={<Navigate to="/app/analytics" replace />} />
      <Route path="/expenses"       element={<Navigate to="/app/expenses" replace />} />
      <Route path="/settings"       element={<Navigate to="/app/settings" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
