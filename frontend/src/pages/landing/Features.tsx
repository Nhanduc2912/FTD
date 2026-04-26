import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Receipt, CreditCard, Wallet, BarChart2, Bell, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
};

const FEATURE_DETAILS = [
  {
    icon: Receipt, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20',
    title: 'Receipt Vault',
    tagline: 'Never lose a warranty again.',
    desc: 'Thermal paper fades within 2 years. FTD lets you photograph and store any receipt permanently. Set warranty expiry dates, get reminders 30 days before they expire, and access your entire purchase history from any device.',
    bullets: ['Upload photos or PDF scans', 'Set custom warranty expiry dates', 'Automatic expiry reminders', 'Search by store, category, or amount', 'Warranty status dashboard'],
  },
  {
    icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Subscription Guillotine',
    tagline: 'See every charge. Cut what you don\'t need.',
    desc: 'The average person wastes $219/year on forgotten subscriptions. FTD lists every recurring service, shows your monthly burn rate, and sends renewal alerts before charges hit your account.',
    bullets: ['Track all billing cycles (weekly/monthly/yearly)', 'Monthly & yearly cost overview', 'Renewal alerts up to 7 days early', '6-month spending forecast', 'Cost breakdown by service'],
  },
  {
    icon: Wallet, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20',
    title: 'Expense Tracker',
    tagline: 'Understand exactly where your money goes.',
    desc: 'Log daily spending across 9 built-in categories. Visual pie charts and monthly trends reveal spending patterns instantly — no spreadsheets needed.',
    bullets: ['9 categories: Food, Transport, Shopping & more', 'Daily average calculator', 'Monthly trend charts', 'Top category highlight', 'Multi-currency support (USD, VND, EUR, JPY, GBP)'],
  },
  {
    icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Smart Analytics',
    tagline: 'Your financial story, visualised.',
    desc: 'The Analytics page combines all your data into one view. See your total monthly burn rate, yearly projection, active warranty value, and expense breakdowns — all updated in real time.',
    bullets: ['Monthly & yearly projections', 'Subscription cost table', 'Expense category pie chart', '6-month spending history bar chart', 'Expiring warranty count'],
  },
  {
    icon: Bell, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20',
    title: 'Proactive Alerts',
    tagline: 'Know before it\'s too late.',
    desc: 'The notification center in the top bar surfaces the items that need your attention — subscriptions renewing in 7 days, warranties expiring in 30 days — so nothing slips past you.',
    bullets: ['In-app notification bell', 'Color-coded urgency (red < 3 days)', 'Mark individual or all as read', 'Persistent across sessions', 'Zero configuration required'],
  },
  {
    icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10 border-primary/20',
    title: 'Security & Privacy',
    tagline: 'Your financial data stays yours.',
    desc: 'All data is encrypted in transit (TLS 1.3) and at rest. We use MongoDB Atlas with strict access controls. We never sell your data or share it with advertisers.',
    bullets: ['TLS 1.3 encryption in transit', 'Encrypted storage at rest', 'JWT-based authentication', 'Password change anytime in settings', 'No third-party data sharing'],
  },
];

export default function Features() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      {/* Header */}
      <motion.div className="text-center mb-20" {...fadeUp}>
        <h1 className="text-5xl font-black mb-4 text-wrap-balance">
          Every Feature You Need to{' '}
          <span className="gradient-text">Own Your Finances</span>
        </h1>
        <p className="text-text-muted text-xl max-w-2xl mx-auto">
          Six fully integrated modules — not six separate apps.
        </p>
      </motion.div>

      {/* Feature Sections */}
      <div className="space-y-24">
        {FEATURE_DETAILS.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}
          >
            {/* Text */}
            <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
              <div className={`inline-flex p-3 rounded-xl border mb-5 ${f.bg}`}>
                <f.icon size={24} className={f.color} aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-black mb-2">{f.title}</h2>
              <p className={`text-lg font-semibold mb-4 ${f.color}`}>{f.tagline}</p>
              <p className="text-text-muted leading-relaxed mb-6">{f.desc}</p>
              <ul className="space-y-2.5">
                {f.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 size={16} className={`flex-shrink-0 ${f.color}`} aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual card */}
            <div className={`${i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
              <div className={`p-8 rounded-3xl border-2 glass card-hover ${f.bg} min-h-[260px] flex flex-col items-center justify-center gap-4`}>
                <div className={`p-6 rounded-2xl border ${f.bg}`}>
                  <f.icon size={48} className={f.color} aria-hidden="true" />
                </div>
                <p className="text-2xl font-black text-center">{f.title}</p>
                <p className={`text-sm font-medium ${f.color} text-center`}>{f.tagline}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div {...fadeUp} className="text-center mt-24 p-12 rounded-3xl border border-primary/20 bg-primary/5">
        <h2 className="text-3xl font-black mb-4">All 6 Features, Free to Start</h2>
        <p className="text-text-muted mb-8 text-lg">Create your account in under 60 seconds — no credit card needed.</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-primary/25 transition-colors"
        >
          Get Started Free <ChevronRight size={20} aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
