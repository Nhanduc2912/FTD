import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/auth/register', { name, email, password });
      login(response.data.token, { _id: response.data._id, name: response.data.name, email: response.data.email });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 glass rounded-3xl border border-border relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-3xl text-white font-bold mb-6 shadow-lg shadow-primary/30">
            F
          </div>
          <h1 className="text-3xl font-bold text-text-h mb-2">Create Account</h1>
          <p className="text-text-muted">Join FTD to secure your receipts and track subscriptions.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {error && <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 mt-4 transition-colors shadow-lg shadow-primary/20"
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
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
