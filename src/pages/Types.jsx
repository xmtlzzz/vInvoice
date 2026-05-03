import React, { useState } from 'react';
import { Plus, X, Trash2, Shield, Loader2, Plane, Utensils, ShoppingBag, Car, Bus, Train, Building2, Footprints, Ship, Bike, Fuel, Wrench, Phone, Gift, Coffee, Briefcase, GraduationCap, Stethoscope } from 'lucide-react';
import clsx from 'clsx';
import { useExpenses, EXPENSE_TYPES } from '../context/ExpenseContext';

const ICON_OPTIONS = [
  { name: 'Plane', component: Plane, label: '机票' },
  { name: 'Utensils', component: Utensils, label: '餐饮' },
  { name: 'ShoppingBag', component: ShoppingBag, label: '购物' },
  { name: 'Car', component: Car, label: '汽车' },
  { name: 'Bus', component: Bus, label: '巴士' },
  { name: 'Train', component: Train, label: '火车' },
  { name: 'Building2', component: Building2, label: '住宿' },
  { name: 'Footprints', component: Footprints, label: '地铁' },
  { name: 'Ship', component: Ship, label: '轮船' },
  { name: 'Bike', component: Bike, label: '单车' },
  { name: 'Fuel', component: Fuel, label: '加油' },
  { name: 'Wrench', component: Wrench, label: '维修' },
  { name: 'Phone', component: Phone, label: '通讯' },
  { name: 'Gift', component: Gift, label: '礼品' },
  { name: 'Coffee', component: Coffee, label: '咖啡' },
  { name: 'Briefcase', component: Briefcase, label: '办公' },
  { name: 'GraduationCap', component: GraduationCap, label: '培训' },
  { name: 'Stethoscope', component: Stethoscope, label: '医疗' },
];

export default function Types() {
  const { customTypes, addCustomType, deleteCustomType } = useExpenses();

  const [showForm, setShowForm] = useState(false);
  const [icon, setIcon] = useState('Plane');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultEntries = Object.entries(EXPENSE_TYPES);
  const customList = customTypes || [];

  const handleAdd = async () => {
    if (!label.trim()) {
      setError('请输入类型名称');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Generate ASCII-safe key: if label is pure ASCII, derive from it; otherwise use timestamp
      const trimmed = label.trim();
      const asciiKey = trimmed.toUpperCase().replace(/\s+/g, '_');
      const key = /^[A-Z_]+$/.test(asciiKey) ? asciiKey : `CUSTOM_${Date.now()}`;
      await addCustomType(key, trimmed, icon);
      setShowForm(false);
      setLabel('');
      setIcon('Plane');
    } catch (err) {
      setError(err.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key, label) => {
    if (!confirm(`确定要删除类型 "${label}" 吗？\n如果该类型已被费用使用，将无法删除。`)) return;
    try {
      await deleteCustomType(key);
    } catch (err) {
      alert(err.message || '删除失败');
    }
  };

  const renderIcon = (iconName) => {
    const opt = ICON_OPTIONS.find(o => o.name === iconName);
    if (opt) {
      const IconComp = opt.component;
      return <IconComp size={20} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">费用类型</h1>
          <p className="text-sm text-neutral-500 mt-1">管理系统默认类型和自定义费用类型</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            showForm
              ? 'bg-neutral-100 text-neutral-700'
              : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
          )}
        >
          <Plus size={18} />
          新增类型
        </button>
      </div>

      {/* Add Custom Type Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-neutral-800">新增自定义类型</h3>

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">选择图标</label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setIcon(opt.name)}
                  title={opt.label}
                  className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                    icon === opt.name
                      ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-400 scale-110'
                      : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 border border-neutral-200'
                  )}
                >
                  <opt.component size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-600 mb-1.5">类型名称</label>
              <input
                type="text"
                value={label}
                onChange={(e) => { setLabel(e.target.value); setError(''); }}
                placeholder="如：机票、餐饮"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-neutral-50 text-sm"
                maxLength={20}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              添加
            </button>
            <button
              onClick={() => { setShowForm(false); setError(''); }}
              className="px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              取消
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>
      )}

      {/* Default Types */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-800 flex items-center gap-2">
            <Shield size={18} className="text-neutral-400" />
            系统默认类型
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">系统内置类型，不可删除</p>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {defaultEntries.map(([key, label]) => (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-sm text-neutral-600"
            >
              <Shield size={14} className="text-neutral-300 shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Types */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-neutral-800">自定义类型</h2>
            <p className="text-xs text-neutral-400 mt-0.5">自行添加的费用类型</p>
          </div>
          {customList.length > 0 && (
            <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{customList.length} 个</span>
          )}
        </div>
        <div className="p-4">
          {customList.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <p className="text-sm">暂无自定义类型</p>
              <p className="text-xs mt-1">点击右上角"新增类型"添加</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {customList.map((ct) => (
                <div
                  key={ct.key}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary-50 border border-primary-100 text-sm font-medium text-primary-700 relative"
                >
                  {ct.icon && renderIcon(ct.icon)}
                  <span className="truncate">{ct.label}</span>
                  <button
                    onClick={() => handleDelete(ct.key, ct.label)}
                    className="ml-auto shrink-0 p-0.5 rounded-full text-primary-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
