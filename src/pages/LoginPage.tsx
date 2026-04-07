import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { toast } from 'sonner';
import { loginUser } from '../store/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        navigate('/');
      } else {
        toast.error(resultAction.payload?.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Unexpected error while signing in');
      console.error(err);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-[22rem] w-[22rem] rounded-full bg-brand-500/12 blur-3xl" />
        <div className="absolute right-[-4rem] top-[18%] h-[18rem] w-[18rem] rounded-full bg-accent/12 blur-3xl" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="hidden lg:block">
          <p className="section-label mb-5">Welcome back</p>
          <h1 className="font-display text-5xl font-bold leading-tight text-white">
            Sign in and continue your next upgrade.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-400">
            GadgetZone now has a cleaner visual system, stronger hierarchy, and more focused interactions throughout the storefront. Your account keeps orders, checkout, and product browsing connected.
          </p>

          <div className="mt-8 grid max-w-lg gap-4 sm:grid-cols-2">
            {[
              { title: 'Cleaner browsing', text: 'Sharper layout, stronger cards, clearer product discovery.' },
              { title: 'Faster decisions', text: 'Improved hierarchy keeps pricing and actions easy to scan.' },
            ].map(({ title, text }) => (
              <div key={title} className="surface-panel-soft p-5">
                <p className="font-display text-xl font-semibold text-white">{title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel mx-auto w-full max-w-md p-8 sm:p-9">
          <Link to="/" className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">
              Gadget<span className="text-brand-300">Zone</span>
            </span>
          </Link>

          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-white">Sign in</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Access your orders, checkout flow, and saved shopping progress.
            </p>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-brand-400/20 bg-brand-400/8 p-4 text-xs text-slate-300">
            <p className="font-semibold text-brand-200">Demo credentials</p>
            <p className="mt-2">User: john@example.com / any6+charpass</p>
            <p className="mt-1">Admin demo: admin@techcart.com / any6+charpass</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="input pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-[1rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={16} /> Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-brand-200 transition-colors hover:text-white">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
