import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';

interface OverviewData {
  metrics: any;
  billing: any;
}

export default function OverviewTab() {
  const { t } = useTranslation();
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, billingRes] = await Promise.all([
          api.get('/admin/health/metrics'),
          api.get('/admin/billing/overview'),
        ]);
        setData({ metrics: metricsRes.data, billing: billingRes.data });
      } catch (err) {
        console.error(err);
        setError(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [t]);

  if (isLoading) {
    return <div className="text-center py-12 text-text-muted">{t('common.loading')}</div>;
  }

  if (error || !data) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  const { metrics, billing } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Users Stat */}
      <div className="glass p-6 rounded-2xl">
        <h3 className="text-sm font-medium text-text-muted">{t('admin.overview.totalUsers')}</h3>
        <p className="text-3xl font-bold mt-2 tabular-nums">{billing.totalUsers}</p>
        <p className="text-xs text-primary mt-2">{billing.proUsers} {t('admin.overview.proUsers')}</p>
      </div>

      {/* Subscriptions Stat */}
      <div className="glass p-6 rounded-2xl">
        <h3 className="text-sm font-medium text-text-muted">{t('admin.overview.activeSubscriptions')}</h3>
        <p className="text-3xl font-bold mt-2 tabular-nums">{billing.subscriptionStatus.active}</p>
        <div className="flex gap-4 text-xs text-text-muted mt-2">
          <span>{billing.subscriptionStatus.trialing} {t('admin.overview.trialing')}</span>
          <span>{billing.subscriptionStatus.canceled} {t('admin.overview.canceled')}</span>
        </div>
      </div>

      {/* System Health */}
      <div className="glass p-6 rounded-2xl">
        <h3 className="text-sm font-medium text-text-muted">{t('admin.overview.serverUptime')}</h3>
        <p className="text-3xl font-bold mt-2 tabular-nums">
          {Math.floor(metrics.server.uptime / 3600)}h {Math.floor((metrics.server.uptime % 3600) / 60)}m
        </p>
        <p className="text-xs text-text-muted mt-2">Node {metrics.server.nodeVersion}</p>
      </div>
    </div>
  );
}
