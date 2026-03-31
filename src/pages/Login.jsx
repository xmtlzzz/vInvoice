import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Loader2, Gift } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useExpenses();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && !inviteCode.trim()) {
      setError('请输入邀请码');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const body = { username, password };
      if (!isLogin) body.inviteCode = inviteCode;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '操作失败');
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            V
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">vInvoice</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {isLogin ? '登录到您的账户' : '创建新账户'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              placeholder="请输入密码"
              required
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1">
                <Gift size={14} />
                邀请码
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all uppercase"
                placeholder="请输入邀请码"
                required
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isLogin ? (
              <LogIn size={20} />
            ) : (
              <UserPlus size={20} />
            )}
            {isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setInviteCode('');
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {isLogin ? '还没有账户？立即注册' : '已有账户？登录'}
          </button>
        </div>

        {!isLogin && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
            <p className="text-xs text-neutral-500 text-center">
              注册后将自动创建您的个人空间，所有数据将与其他用户完全隔离。邀请码仅能使用一次。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
