import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Plus, AlertCircle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../api";
import UpgradePrompt from "../components/UpgradePrompt";
import { useCurrency } from '../context/CurrencyContext';

// ── Types ────────────────────────────────────────────────────────────────────
interface ISubscription {
  _id: string;
  serviceName: string;
  cost: number;
  billingCycle: "weekly" | "monthly" | "yearly";
  nextBillingDate: string;
  isActive: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function toMonthly(cost: number, cycle: string): number {
  if (cycle === "yearly") return cost / 12;
  if (cycle === "weekly") return cost * 4.33;
  return cost;
}

export default function Subscriptions() {
  const { t, i18n } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [subs, setSubs] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<
    "all" | "weekly" | "monthly" | "yearly"
  >("all");
  const [upgradeLimit, setUpgradeLimit] = useState<"subscriptions" | null>(
    null,
  );

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }),
    [i18n.language],
  );

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    try {
      const res = await api.get("/subscriptions");
      // API now returns paginated {data, page, totalPages, total}
      setSubs(Array.isArray(res.data) ? res.data : (res.data.data ?? []));
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGuillotine = async (id: string) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      setSubs((prev) => prev.filter((s) => s._id !== id));
      toast.success(t("subscriptions.cancelSubscription"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleAddSuccess = () => {
    setIsModalOpen(false);
    fetchSubs();
    toast.success(t("subscriptions.addSubscriptionBtn"));
  };

  const handleLimitError = () => {
    setUpgradeLimit("subscriptions");
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      subs.filter((s) => {
        const matchSearch = s.serviceName
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchCycle =
          cycleFilter === "all" || s.billingCycle === cycleFilter;
        return matchSearch && matchCycle;
      }),
    [subs, search, cycleFilter],
  );

  const totalMonthly = useMemo(
    () => subs.reduce((acc, s) => acc + toMonthly(s.cost, s.billingCycle), 0),
    [subs],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("subscriptions.title")}</h1>
          <p className="text-text-muted mt-1">{t("subscriptions.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 self-start sm:self-auto"
        >
          <Plus size={20} aria-hidden="true" />
          {t("subscriptions.addSubscription")}
        </button>
      </header>

      {/* Summary bar */}
      {subs.length > 0 && (
        <div className="glass border border-border rounded-2xl px-5 py-3 flex items-center justify-between">
          <span className="text-text-muted text-sm">
            {subs.length} {t("nav.subscriptions").toLowerCase()}
          </span>
          <span className="font-bold tabular-nums">
            {formatCurrency(totalMonthly)}
            <span className="text-text-muted font-normal text-sm">/mo</span>
          </span>
        </div>
      )}

      {/* Search + filter */}
      {subs.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("receipts.searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 bg-surface-hover border border-border rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "weekly", "monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycleFilter(c)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  cycleFilter === c
                    ? "bg-primary text-white"
                    : "bg-surface-hover text-text-muted hover:text-text border border-border"
                }`}
              >
                {c === "all" ? "All" : t(`subscriptions.${c}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-surface-hover rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3"
          role="alert"
        >
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <div className="w-24 h-24 mx-auto mb-5 bg-surface rounded-full flex items-center justify-center border border-border shadow-inner">
            <Scissors
              size={40}
              className="text-text-muted opacity-50"
              aria-hidden="true"
            />
          </div>
          <p className="text-xl font-medium text-text">{t("subscriptions.noSubscriptions")}</p>
          <p className="text-sm mt-2">
            {t("subscriptions.noSubscriptionsHint")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                sub={sub}
                formatCurrency={formatCurrency}
                dateFmt={dateFmt}
                onCutRequest={(id) => setConfirmDelete(id)}
                cancelLabel={t("subscriptions.cancelSubscription")}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <AddSubscriptionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAddSuccess}
          onLimitReached={handleLimitError}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-cancel-title"
            style={{ overscrollBehavior: "contain" }}
          >
            <h3 id="confirm-cancel-title" className="text-xl font-bold mb-2">
              {t("subscriptions.cancelSubscription")}
            </h3>
            <p className="text-text-muted text-sm mb-6">
              {t("subscriptions.cancelConfirm")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors"
              >
                {t("subscriptions.keepIt")}
              </button>
              <button
                onClick={() => handleGuillotine(confirmDelete)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
              >
                {t("subscriptions.yesCancel")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upgrade Prompt */}
      {upgradeLimit && (
        <UpgradePrompt
          limitType={upgradeLimit}
          onClose={() => setUpgradeLimit(null)}
        />
      )}
    </div>
  );
}

// ── Add Subscription Modal ────────────────────────────────────────────────────
function AddSubscriptionModal({
  onClose,
  onSuccess,
  onLimitReached,
}: {
  onClose: () => void;
  onSuccess: () => void;
  onLimitReached: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    serviceName: "",
    cost: "",
    billingCycle: "monthly",
    nextBillingDate: "",
    reminderDaysBefore: "3",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/subscriptions", {
        serviceName: form.serviceName,
        cost: Number(form.cost),
        billingCycle: form.billingCycle,
        nextBillingDate: form.nextBillingDate,
        reminderDaysBefore: Number(form.reminderDaysBefore),
      });
      onSuccess();
    } catch (err: any) {
      if (err.response?.data?.code === "LIMIT_REACHED") {
        onClose();
        onLimitReached();
      } else {
        setError(err.response?.data?.message || t("common.error"));
      }
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-sub-title"
        style={{ overscrollBehavior: "contain" }}
      >
        <h2 id="add-sub-title" className="text-2xl font-bold mb-4">
          {t("subscriptions.addSubscription")}
        </h2>
        {error && (
          <div
            className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="sub-name"
              className="block text-sm text-text-muted mb-1"
            >
              {t("subscriptions.serviceName")}
            </label>
            <input
              id="sub-name"
              required
              type="text"
              value={form.serviceName}
              onChange={(e) =>
                setForm({ ...form, serviceName: e.target.value })
              }
              placeholder="e.g. Netflix, Adobe CC"
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="sub-cost"
                className="block text-sm text-text-muted mb-1"
              >
                {t("subscriptions.cost")}
              </label>
              <input
                id="sub-cost"
                required
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="0.00"
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="sub-cycle"
                className="block text-sm text-text-muted mb-1"
              >
                {t("subscriptions.billingCycle")}
              </label>
              <select
                id="sub-cycle"
                value={form.billingCycle}
                onChange={(e) =>
                  setForm({ ...form, billingCycle: e.target.value })
                }
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="weekly">{t("subscriptions.weekly")}</option>
                <option value="monthly">{t("subscriptions.monthly")}</option>
                <option value="yearly">{t("subscriptions.yearly")}</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="sub-date"
              className="block text-sm text-text-muted mb-1"
            >
              {t("subscriptions.nextBillingDate")}
            </label>
            <input
              id="sub-date"
              required
              type="date"
              value={form.nextBillingDate}
              onChange={(e) =>
                setForm({ ...form, nextBillingDate: e.target.value })
              }
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div>
            <label
              htmlFor="sub-remind"
              className="block text-sm text-text-muted mb-1"
            >
              {t("subscriptions.remindDays")}
            </label>
            <input
              id="sub-remind"
              type="number"
              min="1"
              value={form.reminderDaysBefore}
              onChange={(e) =>
                setForm({ ...form, reminderDaysBefore: e.target.value })
              }
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors"
            >
              {t("subscriptions.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="flex-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white disabled:opacity-50 transition-colors"
            >
              {submitting
                ? t("subscriptions.saving")
                : t("subscriptions.addSubscriptionBtn")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Subscription Card ─────────────────────────────────────────────────────────
function SubscriptionCard({
  sub,
  formatCurrency,
  dateFmt,
  onCutRequest,
  cancelLabel,
}: {
  sub: ISubscription;
  formatCurrency: (value: number) => string;
  dateFmt: Intl.DateTimeFormat;
  onCutRequest: (id: string) => void;
  cancelLabel: string;
}) {
  const nextBillDate = new Date(sub.nextBillingDate);
  const today = new Date();
  const diffDays = Math.ceil(
    (nextBillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isUrgent = diffDays >= 0 && diffDays <= 3;
  const isOverdue = diffDays < 0;
  const initial = sub.serviceName?.[0]?.toUpperCase() ?? "?";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
      className={`relative overflow-hidden glass rounded-2xl border p-6 ${
        isOverdue
          ? "border-gray-500/50 bg-gray-500/5"
          : isUrgent
            ? "border-red-500/50 bg-red-500/5"
            : "border-border"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center font-bold text-lg text-primary">
            {initial}
          </div>
          <div>
            <h3 className="font-bold text-lg">{sub.serviceName}</h3>
            <p className="text-text-muted text-sm capitalize">
              {sub.billingCycle}
            </p>
          </div>
        </div>
        {isOverdue && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Overdue
          </span>
        )}
      </div>

      <div className="flex justify-between items-end mt-6">
        <div>
          <p className="text-3xl font-bold tabular-nums">
            {formatCurrency(sub.cost)}
          </p>
          <p
            className={`text-sm mt-1 flex items-center gap-1 ${
              isOverdue
                ? "text-gray-400"
                : isUrgent
                  ? "text-red-400 font-medium"
                  : "text-text-muted"
            }`}
          >
            {isUrgent && !isOverdue && (
              <AlertCircle size={14} aria-hidden="true" />
            )}
            {isOverdue
              ? dateFmt.format(nextBillDate)
              : dateFmt.format(nextBillDate)}
          </p>
        </div>
        <button
          onClick={() => onCutRequest(sub._id)}
          aria-label={cancelLabel}
          className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
        >
          <Scissors size={20} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
