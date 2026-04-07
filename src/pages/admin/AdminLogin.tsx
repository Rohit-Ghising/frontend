import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { loginUser } from '../../store/authSlice';

export default function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const { loading, error } = useAppSelector((s) => s.auth);
  const authError =
    typeof error === 'string' ? error : error ? JSON.stringify(error) : '';

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/admin');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-brand-500/12 blur-3xl" />
        <div className="absolute right-[-4rem] top-1/2 h-[16rem] w-[16rem] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="surface-panel relative z-10 w-full max-w-md p-8">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-white">GadgetZone</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin access</p>
          </div>
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-300">
            <Lock size={22} />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold text-white">Admin sign in</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Use an administrator account to manage products, orders, and users.
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-brand-400/20 bg-brand-400/8 p-4 text-xs text-slate-300">
          <p className="font-semibold text-brand-200">Demo admin</p>
          <p className="mt-2">admin@techcart.com / admin123</p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
              required
            />
          </div>

          {authError && (
            <div className="rounded-[1rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {authError}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </span>
            ) : (
              'Sign In to Admin'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
