import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import KintsugiDust from "../components/animations/KintsugiDust";
import BlurText from "../components/BlurText";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const userData = await login(email.trim(), password);
      if (userData.role === "hr") {
        navigate("/hr/dashboard", { replace: true });
      } else {
        navigate("/employee/dashboard", { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-900">
      {/* Left Panel (Philosophy) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 relative overflow-hidden flex-col justify-center items-center p-12 lg:p-24 border-r border-[#d4af37]/10">
        <KintsugiDust />
        {/* Glow Accents */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[50%] bg-[#d4af37]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-lg text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-widest text-brand-primary mb-2">
            ストレス
          </h1>
          <div className="text-[10px] text-brand-primary/60 tracking-[0.5em] uppercase mb-8">
            SUTORESU | STRESS
          </div>
          <h2 className="text-lg md:text-xl font-medium text-gray-300 tracking-[0.2em] uppercase mb-6">
            Employee Wellness Portal
          </h2>
          <BlurText 
            text="In the Japanese art of Kintsugi, broken pottery is repaired with gold, making it stronger and more beautiful than before. This portal is designed to identify corporate burnout, map psychological matrices, and provide the golden seams of support needed for optimal functioning."
            className="text-white/60 text-lg leading-relaxed max-w-md mx-auto mt-4 relative z-10"
          />
        </div>
      </div>

      {/* Right Panel (Portal) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-800 p-6 md:p-12 relative overflow-hidden min-h-screen lg:min-h-0">
        {/* Mobile-only background glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[50%] bg-[#d4af37]/10 blur-[120px] rounded-full pointer-events-none lg:hidden" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="glass-card kintsugi-glow p-8 rounded-2xl">
            {/* Mobile Title */}
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-4xl font-extrabold tracking-widest text-brand-primary mb-1">
                ストレス
              </h1>
              <div className="text-[9px] text-brand-primary/60 tracking-[0.5em] uppercase mb-4">
                SUTORESU | STRESS
              </div>
              <p className="text-gray-300 text-xs font-medium uppercase tracking-[0.2em]">
                Employee Wellness Portal
              </p>
            </div>

            {/* Desktop Title */}
            <div className="text-center mb-8 hidden lg:block">
              <h2 className="text-2xl font-bold text-white tracking-wide uppercase translate-x-[1px]">
                Account Login
              </h2>
              <p className="text-white/50 text-sm mt-2 font-medium">
                Securely authenticate into the portal
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium text-center shadow-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wide"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-white placeholder-white/30 transition-all font-medium"
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wide"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-white placeholder-white/30 transition-all font-medium"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-hover text-surface-900 shadow-lg shadow-[#d4af37]/20 text-sm font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider mt-4"
              >
                {submitting ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
              Need an account?{" "}
              <Link to="/signup" className="text-brand-primary hover:text-white font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
