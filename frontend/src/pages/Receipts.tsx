import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Search, Filter } from 'lucide-react';
import api from '../api';

export default function Receipts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/receipts');
      setReceipts(response.data);
    } catch (err) {
      console.error('Failed to load receipts', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter(r => 
    r.storeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-h">Receipt Management</h1>
          <p className="text-text-muted mt-2">Digitize and track warranties before the thermal paper fades.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20">
          <Upload size={20} /> Upload Receipt
        </button>
      </header>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search stores or items..." 
            className="w-full bg-surface-hover border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 glass border border-border rounded-xl text-text hover:bg-surface-hover transition-colors">
          <Filter size={20} /> Filter
        </button>
      </div>

      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover/50 border-b border-border">
              <th className="p-4 font-medium text-text-muted">Store & Item</th>
              <th className="p-4 font-medium text-text-muted">Purchase Date</th>
              <th className="p-4 font-medium text-text-muted">Amount</th>
              <th className="p-4 font-medium text-text-muted">Warranty Status</th>
              <th className="p-4 font-medium text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-text-muted">Loading receipts...</td></tr>
            ) : filteredReceipts.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-text-muted">No receipts found.</td></tr>
            ) : (
              filteredReceipts.map((receipt, i) => {
                // Calculate warranty status
                const expiryDate = new Date(receipt.warrantyExpiryDate);
                const today = new Date();
                const diffTime = expiryDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let status = 'Active';
                if (diffDays < 0) status = 'Expired';
                else if (diffDays <= 30) status = 'Expiring Soon';

                return (
                  <motion.tr 
                    key={receipt._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-surface-hover/30 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-bold text-text-h">{receipt.storeName}</p>
                      <p className="text-sm text-text-muted">{receipt.itemName}</p>
                    </td>
                    <td className="p-4 text-text">{new Date(receipt.purchaseDate).toLocaleDateString()}</td>
                    <td className="p-4 font-medium">${receipt.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status === 'Active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                        status === 'Expired' ? 'bg-surface-hover text-text-muted border border-border' :
                        'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                        <FileText size={18} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
