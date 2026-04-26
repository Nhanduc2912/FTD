import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `When you create an account, we collect your name, email address, and a hashed password. When you use FTD, we store the financial data you enter: receipts, subscriptions, and expenses. We do not collect payment card numbers directly — payments are processed by Stripe with PCI-DSS compliance.

We automatically collect basic usage data (page views, errors) to improve the service. This is anonymised and never linked to your personal profile.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `Your data is used exclusively to provide you with the FTD service:
• Displaying your receipts, subscriptions, and expense records
• Sending expiry and renewal notifications you opted into
• Improving the reliability and performance of the platform
• Responding to support requests

We never use your financial data for advertising or sell it to third parties. Period.`,
  },
  {
    title: '3. Data Storage & Security',
    body: `All data is stored on MongoDB Atlas servers located in Singapore (or your selected region). We enforce TLS 1.3 encryption for all data in transit. Data at rest is encrypted using AES-256. Access to production databases is restricted to a minimal set of engineering personnel.

We conduct regular security reviews and promptly address any discovered vulnerabilities.`,
  },
  {
    title: '4. Data Retention',
    body: `We retain your data for as long as your account is active. If you delete your account, all associated data is permanently erased within 30 days. You may request immediate deletion by contacting support.

Backups are retained for a maximum of 7 days and are then purged.`,
  },
  {
    title: '5. Your Rights (GDPR & CCPA)',
    body: `Depending on your jurisdiction, you may have the following rights:
• Right to access: Request a copy of all data we hold about you
• Right to rectification: Correct inaccurate personal data
• Right to erasure: Request deletion of your account and all associated data
• Right to portability: Receive your data in a machine-readable format
• Right to object: Opt out of analytics collection

To exercise any of these rights, email us at privacy@ftd.app. We respond within 30 days.`,
  },
  {
    title: '6. Cookies',
    body: `FTD uses a single authentication cookie (JWT token stored in localStorage) to keep you logged in. We do not use third-party tracking cookies or advertising pixels. Analytics are self-hosted and anonymised.`,
  },
  {
    title: '7. Third-Party Services',
    body: `We use a limited number of trusted third-party services:
• MongoDB Atlas – database hosting (Singapore region)
• Stripe – payment processing (Pro plan only)
• SendGrid – transactional email delivery

Each provider has their own privacy policy. We choose providers that maintain high security standards and do not sell user data.`,
  },
  {
    title: '8. Children\'s Privacy',
    body: `FTD is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately and we will delete it.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Significant changes will be communicated via email to registered users at least 14 days before they take effect. Continued use of FTD after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact',
    body: `For privacy-related questions or data requests, contact us at:
Email: privacy@ftd.app
Response time: Within 30 business days`,
  },
];

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div {...fadeUp} className="mb-12">
        <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
        <p className="text-text-muted">Last updated: <time dateTime="2025-01-01">1 January 2025</time></p>
        <p className="text-text-muted mt-4 leading-relaxed">
          Your privacy is fundamental to how we build FTD. This policy explains what data we collect, why we collect it, and how we protect it. We've written it in plain language — not legal jargon — because we want you to actually read it.
        </p>
      </motion.div>

      <div className="space-y-10">
        {SECTIONS.map((s, i) => (
          <motion.section
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
            aria-labelledby={`privacy-${i}`}
            className="pb-10 border-b border-border last:border-0"
          >
            <h2 id={`privacy-${i}`} className="text-xl font-bold mb-4">{s.title}</h2>
            <p className="text-text-muted leading-relaxed whitespace-pre-line text-sm">{s.body}</p>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
