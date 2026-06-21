"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, TrendingUp, BarChart3, PieChart as PieIcon,
  Activity, AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { api } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const PIE_COLORS = ["#3B82F6", "#06B6D4", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981"];

/* -- Custom Tooltip --------------------------------------------------------- */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2 shadow-xl text-xs">
      {label && <p className="text-[var(--text-muted)] mb-1">{label}</p>}
      <p className="font-semibold text-[var(--text-primary)]">{payload[0].value} scans</p>
    </div>
  );
};

/* -- Risk Progress Bar ------------------------------------------------------- */
function RiskBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-2">
        <span className="text-[var(--text-muted)] font-medium">{label}</span>
        <span className="font-mono font-semibold text-[var(--text-primary)]">
          {count} <span className="text-[var(--text-muted)] font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

/* -- Security Score Ring ----------------------------------------------------- */
function ScoreRing({ score }: { score: number }) {
  const safe  = Math.max(0, Math.min(100, score ?? 100));
  const color = safe >= 70 ? "#3B82F6" : safe >= 40 ? "#F59E0B" : "#EF4444";
  const label = safe >= 70 ? "Protected" : safe >= 40 ? "Moderate" : "At Risk";
  const LabelIcon = safe >= 70 ? ShieldCheck : safe >= 40 ? AlertTriangle : AlertTriangle;
  const circ  = 2 * Math.PI * 46;

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center gap-4">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx={60} cy={60} r={46} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
          <motion.circle
            cx={60} cy={60} r={46} fill="none"
            stroke={color} strokeWidth={10} strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${(safe / 100) * circ} ${circ}` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>{safe}</span>
          <span className="text-[10px] text-[var(--text-muted)]">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
          <LabelIcon className="h-3.5 w-3.5" style={{ color }} strokeWidth={2} />
          {label}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Security Score</p>
      </div>
    </div>
  );
}

/* -- Analytics Page ---------------------------------------------------------- */
export default function AnalyticsPage() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    api.getAnalytics()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-8 w-36 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  const d = data || {
    security_score: 100, total_scans: 0,
    weekly_trends: [], category_distribution: [],
    risk_distribution: { high: 0, medium: 0, low: 0 },
  };
  const rd = d.risk_distribution || { high: 0, medium: 0, low: 0 };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Insights into your scanning activity and threat patterns</p>
      </motion.div>

      {/* Top 3 cards */}
      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-3">

        {/* Security Score Ring */}
        <ScoreRing score={d.security_score} />

        {/* Risk Breakdown */}
        <div className="glass-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Risk Breakdown</h3>
          </div>
          <div className="space-y-4">
            <RiskBar label="Safe"   count={rd.low}    total={d.total_scans} color="#10B981" />
            <RiskBar label="Medium" count={rd.medium} total={d.total_scans} color="#F59E0B" />
            <RiskBar label="High"   count={rd.high}   total={d.total_scans} color="#EF4444" />
          </div>
          <p className="mt-5 text-[11px] text-[var(--text-muted)] text-center">
            {d.total_scans} total scans
          </p>
        </div>

        {/* Category Donut */}
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Categories</h3>
          </div>
          <div className="h-36">
            {mounted && (d.category_distribution?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={d.category_distribution}
                    cx="50%" cy="50%"
                    innerRadius={38} outerRadius={56}
                    paddingAngle={3} dataKey="count" strokeWidth={0}
                  >
                    {d.category_distribution.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{
                    background: "var(--bg-raised)", border: "1px solid var(--border)",
                    borderRadius: "12px", fontSize: "12px", color: "var(--text-primary)",
                  }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-[var(--text-muted)]">No data yet</p>
              </div>
            )}
          </div>
          {(d.category_distribution?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
              {d.category_distribution.slice(0, 5).map((c: any, i: number) => (
                <span key={c.category} className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.category}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Area Chart — Scan Trends */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Scan Trends</h3>
          <span className="ml-auto text-[11px] text-[var(--text-muted)]">Last 30 days</span>
        </div>
        <div className="h-64">
          {mounted && (d.weekly_trends?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.weekly_trends}>
                <defs>
                  <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickFormatter={(v: string) =>
                    new Date(v + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })
                  }
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="count"
                  stroke="#3B82F6" strokeWidth={2}
                  fillOpacity={1} fill="url(#areaBlue)"
                  name="Scans"
                  dot={false} activeDot={{ r: 5, fill: "#3B82F6", strokeWidth: 2, stroke: "var(--bg)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-hover)]">
                <Activity className="h-6 w-6 text-[var(--text-muted)]" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-[var(--text-muted)]">No trend data yet — run some scans to see activity here</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bar Chart — Weekly breakdown */}
      {mounted && (d.weekly_trends?.length ?? 0) > 0 && (
        <motion.div variants={fadeUp} className="glass-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Daily Volume</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.weekly_trends} barSize={20} barCategoryGap="30%">
                <defs>
                  <linearGradient id="barCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#06B6D4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickFormatter={(v: string) =>
                    new Date(v + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })
                  }
                  axisLine={false} tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="count" fill="url(#barCyan)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
