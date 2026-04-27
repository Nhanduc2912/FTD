import { useTranslation } from 'react-i18next';

export default function BillingTab() {
  const { t } = useTranslation();
  
  return (
    <div className="glass p-8 rounded-2xl text-center">
      <h3 className="text-lg font-medium mb-2">{t('admin.tabs.billing')}</h3>
      <p className="text-text-muted">Advanced billing management will be available in the next update.</p>
    </div>
  );
}
