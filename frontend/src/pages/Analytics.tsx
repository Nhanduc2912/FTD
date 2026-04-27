import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, DollarSign, ShieldCheck, AlertCircle, TrendingDown, Receipt, CreditCard, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../context/CurrencyContext';

// ── Config ─────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];
const CAT_COLORS: Record<string, string> = {
  'Food & Drink':  '#f59e0b',
  'Transport':     '#6366f1',
  'Entertainment': '#ec4899',
  'Shopping':      '#f43f5e',
  'Health':        '#10b981',
  'Utilities':     '#22d3ee',
  'Education':     '#8b5cf6',
  'Travel':        '#0ea5e9',
  'Other':         '#64748b',
};

// Stable string keys for Recharts dataKey — NEVER use t() here (language switch breaks chart)
const FORECAST_KEY = 'subscriptions';
const EXPENSE_KEY  = 'expenses';

// Compute cost normalised to monthly
function toMonthly(cost: number, cycle: string): number {
  if (cycle === 'yearly') return cost / 12;
  if (cycle === 'weekly') return cost * 4.33;
  return cost;
}

// Generate "next N months" labels
function getNextMonths(n: number, locale: string): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push(d.toLocaleString(locale, { month: 'short', year: '2-digit' }));
  }
  return labels;
}

