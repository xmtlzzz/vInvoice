import React, { useState, useEffect } from 'react';
import { Trash2, Users, Loader2, Shield } from 'lucide-react';
import clsx from 'clsx';
import { useExpenses } from '../context/ExpenseContext';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function Admin() {
  const { user } = useExpenses();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { 'x-user-username': user.username },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    setDeleting(userId);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-user-username': user.username },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除失败');
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
      setConfirmDelete(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-amber-500" />
        <h1 className="text-lg font-semibold text-gray-800">用户管理</h1>
        <span className="text-sm text-gray-400 ml-auto">共 {users.length} 个用户</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Users className="w-10 h-10 mb-2" />
            <p>暂无用户</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map(u => {
              const isSelf = u.username.toLowerCase() === user.username.toLowerCase();
              const isConfirming = confirmDelete === u.id;
              return (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={clsx(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                      isSelf ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    )}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">{u.username}</span>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full shrink-0">管理员</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{u.namespaceId}</p>
                    </div>
                  </div>
                  {!isSelf && (
                    <div className="shrink-0 ml-2">
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleting === u.id}
                            className="text-xs px-2.5 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deleting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '确认'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(u.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center py-2">
        删除用户将同时删除其所有项目和费用数据
      </p>
    </div>
  );
}
