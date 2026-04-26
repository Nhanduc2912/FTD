import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Receipt, CreditCard, Wallet, BarChart2, Settings, Bell } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const GUIDES = [
  {
    icon: Receipt, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20',
    title: 'Receipt Vault',
    steps: [
      'Go to Receipts in the sidebar.',
      'Click "Upload Receipt" in the top-right corner.',
      'Fill in the store name, item name, purchase amount, and purchase date.',
      'If your item has a warranty, enter the warranty expiry date (optional).',
      'Upload a photo or scan of your receipt (JPEG, PNG, WebP, or PDF).',
      'Click "Upload Receipt" to save. The receipt appears in your list immediately.',
      'To delete a receipt, click the trash icon and confirm in the dialog.',
    ],
  },
  {
    icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Subscriptions',
    steps: [
      'Go to Subscriptions in the sidebar.',
      'Click "Add Subscription" to open the form.',
      'Enter the service name (e.g. "Netflix"), cost, billing cycle, and next billing date.',
      'Set "Remind Me" to how many days before renewal you want a notification.',
      'Click "Add Subscription" to save.',
      'To remove a subscription, click the cancel icon and confirm. This removes it permanently.',
    ],
  },
  {
    icon: Wallet, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20',
    title: 'Expense Tracker',
    steps: [
      'Go to Expenses in the sidebar.',
      'Use the month selector at the top to view a specific month\'s expenses.',
      'Click "Add Expense" to open the form.',
      'Enter a description, amount, currency, category, and date.',
      'Click "Save Expense" to log it.',
      'The pie chart and KPI cards update automatically to reflect your new entry.',
      'To delete an expense, click the trash icon and confirm.',
    ],
  },
  {
    icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Analytics',
    steps: [
      'Go to Analytics in the sidebar.',
      'The KPI cards at the top show your monthly burn rate, yearly projection, warranty value, and expiring items.',
      'The forecast bar chart shows your projected subscription spend for the next 6 months.',
      'The expense trend chart shows actual spending over the last 6 months.',
      'Pie charts break down spending by subscription cycle and expense category.',
      'The cost breakdown table lists every subscription with its monthly equivalent cost.',
    ],
  },
  {
    icon: Bell, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20',
    title: 'Notifications',
    steps: [
      'The bell icon in the top-right corner shows how many unread alerts you have.',
      'Click the bell to open the notification panel.',
      'Red dots indicate items expiring in 3 days or less; orange dots are within 7–30 days.',
      'Click any notification to mark it as read.',
      'Click "Mark all read" to dismiss all alerts at once.',
      'Alerts are automatically generated from your subscriptions and receipt warranties — no configuration needed.',
    ],
  },
  {
    icon: Settings, color: 'text-primary', bg: 'bg-primary/10 border-primary/20',
    title: 'Settings',
    steps: [
      'Go to Settings via the sidebar or by clicking your avatar in the top-right.',
      'Update your display name in the Profile section and click "Save Name".',
      'In the Language & Region section, click "English" or "Tiếng Việt" to switch the app language instantly.',
      'To change your password, fill in your current password and your new password twice, then click "Update Password".',
      'Password must be at least 6 characters.',
    ],
  },
];

const FAQS = [
  { q: 'I uploaded a receipt but can\'t see it.', a: 'Refresh the page. If it still doesn\'t appear, check that you clicked "Upload Receipt" (not just closed the modal). Supported formats: JPEG, PNG, WebP, PDF.' },
  { q: 'My subscription shows the wrong renewal date.', a: 'Click the cancel icon to remove the entry and re-add it with the correct next billing date.' },
  { q: 'The language switch didn\'t save after I refreshed.', a: 'Language preference is saved in your browser\'s localStorage. If you cleared your browser data, it will reset to your browser\'s default language.' },
  { q: 'I forgot my password.', a: 'Currently, contact support at support@ftd.app and we\'ll help you reset it. A self-service reset feature is coming soon.' },
  { q: 'Can I use FTD on mobile?', a: 'Yes. FTD is fully responsive and works on any modern mobile browser. A native app is on our roadmap.' },
  { q: 'Why is the monthly trend chart showing $0?', a: 'The expense trend requires data in multiple months. Add expenses across several months to see the chart populate.' },
];

function GuideItem({ guide }: { guide: typeof GUIDES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-hover transition-colors"
      >
        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${guide.bg}`}>
          <guide.icon size={18} className={guide.color} aria-hidden="true" />
        </div>
        <span className="font-semibold flex-1">{guide.title}</span>
        <ChevronDown size={16} className={`text-text-muted transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="border-t border-border bg-surface/50 overflow-hidden"
        >
          <ol className="px-6 py-4 space-y-3">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-muted">
                <span className="font-bold text-primary flex-shrink-0 tabular-nums">{i + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      {/* Header */}
      <motion.div {...fadeUp} className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 text-wrap-balance">
          Help <span className="gradient-text">Center</span>
        </h1>
        <p className="text-text-muted text-xl max-w-xl mx-auto">
          Step-by-step guides for every feature, plus answers to common questions.
        </p>
      </motion.div>

      {/* Guides */}
      <motion.section className="mb-16" {...fadeUp} aria-labelledby="guides-heading">
        <h2 id="guides-heading" className="text-2xl font-bold mb-6">Feature Guides</h2>
        <div className="space-y-3">
          {GUIDES.map(g => <GuideItem key={g.title} guide={g} />)}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section className="mb-16" {...fadeUp} aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-bold mb-6">Troubleshooting & FAQ</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl glass border border-border">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Still need help */}
      <motion.div {...fadeUp} className="text-center p-10 rounded-3xl border border-border glass">
        <h2 className="text-2xl font-bold mb-3">Still Need Help?</h2>
        <p className="text-text-muted mb-6">Our support team responds within 1 business day.</p>
        <a
          href="mailto:support@ftd.app"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/25 transition-colors"
        >
          Email Support <ChevronRight size={16} aria-hidden="true" />
        </a>
        <p className="text-text-muted text-sm mt-4">
          Or read our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> / <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
        </p>
      </motion.div>
    </div>
  );
}
