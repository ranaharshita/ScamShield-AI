"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Mail, Lock, User, Eye, EyeOff, AlertCircle,
  CheckCircle2, ArrowRight, ShieldCheck, Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const PERKS = [
  { icon: ShieldCheck, text: "AI-powered scam detection" },
  { icon: Zap,         text: "Results in under 2 seconds" },
  { icon: Shield,      text: "100% private — nothing stored" },
];

function InputField({ icon: Icon, type = "text", placeholder, value, onChange, required, minLength, suffix, id }: {
  icon: React.ElementType; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
  minLength?: number; suffix?: React.ReactNode; id?: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-hover)]/60 py-3 pl-10 pr-11 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent-mid)] focus:bg-[var(--bg-hover)]"
      />
      {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}

/* -- Success State ---------------------------------------------------------- */
function SuccessView({ email }: { email: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-[var(--bg)]">
      <div className="hero-gradient pointer-events-none fixed inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass-card w-full max-w-sm p-10 text-center"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--green-dim)]">
          <CheckCircle2 className="h-7 w-7 text-[var(--green)]" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Check your inbox</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-[var(--text-primary)]">{email}</span>.
          Click it to activate your account.
        </p>
        <Link
          href="/login"
          className="btn-scan mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
        >
          Back to Sign In <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  const [fullName,      setFullName]      = useState("");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(""); setGoogleLoading(true);
    try { await signInWithGoogle(); }
    catch (err: any) { setError(err.message || "Google sign-in failed."); setGoogleLoading(false); }
  };

  if (success) return <SuccessView email={email} />;

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 pointer-events-none" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[var(--cyan)] opacity-[0.04] blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-dim)]">
            <Shield className="h-4.5 w-4.5 text-[var(--accent)]" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">ScamShield AI</span>
        </div>

        {/* Center */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
              Start protecting<br />
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
                yourself today.
              </span>
            </h2>
            <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
              Free forever. No credit card. Just real protection against real threats.
            </p>
          </div>
          <div className="space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-dim)]">
                  <Icon className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} />
                </div>
                <span className="text-sm text-[var(--text-secondary)]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[12px] text-[var(--text-muted)]">
          © 2025 ScamShield AI · Know Before You Trust
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-dim)]">
              <Shield className="h-6 w-6 text-[var(--accent)]" strokeWidth={2} />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-primary)]">ScamShield AI</h1>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Create account</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Start protecting yourself from scams — it&apos;s free</p>
          </div>

          <div className="glass-card p-6 space-y-4">
            {/* Google */}
            <button
              id="google-signup"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-hover)]/60 px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--bg-hover)] disabled:opacity-60"
            >
              {googleLoading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
                : <GoogleIcon />}
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs text-[var(--text-muted)]">or</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Full Name</label>
                <InputField
                  id="signup-name"
                  icon={User} placeholder="Jane Smith"
                  value={fullName} onChange={setFullName}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Email</label>
                <InputField
                  id="signup-email"
                  icon={Mail} type="email" placeholder="you@example.com"
                  value={email} onChange={setEmail} required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Password</label>
                <InputField
                  id="signup-password"
                  icon={Lock} type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password} onChange={setPassword} required minLength={6}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl bg-[var(--red-dim)] border border-[var(--red)]/20 px-3 py-2.5 text-xs text-[var(--red)]"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="btn-scan flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>Create account <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
