import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Zap, LogIn } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppStore";

import { toast } from "sonner";
import { loginUser } from "../store/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dispatch the thunk with email & password
      const resultAction = await dispatch(loginUser({ email, password }));

      // Check if login succeeded or failed
      if (loginUser.fulfilled.match(resultAction)) {
        console.log("Login successful:", resultAction.payload);
        // Redirect or do something after login
        navigate("/");
      } else {
        console.log("Login failed:", resultAction.payload);
        toast.error(resultAction.payload?.error || "Login failed");
      }
    } catch (err) {
      console.log("Unexpected error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">
            Tech<span className="text-brand-400">Cart</span>
          </span>
        </Link>

        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl text-white mb-2">
              Welcome back
            </h1>
            <p className="text-zinc-500 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          {/* Demo hint */}
          <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-3 mb-6 text-xs text-zinc-400 space-y-1">
            <p className="font-medium text-brand-400">Demo Credentials:</p>
            <p>User: john@example.com / any6+charpass</p>
            <p>Admin: admin@techcart.com / any6+charpass</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={16} /> Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
