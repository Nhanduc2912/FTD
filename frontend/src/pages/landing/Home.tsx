import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Receipt,
  CreditCard,
  BarChart2,
  Wallet,
  ShieldCheck,
  Bell,
  ChevronRight,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Hero3DVisual from "../../components/Hero3DVisual";

// ── Static data (hoisted outside component – rendering-hoist-jsx) ───────────
const FEATURES = [
  {
    icon: Receipt,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Receipt Vault",
    desc: "Digitize paper receipts before the thermal ink fades. Track warranties and never miss an expiry date.",
  },
  {
    icon: CreditCard,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    title: "Subscription Guillotine",
    desc: "See every recurring charge in one dashboard. Cancel the ones draining your wallet silently.",
  },
  {
    icon: Wallet,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    title: "Expense Tracker",
    desc: "Log daily spending by category. Charts reveal exactly where your money disappears each month.",
  },
  {
    icon: BarChart2,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Smart Analytics",
    desc: "Spending trends, monthly burn rate, warranty value — all visualised in beautiful interactive charts.",
  },
  {
    icon: Bell,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    title: "Proactive Alerts",
    desc: "Get notified before warranties expire or subscriptions renew. No more surprised charges.",
  },
  {
    icon: ShieldCheck,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    title: "Secure & Private",
    desc: "Your data is encrypted at rest. We never sell your financial information to third parties.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create a Free Account",
    desc: "Sign up in under 60 seconds — no credit card required.",
  },
  {
    num: "02",
    title: "Add Your Data",
    desc: "Upload receipts, log subscriptions, or add expenses. Starts tracking instantly.",
  },
  {
    num: "03",
    title: "Get Full Control",
    desc: "View analytics, set alerts, and cut the costs that no longer serve you.",
  },
];

const TESTIMONIALS = [
  {
    name: "Minh T.",
    role: "Freelance Designer",
    quote:
      "FTD saved me $340/year by showing me subscriptions I completely forgot about. Worth every second to set up.",
  },
  {
    name: "Sarah K.",
    role: "Product Manager",
    quote:
      "Finally a tool where I can see all my receipts AND track expenses in one place. The warranty alerts alone are gold.",
  },
  {
    name: "Duy N.",
    role: "Software Engineer",
    quote:
      "Switched from 3 separate apps to FTD. The analytics dashboard is exactly what I needed to understand my spending.",
  },
];

const STATS = [
  { value: "50,000+", label: "Receipts Saved" },
  { value: "$2.4M", label: "Subscriptions Tracked" },
  { value: "12,000+", label: "Active Users" },
  { value: "98%", label: "Satisfaction Rate" },
];

