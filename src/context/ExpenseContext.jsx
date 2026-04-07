import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createExpenseRequest } from './expenseApi.js';

const ExpenseContext = createContext();

export const EXPENSE_TYPES = {
  SUBWAY: '地铁',
  TAXI: '打车',
  HOTEL: '住宿',
  TRAIN: '高铁',
  BUS: '大巴车',
};

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const USER_KEY = 'vinvoice_user';

export function ExpenseProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    const savedUser = saved ? JSON.parse(saved) : null;
    return savedUser;
  });
  const [data, setData] = useState({ namespaces: [], projects: [] });
  const [currentNamespace, setCurrentNamespace] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    const savedUser = saved ? JSON.parse(saved) : null;
    return savedUser?.namespaceId || 'default';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const headers = {};
      const ns = user?.namespaceId || 'default';
      if (user?.namespaceId) {
        headers['x-user-namespace'] = user.namespaceId;
      }
      const res = await fetch(`${API_BASE}?namespace=${ns}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
      setCurrentNamespace(ns);
      setError(null);
    } catch (e) {
      setError(e.message);
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const login = (userData) => {
    setUser(userData);
    setCurrentNamespace(userData.namespaceId || 'default');
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    setCurrentNamespace('default');
  };

  const addProject = async (project) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.namespaceId) headers['x-user-namespace'] = user.namespaceId;
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...project, namespaceId: currentNamespace }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const newProject = await res.json();
      setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    } catch (e) {
      setError(e.message);
      console.error('Failed to create project', e);
      throw e;  // Re-throw so callers can catch it
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const headers = {};
      if (user?.namespaceId) headers['x-user-namespace'] = user.namespaceId;
      const res = await fetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE', headers });
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
      const headers = {};
      if (user?.namespaceId) headers['x-user-namespace'] = user.namespaceId;
      const newExpense = await createExpenseRequest({
        apiBase: API_BASE,
        projectId,
        expense,
        headers,
      });
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
      throw e;
    }
  };

  const toggleReimbursed = async (projectId, expenseId) => {
    try {
      const headers = {};
      if (user?.namespaceId) headers['x-user-namespace'] = user.namespaceId;
      const res = await fetch(`${API_BASE}/projects/${projectId}/expenses/${expenseId}/toggle`, { method: 'PUT', headers });
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
      const headers = {};
      if (user?.namespaceId) headers['x-user-namespace'] = user.namespaceId;
      const res = await fetch(`${API_BASE}/projects/${projectId}/submit`, { method: 'PUT', headers });
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

  const updateExpense = async (projectId, expenseId, updates) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user?.namespaceId) headers['x-user-namespace'] = user.namespaceId;
      const res = await fetch(`${API_BASE}/projects/${projectId}/expenses/${expenseId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update expense');
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
      console.error('Failed to update expense', e);
      throw e;
    }
  };

  const deleteExpense = async (projectId, expenseId) => {
    try {
      const headers = {};
      if (user?.namespaceId) headers['x-user-namespace'] = user.namespaceId;
      const res = await fetch(`${API_BASE}/projects/${projectId}/expenses/${expenseId}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete expense');
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p =>
          p.id === projectId
            ? { ...p, expenses: p.expenses.filter(e => e.id !== expenseId) }
            : p
        )
      }));
    } catch (e) {
      setError(e.message);
      console.error('Failed to delete expense', e);
    }
  };

  const revokeProject = async (projectId) => {
    try {
      const headers = {};
      if (user?.namespaceId) headers['x-user-namespace'] = user.namespaceId;
      const res = await fetch(`${API_BASE}/projects/${projectId}/revoke`, { method: 'PUT', headers });
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
    <ExpenseContext.Provider value={{ user, login, logout, data, currentNamespace, loading, error, addProject, deleteProject, addExpense, updateExpense, toggleReimbursed, submitProject, revokeProject, deleteExpense, refetch: fetchData }}>
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
