import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Shield, Users, CreditCard, Settings, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import OverviewTab from '../components/admin/OverviewTab';
import UsersTab from '../components/admin/UsersTab';
import BillingTab from '../components/admin/BillingTab';
import SettingsTab from '../components/admin/SettingsTab';

type Tab = 'overview' | 'users' | 'billing' | 'settings';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Client-side protection
  if (user?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  const tabs = [
    { id: 'overview', label: t('admin.tabs.overview'), icon: Activity },
    { id: 'users', label: t('admin.tabs.users'), icon: Users },
    { id: 'billing', label: t('admin.tabs.billing'), icon: CreditCard },
    { id: 'settings', label: t('admin.tabs.settings'), icon: Settings },
  ] as const;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-primary" />
            {t('admin.title')}
          </h1>
          <p className="text-text-muted mt-1">{t('admin.subtitle')}</p>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-border overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-white hover:border-border'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
