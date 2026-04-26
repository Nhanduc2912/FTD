import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UpgradePromptProps {
  limitType: 'receipts' | 'subscriptions' | 'feature';
  onClose: () => void;
}

export default function UpgradePrompt({ limitType, onClose }: UpgradePromptProps) {
  const { t } = useTranslation();

  const limitMessage =
    limitType === 'receipts' ? t('upgrade.receiptsLimit') :
    limitType === 'subscriptions' ? t('upgrade.subsLimit') :
    t('upgrade.desc');

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          onClick={e => e.stopPropagation()}
          className="bg-surface border border-primary/30 p-8 rounded-3xl w-full max-w-md shadow-2xl text-center"
          style={{ overscrollBehavior: 'contain' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-title"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center mx-auto mb-6">
            <Zap size={28} className="text-white" aria-hidden="true" />
          </div>

          <h2 id="upgrade-title" className="text-2xl font-black mb-2">
            {t('upgrade.limitReached')}
          </h2>
          <p className="text-text-muted text-sm mb-2">{limitMessage}</p>
          <p className="text-text-muted text-sm mb-8">{t('upgrade.desc')}</p>

          {/* Features list */}
          <ul className="text-left space-y-2 mb-8 text-sm">
            {['Unlimited receipts & subscriptions', 'Advanced analytics & projections', 'Priority renewal alerts', 'CSV export', 'Priority support'].map(f => (
              <li key={f} className="flex items-center gap-2 text-text-muted">
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs" aria-hidden="true">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-white font-bold text-base hover:opacity-90 transition-opacity mb-3"
            onClick={() => {
              // TODO: wire to Stripe checkout when keys are available
              window.open('https://github.com/Nhanduc2912/FTD', '_blank');
            }}
          >
            {t('upgrade.cta')}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-text-muted text-sm hover:text-text transition-colors"
          >
            {t('upgrade.notNow')}
          </button>

          {/* Close X */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-hover transition-colors text-text-muted"
            aria-label={t('common.close')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
