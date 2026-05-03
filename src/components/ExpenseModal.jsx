import React, { useEffect, useState, useRef } from 'react';
import { Loader2, Plus, X, Plane, Utensils, ShoppingBag, Car, Bus, Train, Building2, Footprints, Ship, Bike, Fuel, Wrench, Phone, Gift, Coffee, Briefcase, GraduationCap, Stethoscope } from 'lucide-react';
import clsx from 'clsx';
import { useExpenses, EXPENSE_TYPES } from '../context/ExpenseContext';
import { getExpenseFormState } from '../context/expenseApi.js';

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

export default function ExpenseModal({ isOpen, onClose, projectId, expense, onUpdate }) {
  const { addExpense, mergedTypes, customTypes, addCustomType, deleteCustomType } = useExpenses();
  const isEditMode = !!expense;
  const [type, setType] = useState('SUBWAY');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom type form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customIcon, setCustomIcon] = useState('Plane');
  const [customLabel, setCustomLabel] = useState('');
  const [customError, setCustomError] = useState('');

  const prevOpenRef = useRef(false);
  const prevExpenseIdRef = useRef(undefined);

  useEffect(() => {
    // Only reset form state when modal actually opens or expense changes,
    // NOT on re-renders triggered by context updates (e.g. addCustomType).
    const isOpening = isOpen && !prevOpenRef.current;
    const expenseChanged = expense?.id !== prevExpenseIdRef.current;

    prevOpenRef.current = isOpen;
    prevExpenseIdRef.current = expense?.id;

    if (!isOpen) return;
    if (!isOpening && !expenseChanged) return;

    const nextState = getExpenseFormState(expense);
    setType(nextState.type);
    setAmount(nextState.amount);
    setDate(nextState.date);
    setDescription(nextState.description);
    setError('');
    setShowCustomForm(false);
    setCustomLabel('');
    setCustomIcon('Plane');
    setCustomError('');
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await onUpdate(projectId, expense.id, {
          type,
          amount: parseFloat(amount),
          date,
          description,
        });
      } else {
        await addExpense(projectId, {
          type,
          amount: parseFloat(amount),
          date,
          description,
          reimbursed: false,
        });
      }

      setAmount('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || (isEditMode ? '更新费用失败，请重试' : '添加费用失败，请重试'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomType = async () => {
    if (!customLabel.trim()) {
      setCustomError('请输入类型名称');
      return;
    }
    setCustomError('');
    setLoading(true);
    try {
      const trimmed = customLabel.trim();
      const asciiKey = trimmed.toUpperCase().replace(/\s+/g, '_');
      const key = /^[A-Z_]+$/.test(asciiKey) ? asciiKey : `CUSTOM_${Date.now()}`;
      const newType = await addCustomType(key, trimmed, customIcon);
      setType(newType.key);
      setShowCustomForm(false);
      setCustomLabel('');
    } catch (err) {
      setCustomError(err.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const mergedEntries = Object.entries(mergedTypes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900">{isEditMode ? '编辑费用' : '添加费用'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Expense type selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">费用类型</label>
            <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
              {mergedEntries.map(([key, label]) => {
                const ct = customTypes.find(t => t.key === key);
                const iconName = ct ? ct.icon : null;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={clsx(
                      'px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2',
                      type === key
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    )}
                  >
                    {iconName && (() => {
                      const opt = ICON_OPTIONS.find(o => o.name === iconName);
                      if (opt) {
                        const IconComp = opt.component;
                        return <IconComp size={16} />;
                      }
                      return null;
                    })()}
                    {label}
                    {ct && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定要删除自定义类型 "${label}" 吗？`)) {
                            deleteCustomType(key);
                          }
                        }}
                        className="ml-auto text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5"
                        title="删除此类型"
                      >
                        <X size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
              {!isEditMode && (
                <button
                  type="button"
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className={clsx(
                    'px-4 py-2 rounded-xl border border-dashed border-neutral-300 text-sm font-medium transition-all flex items-center justify-center gap-1.5',
                    showCustomForm
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 bg-neutral-50'
                  )}
                >
                  <Plus size={16} />
                  自定义
                </button>
              )}
            </div>

            {/* Custom type creation form */}
            {showCustomForm && (
              <div className="mt-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <label className="block text-sm font-medium text-neutral-700">选择图标</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setCustomIcon(opt.name)}
                      title={opt.label}
                      className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                        customIcon === opt.name
                          ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-400'
                          : 'bg-white text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 border border-neutral-200'
                      )}
                    >
                      <opt.component size={18} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => { setCustomLabel(e.target.value); setCustomError(''); }}
                    placeholder="输入类型名称，如：机票"
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomType}
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    添加
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCustomForm(false); setCustomError(''); }}
                    className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700"
                  >
                    取消
                  </button>
                </div>
                {customError && (
                  <p className="text-xs text-red-500">{customError}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">金额</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">¥</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-neutral-50 font-medium"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-neutral-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述费用内容"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-neutral-50 min-h-[80px] resize-none"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? (isEditMode ? '更新中...' : '添加中...') : (isEditMode ? '更新费用' : '添加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
