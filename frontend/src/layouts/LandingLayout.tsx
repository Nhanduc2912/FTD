import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing',  href: '/pricing' },
  { label: 'About',    href: '/about' },
  { label: 'Help',     href: '/help' },
];

export default function LandingLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">

      {/* ── Skip Link ──────────────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:bg-primary focus-visible:text-white focus-visible:rounded-lg"
      >
        Skip to content
      </a>

      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? 'bg-surface/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" aria-label="FTD home" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/30 group-hover:bg-primary-dark transition-colors" aria-hidden="true">
              F
            </div>
            <span className="text-xl font-bold tracking-tight" translate="no">FTD</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                aria-current={location.pathname === link.href ? 'page' : undefined}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-white bg-surface-hover'
                    : 'text-text-muted hover:text-white hover:bg-surface-hover'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-text-muted hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-primary/25"
            >
              Get Started Free <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-surface-hover transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl overflow-hidden"
              style={{ overscrollBehavior: 'contain' }}
            >
              <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:text-white hover:bg-surface-hover transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="border-border my-2" />
                <Link to="/login"    className="px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:text-white hover:bg-surface-hover transition-colors">Sign In</Link>
                <Link to="/register" className="px-4 py-3 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-dark text-white transition-colors text-center">Get Started Free</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page Content ───────────────────────────────────── */}
      <main id="main-content" className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black" aria-hidden="true">F</div>
                <span className="font-bold" translate="no">FTD</span>
              </Link>
              <p className="text-text-muted text-sm leading-relaxed">
                Your personal finance hub — receipts, subscriptions, and expenses in one place.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-3 text-sm">Product</h3>
              <ul className="space-y-2">
                {[['Features', '/features'], ['Pricing', '/pricing'], ['Help Center', '/help']].map(([label, href]) => (
                  <li key={href}><Link to={href} className="text-text-muted hover:text-white text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-3 text-sm">Company</h3>
              <ul className="space-y-2">
                {[['About', '/about']].map(([label, href]) => (
                  <li key={href}><Link to={href} className="text-text-muted hover:text-white text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-3 text-sm">Legal</h3>
              <ul className="space-y-2">
                {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([label, href]) => (
                  <li key={href}><Link to={href} className="text-text-muted hover:text-white text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-text-muted text-sm">
              © {new Date().getFullYear()} <span translate="no">FTD</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-text-muted hover:text-white text-sm transition-colors">Privacy</Link>
              <Link to="/terms"   className="text-text-muted hover:text-white text-sm transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
