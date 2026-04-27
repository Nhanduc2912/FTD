import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/app" replace />;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      login(response.data.token, {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role || 'user',
        status: response.data.status || 'active',
      });
      navigate("/app");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg relative overflow-hidden">
      {/* Skip link */}
      <a href="#register-form" className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:bg-primary focus-visible:text-white focus-visible:rounded-lg">
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
            <h1 className="text-3xl font-black mb-2">Create an Account</h1>
            <p className="text-text-muted">Start taking control of your financial life today.</p>
          </div>

          <form id="register-form" onSubmit={handleRegister} className="space-y-5" noValidate>
            {error && (
              <div role="alert" aria-live="polite"
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-text-muted mb-2">
                Full Name
              </label>
              <input
                id="reg-name" type="text" name="name"
                autoComplete="name" spellCheck={false}
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                placeholder="John Doe" required
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-text-muted mb-2">
                Email Address
              </label>
              <input
                id="reg-email" type="email" name="email"
                autoComplete="email" spellCheck={false}
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                placeholder="you@example.com" required
              />
            </div>

            <div>
              <label htmlFor="reg-pwd" className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-pwd" type={showPassword ? 'text' : 'password'} name="password"
                  autoComplete="new-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                  placeholder="At least 6 characters" required minLength={6}
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
              {isSubmitting ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-text-muted text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold focus-visible:outline-none focus-visible:underline">
              Sign In
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
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Abstract dark workspace" 
          className="w-full h-full object-cover rounded-3xl shadow-2xl grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-24 left-24 right-24 p-8 glass border border-white/10 rounded-2xl backdrop-blur-xl">
          <p className="text-lg font-medium text-white/90 leading-relaxed mb-4">
            "I stopped worrying about hidden fees and expired warranties the day I started using this."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary" />
            <div>
              <p className="font-semibold text-white text-sm">Mark T.</p>
              <p className="text-white/60 text-xs">Software Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
