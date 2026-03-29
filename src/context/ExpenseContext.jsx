import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ExpenseContext = createContext();

export const EXPENSE_TYPES = {
  SUBWAY: '地铁',
  TAXI: '打车',
  HOTEL: '住宿',
  TRAIN: '高铁',
};

const API_BASE = '/api';
const NAMESPACE_KEY = 'vinvoice_namespace';

export function ExpenseProvider({ children }) {
  const [data, setData] = useState({ namespaces: [], projects: [] });
  const [currentNamespace, setCurrentNamespace] = useState(() => localStorage.getItem(NAMESPACE_KEY) || 'default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}?namespace=${currentNamespace}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e.message);
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  }, [currentNamespace]);

  useEffect(() => {
    localStorage.setItem(NAMESPACE_KEY, currentNamespace);
    setLoading(true);
    fetchData();
  }, [fetchData, currentNamespace]);

  const createNamespace = async (name) => {
    try {
      const res = await fetch(`${API_BASE}/namespaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create namespace');
      const newNamespace = await res.json();
      setData(prev => ({ ...prev, namespaces: [...prev.namespaces, newNamespace] }));
      setCurrentNamespace(newNamespace.id);
    } catch (e) {
      setError(e.message);
      console.error('Failed to create namespace', e);
    }
  };

  const deleteNamespace = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/namespaces/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete namespace');
      setData(prev => ({
        ...prev,
        namespaces: prev.namespaces.filter(n => n.id !== id),
        projects: prev.projects.filter(p => p.namespaceId !== id)
      }));
      if (currentNamespace === id) {
        setCurrentNamespace('default');
      }
    } catch (e) {
      setError(e.message);
      console.error('Failed to delete namespace', e);
    }
  };

  const addProject = async (project) => {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project, namespaceId: currentNamespace }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const newProject = await res.json();
      setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    } catch (e) {
      setError(e.message);
      console.error('Failed to create project', e);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      setData(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== projectId)
      }));
    } catch (e) {
      setError(e.message);
      console.error('Failed to delete project', e);
    }
  };

  const addExpense = async (projectId, expense) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (!res.ok) throw new Error('Failed to add expense');
      const newExpense = await res.json();
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p =>
          p.id === projectId
            ? { ...p, expenses: [...p.expenses, newExpense] }
            : p
        )
      }));
    } catch (e) {
      setError(e.message);
      console.error('Failed to add expense', e);
    }
  };

  const toggleReimbursed = async (projectId, expenseId) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/expenses/${expenseId}/toggle`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to toggle reimbursed');
      const updated = await res.json();
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p =>
          p.id === projectId
            ? { ...p, expenses: p.expenses.map(e => e.id === expenseId ? updated : e) }
            : p
        )
      }));
    } catch (e) {
      setError(e.message);
      console.error('Failed to toggle reimbursed', e);
    }
  };

  const submitProject = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/submit`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to submit project');
      const updated = await res.json();
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? updated : p)
      }));
    } catch (e) {
      setError(e.message);
      console.error('Failed to submit project', e);
    }
  };

  const revokeProject = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/revoke`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to revoke project');
      const updated = await res.json();
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? updated : p)
      }));
    } catch (e) {
      setError(e.message);
      console.error('Failed to revoke project', e);
    }
  };

  return (
    <ExpenseContext.Provider value={{ data, currentNamespace, setCurrentNamespace, loading, error, createNamespace, deleteNamespace, addProject, deleteProject, addExpense, toggleReimbursed, submitProject, revokeProject, refetch: fetchData }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}
