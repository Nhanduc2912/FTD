import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Receipt, CreditCard, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Receipts', path: '/receipts', icon: Receipt },
    { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
  ];

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-surface text-text">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-surface">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 glass border-r border-border flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="text-xl font-semibold tracking-tight text-text">FTD App</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                  isActive ? 'text-white' : 'text-text-muted hover:text-white hover:bg-surface-hover'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/20 rounded-xl border border-primary/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="font-medium relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-text-muted hover:text-white hover:bg-surface-hover transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
