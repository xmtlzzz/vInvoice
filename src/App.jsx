import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import Statistics from './pages/Statistics';
import Types from './pages/Types';
import Login from './pages/Login';

function AppRoutes() {
  const { user } = useExpenses();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/types" element={<Types />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ExpenseProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ExpenseProvider>
  );
}

export default App;
