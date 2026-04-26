import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Plus, AlertCircle } from 'lucide-react';
import api from '../api';

export default function Subscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubs(response.data);
    } catch {
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuillotine = async (id: string) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      setSubs((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert('Failed to cancel subscription!');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-h">Subscription Guillotine</h1>
          <p className="text-text-muted mt-2">Track, analyze, and cut unwanted subscriptions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} /> Add Subscription
        </button>
      </header>

      {loading ? (
        <div className="text-text-muted animate-pulse">Loading subscriptions...</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>
      ) : subs.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Scissors size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No subscriptions yet.</p>
          <p className="text-sm mt-1">Click "Add Subscription" to start tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {subs.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                sub={sub}
                onCutRequest={(id: string) => setConfirmDelete(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <AddSubscriptionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchSubs(); }}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-2">Cancel Subscription?</h3>
            <p className="text-text-muted text-sm mb-6">This action cannot be undone. The subscription will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors"
              >
                Keep It
              </button>
              <button
                onClick={() => handleGuillotine(confirmDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Add Subscription Modal ───────────────────────────────────────────────────
function AddSubscriptionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    serviceName: '', cost: '', billingCycle: 'monthly', nextBillingDate: '', reminderDaysBefore: '3',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/subscriptions', {
        serviceName: form.serviceName,
        cost: Number(form.cost),
        billingCycle: form.billingCycle,
        nextBillingDate: form.nextBillingDate,
        reminderDaysBefore: Number(form.reminderDaysBefore),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add subscription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-4">Add Subscription</h2>
        {error && <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Service Name</label>
            <input required type="text" value={form.serviceName} onChange={e => setForm({ ...form, serviceName: e.target.value })}
              placeholder="e.g. Netflix, Adobe CC" className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-text-muted mb-1">Cost ($)</label>
              <input required type="number" step="0.01" min="0" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })}
                placeholder="0.00" className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-text-muted mb-1">Billing Cycle</label>
              <select value={form.billingCycle} onChange={e => setForm({ ...form, billingCycle: e.target.value })}
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Next Billing Date</label>
            <input required type="date" value={form.nextBillingDate} onChange={e => setForm({ ...form, nextBillingDate: e.target.value })}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Remind Me (days before)</label>
            <input type="number" min="1" value={form.reminderDaysBefore} onChange={e => setForm({ ...form, reminderDaysBefore: e.target.value })}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white disabled:opacity-50 transition-colors">
              {submitting ? 'Saving...' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Subscription Card ─────────────────────────────────────────────────────────
function SubscriptionCard({ sub, onCutRequest }: { sub: any; onCutRequest: (id: string) => void }) {

  const handleCutClick = () => {
    onCutRequest(sub._id);
  };

  // Fix: use correct model fields serviceName, cost, billingCycle, nextBillingDate
  const nextBillDate = new Date(sub.nextBillingDate);
  const today = new Date();
  const diffTime = nextBillDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays >= 0 && diffDays <= 3;
  const isOverdue = diffDays < 0;
  const formattedDate = nextBillDate.toLocaleDateString();
  const initial = sub.serviceName?.[0]?.toUpperCase() ?? '?';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
      className={`relative overflow-hidden glass rounded-2xl border p-6 ${
        isOverdue ? 'border-gray-500/50 bg-gray-500/5' :
        isUrgent ? 'border-red-500/50 bg-red-500/5' : 'border-border'
      }`}
    >


      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center font-bold text-lg text-primary">
            {initial}
          </div>
          <div>
            {/* Fix: serviceName not name */}
            <h3 className="font-bold text-lg text-text-h">{sub.serviceName}</h3>
            {/* Fix: billingCycle not cycle */}
            <p className="text-text-muted text-sm capitalize">{sub.billingCycle}</p>
          </div>
        </div>
        {isOverdue && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Overdue</span>
        )}
      </div>

      <div className="flex justify-between items-end mt-6">
        <div>
          {/* Fix: cost not amount */}
          <p className="text-3xl font-bold">${sub.cost?.toFixed(2)}</p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${isOverdue ? 'text-gray-400' : isUrgent ? 'text-red-400 font-medium' : 'text-text-muted'}`}>
            {isUrgent && !isOverdue && <AlertCircle size={14} />}
            {isOverdue ? `Was due ${formattedDate}` : `Renews ${formattedDate}`}
          </p>
        </div>
        <button
          onClick={handleCutClick}
          className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
          title="Cancel this subscription"
        >
          <Scissors size={20} />
        </button>
      </div>
    </motion.div>
  );
}