// ── Fade-in animation variant ────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function LandingHome() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center px-4 py-24 lg:py-0 overflow-hidden">
        {/* Background glow */}
        <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              Free to use — No credit card needed
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] text-wrap-balance mb-6">
              Take Control of Your <br className="hidden lg:block" />
              <span className="gradient-text">Financial Life</span>
            </h1>

            <p className="text-xl text-text-muted leading-relaxed mb-10 text-wrap-pretty max-w-xl mx-auto lg:mx-0">
              Track receipts before warranties expire, cut subscriptions silently draining your account,
              and understand where every dollar goes — all in one beautiful dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 transition-colors text-lg"
              >
                Start for Free <ChevronRight size={20} aria-hidden="true" />
              </Link>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 text-text-muted hover:text-white border border-border hover:border-primary/40 px-8 py-4 rounded-2xl transition-[color,border-color] text-lg font-medium"
              >
                See All Features <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            {/* Trust signals */}
            <p className="mt-6 text-text-muted text-sm flex items-center justify-center lg:justify-start gap-3 flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" aria-hidden="true" /> No spam</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" aria-hidden="true" /> Cancel anytime</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" aria-hidden="true" /> Data encrypted</span>
            </p>
          </motion.div>

          {/* Right 3D Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative hidden lg:block"
          >
            <Hero3DVisual />
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section
        className="border-y border-border bg-surface/50"
        aria-label="Key statistics"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <motion.div key={stat.label} {...fadeUp}>
                <dt className="text-text-muted text-sm mb-1">{stat.label}</dt>
                <dd className="text-3xl font-black gradient-text tabular-nums">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        id="features"
        aria-labelledby="features-heading"
      >
        <motion.div className="text-center mb-16" {...fadeUp}>
          <h2
            id="features-heading"
            className="text-4xl font-black mb-4 text-wrap-balance"
          >
            Everything You Need
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Six powerful modules designed to give you complete financial
            awareness.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`p-6 rounded-2xl border glass card-hover ${f.bg}`}
            >
              <div className={`inline-flex p-3 rounded-xl border mb-4 ${f.bg}`}>
                <f.icon size={22} className={f.color} aria-hidden="true" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it Works ──────────────────────────────────────── */}
      <section
        className="bg-surface/40 border-y border-border py-24"
        aria-labelledby="how-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2
              id="how-heading"
              className="text-4xl font-black mb-4 text-wrap-balance"
            >
              Up & Running in 3 Steps
            </h2>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              No complex setup. No lengthy onboarding. Just open and go.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center p-8 rounded-2xl glass border border-border"
              >
                <span
                  className="text-6xl font-black gradient-text mb-5"
                  aria-hidden="true"
                >
                  {step.num}
                </span>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-text-muted leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight
                      size={24}
                      className="text-primary"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        aria-labelledby="testimonials-heading"
      >
        <motion.div className="text-center mb-16" {...fadeUp}>
          <h2
            id="testimonials-heading"
            className="text-4xl font-black mb-4 text-wrap-balance"
          >
            Trusted by Thousands
          </h2>
          <div
            className="flex items-center justify-center gap-1 mb-2"
            aria-label="5 out of 5 stars"
          >
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className="text-amber-400 fill-amber-400"
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-text-muted">4.9 / 5 average rating</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass border border-border rounded-2xl p-6"
            >
              <div className="flex gap-0.5 mb-4" aria-label="5 stars">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="text-amber-400 fill-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="text-text-muted leading-relaxed mb-5 text-sm">
                "{t.quote}"
              </blockquote>
              <figcaption>
                <p className="font-semibold">{t.name}</p>
                <p className="text-text-muted text-xs">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ── Pricing Teaser ────────────────────────────────────── */}
      <section
        className="border-y border-border bg-surface/40 py-24"
        aria-labelledby="pricing-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2
              id="pricing-heading"
              className="text-4xl font-black mb-4 text-wrap-balance"
            >
              Simple, Transparent Pricing
            </h2>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              Start free forever. Upgrade when you're ready for advanced
              features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div
              {...fadeUp}
              className="p-8 rounded-2xl glass border border-border flex flex-col"
            >
              <h3 className="text-xl font-bold mb-1">Free</h3>
              <div className="text-4xl font-black mb-2">
                $0
                <span className="text-lg font-normal text-text-muted">/mo</span>
              </div>
              <p className="text-text-muted text-sm mb-6">
                Everything you need to get started.
              </p>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Up to 50 receipts",
                  "10 subscriptions",
                  "Expense tracking",
                  "Email alerts",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      size={16}
                      className="text-green-400 flex-shrink-0"
                      aria-hidden="true"
                    />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full text-center px-6 py-3 rounded-xl border border-border hover:bg-surface-hover transition-colors font-semibold"
              >
                Start Free
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                Popular
              </div>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <div className="text-4xl font-black mb-2">
                $4.99
                <span className="text-lg font-normal text-text-muted">/mo</span>
              </div>
              <p className="text-text-muted text-sm mb-6">
                For power users who want everything.
              </p>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unlimited receipts",
                  "Unlimited subscriptions",
                  "Advanced analytics",
                  "Priority alerts",
                  "Export to CSV",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      size={16}
                      className="text-primary flex-shrink-0"
                      aria-hidden="true"
                    />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full text-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors shadow-lg shadow-primary/25"
              >
                Start 14-Day Trial
              </Link>
            </motion.div>
          </div>

          <motion.p
            className="text-center text-text-muted text-sm mt-8"
            {...fadeUp}
            transition={{ delay: 0.2 }}
          >
            <Link to="/pricing" className="text-primary hover:underline">
              Compare all features →
            </Link>
          </motion.p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.div
          {...fadeUp}
          className="relative p-12 rounded-3xl border border-primary/20 bg-primary/5 overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 pointer-events-none"
            aria-hidden="true"
          />
          <h2 className="text-4xl font-black mb-4 relative z-10 text-wrap-balance">
            Ready to Take Control?
          </h2>
          <p className="text-text-muted text-lg mb-8 max-w-xl mx-auto relative z-10">
            Join 12,000+ users who already have complete clarity on their
            finances.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 transition-colors text-lg"
            >
              Create Free Account <ChevronRight size={20} aria-hidden="true" />
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center justify-center gap-2 text-text-muted hover:text-white border border-border hover:border-primary/40 px-8 py-4 rounded-2xl transition-[color,border-color] text-lg"
            >
              Read the Docs
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
