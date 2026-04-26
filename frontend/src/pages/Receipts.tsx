import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Search, Filter } from 'lucide-react';
import api from '../api';

export default function Receipts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    itemName: '',
    purchaseDate: '',
    totalAmount: '',
    expiryDate: '',
    notes: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select an image file');

    setUploading(true);
    try {
      const data = new FormData();
      data.append('storeName', formData.storeName);
      data.append('itemName', formData.itemName); // We map this to notes or expand model, wait model doesn't have itemName! Ah!
      // Let's use notes for itemName since model has storeName, notes. Or we can just concatenate storeName + itemName.
      // Wait, model has `storeName`. `itemName` was in my dummy data. I'll pass it in `notes`.
      data.append('purchaseDate', formData.purchaseDate);
      data.append('totalAmount', formData.totalAmount);
      if (formData.expiryDate) data.append('expiryDate', formData.expiryDate);
      data.append('notes', formData.notes ? `${formData.itemName} | ${formData.notes}` : formData.itemName);
      data.append('receiptImage', imageFile);

      await api.post('/receipts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsModalOpen(false);
      setFormData({ storeName: '', itemName: '', purchaseDate: '', totalAmount: '', expiryDate: '', notes: '' });
      setImageFile(null);
      fetchReceipts();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredReceipts = receipts.filter(r => 
    r.storeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-h">Receipt Management</h1>
          <p className="text-text-muted mt-2">Digitize and track warranties before the thermal paper fades.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
        >
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
                const expiryDate = new Date(receipt.expiryDate || receipt.purchaseDate); // Fallback to purchase date if no warranty
                const today = new Date();
                const diffTime = expiryDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let status = receipt.expiryDate ? 'Active' : 'No Warranty';
                if (receipt.expiryDate) {
                  if (diffDays < 0) status = 'Expired';
                  else if (diffDays <= 30) status = 'Expiring Soon';
                }

                return (
                  <motion.tr 
                    key={receipt._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-surface-hover/30 transition-colors"
                  >
                    <td className="p-4 flex items-center gap-4">
                      {receipt.imageUrl && (
                         <div className="w-12 h-12 rounded-lg bg-surface-hover overflow-hidden border border-border">
                           <img src={`http://localhost:5000${receipt.imageUrl}`} alt="Receipt" className="w-full h-full object-cover" />
                         </div>
                      )}
                      <div>
                        <p className="font-bold text-text-h">{receipt.storeName}</p>
                        <p className="text-sm text-text-muted">{receipt.notes ? receipt.notes.split('|')[0] : 'No item specified'}</p>
                      </div>
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
      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4">Upload Receipt</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Store Name</label>
                <input required type="text" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Item Name</label>
                <input required type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-text-muted mb-1">Purchase Date</label>
                  <input required type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-text-muted mb-1">Total Amount</label>
                  <input required type="number" step="0.01" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Warranty Expiry (Optional)</label>
                <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Receipt Image</label>
                <input required type="file" accept="image/jpeg, image/png, image/webp, application/pdf" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
