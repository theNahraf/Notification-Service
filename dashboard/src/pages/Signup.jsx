import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function Signup() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) { navigate("/", { replace: true }); return null; }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">NotifyStack</h1>
          <p className="mt-2 text-neutral-400">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="label">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Ayush"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
              <input
                type="email"
                className="input pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
              <input
                type="password"
                className="input pl-10"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2">
            {loading ? "Creating account…" : "Create account"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-ink hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
