import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../api';
import { triggerConfetti } from '../utils/confetti';

export default function QuickCapture() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-trigger camera on mount
  useEffect(() => {
    if (!imageFile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    setUploading(true);
    setError('');

    try {
      const data = new FormData();
      // Default values for quick capture
      data.append('storeName', 'Quick Capture');
      data.append('purchaseDate', new Date().toISOString().split('T')[0]);
      data.append('totalAmount', '0');
      data.append('category', 'Other');
      data.append('receiptImage', imageFile);
      data.append('notes', 'Captured via mobile shortcut');

      await api.post('/receipts', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      triggerConfetti();
      toast.success(t('receipts.uploadSuccess'));
      navigate('/app/receipts');
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto h-[80vh] flex flex-col justify-center p-4">
      <AnimatePresence mode="wait">
        {!previewUrl ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
              <Camera size={48} />
            </div>
            <h2 className="text-2xl font-bold">{t('receipts.quickCaptureTitle', 'Quick Capture')}</h2>
            <p className="text-text-muted">
              {t('receipts.quickCaptureDesc', 'Snap a photo of your receipt to save it instantly.')}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold text-lg transition-transform active:scale-95"
            >
              {t('receipts.openCamera', 'Open Camera')}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-text-muted hover:text-text"
            >
              {t('common.cancel')}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-6"
          >
            <div className="relative flex-1 bg-surface-hover rounded-3xl overflow-hidden border border-border">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setImageFile(null);
                }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setImageFile(null);
                }}
                disabled={uploading}
                className="py-4 rounded-2xl border border-border font-medium hover:bg-surface-hover disabled:opacity-50"
              >
                {t('common.retake', 'Retake')}
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="py-4 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Upload size={20} /> {t('common.upload', 'Upload')}</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
