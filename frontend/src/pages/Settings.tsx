import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, KeyRound, Shield, User, AlertCircle, CheckCircle, Globe, Zap, Trash2, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  { code: 'en', label: 'English',     flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'zh', label: '中文',       flag: '🇨🇳' },
  { code: 'ja', label: '日本語',     flag: '🇯🇵' },
  { code: 'ko', label: '한국어',     flag: '🇰🇷' },
  { code: 'hi', label: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
];

const CURRENCIES = [
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { code: 'CNY', label: 'CNY (¥)', symbol: '¥' },
  { code: 'INR', label: 'INR (₹)', symbol: '₹' },
  { code: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { code: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { code: 'CHF', label: 'CHF (Fr)', symbol: 'Fr' },
  { code: 'VND', label: 'VND (₫)', symbol: '₫' },
  { code: 'SGD', label: 'SGD (S$)', symbol: 'S$' },
  { code: 'NZD', label: 'NZD (NZ$)', symbol: 'NZ$' },
  { code: 'KRW', label: 'KRW (₩)', symbol: '₩' },
  { code: 'BRL', label: 'BRL (R$)', symbol: 'R$' },
  { code: 'MXN', label: 'MXN ($)', symbol: '$' },
  { code: 'ZAR', label: 'ZAR (R)', symbol: 'R' },
];

// Free plan limits (mirrors backend planLimits.ts)
const FREE_RECEIPT_LIMIT = 50;
const FREE_SUB_LIMIT     = 10;

export default function Settings() {
  const { user, login, token, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [nameForm, setNameForm]       = useState({ name: user?.name || '' });
  const [pwForm, setPwForm]           = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [nameStatus, setNameStatus]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [pwStatus, setPwStatus]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [nameSaving, setNameSaving]   = useState(false);
  const [pwSaving, setPwSaving]       = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    const baseLang = i18n.language ? i18n.language.split('-')[0] : 'en';
    return LANGUAGES.some(l => l.code === baseLang) ? baseLang : 'en';
  });
  const [showPw, setShowPw]           = useState({ current: false, new: false, confirm: false });

  // Danger zone
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword]   = useState('');
  const [showDeletePw, setShowDeletePw]       = useState(false);
  const [deleting, setDeleting]               = useState(false);

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSaving(true); setNameStatus(null);
    try {
      const res = await api.put('/auth/profile', { name: nameForm.name });
      if (token) login(token, res.data);
      setNameStatus({ type: 'success', msg: t('settings.nameUpdated') });
    } catch (err: any) {
      setNameStatus({ type: 'error', msg: err.response?.data?.message || t('common.error') });
    } finally { setNameSaving(false); }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwStatus({ type: 'error', msg: t('settings.passwordMismatch') }); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwStatus({ type: 'error', msg: t('settings.passwordTooShort') }); return;
    }
    setPwSaving(true); setPwStatus(null);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwStatus({ type: 'success', msg: t('settings.passwordUpdated') });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setPwStatus({ type: 'error', msg: err.response?.data?.message || t('common.error') });
    } finally { setPwSaving(false); }
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('ftd_language', langCode);
    const langLabel = LANGUAGES.find(l => l.code === langCode)?.label || langCode;
    toast.success(`Language switched to ${langLabel}`);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      logout();
      navigate('/');
      toast.success('Account deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally { setDeleting(false); }
  };

  const plan = (user as any)?.plan ?? 'free';
  const isPro = plan === 'pro';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-text-muted mt-2">{t('settings.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

      {/* ── Column Left ──────────────────────────────────── */}
      <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="p-2 rounded-lg bg-surface-hover text-primary"><User size={20} aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">{t('settings.profile')}</h2>
        </div>
        <form onSubmit={handleNameSave} className="p-5 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-black text-primary">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-semibold">{user?.name || 'Anonymous'}</p>
              <p className="text-sm text-text-muted">{user?.email}</p>
            </div>
          </div>
          {nameStatus && <StatusBar status={nameStatus} />}
          <div>
            <label htmlFor="settings-name" className="block text-sm text-text-muted mb-1">{t('settings.displayName')}</label>
            <input
              id="settings-name" type="text" name="name" autoComplete="name" required
              value={nameForm.name}
              onChange={e => setNameForm({ name: e.target.value })}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={nameSaving} aria-busy={nameSaving}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50">
              <Save size={16} aria-hidden="true" />
              {nameSaving ? t('settings.saving') : t('settings.saveName')}
            </button>
          </div>
        </form>
      </motion.section>

      {/* ── Your Plan ───────────────────────────────────────────────────── */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="glass border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="p-2 rounded-lg bg-surface-hover text-primary"><Zap size={20} aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">{t('settings.yourPlan')}</h2>
          <span className={`ml-auto text-xs px-3 py-1 rounded-full font-bold ${isPro ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted border border-border'}`}>
            {isPro ? t('settings.proPlan') : t('settings.freePlan')}
          </span>
        </div>
        <div className="p-5 space-y-4">
          {/* Usage meters */}
          <UsageMeter label={t('settings.usageReceipts', { used: '—', limit: FREE_RECEIPT_LIMIT })} used={0} limit={FREE_RECEIPT_LIMIT} />
          <UsageMeter label={t('settings.usageSubscriptions', { used: '—', limit: FREE_SUB_LIMIT })} used={0} limit={FREE_SUB_LIMIT} />
          {!isPro && (
            <button className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-opacity">
              {t('settings.upgradeToPro')}
            </button>
          )}
        </div>
      </motion.section>

      </div>{/* end col-left */}

      {/* ── Column Right ─────────────────────────────────── */}
      <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="glass border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="p-2 rounded-lg bg-surface-hover text-primary"><Globe size={20} aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">{t('settings.language')}</h2>
        </div>
        <div className="p-5">
          {/* Language Selection */}
          <div className="mb-6">
            <p className="text-sm text-text-muted mb-4">{t('settings.languageLabel')}</p>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  id={`lang-${lang.code}`}
                  onClick={() => handleLanguageChange(lang.code)}
                  aria-pressed={currentLang === lang.code}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors font-medium text-left ${
                    currentLang === lang.code
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-border bg-surface-hover text-text-muted hover:border-primary/40 hover:text-white'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {currentLang === lang.code && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                      ✓
                    </motion.span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border mb-6" />

          {/* Currency Selection */}
          <div className="mb-6">
            <p className="text-sm text-text-muted mb-4">{t('settings.currency')}</p>
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {CURRENCIES.map(curr => (
                <button
                  key={curr.code}
                  id={`curr-${curr.code}`}
                  onClick={() => setCurrency(curr.code)}
                  aria-pressed={currency === curr.code}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors font-medium text-left ${
                    currency === curr.code
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-border bg-surface-hover text-text-muted hover:border-primary/40 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currency === curr.code ? 'bg-primary text-white' : 'bg-surface border border-border text-text-muted'}`} aria-hidden="true">
                    {curr.symbol}
                  </div>
                  <span>{curr.label}</span>
                  {currency === curr.code && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                      ✓
                    </motion.span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border mb-6" />

          {/* Theme Selection */}
          <div>
            <p className="text-sm text-text-muted mb-4">{t('settings.theme', 'App Theme')}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors font-medium text-left ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-border bg-surface-hover text-text-muted hover:border-primary/40 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-primary/20 text-white' : 'bg-surface border border-border text-text-muted'}`}>
                  <Sun size={18} />
                </div>
                <span>{t('settings.light', 'Light')}</span>
                {theme === 'light' && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                    ✓
                  </motion.span>
                )}
              </button>

              <button
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors font-medium text-left ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-border bg-surface-hover text-text-muted hover:border-primary/40 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-primary/20 text-white' : 'bg-surface border border-border text-text-muted'}`}>
                  <Moon size={18} />
                </div>
                <span>{t('settings.dark', 'Dark')}</span>
                {theme === 'dark' && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                    ✓
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Password ────────────────────────────────────────────────────── */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="glass border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="p-2 rounded-lg bg-surface-hover text-primary"><KeyRound size={20} aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">{t('settings.changePassword')}</h2>
        </div>
        <form onSubmit={handlePasswordSave} className="p-5 space-y-4">
          {pwStatus && <StatusBar status={pwStatus} />}
          {([
            { id: 'current-pw', labelKey: 'settings.currentPassword', key: 'currentPassword', showKey: 'current' as const, ac: 'current-password' },
            { id: 'new-pw',     labelKey: 'settings.newPassword',     key: 'newPassword',     showKey: 'new' as const,     ac: 'new-password' },
            { id: 'confirm-pw', labelKey: 'settings.confirmPassword', key: 'confirm',          showKey: 'confirm' as const,  ac: 'new-password' },
          ] as const).map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm text-text-muted mb-1">{t(field.labelKey)}</label>
              <div className="relative">
                <input
                  id={field.id}
                  type={showPw[field.showKey] ? 'text' : 'password'}
                  name={field.key}
                  autoComplete={field.ac}
                  required
                  value={(pwForm as any)[field.key]}
                  onChange={e => setPwForm({ ...pwForm, [field.key]: e.target.value })}
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 pr-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => ({ ...p, [field.showKey]: !p[field.showKey] }))}
                  aria-label={showPw[field.showKey] ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showPw[field.showKey] ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={pwSaving} aria-busy={pwSaving}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50">
              <Shield size={16} aria-hidden="true" />
              {pwSaving ? t('settings.updating') : t('settings.updatePassword')}
            </button>
          </div>
        </form>
      </motion.section>

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="glass border border-red-500/30 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-red-500/20">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><Trash2 size={20} aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold text-red-400">{t('settings.dangerZone')}</h2>
        </div>
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{t('settings.deleteAccount')}</p>
            <p className="text-text-muted text-sm mt-0.5">{t('settings.deleteAccountHint')}</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-xl font-medium transition-colors"
          >
            <Trash2 size={16} aria-hidden="true" />
            {t('settings.deleteAccount')}
          </button>
        </div>
      </motion.section>

      {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-red-500/40 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
              style={{ overscrollBehavior: 'contain' }}
            >
              <h3 id="delete-modal-title" className="text-xl font-bold mb-2 text-red-400">{t('settings.deleteAccount')}</h3>
              <p className="text-text-muted text-sm mb-5">{t('settings.deleteAccountConfirm')}</p>
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label htmlFor="delete-pw" className="block text-sm text-text-muted mb-1">{t('settings.confirmYourPassword')}</label>
                  <div className="relative">
                    <input
                      id="delete-pw"
                      type={showDeletePw ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      className="w-full bg-surface-hover border border-red-500/30 rounded-xl px-4 py-2 pr-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                    />
                    <button type="button" onClick={() => setShowDeletePw(v => !v)}
                      aria-label={showDeletePw ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                      {showDeletePw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                    className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-surface-hover transition-colors">
                    {t('common.close')}
                  </button>
                  <button type="submit" disabled={deleting || !deletePassword} aria-busy={deleting}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50 transition-colors">
                    {deleting ? t('settings.deleting') : t('settings.deleteAccountBtn')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>{/* end col-right */}
      </div>{/* end grid */}
    </div>
  );
}

function StatusBar({ status }: { status: { type: 'success' | 'error'; msg: string } }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        role="alert"
        aria-live="polite"
        className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
          status.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}
      >
        {status.type === 'success'
          ? <CheckCircle size={16} aria-hidden="true" />
          : <AlertCircle size={16} aria-hidden="true" />
        }
        {status.msg}
      </motion.div>
    </AnimatePresence>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-muted">{label}</span>
        <span className="tabular-nums font-medium">{used}/{limit}</span>
      </div>
      <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-red-400' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={limit}
        />
      </div>
    </div>
  );
}
