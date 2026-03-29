import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, FolderOpen, CheckCircle2, Clock, FileText, Loader2, Trash2 } from 'lucide-react';
import { useExpenses, EXPENSE_TYPES } from '../context/ExpenseContext';
import clsx from 'clsx';
import ProjectModal from '../components/ProjectModal';

export default function Home() {
  const { data, loading, deleteProject } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  const totalAmount = data.projects.reduce((acc, p) =>
    acc + p.expenses.reduce((a, e) => a + e.amount, 0), 0
  );

  const reimbursedAmount = data.projects.reduce((acc, p) =>
    acc + p.expenses.filter(e => e.reimbursed).reduce((a, e) => a + e.amount, 0), 0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
          <p className="text-neutral-500 text-sm font-medium mb-1">总费用</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            ¥ {totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100">
          <p className="text-neutral-500 text-sm font-medium mb-1">已报销</p>
          <p className="text-2xl font-bold text-primary-600 tracking-tight">
            ¥ {reimbursedAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">我的项目</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors active:scale-95"
        >
          <Plus size={16} />
          新建项目
        </button>
      </div>

      <div className="space-y-3">
        {data.projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-neutral-100">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FolderOpen size={24} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 text-sm">暂无项目</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-primary-600 text-sm font-medium hover:underline"
            >
              创建第一个项目
            </button>
          </div>
        ) : (
          data.projects.map((project) => {
            const total = project.expenses.reduce((a, e) => a + e.amount, 0);
            const reimbursed = project.expenses.filter(e => e.reimbursed).length;
            const typeCount = {};
            project.expenses.forEach(e => {
              typeCount[e.type] = (typeCount[e.type] || 0) + 1;
            });

            return (
              <div key={project.id} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 text-base truncate pr-4 group-hover:text-primary-700 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-0.5 truncate">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/project/${project.id}`}
                      className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                    >
                      <ChevronRight size={20} />
                    </Link>
                    {!project.submittedAt && (
                      <button
                        onClick={() => {
                          if (confirm(`确定要删除项目 "${project.name}" 吗？`)) {
                            deleteProject(project.id);
                          }
                        }}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {Object.entries(typeCount).map(([type, count]) => (
                      <span key={type} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-md">
                        {EXPENSE_TYPES[type]} x{count}
                      </span>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-neutral-900 tracking-tight">
                    ¥ {total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>{project.expenses.length} 笔费用</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {project.submittedAt ? (
                      <>
                        <CheckCircle2 size={14} className="text-primary-600" />
                        <span className="text-primary-600 font-medium">已提交</span>
                      </>
                    ) : (
                      <>
                        <Clock size={14} />
                        <span>{reimbursed}/{project.expenses.length} 已报销</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
