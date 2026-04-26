import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Receipt, AlertCircle } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSubs: 0,
    subsCost: 0,
    totalReceipts: 0,
    receiptsAmount: 0,
    expiringSubs: 0,
    expiringReceipts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [subsRes, receiptsRes] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/receipts')
        ]);

        const subs = subsRes.data;
        const receipts = receiptsRes.data;

        // Calculate Stats
        const subsCost = subs.reduce((acc: number, sub: any) => acc + sub.amount, 0);
        
        const today = new Date();
        const expiringSubs = subs.filter((sub: any) => {
          const diffDays = Math.ceil((new Date(sub.nextBillingDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        }).length;

        const receiptsAmount = receipts.reduce((acc: number, r: any) => acc + r.totalAmount, 0);
        const expiringReceipts = receipts.filter((r: any) => {
           const diffDays = Math.ceil((new Date(r.warrantyExpiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
           return diffDays >= 0 && diffDays <= 30;
        }).length;

        setStats({
          totalSubs: subs.length,
          subsCost,
          totalReceipts: receipts.length,
          receiptsAmount,
          expiringSubs,
          expiringReceipts,
        });

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-text-muted">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text">Dashboard Overview</h1>
        <p className="text-text-muted mt-2">Welcome back! Here's a summary of your trusted documents.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Subscriptions" 
          value={stats.totalSubs.toString()} 
          amount={`$${stats.subsCost.toFixed(2)} total/cycle`} 
          icon={CreditCard} 
          trend={`${stats.expiringSubs} renewing soon`}
        />
        <StatCard 
          title="Total Receipts" 
          value={stats.totalReceipts.toString()} 
          amount={`$${stats.receiptsAmount.toFixed(2)}`} 
          icon={Receipt} 
          trend={`${stats.expiringReceipts} warranties expiring soon`}
        />
        <StatCard 
          title="Action Needed" 
          value={(stats.expiringSubs + stats.expiringReceipts).toString()} 
          amount="Expiring items" 
          icon={AlertCircle} 
          trend="Review immediately"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl border border-border"
        >
          <h2 className="text-xl font-semibold mb-4">Upcoming Renewals</h2>
          <div className="flex flex-col gap-4">
            <RenewalItem name="Netflix Premium" date="Tomorrow" amount="$15.99" />
            <RenewalItem name="Adobe Creative Cloud" date="In 3 days" amount="$29.99" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl border border-border"
        >
          <h2 className="text-xl font-semibold mb-4">Recent Receipts</h2>
          <div className="flex flex-col gap-4">
            <ReceiptItem store="Best Buy" item="Sony Headphones" date="Oct 12, 2026" />
            <ReceiptItem store="Apple Store" item="MacBook Pro" date="Oct 05, 2026" />
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
      whileHover={{ y: -5 }}
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

function RenewalItem({ name, date, amount }: any) {
  return (
    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-surface-hover transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          {name[0]}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-text-muted">Renews {date}</p>
        </div>
      </div>
      <div className="font-semibold">{amount}</div>
    </div>
  );
}

function ReceiptItem({ store, item, date }: any) {
  return (
    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-surface-hover transition-colors">
      <div className="flex flex-col">
        <p className="font-medium">{store}</p>
        <p className="text-sm text-text-muted">{item}</p>
      </div>
      <div className="text-sm text-text-muted">{date}</div>
    </div>
  );
}
