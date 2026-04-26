import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Target, Heart, Globe } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const VALUES = [
  { icon: Target, title: 'Clarity Over Complexity', desc: 'Financial tools should be simple enough that anyone can understand their money situation at a glance — not just accountants.' },
  { icon: Heart,  title: 'Honesty First',           desc: 'No dark patterns. No surprise charges. No selling your data. We only grow if our users genuinely find value.' },
  { icon: Globe,  title: 'Built for Everyone',       desc: 'FTD supports English and Vietnamese, with more languages on the way. Financial awareness shouldn\'t have a language barrier.' },
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      {/* Hero */}
      <motion.div className="text-center mb-20" {...fadeUp}>
        <h1 className="text-5xl font-black mb-6 text-wrap-balance">
          Built by People Who{' '}
          <span className="gradient-text">Hated Losing Receipts</span>
        </h1>
        <p className="text-text-muted text-xl max-w-2xl mx-auto leading-relaxed">
          FTD started when one developer realised his warranty had expired on a $600 appliance — and he'd thrown the receipt away 8 months earlier.
        </p>
      </motion.div>

      {/* Story */}
      <motion.section className="mb-20 glass border border-border rounded-3xl p-10" {...fadeUp} aria-labelledby="story-heading">
        <h2 id="story-heading" className="text-3xl font-black mb-6">Our Story</h2>
        <div className="prose prose-invert max-w-none space-y-4 text-text-muted leading-relaxed">
          <p>
            In 2024, a small team of developers in Vietnam got tired of juggling 4 different apps to manage their finances:
            one for receipts, one for subscriptions, one for budgeting, and one for analytics. None of them talked to each other.
          </p>
          <p>
            So we built FTD — <strong className="text-text">Finance Trusted Documents</strong> — a single platform where your receipts,
            subscriptions, expenses, and analytics live together and work as a unified picture of your financial life.
          </p>
          <p>
            We launched publicly in 2025 and within 6 months had over 12,000 users in 40+ countries. The most common feedback?
            "I had no idea how much I was wasting on subscriptions I forgot about."
          </p>
          <p>
            Today, FTD continues to be developed by a lean, passionate team focused on one thing: giving you complete clarity on your money — simply and honestly.
          </p>
        </div>
      </motion.section>

      {/* Values */}
      <motion.section className="mb-20" {...fadeUp} aria-labelledby="values-heading">
        <h2 id="values-heading" className="text-3xl font-black mb-10 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map(v => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-2xl glass border border-border card-hover"
            >
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 inline-flex mb-4">
                <v.icon size={22} className="text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold mb-2">{v.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div {...fadeUp} className="text-center p-10 rounded-3xl border border-primary/20 bg-primary/5">
        <h2 className="text-3xl font-black mb-4">Join Our Community</h2>
        <p className="text-text-muted mb-6 text-lg">Be part of a growing community of people taking control of their finances.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-primary/25 transition-colors">
          Get Started Free <ChevronRight size={20} aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
