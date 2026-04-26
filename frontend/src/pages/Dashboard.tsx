import { motion } from 'framer-motion';
import { CreditCard, Receipt, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-text">Dashboard Overview</h1>
        <p className="text-text-muted mt-2">Welcome back! Here's a summary of your trusted documents.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Subscriptions" 
          value="4" 
          amount="$45.99/mo" 
          icon={CreditCard} 
          trend="+1 this month"
        />
        <StatCard 
          title="Total Receipts" 
          value="128" 
          amount="$1,240.00" 
          icon={Receipt} 
          trend="Saved $50 in returns"
        />
        <StatCard 
          title="Expiring Soon" 
          value="2" 
          amount="Action needed" 
          icon={AlertCircle} 
          trend="Within 7 days"
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
