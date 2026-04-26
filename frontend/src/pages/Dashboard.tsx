import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Receipt, AlertCircle, ArrowRight, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalSubs: 0, subsCost: 0,
    totalReceipts: 0, receiptsAmount: 0,
    expiringSubs: 0, expiringReceipts: 0,
    totalExpenses: 0,
  });
  const [upcomingRenewals, setUpcomingRenewals] = useState<any[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // locale-aware formatters
  const currFmt = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    [i18n.language]
  );
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric' }),
    [i18n.language]
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // async-parallel: all requests in one Promise.all
        const [subsRes, receiptsRes, expRes] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/receipts'),
          api.get('/expenses'),
        ]);

        const subs: any[]     = subsRes.data;
        const receipts: any[] = receiptsRes.data;
        const expenses: any[] = expRes.data;
        const today = new Date();

        const subsCost = subs.reduce((acc, sub) => acc + (sub.cost || 0), 0);
        const expiringSubs = subs.filter(sub => {
          const diff = Math.ceil((new Date(sub.nextBillingDate).getTime() - today.getTime()) / 86400000);
          return diff >= 0 && diff <= 7;
        }).length;

        const receiptsAmount   = receipts.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
        const expiringReceipts = receipts.filter(r => {
          if (!r.expiryDate) return false;
          const diff = Math.ceil((new Date(r.expiryDate).getTime() - today.getTime()) / 86400000);
          return diff >= 0 && diff <= 30;
        }).length;

        // This month's expenses
        const now = new Date();
        const totalExpenses = expenses
          .filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          })
          .reduce((sum, e) => sum + e.amount, 0);

        setStats({ totalSubs: subs.length, subsCost, totalReceipts: receipts.length, receiptsAmount, expiringSubs, expiringReceipts, totalExpenses });

        const upcoming = subs
          .filter(sub => {
            const diff = Math.ceil((new Date(sub.nextBillingDate).getTime() - today.getTime()) / 86400000);
            return diff >= 0 && diff <= 30;
          })
          .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
          .slice(0, 4);
        setUpcomingRenewals(upcoming);
        setRecentReceipts(receipts.slice(0, 4));
      } catch {
        setFetchError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-6 animate-pulse" aria-label={t('common.loading')} aria-busy="true">
      <div className="h-8 w-64 bg-surface-hover rounded-xl" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-surface-hover rounded-2xl" />)}
      </div>
    </div>
  );

  if (fetchError) return (
    <div role="alert" className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
      <AlertCircle size={24} aria-hidden="true" />
      <p>{fetchError}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-wrap-balance">{t('dashboard.title')}</h1>
        <p className="text-text-muted mt-2">
          {t('dashboard.welcome', { name: user?.name ?? '' })}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('dashboard.activeSubscriptions')}
          value={stats.totalSubs.toString()}
          amount={t('dashboard.totalCycle', { amount: stats.subsCost.toFixed(0) })}
          icon={CreditCard}
          trend={stats.expiringSubs > 0 ? t('dashboard.renewingSoon', { count: stats.expiringSubs }) : t('dashboard.allClear')}
        />
        <StatCard
          title={t('dashboard.totalReceipts')}
          value={stats.totalReceipts.toString()}
          amount={currFmt.format(stats.receiptsAmount)}
          icon={Receipt}
          trend={stats.expiringReceipts > 0 ? t('dashboard.warrantiesExpiring', { count: stats.expiringReceipts }) : t('dashboard.allClear')}
        />
        <StatCard
          title={t('dashboard.actionNeeded')}
          value={(stats.expiringSubs + stats.expiringReceipts).toString()}
          amount={t('dashboard.expiringItems')}
          icon={AlertCircle}
          trend={(stats.expiringSubs + stats.expiringReceipts) > 0 ? t('dashboard.reviewImmediately') : t('dashboard.nothingUrgent')}
          highlight={(stats.expiringSubs + stats.expiringReceipts) > 0}
        />
        <StatCard
          title={t('expenses.totalThisMonth')}
          value={currFmt.format(stats.totalExpenses)}
          amount={t('expenses.transactions')}
          icon={TrendingDown}
          trend={t('nav.expenses')}
          color="text-red-400"
          bg="bg-red-500/10 border-red-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Renewals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('dashboard.upcomingRenewals')}</h2>
            <Link to="/app/subscriptions" className="text-primary text-sm flex items-center gap-1 hover:underline">
              {t('dashboard.viewAll')} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingRenewals.length === 0 ? (
              <p className="text-text-muted text-sm">{t('dashboard.noRenewals')}</p>
            ) : (
              upcomingRenewals.map(sub => {
                const diff = Math.ceil((new Date(sub.nextBillingDate).getTime() - new Date().getTime()) / 86400000);
                const label = diff === 0 ? t('dashboard.renewsToday') : diff === 1 ? t('dashboard.renewsTomorrow') : t('dashboard.renewsInDays', { count: diff });
                return (
                  <RenewalItem key={sub._id} name={sub.serviceName} date={label} amount={currFmt.format(sub.cost)} urgent={diff <= 3} />
                );
              })
            )}
          </div>
        </motion.div>

        {/* Recent Receipts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('dashboard.recentReceipts')}</h2>
            <Link to="/app/receipts" className="text-primary text-sm flex items-center gap-1 hover:underline">
              {t('dashboard.viewAll')} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentReceipts.length === 0 ? (
              <p className="text-text-muted text-sm">{t('dashboard.noReceipts')}</p>
            ) : (
              recentReceipts.map(r => (
                <ReceiptItem
                  key={r._id}
                  store={r.storeName}
                  item={r.itemName || t('receipts.noItemSpecified')}
                  date={dateFmt.format(new Date(r.purchaseDate))}
                  amount={currFmt.format(r.totalAmount)}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Sub-components (hoisted outside, rerender-no-inline-components) ──────────

function StatCard({ title, value, amount, icon: Icon, trend, highlight, color, bg }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl border relative overflow-hidden ${
        bg ?? (highlight ? 'bg-primary/10 border-primary/30' : 'glass border-border')
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <p className="text-text-muted font-medium mb-1 truncate">{title}</p>
          <h3 className={`text-3xl font-bold tabular-nums ${color ?? ''}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-xl flex-shrink-0 ${highlight ? 'bg-primary text-white' : 'bg-surface-hover text-primary'}`}>
          <Icon size={24} aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="font-medium text-text truncate">{amount}</span>
        <span aria-hidden="true">•</span>
        <span className="truncate">{trend}</span>
      </div>
    </motion.div>
  );
}

function RenewalItem({ name, date, amount, urgent }: any) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-xl hover:bg-surface-hover transition-colors ${urgent ? 'bg-red-500/5' : ''}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${urgent ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`} aria-hidden="true">
          {name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{name}</p>
          <p className={`text-sm ${urgent ? 'text-red-400' : 'text-text-muted'}`}>{date}</p>
        </div>
      </div>
      <div className="font-semibold tabular-nums flex-shrink-0 ml-2">{amount}</div>
    </div>
  );
}

function ReceiptItem({ store, item, date, amount }: any) {
  return (
    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-surface-hover transition-colors">
      <div className="flex flex-col min-w-0">
        <p className="font-medium truncate">{store}</p>
        <p className="text-sm text-text-muted truncate">{item}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className="font-medium tabular-nums">{amount}</p>
        <p className="text-sm text-text-muted">{date}</p>
      </div>
    </div>
  );
}
