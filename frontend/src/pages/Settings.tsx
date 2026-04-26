import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, KeyRound, Shield, User, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export default function Settings() {
  const { user, login, token } = useAuth();
  const { t, i18n } = useTranslation();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language.startsWith('vi') ? 'vi' : 'en');

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSaving(true);
    setNameStatus(null);
    try {
      const res = await api.put('/auth/profile', { name: nameForm.name });
      if (token) login(token, res.data);
      setNameStatus({ type: 'success', msg: t('settings.nameUpdated') });
    } catch (err: any) {
      setNameStatus({ type: 'error', msg: err.response?.data?.message || t('common.error') });
    } finally {
      setNameSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwStatus({ type: 'error', msg: 'New passwords do not match' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwStatus({ type: 'error', msg: 'Password must be at least 6 characters' });
      return;
    }
    setPwSaving(true);
    setPwStatus(null);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwStatus({ type: 'success', msg: t('settings.passwordUpdated') });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setPwStatus({ type: 'error', msg: err.response?.data?.message || t('common.error') });
    } finally {
      setPwSaving(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('ftd_language', langCode);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold text-wrap-balance">{t('settings.title')}</h1>
        <p className="text-text-muted mt-2">{t('settings.subtitle')}</p>
      </header>

      {/* Profile Section */}
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
              id="settings-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              value={nameForm.name}
              onChange={e => setNameForm({ name: e.target.value })}
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={nameSaving}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50">
              <Save size={16} aria-hidden="true" />
              {nameSaving ? t('settings.saving') : t('settings.saveName')}
            </button>
          </div>
        </form>
      </motion.section>

      {/* Language & Region Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass border border-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="p-2 rounded-lg bg-surface-hover text-primary"><Globe size={20} aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">{t('settings.language')}</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-text-muted mb-4">{t('settings.languageLabel')}</p>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                id={`lang-${lang.code}`}
                onClick={() => handleLanguageChange(lang.code)}
                aria-pressed={currentLang === lang.code}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium text-left ${
                  currentLang === lang.code
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-border bg-surface-hover text-text-muted hover:border-primary/40 hover:text-white'
                }`}
              >
                <span className="text-2xl" aria-hidden="true">{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLang === lang.code && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs"
                  >
                    ✓
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Password Section */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="p-2 rounded-lg bg-surface-hover text-primary"><KeyRound size={20} aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">{t('settings.changePassword')}</h2>
        </div>
        <form onSubmit={handlePasswordSave} className="p-5 space-y-4">
          {pwStatus && <StatusBar status={pwStatus} />}
          {[
            { id: 'current-pw', labelKey: 'settings.currentPassword', key: 'currentPassword', autoComplete: 'current-password' },
            { id: 'new-pw',     labelKey: 'settings.newPassword',     key: 'newPassword',     autoComplete: 'new-password' },
            { id: 'confirm-pw', labelKey: 'settings.confirmPassword', key: 'confirm',          autoComplete: 'new-password' },
          ].map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm text-text-muted mb-1">{t(field.labelKey)}</label>
              <input
                id={field.id}
                type="password"
                name={field.key}
                autoComplete={field.autoComplete}
                required
                value={(pwForm as any)[field.key]}
                onChange={e => setPwForm({ ...pwForm, [field.key]: e.target.value })}
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={pwSaving}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors disabled:opacity-50">
              <Shield size={16} aria-hidden="true" />
              {pwSaving ? t('settings.updating') : t('settings.updatePassword')}
            </button>
          </div>
        </form>
      </motion.section>
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
          status.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}
      >
        {status.type === 'success' ? <CheckCircle size={16} aria-hidden="true" /> : <AlertCircle size={16} aria-hidden="true" />}
        {status.msg}
      </motion.div>
    </AnimatePresence>
  );
}
