import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Plus, AlertCircle } from 'lucide-react';
import api from '../api';

export default function Subscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubs(response.data);
    } catch (err: any) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleGuillotine = async (id: string) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      setSubs((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert('Failed to cut subscription!');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-h">Subscription Guillotine</h1>
          <p className="text-text-muted mt-2">Track, analyze, and cut unwanted subscriptions.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20">
          <Plus size={20} /> Add Subscription
        </button>
      </header>

      {loading ? (
        <div className="text-text-muted">Loading subscriptions...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : subs.length === 0 ? (
        <div className="text-text-muted">No active subscriptions found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {subs.map((sub) => (
              <SubscriptionCard key={sub._id} sub={sub} onCut={handleGuillotine} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({ sub, onCut }: any) {
  const [isSlashing, setIsSlashing] = useState(false);

  const handleCutClick = () => {
    setIsSlashing(true);
    // Timeout to allow animation to play before actual delete
    setTimeout(() => {
      onCut(sub._id);
    }, 500);
  };

  // Basic diff calculation for daysLeft
  const nextBillDate = new Date(sub.nextBillingDate);
  const today = new Date();
  const diffTime = Math.abs(nextBillDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays <= 3;
  const formattedDate = nextBillDate.toLocaleDateString();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isSlashing ? 0 : 1, scale: isSlashing ? 0.8 : 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
      className={`relative overflow-hidden glass rounded-2xl border p-6 ${
        isUrgent ? 'border-red-500/50 bg-red-500/5' : 'border-border'
      }`}
    >
      {/* Guillotine Slash Effect */}
      <AnimatePresence>
        {isSlashing && (
          <motion.div
            initial={{ top: '-100%', rotate: -15 }}
            animate={{ top: '200%', rotate: -15 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            className="absolute -inset-x-20 h-2 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center font-bold text-lg text-primary">
            {sub.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-lg text-text-h">{sub.name}</h3>
            <p className="text-text-muted text-sm">{sub.cycle}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mt-6">
        <div>
          <p className="text-3xl font-bold">${sub.amount.toFixed(2)}</p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${isUrgent ? 'text-red-400 font-medium' : 'text-text-muted'}`}>
            {isUrgent && <AlertCircle size={14} />} Renews {formattedDate}
          </p>
        </div>
        
        <button
          onClick={handleCutClick}
          disabled={isSlashing}
          className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"
          title="Cut this subscription"
        >
          <Scissors size={20} />
        </button>
      </div>
    </motion.div>
  );
}
