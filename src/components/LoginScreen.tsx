import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Lock, ArrowRight, Loader2, Wallet } from 'lucide-react';

interface LoginScreenProps {
  onToggle: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onToggle }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ui-main p-6 selection:bg-primary/30">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-ui-card shadow-2xl border border-ui p-4">
            <img src="/logo.svg" alt="Ospent Logo" className="h-full w-full" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-ui-main">Master Ledger</h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-ui-dim">Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[3rem] bg-ui-card p-10 shadow-2xl border border-ui">
          {error && (
            <div className="rounded-2xl bg-rose-500/10 p-4 text-center text-xs font-black uppercase tracking-widest text-rose-500 animate-in shake-1">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-dim">Identity</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-dim" />
              <input
                type="text"
                placeholder="Username"
                className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 py-5 pl-12 pr-6 text-sm font-bold text-ui-main outline-none focus:border-primary transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-dim">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-dim" />
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 py-5 pl-12 pr-6 text-sm font-bold text-ui-main outline-none focus:border-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[2rem] bg-primary py-5 text-sm font-black uppercase tracking-widest text-ui-card shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Initialize Access <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          
          <div className="pt-4 text-center">
            <button 
              type="button" 
              onClick={onToggle}
              className="text-[10px] font-black uppercase tracking-widest text-ui-dim hover:text-primary transition-colors"
            >
              Don't have an account? <span className="text-primary underline">Join Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
