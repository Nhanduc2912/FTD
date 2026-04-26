import { motion } from 'framer-motion';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By creating an account or using FTD (Finance Trusted Documents), you agree to be bound by these Terms of Service. If you do not agree, do not use the service.

These Terms apply to all users, including visitors, registered users, and Pro subscribers.`,
  },
  {
    title: '2. Description of Service',
    body: `FTD is a personal finance management platform that allows users to store receipts, track subscriptions, log expenses, and view analytics. The service is provided "as is" and may evolve over time.

We reserve the right to modify, suspend, or discontinue any part of the service with reasonable notice to users.`,
  },
  {
    title: '3. Account Registration',
    body: `You must provide accurate, complete information when registering. You are responsible for maintaining the security of your password and for all activities that occur under your account.

You must be at least 13 years of age to use FTD. By registering, you represent that you meet this requirement.

You may not share your account credentials with others or create accounts on behalf of third parties without their explicit consent.`,
  },
  {
    title: '4. Acceptable Use',
    body: `You agree not to:
• Use FTD for any unlawful purpose or in violation of any applicable laws
• Attempt to gain unauthorised access to any part of the service or its related systems
• Upload malicious files or content that could harm other users or our infrastructure
• Scrape, harvest, or systematically extract data from the service
• Use the service in a way that could damage, overload, or impair its functionality
• Impersonate other users or create multiple accounts to circumvent restrictions`,
  },
  {
    title: '5. User Content',
    body: `You retain ownership of the content you upload to FTD (receipts, notes, financial data). By uploading content, you grant FTD a limited licence to store, process, and display that content solely for the purpose of providing the service to you.

You are responsible for ensuring you have the right to upload any content and that it does not infringe any third-party rights.`,
  },
  {
    title: '6. Subscription & Payment (Pro Plan)',
    body: `Pro plan subscriptions are billed monthly or annually in advance. All prices are in USD. Payments are processed securely by Stripe.

You may cancel your Pro subscription at any time. Cancellation takes effect at the end of the current billing period — you will not receive a prorated refund for unused time.

We reserve the right to change Pro pricing with 30 days' notice. Existing subscribers will receive email notification before any price change takes effect.`,
  },
  {
    title: '7. Data & Privacy',
    body: `Our collection and use of your personal data is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using FTD, you consent to data practices described in the Privacy Policy.`,
  },
  {
    title: '8. Disclaimers',
    body: `FTD is a personal finance organisational tool. It is not a financial advisor and does not provide investment, tax, or legal advice. You are solely responsible for your financial decisions.

The service is provided "as is" without warranties of any kind, express or implied. We do not guarantee the accuracy, completeness, or reliability of any information processed by the service.`,
  },
  {
    title: '9. Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, FTD and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service.

Our total liability for any claims arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim, or $50 USD, whichever is greater.`,
  },
  {
    title: '10. Termination',
    body: `You may delete your account at any time from the Settings page. We may terminate or suspend your account if you violate these Terms, with or without notice.

Upon termination, your right to use the service ceases immediately. We will delete your data in accordance with our Privacy Policy.`,
  },
  {
    title: '11. Changes to Terms',
    body: `We may update these Terms from time to time. Material changes will be communicated via email to registered users at least 14 days before the effective date. Continued use of FTD after the effective date constitutes your acceptance of the revised Terms.`,
  },
  {
    title: '12. Governing Law',
    body: `These Terms are governed by the laws of Vietnam. Any disputes shall be resolved in the courts of Ho Chi Minh City, Vietnam, unless otherwise required by applicable consumer protection law in your jurisdiction.`,
  },
  {
    title: '13. Contact',
    body: `For questions about these Terms, contact us at:
Email: legal@ftd.app
Response time: Within 30 business days`,
  },
];

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-black mb-3">Terms of Service</h1>
        <p className="text-text-muted">Last updated: <time dateTime="2025-01-01">1 January 2025</time></p>
        <p className="text-text-muted mt-4 leading-relaxed">
          Please read these terms carefully before using FTD. They govern your use of our service and are written to be fair and understandable.
        </p>
      </motion.div>

      <div className="space-y-10">
        {SECTIONS.map((s, i) => (
          <motion.section
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.02 }}
            aria-labelledby={`terms-${i}`}
            className="pb-10 border-b border-border last:border-0"
          >
            <h2 id={`terms-${i}`} className="text-xl font-bold mb-4">{s.title}</h2>
            <p className="text-text-muted leading-relaxed whitespace-pre-line text-sm">{s.body}</p>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
