import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, X as XIcon, Train, Car, Building2, Footprints, Loader2, RotateCcw } from 'lucide-react';
import { useExpenses, EXPENSE_TYPES } from '../context/ExpenseContext';
import ExpenseModal from '../components/ExpenseModal';
import clsx from 'clsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, toggleReimbursed, submitProject, revokeProject, deleteExpense } = useExpenses();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  const project = data.projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">项目不存在</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary-600 font-medium">返回首页</button>
      </div>
    );
  }

  const totalAmount = project.expenses.reduce((a, e) => a + e.amount, 0);
  const reimbursedAmount = project.expenses.filter(e => e.reimbursed).reduce((a, e) => a + e.amount, 0);

  const typeIcons = {
    SUBWAY: Train,
    TAXI: Car,
    HOTEL: Building2,
    TRAIN: Footprints,
  };

  const sortedExpenses = [...project.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">返回首页</span>
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">{project.name}</h1>
            <p className="text-sm text-neutral-500">{project.description}</p>
          </div>
          {project.submittedAt ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">已提交</span>
              <button
                onClick={() => {
                  if (confirm('确定要撤回报销单吗？撤回后可以继续编辑未报销的项目。')) {
                    revokeProject(project.id);
                  }
                }}
                className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                title="撤回提交"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const unreimbursed = project.expenses.filter(e => !e.reimbursed);
                if (unreimbursed.length > 0) {
                  if (!confirm(`有 ${unreimbursed.length} 笔费用尚未标记为已报销，确定要提交吗？`)) {
                    return;
                  }
                }
                submitProject(project.id);
              }}
              className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
            >
              提交报销
            </button>
          )}
        </div>
        {project.submittedAt && (
          <div className="text-xs text-neutral-400 mb-4">
            提交于 {new Date(project.submittedAt).toLocaleString('zh-CN')}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">总费用</p>
            <p className="text-2xl font-bold text-neutral-900">¥ {totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">已报销</p>
            <p className="text-2xl font-bold text-primary-600">¥ {reimbursedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">费用明细</h2>
        {!project.submittedAtAt && (
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors active:scale-95"
          >
            <Plus size={16} />
            添加费用
          </button>
        )}
      </div>

      <div className="space-y-3">
        {project.expenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-100">
            <p className="text-neutral-500 text-sm">暂无费用记录</p>
            {!project.submittedAt && (
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="mt-4 text-primary-600 text-sm font-medium hover:underline"
              >
                添加第一笔费用
              </button>
            )}
          </div>
        ) : (
          sortedExpenses.map((expense) => {
            const Icon = typeIcons[expense.type] || Train;
            return (
              <div
                key={expense.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex items-center gap-4 group"
              >
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  expense.reimbursed ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-500'
                )}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-neutral-900">
                      {EXPENSE_TYPES[expense.type]}
                    </span>
                    <span className="text-sm text-neutral-400">•</span>
                    <span className="text-sm text-neutral-500">{expense.date}</span>
                  </div>
                  <p className="text-sm text-neutral-500 truncate">{expense.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-neutral-900 text-lg">
                    ¥ {expense.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {!project.submittedAt && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleReimbursed(project.id, expense.id)}
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                        expense.reimbursed ? 'bg-primary-100 text-primary-600 hover:bg-primary-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      )}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if(confirm('确定要删除这笔费用吗？')) {
                          deleteExpense(project.id, expense.id);
                        }
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        projectId={project.id}
      />
    </div>
  );
}
