import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, User } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 text-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-[#1e293b] p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#10b981]">Ospent</h2>
          <p className="mt-2 text-sm font-medium text-slate-400">Track your path to financial freedom</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && <div className="rounded-xl bg-red-500/10 p-3 text-center text-sm font-bold text-red-400">{error}</div>}
          
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-2xl border-2 border-slate-700 bg-slate-800/50 py-4 pl-12 pr-4 font-bold text-white outline-none focus:border-[#10b981] transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-2xl border-2 border-slate-700 bg-slate-800/50 py-4 pl-12 pr-4 font-bold text-white outline-none focus:border-[#10b981] transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#10b981] py-4 text-lg font-bold text-[#0f172a] shadow-lg shadow-[#10b981]/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-500">
          Demo: testuser / testpassword
        </p>
      </div>
    </div>
  );
};
