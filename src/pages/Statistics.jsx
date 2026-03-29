import React, { useState } from 'react';
import { useExpenses, EXPENSE_TYPES } from '../context/ExpenseContext';
import { Loader2 } from 'lucide-react';

export default function Statistics() {
  const { data, loading } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  const allExpenses = data.projects.flatMap(p => p.expenses.map(e => ({ ...e, projectName: p.name, projectId: p.id })));
  const filteredExpenses = allExpenses.filter(e => e.date.startsWith(selectedMonth));

  const totalAmount = filteredExpenses.reduce((a, e) => a + e.amount, 0);
  const reimbursedAmount = filteredExpenses.filter(e => e.reimbursed).reduce((a, e) => a + e.amount, 0);

  const typeBreakdown = {};
  filteredExpenses.forEach(e => {
    if (!typeBreakdown[e.type]) {
      typeBreakdown[e.type] = { count: 0, amount: 0 };
    }
    typeBreakdown[e.type].count += 1;
    typeBreakdown[e.type].amount += e.amount;
  });

  const months = [];
  const loopDate = new Date();
  for (let i = 0; i < 12; i++) {
    months.push(loopDate.toISOString().slice(0, 7));
    loopDate.setMonth(loopDate.getMonth() - 1);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">月度统计</h1>
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 font-medium text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all appearance-none"
          >
            {months.map(m => (
              <option key={m} value={m}>{m.replace('-', '年')}月</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h3 className="text-sm font-medium text-neutral-500 mb-4 uppercase tracking-wider">费用总览</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-3xl font-bold text-neutral-900">
              ¥ {totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-neutral-500 mt-1">总支出</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-600">
              ¥ {reimbursedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-neutral-500 mt-1">已报销</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h3 className="text-sm font-medium text-neutral-500 mb-4 uppercase tracking-wider">分类明细</h3>
        <div className="space-y-4">
          {Object.entries(EXPENSE_TYPES).map(([key, label]) => {
            const breakdown = typeBreakdown[key] || { count: 0, amount: 0 };
            const percentage = totalAmount > 0 ? (breakdown.amount / totalAmount) * 100 : 0;
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-900">{label}</span>
                  <span className="text-neutral-500">¥ {breakdown.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-400">{breakdown.count} 笔</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
