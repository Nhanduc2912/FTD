import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const FREE_FEATURES  = ['Up to 50 receipts', '10 active subscriptions', 'Expense tracking (unlimited)', 'Basic analytics charts', 'In-app expiry alerts', 'Email support'];
const PRO_FEATURES   = ['Unlimited receipts', 'Unlimited subscriptions', 'Advanced analytics & trends', 'Priority renewal alerts (SMS coming soon)', 'CSV/PDF export', 'Priority email support', 'Early access to new features'];

const FAQS = [
  { q: 'Is FTD really free?',          a: 'Yes. The Free tier has no time limit — it\'s not a trial. You can use it forever with the stated limits.' },
  { q: 'Do I need a credit card to sign up?', a: 'No. You can create a free account with just your email address. A card is only needed if you upgrade to Pro.' },
  { q: 'Can I cancel Pro anytime?',    a: 'Absolutely. Cancel from Settings any time. You keep Pro features until the end of your billing period.' },
  { q: 'Is my data safe?',             a: 'All data is encrypted in transit (TLS 1.3) and at rest. We never sell your data.' },
  { q: 'Can I export my data?',        a: 'Pro users can export all data to CSV. Free users can view data inside the app.' },
  { q: 'What currencies are supported?', a: 'USD, VND, EUR, JPY, and GBP. More currencies are coming in future updates.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-hover transition-colors gap-4"
      >
        <span className="font-medium">{q}</span>
        <HelpCircle size={18} className={`flex-shrink-0 transition-colors ${open ? 'text-primary' : 'text-text-muted'}`} aria-hidden="true" />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-6 pb-4 text-text-muted text-sm leading-relaxed border-t border-border"
        >
          <p className="pt-3">{a}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function Pricing() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <motion.div className="text-center mb-16" {...fadeUp}>
        <h1 className="text-5xl font-black mb-4 text-wrap-balance">
          Simple, <span className="gradient-text">Honest</span> Pricing
        </h1>
        <p className="text-text-muted text-xl max-w-xl mx-auto">No hidden fees. No dark patterns. Start free, upgrade when you're ready.</p>
      </motion.div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">

        {/* Free */}
        <motion.div {...fadeUp} className="p-8 rounded-3xl glass border border-border flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Free</h2>
            <div className="text-5xl font-black mb-2">$0<span className="text-xl font-normal text-text-muted">/month</span></div>
            <p className="text-text-muted">Forever free. No credit card required.</p>
          </div>

          <ul className="space-y-3 flex-1 mb-8">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>

          <Link to="/register" className="block text-center px-6 py-3.5 rounded-2xl border border-border hover:bg-surface-hover transition-colors font-semibold">
            Start for Free
          </Link>
        </motion.div>

        {/* Pro */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="p-8 rounded-3xl border-2 border-primary bg-primary/5 flex flex-col relative overflow-hidden">
          <div className="absolute top-5 right-5 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">Most Popular</div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Pro</h2>
            <div className="text-5xl font-black mb-2">$4.99<span className="text-xl font-normal text-text-muted">/month</span></div>
            <p className="text-text-muted">Or $47.99/year — save 20%.</p>
          </div>

          <ul className="space-y-3 flex-1 mb-8">
            <li className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Everything in Free, plus:</li>
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={16} className="text-primary flex-shrink-0" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>

          <Link to="/register" className="block text-center px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors shadow-lg shadow-primary/25">
            Start 14-Day Free Trial
          </Link>
          <p className="text-center text-text-muted text-xs mt-3">No payment until trial ends. Cancel anytime.</p>
        </motion.div>
      </div>

      {/* Feature comparison note */}
      <motion.div {...fadeUp} className="text-center mb-20">
        <p className="text-text-muted">
          Need a team plan or custom limits?{' '}
          <Link to="/help" className="text-primary hover:underline">Contact us →</Link>
        </p>
      </motion.div>

      {/* FAQ */}
      <motion.div {...fadeUp}>
        <h2 className="text-3xl font-black text-center mb-10">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div {...fadeUp} className="text-center mt-20">
        <h2 className="text-3xl font-black mb-4">Start Free Today</h2>
        <p className="text-text-muted mb-6">No credit card. No commitment. Full access to the Free tier immediately.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-primary/25 transition-colors">
          Create Your Account <ChevronRight size={20} aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
