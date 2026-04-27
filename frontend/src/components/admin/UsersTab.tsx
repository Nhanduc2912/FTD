import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShieldBan, Trash2, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface UserData {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  failedLoginAttempts: number;
  plan: string;
  createdAt: string;
}

export default function UsersTab() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async (pageNum: number, searchQuery: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${pageNum}&limit=10&search=${searchQuery}`);
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setPage(res.data.page);
    } catch (err) {
      console.error(err);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timeout = setTimeout(() => {
      fetchUsers(1, search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUsers(newPage, search);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (id === currentUser?._id) {
      toast.error('Cannot suspend your own account');
      return;
    }
    try {
      await api.patch(`/admin/users/${id}/toggle-status`);
      toast.success(`User ${currentStatus === 'active' ? 'suspended' : 'activated'}`);
      fetchUsers(page, search);
    } catch (err) {
      toast.error(t('common.error'));
    }
  };

  const unlockUser = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/unlock`);
      toast.success(t('admin.users.unlock') + ' successful');
      fetchUsers(page, search);
    } catch (err) {
      toast.error(t('common.error'));
    }
  };

  const deleteUser = async (id: string) => {
    if (id === currentUser?._id) return;
    if (!window.confirm(t('admin.users.deleteConfirm'))) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success(t('admin.users.delete') + ' successful');
      fetchUsers(page, search);
    } catch (err) {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder={t('admin.users.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface/50 border border-border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium text-text-muted">User</th>
              <th className="px-4 py-3 font-medium text-text-muted">{t('admin.users.role')}</th>
              <th className="px-4 py-3 font-medium text-text-muted">{t('admin.users.plan')}</th>
              <th className="px-4 py-3 font-medium text-text-muted">{t('admin.users.status')}</th>
              <th className="px-4 py-3 font-medium text-text-muted text-right">{t('admin.users.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  {t('common.loading')}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{u.name || 'Unnamed'}</div>
                    <div className="text-xs text-text-muted">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-text-muted'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 uppercase text-xs font-semibold">{u.plan}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center w-max px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.status}
                      </span>
                      {u.failedLoginAttempts > 0 && (
                        <span className="text-[10px] text-orange-400 flex items-center gap-1">
                          <Key size={10} /> {u.failedLoginAttempts} {t('admin.users.failedAttempts')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.failedLoginAttempts >= 5 && (
                        <button onClick={() => unlockUser(u._id)} title={t('admin.users.unlock')} className="p-1.5 text-orange-400 hover:bg-surface rounded-lg">
                          <Key size={16} />
                        </button>
                      )}
                      {u._id !== currentUser?._id && (
                        <>
                          <button onClick={() => toggleStatus(u._id, u.status)} title={u.status === 'active' ? t('admin.users.suspend') : t('admin.users.activate')} className={`p-1.5 rounded-lg ${u.status === 'active' ? 'text-text-muted hover:text-orange-400 hover:bg-surface' : 'text-orange-400 hover:bg-surface'}`}>
                            <ShieldBan size={16} />
                          </button>
                          <button onClick={() => deleteUser(u._id)} title={t('admin.users.delete')} className="p-1.5 text-text-muted hover:text-red-400 hover:bg-surface rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-text-muted">
            {t('common.pageOf', { page, total: totalPages })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium glass rounded-xl disabled:opacity-50"
            >
              {t('common.prev')}
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm font-medium glass rounded-xl disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
