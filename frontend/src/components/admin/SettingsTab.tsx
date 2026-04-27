import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../../api';

interface Settings {
  maintenanceMode: boolean;
  announcementBanner: string;
}

export default function SettingsTab() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings>({ maintenanceMode: false, announcementBanner: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings({
          maintenanceMode: res.data.maintenanceMode || false,
          announcementBanner: res.data.announcementBanner || '',
        });
      } catch (err) {
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [t]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success(t('admin.settings.saveSettings') + ' successful');
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-center py-12 text-text-muted">{t('common.loading')}</div>;

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSave} className="space-y-6 glass p-6 rounded-2xl">
        
        {/* Maintenance Mode */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{t('admin.settings.maintenanceMode')}</h3>
            <p className="text-xs text-text-muted mt-1">Disables access for non-admin users.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
            />
            <div className="w-11 h-6 bg-surface border border-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted peer-checked:after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <hr className="border-border" />

        {/* Announcement Banner */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('admin.settings.announcementBanner')}</label>
          <textarea
            value={settings.announcementBanner}
            onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
            placeholder="Show a banner across the app (leave empty to hide)"
            className="w-full p-3 bg-surface/50 border border-border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[100px]"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isSaving ? t('admin.settings.saving') : t('admin.settings.saveSettings')}
          </button>
        </div>
      </form>
    </div>
  );
}
