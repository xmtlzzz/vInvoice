import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, BarChart3, ChevronDown, Plus, Trash2, Layers } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import clsx from 'clsx';

export default function Layout({ children }) {
  const location = useLocation();
  const { data, currentNamespace, setCurrentNamespace, createNamespace, deleteNamespace } = useExpenses();
  const [isNsDropdownOpen, setIsNsDropdownOpen] = useState(false);
  const [isCreateNsOpen, setIsCreateNsOpen] = useState(false);
  const [newNsName, setNewNsName] = useState('');

  const navItems = [
    { path: '/', icon: LayoutGrid, label: '首页' },
    { path: '/statistics', icon: BarChart3, label: '统计' },
  ];

  const currentNs = data.namespaces.find(n => n.id === currentNamespace) || { name: '默认空间' };

  const handleCreateNs = (e) => {
    e.preventDefault();
    if (newNsName.trim()) {
      createNamespace(newNsName.trim());
      setNewNsName('');
      setIsCreateNsOpen(false);
      setIsNsDropdownOpen(false);
    }
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
                    <p className="text-xs font-semibold text-neutral-400 uppercase px-2 py-1">切换空间</p>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {data.namespaces.map(ns => (
                      <div key={ns.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-50 group">
                        <button
                          onClick={() => {
                            setCurrentNamespace(ns.id);
                            setIsNsDropdownOpen(false);
                          }}
                          className={clsx(
                            'flex-1 text-left text-sm font-medium rounded px-2 py-1',
                            currentNamespace === ns.id ? 'text-primary-600 bg-primary-50' : 'text-neutral-700'
                          )}
                        >
                          {ns.name}
                        </button>
                        {ns.id !== 'default' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`确定要删除空间 "${ns.name}" 吗？该空间下的所有项目也会被删除。`)) {
                                deleteNamespace(ns.id);
                              }
                            }}
                            className="p-1 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isCreateNsOpen ? (
                    <form onSubmit={handleCreateNs} className="p-3 border-t border-neutral-100 bg-neutral-50">
                      <input
                        type="text"
                        value={newNsName}
                        onChange={(e) => setNewNsName(e.target.value)}
                        placeholder="新空间名称"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCreateNsOpen(false)}
                          className="flex-1 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200 rounded-lg"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          创建
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-2 border-t border-neutral-100">
                      <button
                        onClick={() => setIsCreateNsOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                        创建新空间
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
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
