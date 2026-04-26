import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Receipt, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSubs: 0,
    subsCost: 0,
    totalReceipts: 0,
    receiptsAmount: 0,
    expiringSubs: 0,
    expiringReceipts: 0,
  });
  const [upcomingRenewals, setUpcomingRenewals] = useState<any[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [subsRes, receiptsRes] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/receipts'),
        ]);

        const subs: any[] = subsRes.data;
        const receipts: any[] = receiptsRes.data;

        const today = new Date();

        // ─── Stats ───────────────────────────────────────────────
        // Fix: use sub.cost not sub.amount
        const subsCost = subs.reduce((acc, sub) => acc + (sub.cost || 0), 0);

        const expiringSubs = subs.filter((sub) => {
          const diffDays = Math.ceil((new Date(sub.nextBillingDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        }).length;

        const receiptsAmount = receipts.reduce((acc, r) => acc + (r.totalAmount || 0), 0);

        // Fix: use r.expiryDate not r.warrantyExpiryDate
        const expiringReceipts = receipts.filter((r) => {
          if (!r.expiryDate) return false;
          const diffDays = Math.ceil((new Date(r.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 30;
        }).length;

        setStats({ totalSubs: subs.length, subsCost, totalReceipts: receipts.length, receiptsAmount, expiringSubs, expiringReceipts });

        // ─── Upcoming Renewals (real data, next 7 days) ──────────
        const upcoming = subs
          .filter((sub) => {
            const diff = Math.ceil((new Date(sub.nextBillingDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diff >= 0 && diff <= 30;
          })
          .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
          .slice(0, 4);
        setUpcomingRenewals(upcoming);

        // ─── Recent Receipts (last 4) ─────────────────────────────
        setRecentReceipts(receipts.slice(0, 4));

      } catch {
        setFetchError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-64 bg-surface-hover rounded-xl" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-36 bg-surface-hover rounded-2xl" />)}
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
      <AlertCircle size={24} />
      <p>{fetchError}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text">Dashboard Overview</h1>
        <p className="text-text-muted mt-2">
          Welcome back{user?.name ? `, ${user.name}` : ''}! Here's a summary of your trusted documents.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Subscriptions"
          value={stats.totalSubs.toString()}
          amount={`$${stats.subsCost.toFixed(2)} total/cycle`}
          icon={CreditCard}
          trend={stats.expiringSubs > 0 ? `${stats.expiringSubs} renewing soon` : 'All clear'}
        />
        <StatCard
          title="Total Receipts"
          value={stats.totalReceipts.toString()}
          amount={`$${stats.receiptsAmount.toFixed(2)}`}
          icon={Receipt}
          trend={stats.expiringReceipts > 0 ? `${stats.expiringReceipts} warranties expiring` : 'All warranties active'}
        />
        <StatCard
          title="Action Needed"
          value={(stats.expiringSubs + stats.expiringReceipts).toString()}
          amount="Expiring items"
          icon={AlertCircle}
          trend={(stats.expiringSubs + stats.expiringReceipts) > 0 ? 'Review immediately' : 'Nothing urgent'}
          highlight={(stats.expiringSubs + stats.expiringReceipts) > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Upcoming Renewals – REAL DATA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl border border-border"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Renewals</h2>
            <Link to="/subscriptions" className="text-primary text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingRenewals.length === 0 ? (
              <p className="text-text-muted text-sm">No renewals in the next 30 days.</p>
            ) : (
              upcomingRenewals.map((sub) => {
                const diffDays = Math.ceil((new Date(sub.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const label = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;
                return (
                  <RenewalItem
                    key={sub._id}
                    name={sub.serviceName}
                    date={label}
                    amount={`$${sub.cost.toFixed(2)}`}
                    urgent={diffDays <= 3}
                  />
                );
              })
            )}
          </div>
        </motion.div>

        {/* Recent Receipts – REAL DATA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl border border-border"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Receipts</h2>
            <Link to="/receipts" className="text-primary text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentReceipts.length === 0 ? (
              <p className="text-text-muted text-sm">No receipts uploaded yet.</p>
            ) : (
              recentReceipts.map((r) => (
                <ReceiptItem
                  key={r._id}
                  store={r.storeName}
                  item={r.notes ? r.notes.split('|')[0].trim() : 'Item'}
                  date={new Date(r.purchaseDate).toLocaleDateString()}
                  amount={`$${r.totalAmount?.toFixed(2)}`}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, amount, icon: Icon, trend, highlight }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl border relative overflow-hidden ${
        highlight ? 'bg-primary/10 border-primary/30' : 'glass border-border'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-text-muted font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${highlight ? 'bg-primary text-white' : 'bg-surface-hover text-primary'}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span className="font-medium text-text">{amount}</span> • {trend}
      </div>
    </motion.div>
  );
}

function RenewalItem({ name, date, amount, urgent }: any) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-xl hover:bg-surface-hover transition-colors ${urgent ? 'bg-red-500/5' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${urgent ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
          {name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className={`text-sm ${urgent ? 'text-red-400' : 'text-text-muted'}`}>Renews {date}</p>
        </div>
      </div>
      <div className="font-semibold">{amount}</div>
    </div>
  );
}

function ReceiptItem({ store, item, date, amount }: any) {
  return (
    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-surface-hover transition-colors">
      <div className="flex flex-col">
        <p className="font-medium">{store}</p>
        <p className="text-sm text-text-muted">{item}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{amount}</p>
        <p className="text-sm text-text-muted">{date}</p>
      </div>
    </div>
  );
}
