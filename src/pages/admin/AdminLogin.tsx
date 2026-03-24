import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppStore";
import { loginUser } from "../../store/authSlice";

export default function AdminLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const { loading, error } = useAppSelector((s) => s.auth);
  const authError =
    typeof error === "string" ? error : error ? JSON.stringify(error) : "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-none">
              TechCart
            </p>
            <p className="text-xs text-zinc-500">Admin Panel</p>
          </div>
        </div>

        <div className="card p-7">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 mx-auto mb-5">
            <Lock size={20} className="text-brand-400" />
          </div>
          <h1 className="font-display font-bold text-xl text-white text-center mb-1">
            Admin Access
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-6">
            Sign in with admin credentials
          </p>

          <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-3 mb-5 text-xs text-zinc-400">
            <p className="font-medium text-brand-400 mb-1">Demo Admin:</p>
            <p>admin@techcart.com / admin123</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In to Admin"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
