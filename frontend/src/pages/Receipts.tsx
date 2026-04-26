import { useState, useEffect, useMemo, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Search, Trash2, AlertCircle } from 'lucide-react';
import api from '../api';

const CATEGORIES = ['All', 'Electronics', 'Appliances', 'Clothing', 'Food', 'Services', 'Health', 'Other'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Appliances:  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Clothing:    'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Food:        'bg-green-500/10 text-green-400 border-green-500/20',
  Services:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Health:      'bg-red-500/10 text-red-400 border-red-500/20',
  Other:       'bg-surface-hover text-text-muted border-border',
};

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function Receipts() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    storeName: '', itemName: '', purchaseDate: '', totalAmount: '', expiryDate: '', category: 'Other',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchReceipts(); }, []);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/receipts');
      setReceipts(response.data);
    } catch {
      setFetchError('Failed to load receipts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) { setUploadError('Please select an image file.'); return; }
    setUploading(true);
    setUploadError('');
    try {
      const data = new FormData();
      data.append('storeName', formData.storeName);
      data.append('purchaseDate', formData.purchaseDate);
      data.append('totalAmount', formData.totalAmount);
      data.append('category', formData.category);
      if (formData.expiryDate) data.append('expiryDate', formData.expiryDate);
      data.append('notes', formData.itemName);
      data.append('receiptImage', imageFile);
      await api.post('/receipts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsModalOpen(false);
      setFormData({ storeName: '', itemName: '', purchaseDate: '', totalAmount: '', expiryDate: '', category: 'Other' });
      setImageFile(null);
      fetchReceipts();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/receipts/${id}`);
      setReceipts(prev => prev.filter(r => r._id !== id));
    } catch {
      alert('Failed to delete receipt.');
    } finally {
      setConfirmDelete(null);
    }
  };

  // Derived: filtered receipts (combine filter+search in one pass per rerender-derived-state-no-effect)
  const filteredReceipts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return receipts.filter(r => {
      const matchCat = activeCategory === 'All' || r.category === activeCategory;
      const matchQ = !q || r.storeName.toLowerCase().includes(q) || (r.notes && r.notes.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [receipts, searchTerm, activeCategory]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-h text-wrap-balance">Receipt Management</h1>
          <p className="text-text-muted mt-1">Digitize and track warranties before the thermal paper fades.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Upload a new receipt"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
        >
          <Upload size={20} aria-hidden="true" /> Upload Receipt
        </button>
      </header>

      {/* Search */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <label htmlFor="receipt-search" className="sr-only">Search receipts</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} aria-hidden="true" />
          <input
            id="receipt-search"
            type="search"
            name="search"
            autoComplete="off"
            placeholder="Search stores or items…"
            className="w-full bg-surface-hover border border-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-text"
            value={searchTerm}
            onChange={e => { startTransition(() => setSearchTerm(e.target.value)); }}
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white border-primary'
                : 'border-border text-text-muted hover:border-primary/50 hover:text-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error state */}
      {fetchError && (
        <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
          <AlertCircle size={18} aria-hidden="true" /> {fetchError}
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover/50 border-b border-border">
              <th scope="col" className="p-4 font-medium text-text-muted">Store & Item</th>
              <th scope="col" className="p-4 font-medium text-text-muted">Category</th>
              <th scope="col" className="p-4 font-medium text-text-muted">Purchase Date</th>
              <th scope="col" className="p-4 font-medium text-text-muted tabular-nums">Amount</th>
              <th scope="col" className="p-4 font-medium text-text-muted">Warranty</th>
              <th scope="col" className="p-4 font-medium text-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-border animate-pulse">
                  <td className="p-4"><div className="h-4 bg-surface-hover rounded w-32" /></td>
                  <td className="p-4"><div className="h-4 bg-surface-hover rounded w-20" /></td>
                  <td className="p-4"><div className="h-4 bg-surface-hover rounded w-24" /></td>
                  <td className="p-4"><div className="h-4 bg-surface-hover rounded w-16" /></td>
                  <td className="p-4"><div className="h-4 bg-surface-hover rounded w-20" /></td>
                  <td className="p-4"><div className="h-4 bg-surface-hover rounded w-12 ml-auto" /></td>
                </tr>
              ))
            ) : filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-text-muted">
                  <FileText size={40} className="mx-auto mb-3 opacity-20" aria-hidden="true" />
                  <p>No receipts found{searchTerm || activeCategory !== 'All' ? ' matching your filters' : ''}.</p>
                </td>
              </tr>
            ) : (
              filteredReceipts.map((receipt, i) => {
                const hasExpiry = !!receipt.expiryDate;
                const diffDays = hasExpiry
                  ? Math.ceil((new Date(receipt.expiryDate).getTime() - Date.now()) / 86400000)
                  : null;
                let status = hasExpiry ? 'Active' : 'No Warranty';
                if (hasExpiry && diffDays !== null) {
                  if (diffDays < 0) status = 'Expired';
                  else if (diffDays <= 30) status = 'Expiring Soon';
                }
                return (
                  <motion.tr
                    key={receipt._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border hover:bg-surface-hover/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {receipt.imageUrl && (
                          <div className="w-10 h-10 rounded-lg bg-surface-hover overflow-hidden border border-border flex-shrink-0">
                            <img
                              src={`http://localhost:5000${receipt.imageUrl}`}
                              alt={`Receipt from ${receipt.storeName}`}
                              width={40} height={40}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-text-h truncate">{receipt.storeName}</p>
                          <p className="text-sm text-text-muted truncate">{receipt.notes?.split('|')[0]?.trim() || 'No item specified'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[receipt.category] ?? CATEGORY_COLORS['Other']}`}>
                        {receipt.category || 'Other'}
                      </span>
                    </td>
                    <td className="p-4 text-text tabular-nums">{dateFmt.format(new Date(receipt.purchaseDate))}</td>
                    <td className="p-4 font-semibold tabular-nums">{fmt.format(receipt.totalAmount)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        status === 'Expiring Soon' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        status === 'Expired' ? 'bg-surface-hover text-text-muted border-border' :
                        'bg-surface-hover text-text-muted border-border'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setConfirmDelete(receipt._id)}
                        aria-label={`Delete receipt from ${receipt.storeName}`}
                        className="p-2 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Upload receipt">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl"
              style={{ overscrollBehavior: 'contain' }}
            >
              <h2 className="text-2xl font-bold mb-4">Upload Receipt</h2>
              {uploadError && (
                <div role="alert" aria-live="polite" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={15} aria-hidden="true" /> {uploadError}
                </div>
              )}
              <form onSubmit={handleUpload} className="space-y-4">
                {[
                  { id: 'up-store', label: 'Store Name', key: 'storeName', type: 'text', placeholder: 'e.g. Best Buy…', autoComplete: 'organization' },
                  { id: 'up-item', label: 'Item Name', key: 'itemName', type: 'text', placeholder: 'e.g. MacBook Pro…', autoComplete: 'off' },
                ].map(f => (
                  <div key={f.id}>
                    <label htmlFor={f.id} className="block text-sm text-text-muted mb-1">{f.label}</label>
                    <input required id={f.id} type={f.type} placeholder={f.placeholder} autoComplete={f.autoComplete}
                      value={(formData as any)[f.key]}
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
                  </div>
                ))}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="up-date" className="block text-sm text-text-muted mb-1">Purchase Date</label>
                    <input required id="up-date" type="date" value={formData.purchaseDate}
                      onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="up-amount" className="block text-sm text-text-muted mb-1">Amount ($)</label>
                    <input required id="up-amount" type="number" step="0.01" min="0" placeholder="0.00" value={formData.totalAmount}
                      onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                      className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
                  </div>
                </div>
                <div>
                  <label htmlFor="up-cat" className="block text-sm text-text-muted mb-1">Category</label>
                  <select id="up-cat" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="up-expiry" className="block text-sm text-text-muted mb-1">Warranty Expiry <span className="text-xs opacity-60">(optional)</span></label>
                  <input id="up-expiry" type="date" value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" />
                </div>
                <div>
                  <label htmlFor="up-file" className="block text-sm text-text-muted mb-1">Receipt Image</label>
                  <input required id="up-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 text-sm file:mr-3 file:px-3 file:py-1 file:rounded-lg file:bg-primary/20 file:text-primary file:border-0 file:text-sm cursor-pointer" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setIsModalOpen(false); setUploadError(''); }}
                    className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={uploading}
                    className="flex-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white disabled:opacity-50 transition-colors font-medium">
                    {uploading ? 'Uploading…' : 'Upload Receipt'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
              <h3 className="text-xl font-bold mb-2">Delete Receipt?</h3>
              <p className="text-text-muted text-sm mb-6">This will permanently remove the receipt and its image.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors">Keep It</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
