import { useState, useEffect, useMemo } from 'react';
import api from '../api';

export interface Notification {
  id: string;
  type: 'subscription' | 'receipt';
  title: string;
  message: string;
  daysLeft: number;
  read: boolean;
}

const STORAGE_KEY = 'ftd_read_notifications_v1';

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function useNotifications() {
  const [subs, setSubs] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([api.get('/subscriptions'), api.get('/receipts')]);
        // API returns paginated {data, page, totalPages, total} — extract array
        setSubs(Array.isArray(s.data) ? s.data : (s.data.data ?? []));
        setReceipts(Array.isArray(r.data) ? r.data : (r.data.data ?? []));
      } catch { /* silent */ }
    };
    load();
  }, []);

  const notifications: Notification[] = useMemo(() => {
    const today = new Date();
    const items: Notification[] = [];

    subs.forEach(s => {
      const diff = Math.ceil((new Date(s.nextBillingDate).getTime() - today.getTime()) / 86400000);
      if (diff >= 0 && diff <= 7) {
        items.push({
          id: `sub_${s._id}`,
          type: 'subscription',
          title: `${s.serviceName} renews ${diff === 0 ? 'today' : `in ${diff} day${diff !== 1 ? 's' : ''}`}`,
          message: `$${s.cost.toFixed(2)} / ${s.billingCycle}`,
          daysLeft: diff,
          read: readIds.has(`sub_${s._id}`),
        });
      }
    });

    receipts.forEach(r => {
      if (!r.expiryDate) return;
      const diff = Math.ceil((new Date(r.expiryDate).getTime() - today.getTime()) / 86400000);
      if (diff >= 0 && diff <= 30) {
        items.push({
          id: `rcp_${r._id}`,
          type: 'receipt',
          title: `${r.storeName} warranty expires in ${diff} day${diff !== 1 ? 's' : ''}`,
          message: r.notes?.split('|')[0]?.trim() || 'No item specified',
          daysLeft: diff,
          read: readIds.has(`rcp_${r._id}`),
        });
      }
    });

    return items.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subs, receipts, readIds]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markRead = (id: string) => {
    const next = new Set(readIds).add(id);
    setReadIds(next);
    saveReadIds(next);
  };

  const markAllRead = () => {
    const next = new Set(notifications.map(n => n.id));
    setReadIds(next);
    saveReadIds(next);
  };

  return { notifications, unreadCount, markRead, markAllRead };
}
