import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/app" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, { _id: response.data._id, name: response.data.name, email: response.data.email });
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Skip link */}
      <a href="#login-form" className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2 focus-visible:bg-primary focus-visible:text-white focus-visible:rounded-lg">
        Skip to form
      </a>

      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 glass rounded-3xl border border-border relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" aria-label="Back to FTD home" className="inline-block">
            <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-3xl text-white font-bold mb-6 shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors" aria-hidden="true">
              F
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-text-muted">Sign in to access your trusted documents.</p>
        </div>

        <form id="login-form" onSubmit={handleLogin} className="space-y-5" noValidate>
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-text-muted mb-2">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-[border-color,box-shadow]"
              placeholder="you@example.com…"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-text-muted mb-2">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-[border-color,box-shadow]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 transition-colors shadow-lg shadow-primary/20"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Create One
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
