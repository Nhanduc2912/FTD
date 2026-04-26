import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Plus, AlertCircle } from 'lucide-react';

const DUMMY_SUBS = [
  { id: 1, name: 'Netflix Premium', cost: '$15.99', cycle: 'Monthly', nextBill: 'Tomorrow', daysLeft: 1 },
  { id: 2, name: 'Adobe CC', cost: '$29.99', cycle: 'Monthly', nextBill: 'In 3 days', daysLeft: 3 },
  { id: 3, name: 'Amazon Prime', cost: '$139.00', cycle: 'Yearly', nextBill: 'In 45 days', daysLeft: 45 },
  { id: 4, name: 'Spotify Premium', cost: '$10.99', cycle: 'Monthly', nextBill: 'In 12 days', daysLeft: 12 },
];

export default function Subscriptions() {
  const [subs, setSubs] = useState(DUMMY_SUBS);

  const handleGuillotine = (id: number) => {
    // Slash animation triggers, then remove
    setTimeout(() => {
      setSubs((prev) => prev.filter((s) => s.id !== id));
    }, 600);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {subs.map((sub) => (
            <SubscriptionCard key={sub.id} sub={sub} onCut={handleGuillotine} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SubscriptionCard({ sub, onCut }: any) {
  const [isSlashing, setIsSlashing] = useState(false);

  const handleCutClick = () => {
    setIsSlashing(true);
    onCut(sub.id);
  };

  const isUrgent = sub.daysLeft <= 3;

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
          <p className="text-3xl font-bold">{sub.cost}</p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${isUrgent ? 'text-red-400 font-medium' : 'text-text-muted'}`}>
            {isUrgent && <AlertCircle size={14} />} Renews {sub.nextBill}
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
