import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
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
      login(response.data.token, {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
      });
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg relative overflow-hidden">
      {/* Skip link */}
      <a href="#login-form" className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:bg-primary focus-visible:text-white focus-visible:rounded-lg">
        Skip to form
      </a>

      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <Link to="/" aria-label="Back to FTD home" className="inline-block">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-2xl text-white font-bold mb-8 shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors" aria-hidden="true">
                F
              </div>
            </Link>
            <h1 className="text-3xl font-black mb-2">Welcome Back</h1>
            <p className="text-text-muted">Sign in to access your trusted documents.</p>
          </div>

          <form id="login-form" onSubmit={handleLogin} className="space-y-5" noValidate>
            {error && (
              <div role="alert" aria-live="polite"
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-text-muted mb-2">
                Email Address
              </label>
              <input
                id="login-email" type="email" name="email"
                autoComplete="email" spellCheck={false}
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                placeholder="you@example.com" required
              />
            </div>

            <div>
              <label htmlFor="login-pwd" className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-pwd" type={showPassword ? 'text' : 'password'} name="password"
                  autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                  placeholder="••••••••" required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-surface-hover transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20 mt-4"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-text-muted text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold focus-visible:outline-none focus-visible:underline">
              Create one now
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:flex w-1/2 bg-surface border-l border-border relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-violet-500/10 pointer-events-none" aria-hidden="true" />
        <motion.img 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          src="/images/auth_side_image.png" 
          alt="Abstract 3D finance illustration" 
          className="w-full h-full object-cover rounded-3xl shadow-2xl"
        />
        <div className="absolute bottom-24 left-24 right-24 p-8 glass border border-white/10 rounded-2xl backdrop-blur-xl">
          <p className="text-lg font-medium text-white/90 leading-relaxed mb-4">
            "Finally, a dashboard that gives me complete clarity on where my money goes, without the clutter."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-violet-500" />
            <div>
              <p className="font-semibold text-white text-sm">Elena R.</p>
              <p className="text-white/60 text-xs">Small Business Owner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
