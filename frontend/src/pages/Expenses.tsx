import { useState, useEffect, useMemo, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Plus, Trash2, AlertCircle, TrendingDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../api';

// ── Config ─────────────────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  'Food & Drink', 'Transport', 'Entertainment', 'Shopping',
  'Health', 'Utilities', 'Education', 'Travel', 'Other',
] as const;

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

const CAT_BG: Record<string, string> = {
  'Food & Drink':  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Transport':     'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Entertainment': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Shopping':      'bg-red-500/10 text-red-400 border-red-500/20',
  'Health':        'bg-green-500/10 text-green-400 border-green-500/20',
  'Utilities':     'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Education':     'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Travel':        'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Other':         'bg-surface-hover text-text-muted border-border',
};

// Stable dataKey — never use t() as dataKey for Recharts
const TREND_KEY = 'amount';

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
    });
  }
  return months;
}

// ── Types ──────────────────────────────────────────────────────────────────
interface IExpense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  currency: string;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Expenses() {
  const { t, i18n } = useTranslation();

  const [expenses, setExpenses]           = useState<IExpense[]>([]);
  const [summary, setSummary]             = useState<{ total: number; byCategory: Record<string, number>; count: number } | null>(null);
  const [trendData, setTrendData]         = useState<{ month: string; [TREND_KEY]: number }[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getMonthOptions()[0].value);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: '', amount: '', category: 'Food & Drink',
    date: new Date().toISOString().split('T')[0], currency: 'USD',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving]       = useState(false);

  const monthOptions = useMemo(() => getMonthOptions(), []);

  const fmt = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    [i18n.language]
  );
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric' }),
    [i18n.language]
  );
  const monthFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: 'short', year: '2-digit' }),
    [i18n.language]
  );

  useEffect(() => { setPage(1); }, [selectedMonth]);
  useEffect(() => { fetchData(); }, [selectedMonth, page]);
  useEffect(() => { fetchTrend(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [y, m] = selectedMonth.split('-');
      const [expRes, sumRes] = await Promise.all([
        api.get<PaginatedResponse<IExpense>>(`/expenses?year=${y}&month=${m}&page=${page}&limit=20`),
        api.get('/expenses/summary'),
      ]);
      setExpenses(expRes.data.data);
      setTotalPages(expRes.data.totalPages);
      setSummary(sumRes.data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async () => {
    try {
      const res = await api.get<{ month: string; total: number }[]>('/expenses/trend');
      setTrendData(res.data.map(d => {
        const [y, mo] = d.month.split('-');
        const label = monthFmt.format(new Date(Number(y), Number(mo) - 1, 1));
        return { month: label, [TREND_KEY]: d.total };
      }));
    } catch { /* chart is optional */ }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/expenses', {
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        currency: form.currency,
      });
      setIsModalOpen(false);
      setForm({ description: '', amount: '', category: 'Food & Drink', date: new Date().toISOString().split('T')[0], currency: 'USD' });
      toast.success(t('expenses.addSuccess'));
      fetchData();
      fetchTrend();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e._id !== id));
      toast.success(t('expenses.deleteSuccess'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setConfirmDelete(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? expenses : expenses.filter(e =>
      e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    );
  }, [expenses, search]);

  const pieData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.byCategory).map(([cat, val]) => ({
      name: String(t(`common.categories.${cat}`, cat)),
      value: val,
      color: CAT_COLORS[cat] || '#64748b',
    })).sort((a, b) => b.value - a.value);
  }, [summary, t]);

  const daysInMonth = new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();
  const dailyAvg = summary ? summary.total / daysInMonth : 0;
  const topCat   = pieData[0];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-wrap-balance">{t('expenses.title')}</h1>
          <p className="text-text-muted mt-1">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            aria-label={t('expenses.selectMonth')}
            className="bg-surface-hover border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
            aria-label={t('expenses.addExpense')}
          >
            <Plus size={18} aria-hidden="true" /> {t('expenses.addExpense')}
          </button>
        </div>
      </header>

      {/* KPI Row */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard icon={TrendingDown} label={t('expenses.totalThisMonth')}
            value={fmt.format(summary.total)} sub={`${summary.count} ${t('expenses.transactions')}`}
            color="text-red-400" bg="bg-red-500/10 border-red-500/20" />
          <KpiCard icon={TrendingDown} label={t('expenses.topCategory')}
            value={topCat ? topCat.name : '—'}
            sub={topCat ? fmt.format(topCat.value) : '—'}
            color="text-orange-400" bg="bg-orange-500/10 border-orange-500/20" />
          <KpiCard icon={TrendingDown} label={t('expenses.dailyAverage')}
            value={fmt.format(dailyAvg)} sub={t('expenses.perDay')}
            color="text-primary" bg="bg-primary/10 border-primary/20" />
        </div>
      )}

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
          <AlertCircle size={18} aria-hidden="true" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass border border-border rounded-2xl p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">{t('expenses.spendingByCategory')}</h2>
          {pieData.length === 0 ? (
            <p className="text-text-muted text-sm">{t('expenses.noCategoryData')}</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={pieData[i].color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmt.format(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.slice(0, 5).map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-text-muted truncate">{d.name}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{fmt.format(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Expense list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="glass border border-border rounded-2xl overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <label htmlFor="expense-search" className="sr-only">{t('expenses.searchPlaceholder')}</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} aria-hidden="true" />
              <input
                id="expense-search" type="search"
                placeholder={t('expenses.searchPlaceholder')}
                value={search}
                onChange={e => { startTransition(() => setSearch(e.target.value)); }}
                className="w-full bg-surface-hover border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-surface-hover flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-hover rounded w-32" />
                    <div className="h-3 bg-surface-hover rounded w-20" />
                  </div>
                  <div className="h-4 bg-surface-hover rounded w-16" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                <TrendingDown size={40} className="mx-auto mb-3 opacity-20" aria-hidden="true" />
                <p>{search ? t('expenses.noExpensesFilter') : t('expenses.noExpenses')}</p>
              </div>
            ) : (
              filtered.map((exp, i) => (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-4 hover:bg-surface-hover/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border flex-shrink-0 ${CAT_BG[exp.category] ?? CAT_BG['Other']}`}>
                    {exp.category[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{exp.description}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${CAT_BG[exp.category] ?? CAT_BG['Other']}`}>
                      {String(t(`common.categories.${exp.category}`, exp.category))}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold tabular-nums text-red-400">−{fmt.format(exp.amount)}</p>
                    <p className="text-xs text-text-muted">{dateFmt.format(new Date(exp.date))}</p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(exp._id)}
                    aria-label={`${t('expenses.deleteExpense')}: ${exp.description}`}
                    className="ml-1 p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={t('common.prevPage')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} aria-hidden="true" /> {t('common.prev')}
              </button>
              <span className="text-sm text-text-muted tabular-nums">
                {t('common.pageOf', { page, total: totalPages })}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label={t('common.nextPage')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.next')} <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly Trend Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="glass border border-border rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4">{t('expenses.monthlySpend')}</h2>
        {trendData.some(d => d[TREND_KEY] > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => fmt.format(v)} />
              <Tooltip
                formatter={(v: any) => [fmt.format(v), t('expenses.title')]}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}
              />
              <Bar dataKey={TREND_KEY} fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-muted text-sm">{t('expenses.noCategoryData')}</p>
        )}
      </motion.div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog" aria-modal="true" aria-labelledby="exp-modal-title">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl"
              style={{ overscrollBehavior: 'contain' }}
            >
              <h2 id="exp-modal-title" className="text-2xl font-bold mb-4">{t('expenses.addExpenseTitle')}</h2>
              {formError && (
                <div role="alert" aria-live="polite" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={15} aria-hidden="true" /> {formError}
                </div>
              )}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="exp-desc" className="block text-sm text-text-muted mb-1">{t('expenses.descriptionLabel')}</label>
                  <input required id="exp-desc" type="text" autoComplete="off" placeholder="e.g. Lunch at Pho 24…"
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="exp-amount" className="block text-sm text-text-muted mb-1">{t('expenses.amountLabel')}</label>
                    <input required id="exp-amount" type="number" step="0.01" min="0.01" placeholder="0.00"
                      value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="exp-currency" className="block text-sm text-text-muted mb-1">{t('expenses.currencyLabel')}</label>
                    <select id="exp-currency" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                      className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                      <option value="USD">USD $</option>
                      <option value="VND">VND ₫</option>
                      <option value="EUR">EUR €</option>
                      <option value="JPY">JPY ¥</option>
                      <option value="GBP">GBP £</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="exp-cat" className="block text-sm text-text-muted mb-1">{t('expenses.categoryLabel')}</label>
                  <select id="exp-cat" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{String(t(`common.categories.${c}`, c))}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="exp-date" className="block text-sm text-text-muted mb-1">{t('expenses.dateLabel')}</label>
                  <input required id="exp-date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setIsModalOpen(false); setFormError(''); }}
                    className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors">
                    {t('expenses.cancel')}
                  </button>
                  <button type="submit" disabled={saving} aria-busy={saving}
                    className="flex-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white disabled:opacity-50 transition-colors font-medium">
                    {saving ? t('expenses.saving') : t('expenses.saveExpense')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            role="dialog" aria-modal="true" aria-labelledby="exp-del-title">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
              style={{ overscrollBehavior: 'contain' }}>
              <h3 id="exp-del-title" className="text-xl font-bold mb-2">{t('expenses.deleteExpense')}</h3>
              <p className="text-text-muted text-sm mb-6">{t('expenses.deleteConfirm')}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors">
                  {t('expenses.keepIt')}
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">
                  {t('expenses.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: any; label: string; value: string; sub: string; color: string; bg: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -3 }}
      className={`glass border rounded-2xl p-5 ${bg}`}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <Icon size={18} className={color} aria-hidden="true" />
      </div>
      <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
      <p className="text-xs text-text-muted mt-1">{sub}</p>
    </motion.div>
  );
}
