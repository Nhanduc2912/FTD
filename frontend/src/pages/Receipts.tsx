import {
  useState,
  useEffect,
  useMemo,
  startTransition,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Search,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Image,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../api";
import UpgradePrompt from "../components/UpgradePrompt";
import { useCurrency } from '../context/CurrencyContext';

// ── Types ────────────────────────────────────────────────────────────────────
interface IReceipt {
  _id: string;
  storeName: string;
  category: string;
  purchaseDate: string;
  totalAmount: number;
  expiryDate?: string;
  imageUrl?: string;
  notes?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Electronics",
  "Appliances",
  "Clothing",
  "Food",
  "Services",
  "Health",
  "Other",
] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Appliances: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Clothing: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Food: "bg-green-500/10 text-green-400 border-green-500/20",
  Services: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Health: "bg-red-500/10 text-red-400 border-red-500/20",
  Other: "bg-surface-hover text-text-muted border-border",
};

export default function Receipts() {
  const { t, i18n } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [upgradeLimit, setUpgradeLimit] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    storeName: "",
    itemName: "",
    purchaseDate: "",
    totalAmount: "",
    expiryDate: "",
    category: "Other",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Locale-aware formatters
  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [i18n.language],
  );

  useEffect(() => {
    fetchReceipts();
  }, [page]);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/receipts?page=${page}&limit=20`);
      // Support both paginated {data, page, totalPages} and legacy array
      if (Array.isArray(response.data)) {
        setReceipts(response.data);
      } else {
        setReceipts(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch {
      setFetchError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setUploadError(t("receipts.noImageError"));
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const data = new FormData();
      data.append("storeName", formData.storeName);
      data.append("purchaseDate", formData.purchaseDate);
      data.append("totalAmount", formData.totalAmount);
      data.append("category", formData.category);
      if (formData.expiryDate) data.append("expiryDate", formData.expiryDate);
      data.append("notes", formData.itemName);
      data.append("receiptImage", imageFile);
      await api.post("/receipts", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsModalOpen(false);
      setFormData({
        storeName: "",
        itemName: "",
        purchaseDate: "",
        totalAmount: "",
        expiryDate: "",
        category: "Other",
      });
      setImageFile(null);
      toast.success(t("receipts.uploadSuccess"));
      fetchReceipts();
    } catch (err: any) {
      if (err.response?.data?.code === "LIMIT_REACHED") {
        setIsModalOpen(false);
        setUpgradeLimit(true);
      } else {
        setUploadError(err.response?.data?.message || t("common.error"));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/receipts/${id}`);
      setReceipts((prev) => prev.filter((r) => r._id !== id));
      toast.success(t("receipts.deleteSuccess"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredReceipts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return receipts.filter((r) => {
      const matchCat =
        activeCategory === "All" || r.category === activeCategory;
      const matchQ =
        !q ||
        r.storeName.toLowerCase().includes(q) ||
        (r.notes?.toLowerCase().includes(q) ?? false);
      return matchCat && matchQ;
    });
  }, [receipts, searchTerm, activeCategory]);

  // i18n category label helper
  const catLabel = (cat: string) =>
    cat === "All"
      ? t("receipts.filterAll")
      : String(t(`common.categories.${cat}`, cat));

  // Warranty status helpers
  const getStatus = (receipt: IReceipt) => {
    if (!receipt.expiryDate)
      return {
        key: "receipts.statusNoWarranty",
        cls: "bg-surface-hover text-text-muted border-border",
      };
    const diff = Math.ceil(
      (new Date(receipt.expiryDate).getTime() - Date.now()) / 86400000,
    );
    if (diff < 0)
      return {
        key: "receipts.statusExpired",
        cls: "bg-surface-hover text-text-muted border-border",
      };
    if (diff <= 30)
      return {
        key: "receipts.statusExpiringSoon",
        cls: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      };
    return {
      key: "receipts.statusActive",
      cls: "bg-green-500/10 text-green-400 border-green-500/20",
    };
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-wrap-balance">
            {t("receipts.title")}
          </h1>
          <p className="text-text-muted mt-1">{t("receipts.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label={t("receipts.uploadReceipt")}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
        >
          <Upload size={20} aria-hidden="true" />
          {t("receipts.uploadReceipt")}
        </button>
      </header>

      {/* Search */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <label htmlFor="receipt-search" className="sr-only">
            {t("receipts.searchPlaceholder")}
          </label>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            size={18}
            aria-hidden="true"
          />
          <input
            id="receipt-search"
            type="search"
            name="search"
            autoComplete="off"
            placeholder={t("receipts.searchPlaceholder")}
            className="w-full bg-surface-hover border border-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-text"
            value={searchTerm}
            onChange={(e) => {
              startTransition(() => setSearchTerm(e.target.value));
            }}
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div
        className="flex gap-2 flex-wrap"
        role="group"
        aria-label={t("receipts.filterByCategory")}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === cat
                ? "bg-primary text-white border-primary"
                : "border-border text-text-muted hover:border-primary/50 hover:text-text"
            }`}
          >
            {catLabel(cat)}
          </button>
        ))}
      </div>

      {/* Error state */}
      {fetchError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2"
        >
          <AlertCircle size={18} aria-hidden="true" /> {fetchError}
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover/50 border-b border-border">
              <th scope="col" className="p-4 font-medium text-text-muted">
                {t("receipts.colStoreItem")}
              </th>
              <th scope="col" className="p-4 font-medium text-text-muted">
                {t("receipts.colCategory")}
              </th>
              <th scope="col" className="p-4 font-medium text-text-muted">
                {t("receipts.colDate")}
              </th>
              <th
                scope="col"
                className="p-4 font-medium text-text-muted tabular-nums"
              >
                {t("receipts.colAmount")}
              </th>
              <th scope="col" className="p-4 font-medium text-text-muted">
                {t("receipts.colWarranty")}
              </th>
              <th
                scope="col"
                className="p-4 font-medium text-text-muted text-right"
              >
                {t("receipts.colActions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-border animate-pulse">
                  <td className="p-4">
                    <div className="h-4 bg-surface-hover rounded w-32" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-surface-hover rounded w-20" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-surface-hover rounded w-24" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-surface-hover rounded w-16" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-surface-hover rounded w-20" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-surface-hover rounded w-12 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-text-muted">
                  <div className="w-20 h-20 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center border border-border shadow-inner">
                    <FileText size={32} className="text-text-muted opacity-50" aria-hidden="true" />
                  </div>
                  <p className="text-lg font-medium">
                    {searchTerm || activeCategory !== "All"
                      ? t("receipts.noResultsFiltered")
                      : t("receipts.noReceipts")}
                  </p>
                </td>
              </tr>
            ) : (
              filteredReceipts.map((receipt, i) => {
                const { key: statusKey, cls: statusCls } = getStatus(receipt);
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
                              alt={`${t("receipts.receiptFrom")} ${receipt.storeName}`}
                              width={40}
                              height={40}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate">
                            {receipt.storeName}
                          </p>
                          <p className="text-sm text-text-muted truncate">
                            {receipt.notes?.split("|")[0]?.trim() ||
                              t("receipts.noItemSpecified")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[receipt.category] ?? CATEGORY_COLORS["Other"]}`}
                      >
                        {catLabel(receipt.category || "Other")}
                      </span>
                    </td>
                    <td className="p-4 tabular-nums">
                      {dateFmt.format(new Date(receipt.purchaseDate))}
                    </td>
                    <td className="p-4 font-semibold tabular-nums">
                      {formatCurrency(receipt.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusCls}`}
                      >
                        {String(t(statusKey))}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setConfirmDelete(receipt._id)}
                        aria-label={`${t("receipts.deleteReceipt")} ${receipt.storeName}`}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label={t("common.prevPage")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} aria-hidden="true" /> {t("common.prev")}
            </button>
            <span className="text-sm text-text-muted tabular-nums">
              {t("common.pageOf", { page, total: totalPages })}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label={t("common.nextPage")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t("common.next")} <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-6 rounded-3xl w-full max-w-md shadow-2xl"
              style={{ overscrollBehavior: "contain" }}
            >
              <h2 id="upload-modal-title" className="text-2xl font-bold mb-4">
                {t("receipts.uploadReceipt")}
              </h2>
              {uploadError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
                >
                  <AlertCircle size={15} aria-hidden="true" /> {uploadError}
                </div>
              )}
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label
                    htmlFor="up-store"
                    className="block text-sm text-text-muted mb-1"
                  >
                    {t("receipts.storeName")}
                  </label>
                  <input
                    required
                    id="up-store"
                    type="text"
                    autoComplete="organization"
                    placeholder={t("receipts.storeNamePlaceholder")}
                    value={formData.storeName}
                    onChange={(e) =>
                      setFormData({ ...formData, storeName: e.target.value })
                    }
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="up-item"
                    className="block text-sm text-text-muted mb-1"
                  >
                    {t("receipts.itemName")}
                  </label>
                  <input
                    id="up-item"
                    type="text"
                    autoComplete="off"
                    placeholder={t("receipts.itemNamePlaceholder")}
                    value={formData.itemName}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="up-date"
                      className="block text-sm text-text-muted mb-1"
                    >
                      {t("receipts.purchaseDate")}
                    </label>
                    <input
                      required
                      id="up-date"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseDate: e.target.value,
                        })
                      }
                      className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="up-amount"
                      className="block text-sm text-text-muted mb-1"
                    >
                      {t("receipts.amount")}
                    </label>
                    <input
                      required
                      id="up-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.totalAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalAmount: e.target.value,
                        })
                      }
                      className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="up-cat"
                    className="block text-sm text-text-muted mb-1"
                  >
                    {t("receipts.category")}
                  </label>
                  <select
                    id="up-cat"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {catLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="up-expiry"
                    className="block text-sm text-text-muted mb-1"
                  >
                    {t("receipts.warrantyExpiry")}{" "}
                    <span className="text-xs opacity-60">
                      ({t("receipts.optional")})
                    </span>
                  </label>
                  <input
                    id="up-expiry"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  />
                </div>
                {/* Drag-and-drop file zone */}
                <div>
                  <p className="block text-sm text-text-muted mb-2">
                    {t("receipts.receiptImage")}
                  </p>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={t("receipts.dropZoneLabel")}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) =>
                      e.key === "Enter" && fileInputRef.current?.click()
                    }
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) setImageFile(file);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                      dragOver
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-surface-hover"
                    }`}
                  >
                    <Image
                      size={28}
                      className={dragOver ? "text-primary" : "text-text-muted"}
                      aria-hidden="true"
                    />
                    {imageFile ? (
                      <p className="text-sm text-primary font-medium text-center">
                        {imageFile.name}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-text-muted text-center">
                          {t("receipts.dropZoneMain")}
                        </p>
                        <p className="text-xs text-text-muted opacity-60">
                          {t("receipts.dropZoneSub")}
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    id="up-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setUploadError("");
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors"
                  >
                    {t("receipts.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    aria-busy={uploading}
                    className="flex-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white disabled:opacity-50 transition-colors font-medium"
                  >
                    {uploading
                      ? t("receipts.uploading")
                      : t("receipts.uploadBtn")}
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
              style={{ overscrollBehavior: "contain" }}
            >
              <h3 id="delete-modal-title" className="text-xl font-bold mb-2">
                {t("receipts.deleteTitle")}
              </h3>
              <p className="text-text-muted text-sm mb-6">
                {t("receipts.deleteConfirm")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors"
                >
                  {t("receipts.keepIt")}
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                >
                  {t("receipts.deleteBtn")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade Prompt */}
      {upgradeLimit && (
        <UpgradePrompt
          limitType="receipts"
          onClose={() => setUpgradeLimit(false)}
        />
      )}
    </div>
  );
}
