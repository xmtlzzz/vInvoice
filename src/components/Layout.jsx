import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, BarChart3, ChevronDown, Plus, Trash2, Layers, LogOut, User } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import clsx from 'clsx';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, data, currentNamespace, logout } = useExpenses();
  const [isNsDropdownOpen, setIsNsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navItems = [
    { path: '/', icon: LayoutGrid, label: '首页' },
    { path: '/statistics', icon: BarChart3, label: '统计' },
  ];

  const currentNs = data.namespaces.find(n => n.id === currentNamespace) || { name: '默认空间' };
  const isUserMode = !!user;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">vInvoice</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* User Namespace Switcher (Only if logged in) */}
            {isUserMode && (
              <div className="relative">
                <button
                  onClick={() => setIsNsDropdownOpen(!isNsDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors"
                >
                  <Layers size={16} />
                  <span className="max-w-[120px] truncate">{currentNs.name}</span>
                  <ChevronDown size={14} className={clsx('transition-transform', isNsDropdownOpen && 'rotate-180')} />
                </button>

                {isNsDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNsDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 z-20 overflow-hidden">
                      <div className="p-2 border-b border-neutral-100">
                        <p className="text-xs font-semibold text-neutral-400 uppercase px-2 py-1">我的空间</p>
                      </div>
                      <div className="p-2">
                        <p className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                          {currentNs.name}
                        </p>
                        <p className="mt-2 px-3 text-xs text-neutral-400">
                          登录用户空间，数据完全隔离
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
                <ChevronDown size={14} className={clsx('transition-transform', isUserDropdownOpen && 'rotate-180')} />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 z-20 overflow-hidden">
                    <div className="p-3 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-900">{user.username}</p>
                      <p className="text-xs text-neutral-500">已登录</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex flex-col items-center justify-center w-full h-full transition-colors',
                  isActive ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