// Last 6 months for expense trend
function getLast6MonthsKeys(): { key: string; label: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
    });
  }
  return result;
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt.format(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Analytics() {
  const { t, i18n } = useTranslation();
  const { formatCurrency, currency } = useCurrency();
  const [subs, setSubs] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  

  useEffect(() => {
    const load = async () => {
      try {
        const [subsRes, rcpRes, expRes] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/receipts'),
          api.get('/expenses?all=true'),
        ]);
        // All endpoints return paginated {data, page, totalPages, total} — extract array
        setSubs(Array.isArray(subsRes.data) ? subsRes.data : (subsRes.data.data ?? []));
        setReceipts(Array.isArray(rcpRes.data) ? rcpRes.data : (rcpRes.data.data ?? []));
        setExpenses(Array.isArray(expRes.data) ? expRes.data : (expRes.data.data ?? []));
      } catch {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived data (memoised) ────────────────────────────────────────────
  const totalMonthly = useMemo(() =>
    subs.reduce((acc, s) => acc + toMonthly(s.cost, s.billingCycle), 0), [subs]);

  const totalWarrantyValue = useMemo(() =>
    receipts.filter(r => r.expiryDate && new Date(r.expiryDate) > new Date())
             .reduce((acc, r) => acc + r.totalAmount, 0), [receipts]);

  const expiringCount = useMemo(() => {
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    return receipts.filter(r => r.expiryDate && new Date(r.expiryDate) <= in30 && new Date(r.expiryDate) > new Date()).length;
  }, [receipts]);

  // Bar chart: projected monthly spend for next 6 months
  const monthlyForecast = useMemo(() => {
    const labels = getNextMonths(6, i18n.language);
    const monthlyTotal = subs.reduce((acc, s) => acc + toMonthly(s.cost, s.billingCycle), 0);
    return labels.map(month => ({ month, [FORECAST_KEY]: parseFloat(monthlyTotal.toFixed(2)) }));
  }, [subs, i18n.language]);

  // Pie chart: subs by billing cycle
  const cycleData = useMemo(() => {
    const map: Record<string, number> = {};
    subs.forEach(s => { map[s.billingCycle] = (map[s.billingCycle] || 0) + 1; });
    return Object.entries(map).map(([cycle, count]) => ({
      name: t(`subscriptions.${cycle}`, cycle),
      value: count,
    }));
  }, [subs, t]);

  // Pie chart: receipts by rough cost bracket
  const costBrackets = useMemo(() => {
    const brackets = [
      { name: t('analytics.bracket0'),   value: 0 },
      { name: t('analytics.bracket50'),  value: 0 },
      { name: t('analytics.bracket200'), value: 0 },
      { name: t('analytics.bracket1k'),  value: 0 },
    ];
    receipts.forEach(r => {
      if (r.totalAmount < 50) brackets[0].value++;
      else if (r.totalAmount < 200) brackets[1].value++;
      else if (r.totalAmount < 1000) brackets[2].value++;
      else brackets[3].value++;
    });
    return brackets.filter(b => b.value > 0);
  }, [receipts, t]);

  // Expense trend: last 6 months grouped by month
  const expenseTrend = useMemo(() => {
    const months = getLast6MonthsKeys();
    return months.map(({ key, label }) => {
      const total = expenses
        .filter(e => {
          const d = new Date(e.date);
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return k === key;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      return { month: label, [EXPENSE_KEY]: parseFloat(total.toFixed(2)) };
    });
  }, [expenses]);

  // Expense by category (pie)
  const expenseByCat = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map)
      .map(([cat, val]) => ({ name: t(`common.categories.${cat}`, cat), value: val, color: CAT_COLORS[cat] || '#64748b' }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, t]);

  const totalExpenseThisMonth = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return k === key;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface-hover rounded-2xl" />)}
      <div className="col-span-4 h-64 bg-surface-hover rounded-2xl" />
    </div>
  );

  if (error) return (
    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
      <AlertCircle size={24} aria-hidden="true" />
      <p>{error}</p>
    </div>
  );

  // ── Empty state: user has no data at all ──────────────────────────────────
  if (subs.length === 0 && receipts.length === 0 && expenses.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
          <p className="text-text-muted mt-2">{t('analytics.subtitle')}</p>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass border border-primary/20 rounded-2xl p-10 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <TrendingUp size={32} className="text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t('analytics.noData', 'Your analytics will appear here')}</h2>
          <p className="text-text-muted text-sm mb-8 max-w-sm mx-auto">
            {t('analytics.noDataHint', 'Add some data to see charts, trends, and spending insights.')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <Link to="/app/receipts"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/50 transition-colors group">
              <Receipt size={24} className="text-indigo-400" aria-hidden="true" />
              <span className="text-sm font-medium group-hover:text-white transition-colors">{t('receipts.uploadReceipt')}</span>
            </Link>
            <Link to="/app/subscriptions"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/50 transition-colors group">
              <CreditCard size={24} className="text-purple-400" aria-hidden="true" />
              <span className="text-sm font-medium group-hover:text-white transition-colors">{t('subscriptions.addSubscription')}</span>
            </Link>
            <Link to="/app/expenses"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors group">
              <Wallet size={24} className="text-cyan-400" aria-hidden="true" />
              <span className="text-sm font-medium group-hover:text-white transition-colors">{t('expenses.addExpense')}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text text-wrap-balance">{t('analytics.title')}</h1>
        <p className="text-text-muted mt-2">{t('analytics.subtitle')}</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={t('analytics.monthlyBurnRate')} value={formatCurrency(totalMonthly)} icon={DollarSign} desc={t('analytics.allSubscriptions')} />
        <KpiCard title={t('analytics.yearlyProjection')} value={formatCurrency(totalMonthly * 12)} icon={TrendingUp} desc={t('analytics.basedOnCurrent')} />
        <KpiCard title={t('analytics.activeWarrantyValue')} value={formatCurrency(totalWarrantyValue)} icon={ShieldCheck} desc={t('analytics.validWarranties')} />
        <KpiCard title={t('analytics.warrantiesExpiring')} value={expiringCount.toString()} icon={AlertCircle} desc={t('analytics.within30Days')} highlight={expiringCount > 0} />
      </div>

      {/* Expense This Month KPI */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><TrendingDown size={20} /></div>
          <h2 className="text-lg font-semibold">{t('expenses.totalThisMonth')}</h2>
          <span className="ml-auto text-3xl font-black text-red-400 tabular-nums">{formatCurrency(totalExpenseThisMonth)}</span>
        </div>
        <p className="text-sm text-text-muted pl-11">{expenses.length} {t('expenses.transactions')}</p>
      </motion.div>

      {/* Spending Forecast Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">{t('analytics.forecast')}</h2>
        {subs.length === 0 ? (
          <p className="text-text-muted text-sm">{t('analytics.addSubsToSeeChart')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyForecast} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${currency === 'VND' ? '₫' : '$'}${v}`} />
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey={FORECAST_KEY} fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Expense Trend - last 6 months */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">{t('expenses.monthlySpend')}</h2>
        {expenses.length === 0 ? (
          <p className="text-text-muted text-sm">{t('expenses.noCategoryData')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={expenseTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${currency === 'VND' ? '₫' : '$'}${v}`} />
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey={EXPENSE_KEY} fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">{t('analytics.subsByCycle')}</h2>
          {cycleData.length === 0 ? (
            <p className="text-text-muted text-sm">{t('analytics.noSubData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={cycleData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {cycleData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}`, '']} />
                <Legend wrapperStyle={{ fontSize: '13px', color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">{t('expenses.spendingByCategory')}</h2>
          {expenseByCat.length === 0 ? (
            <p className="text-text-muted text-sm">{t('expenses.noCategoryData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expenseByCat} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {expenseByCat.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [formatCurrency(v as number), '']} />
                <Legend wrapperStyle={{ fontSize: '13px', color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">{t('analytics.receiptsByValue')}</h2>
          {costBrackets.length === 0 ? (
            <p className="text-text-muted text-sm">{t('analytics.noReceiptData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={costBrackets} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {costBrackets.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}`, '']} />
                <Legend wrapperStyle={{ fontSize: '13px', color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Subscription Cost Breakdown Table */}
      {subs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">{t('analytics.costBreakdown')}</h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-hover/50 border-b border-border">
                <th className="p-4 font-medium text-text-muted">{t('analytics.service')}</th>
                <th className="p-4 font-medium text-text-muted">{t('analytics.cycle')}</th>
                <th className="p-4 font-medium text-text-muted text-right tabular-nums">{t('analytics.billed')}</th>
                <th className="p-4 font-medium text-text-muted text-right tabular-nums">{t('analytics.monthlyEquiv')}</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s._id} className="border-b border-border hover:bg-surface-hover/30 transition-colors">
                  <td className="p-4 font-medium">{s.serviceName}</td>
                  <td className="p-4 text-text-muted capitalize">{String(t(`subscriptions.${s.billingCycle}`, s.billingCycle))}</td>
                  <td className="p-4 text-right tabular-nums">{formatCurrency(s.cost)}</td>
                  <td className="p-4 text-right tabular-nums text-primary font-semibold">{formatCurrency(toMonthly(s.cost, s.billingCycle))}</td>
                </tr>
              ))}
              <tr className="bg-primary/5">
                <td colSpan={3} className="p-4 font-bold text-right">{t('analytics.totalMonthly')}</td>
                <td className="p-4 text-right font-black text-primary tabular-nums">{formatCurrency(totalMonthly)}</td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, desc, highlight = false }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`p-5 rounded-2xl border ${highlight ? 'bg-orange-500/10 border-orange-500/30' : 'glass border-border'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <p className="text-text-muted text-sm font-medium">{title}</p>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-orange-500/20 text-orange-400' : 'bg-surface-hover text-primary'}`}>
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>
      <p className="text-3xl font-black tabular-nums mb-1">{value}</p>
      <p className="text-text-muted text-xs">{desc}</p>
    </motion.div>
  );
}
