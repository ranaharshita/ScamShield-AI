"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Save, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

function Field({
  label, icon: Icon, value, onChange, disabled, type = "text",
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.75} />
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          disabled={disabled}
          suppressHydrationWarning
          className={`w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition-colors ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "focus:border-[var(--accent)]"
          }`}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    api.getProfile()
      .then((p: any) => setFullName(p.full_name || ""))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      await api.updateProfile({ full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    finally { setLoading(false); }
  };

  const initials = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U";
  const displayName = user?.user_metadata?.full_name || fullName || "User";

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-md space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Manage your account information</p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] overflow-hidden">
        {/* Avatar banner */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] via-[#6366f1] to-transparent" />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-dim)] text-xl font-bold text-[var(--accent)]">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{displayName}</p>
              <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="mx-6 h-px bg-[var(--border)]" />

        {/* Fields */}
        <div className="p-6 space-y-4">
          <Field
            label="Full Name"
            icon={User}
            value={fullName}
            onChange={setFullName}
          />
          <Field
            label="Email Address"
            icon={Mail}
            value={user?.email || ""}
            disabled
            type="email"
          />
          <Field
            label="Member Since"
            icon={Calendar}
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""}
            disabled
          />

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--accent-glow)] transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                : saved
                ? <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
