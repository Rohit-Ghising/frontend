import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, UserPlus } from "lucide-react";
import { useAppDispatch } from "../hooks/useAppStore";
import { toast } from "sonner";
import { signupUser } from "../store/authSlice";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const resultAction = await dispatch(
        signupUser({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      );

      if (signupUser.fulfilled.match(resultAction)) {
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        const payload = resultAction.payload as any;
        const backendError =
          payload?.name?.join(" ") ||
          payload?.email?.join(" ") ||
          payload?.non_field_errors?.join(" ") ||
          "Signup failed";
        toast.error(backendError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />
      <div className="w-full max-w-md relative z-10">
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
              Create Account
            </h1>
            <p className="text-zinc-500 text-sm">
              Join thousands of tech enthusiasts
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {[
              {
                key: "name",
                label: "Full Name",
                type: "text",
                placeholder: "John Doe",
              },
              {
                key: "email",
                label: "Email Address",
                type: "email",
                placeholder: "you@example.com",
              },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="input"
                  required
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  <UserPlus size={16} /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
