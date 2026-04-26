import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/app" replace />;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      login(response.data.token, { _id: response.data._id, name: response.data.name, email: response.data.email });
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Skip link */}
      <a href="#register-form" className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2 focus-visible:bg-primary focus-visible:text-white focus-visible:rounded-lg">
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
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-text-muted">Join FTD to secure your receipts & track subscriptions.</p>
        </div>

        <form id="register-form" onSubmit={handleRegister} className="space-y-5" noValidate>
          {error && (
            <div role="alert" aria-live="polite" className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-[border-color,box-shadow]"
              placeholder="Nguyễn Văn A…"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-text-muted mb-2">Email Address</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password" className="block text-sm font-medium text-text-muted mb-2">Password</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 pr-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-[border-color,box-shadow]"
                placeholder="At least 6 characters…"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 mt-4 transition-colors shadow-lg shadow-primary/20"
          >
            {isSubmitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
