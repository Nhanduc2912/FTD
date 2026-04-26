import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Receipt, CreditCard, Wallet, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WelcomeBannerProps {
  onDismiss: () => void;
}

const STEPS = [
  { icon: Receipt,    titleKey: 'onboarding.step1Title', descKey: 'onboarding.step1Desc', href: '/app/receipts',     color: 'bg-indigo-500/10 text-indigo-400' },
  { icon: CreditCard, titleKey: 'onboarding.step2Title', descKey: 'onboarding.step2Desc', href: '/app/subscriptions', color: 'bg-purple-500/10 text-purple-400' },
  { icon: Wallet,     titleKey: 'onboarding.step3Title', descKey: 'onboarding.step3Desc', href: '/app/expenses',      color: 'bg-cyan-500/10 text-cyan-400' },
];

export default function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="relative glass border border-primary/30 rounded-2xl p-6 mb-6"
    >
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
        aria-label={t('onboarding.dismiss')}
      >
        <X size={16} aria-hidden="true" />
      </button>

      <div className="flex items-center gap-4 mb-5">
        <img src="/images/welcome_mascot.png" alt="Mascot" className="w-16 h-16 object-contain hidden sm:block drop-shadow-xl" />
        <div>
          <h2 className="text-xl font-bold gradient-text mb-1">{t('onboarding.title')}</h2>
          <p className="text-text-muted text-sm">{t('onboarding.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STEPS.map(({ icon: Icon, titleKey, descKey, href, color }) => (
          <Link
            key={href}
            to={href}
            className="flex items-start gap-3 p-4 rounded-xl bg-surface-hover hover:bg-primary/10 border border-border hover:border-primary/30 transition-all group"
          >
            <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
              <Icon size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">{t(titleKey)}</p>
              <p className="text-text-muted text-xs mt-0.5 truncate">{t(descKey)}</p>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={onDismiss}
        className="mt-4 text-xs text-text-muted hover:text-text transition-colors underline underline-offset-2"
      >
        {t('onboarding.dismiss')}
      </button>
    </motion.div>
  );
}
