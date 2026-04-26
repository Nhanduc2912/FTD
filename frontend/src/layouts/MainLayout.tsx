import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Receipt, CreditCard, LayoutDashboard, LogOut, BarChart2,
  Settings, Bell, X, Menu, Wallet, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { key: 'nav.dashboard',     path: '/app',                icon: LayoutDashboard },
  { key: 'nav.receipts',      path: '/app/receipts',       icon: Receipt },
  { key: 'nav.subscriptions', path: '/app/subscriptions',  icon: CreditCard },
  { key: 'nav.analytics',     path: '/app/analytics',      icon: BarChart2 },
  { key: 'nav.expenses',      path: '/app/expenses',       icon: Wallet },
];

export default function MainLayout() {
  const location  = useLocation();
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    localStorage.getItem('ftd_sidebar_collapsed') === 'true'
  );
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const toggleCollapse = () => {
    setSidebarCollapsed(v => {
      localStorage.setItem('ftd_sidebar_collapsed', String(!v));
      return !v;
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface" aria-label={t('common.loading')} aria-busy="true">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden">

      {/* ── Mobile overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar ──────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar-mobile"
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 z-40 h-full w-64 glass border-r border-border flex flex-col lg:hidden"
            aria-label="Main navigation"
          >
            <SidebarContent
              location={location} logout={logout}
              onClose={() => setSidebarOpen(false)}
              t={t} collapsed={false}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex flex-shrink-0 glass border-r border-border flex-col overflow-hidden"
        aria-label="Main navigation"
      >
        <SidebarContent
          location={location} logout={logout}
          t={t} collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </motion.aside>

      {/* ── Main content area ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border glass lg:px-6">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-surface-hover transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
                aria-expanded={notifOpen}
                aria-haspopup="true"
                className="relative p-2 rounded-xl hover:bg-surface-hover transition-colors"
              >
                <Bell size={20} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white leading-none" aria-hidden="true">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-80 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
                    style={{ overscrollBehavior: 'contain' }}
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="font-semibold">{t('nav.notifications')}</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:underline">
                          {t('nav.markAllRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-text-muted text-sm">{t('nav.noNotifications')}</p>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface-hover transition-colors flex items-start gap-3 ${n.read ? 'opacity-50' : ''}`}
                          >
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.daysLeft <= 3 ? 'bg-red-500' : 'bg-orange-400'}`} aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{n.title}</p>
                              <p className="text-xs text-text-muted truncate">{n.message}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <Link
              to="/app/settings"
              aria-label="Open settings"
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary hover:bg-primary/30 transition-colors"
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// ── SidebarContent ──────────────────────────────────────────────────────────
function SidebarContent({
  location, logout, onClose, t, collapsed, onToggleCollapse,
}: {
  location: ReturnType<typeof useLocation>;
  logout: () => void;
  onClose?: () => void;
  t: (key: string) => string;
  collapsed: boolean;
  onToggleCollapse?: () => void;
}) {
  const isActive = (path: string) =>
    path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path);

  return (
    <>
      {/* Logo row */}
      <div className="p-4 flex items-center justify-between border-b border-border min-h-[64px]">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black group-hover:bg-primary-dark transition-colors flex-shrink-0" aria-hidden="true">F</div>
            <span className="text-xl font-semibold tracking-tight" translate="no">FTD</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black hover:bg-primary-dark transition-colors" aria-hidden="true">F</div>
          </Link>
        )}
        {/* Mobile close */}
        {onClose && (
          <button onClick={onClose} aria-label="Close navigation" className="p-1 rounded-lg hover:bg-surface-hover transition-colors lg:hidden">
            <X size={18} aria-hidden="true" />
          </button>
        )}
        {/* Desktop collapse toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1 rounded-lg hover:bg-surface-hover transition-colors text-text-muted"
          >
            {collapsed
              ? <ChevronRight size={16} aria-hidden="true" />
              : <ChevronLeft size={16} aria-hidden="true" />
            }
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Main navigation">
        {/* Skip to main content */}
        <a href="#main-content" className="sr-only focus-visible:not-sr-only focus-visible:block focus-visible:px-4 focus-visible:py-2 focus-visible:mb-2 focus-visible:bg-primary focus-visible:text-white focus-visible:rounded-xl">
          Skip to content
        </a>

        {NAV_ITEMS.map(item => {
          const active = isActive(item.path);
          const Icon   = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? t(item.key) : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-[background-color,color] duration-200 relative ${
                collapsed ? 'justify-center' : ''
              } ${active ? 'text-white' : 'text-text-muted hover:text-white hover:bg-surface-hover'}`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/20 rounded-xl border border-primary/30"
                />
              )}
              <Icon size={20} className="relative z-10 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="font-medium relative z-10">{t(item.key)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-2 border-t border-border space-y-1">
        <Link
          to="/app/settings"
          aria-current={location.pathname === '/app/settings' ? 'page' : undefined}
          title={collapsed ? t('nav.settings') : undefined}
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-colors ${
            collapsed ? 'justify-center' : ''
          } ${location.pathname === '/app/settings' ? 'text-white bg-surface-hover' : 'text-text-muted hover:text-white hover:bg-surface-hover'}`}
        >
          <Settings size={20} aria-hidden="true" />
          {!collapsed && <span className="font-medium">{t('nav.settings')}</span>}
        </Link>
        <button
          onClick={logout}
          title={collapsed ? t('nav.logout') : undefined}
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-text-muted hover:text-white hover:bg-surface-hover transition-colors ${collapsed ? 'justify-center' : ''}`}
          aria-label="Log out of your account"
        >
          <LogOut size={20} aria-hidden="true" />
          {!collapsed && <span className="font-medium">{t('nav.logout')}</span>}
        </button>
      </div>
    </>
  );
}
