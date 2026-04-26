import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, DollarSign, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../api';

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];
const CYCLE_LABELS: Record<string, string> = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

// Compute cost normalised to monthly
function toMonthly(cost: number, cycle: string): number {
  if (cycle === 'yearly') return cost / 12;
  if (cycle === 'weekly') return cost * 4.33;
  return cost;
}

// Generate "next N months" labels
function getNextMonths(n: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push(d.toLocaleString('default', { month: 'short', year: '2-digit' }));
  }
  return labels;
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
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
  const [subs, setSubs] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [subsRes, rcpRes] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/receipts'),
        ]);
        setSubs(subsRes.data);
        setReceipts(rcpRes.data);
      } catch {
        setError('Failed to load analytics data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived data (memoised to avoid recalc on re-renders) ────────────────
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
    const labels = getNextMonths(6);
    const monthlyTotal = subs.reduce((acc, s) => acc + toMonthly(s.cost, s.billingCycle), 0);
    return labels.map(month => ({ month, Subscriptions: parseFloat(monthlyTotal.toFixed(2)) }));
  }, [subs]);

  // Pie chart: subs by billing cycle
  const cycleData = useMemo(() => {
    const map: Record<string, number> = {};
    subs.forEach(s => { map[s.billingCycle] = (map[s.billingCycle] || 0) + 1; });
    return Object.entries(map).map(([cycle, count]) => ({ name: CYCLE_LABELS[cycle] ?? cycle, value: count }));
  }, [subs]);

  // Pie chart: receipts by rough cost bracket
  const costBrackets = useMemo(() => {
    const brackets = [
      { name: 'Under $50', value: 0 },
      { name: '$50–$200', value: 0 },
      { name: '$200–$1K', value: 0 },
      { name: 'Over $1K', value: 0 },
    ];
    receipts.forEach(r => {
      if (r.totalAmount < 50) brackets[0].value++;
      else if (r.totalAmount < 200) brackets[1].value++;
      else if (r.totalAmount < 1000) brackets[2].value++;
      else brackets[3].value++;
    });
    return brackets.filter(b => b.value > 0);
  }, [receipts]);

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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text text-wrap-balance">Spending Analytics</h1>
        <p className="text-text-muted mt-2">Understand your financial footprint at a glance.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Monthly Burn Rate" value={fmt.format(totalMonthly)} icon={DollarSign} desc="across all subscriptions" />
        <KpiCard title="Yearly Projection" value={fmt.format(totalMonthly * 12)} icon={TrendingUp} desc="based on current subscriptions" />
        <KpiCard title="Active Warranty Value" value={fmt.format(totalWarrantyValue)} icon={ShieldCheck} desc="receipts with valid warranties" />
        <KpiCard title="Warranties Expiring" value={expiringCount.toString()} icon={AlertCircle} desc="within 30 days" highlight={expiringCount > 0} />
      </div>

      {/* Spending Forecast Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">6-Month Subscription Forecast</h2>
        {subs.length === 0 ? (
          <p className="text-text-muted text-sm">Add subscriptions to see your spending forecast.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyForecast} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="Subscriptions" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Subscriptions by Cycle</h2>
          {cycleData.length === 0 ? (
            <p className="text-text-muted text-sm">No subscription data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={cycleData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {cycleData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} subscription${v !== 1 ? 's' : ''}`, '']} />
                <Legend wrapperStyle={{ fontSize: '13px', color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Receipts by Value Range</h2>
          {costBrackets.length === 0 ? (
            <p className="text-text-muted text-sm">No receipt data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={costBrackets} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {costBrackets.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} receipt${v !== 1 ? 's' : ''}`, '']} />
                <Legend wrapperStyle={{ fontSize: '13px', color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Subscription List with monthly cost breakdown */}
      {subs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Subscription Cost Breakdown</h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-hover/50 border-b border-border">
                <th className="p-4 font-medium text-text-muted">Service</th>
                <th className="p-4 font-medium text-text-muted">Cycle</th>
                <th className="p-4 font-medium text-text-muted text-right tabular-nums">Billed</th>
                <th className="p-4 font-medium text-text-muted text-right tabular-nums">Monthly Equiv.</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s._id} className="border-b border-border hover:bg-surface-hover/30 transition-colors">
                  <td className="p-4 font-medium">{s.serviceName}</td>
                  <td className="p-4 text-text-muted capitalize">{s.billingCycle}</td>
                  <td className="p-4 text-right tabular-nums">{fmt.format(s.cost)}</td>
                  <td className="p-4 text-right tabular-nums text-primary font-semibold">{fmt.format(toMonthly(s.cost, s.billingCycle))}</td>
                </tr>
              ))}
              <tr className="bg-primary/5">
                <td colSpan={3} className="p-4 font-bold text-right">Total Monthly</td>
                <td className="p-4 text-right font-black text-primary tabular-nums">{fmt.format(totalMonthly)}</td>
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
