"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShieldAlert, ShieldCheck, ShieldQuestion,
  Trash2, ChevronLeft, ChevronRight, ScanSearch, X, ChevronDown,
} from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

const RISK_LEVELS = ["", "Low", "Medium", "High"];
const SCAN_TYPES  = ["", "TEXT", "URL", "CHAT", "SCREENSHOT", "DOCUMENT", "EMAIL"];

const riskMeta = {
  High:   { icon: ShieldAlert,   color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  Medium: { icon: ShieldQuestion, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Low:    { icon: ShieldCheck,   color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

export default function HistoryPage() {
  const [scans,      setScans]      = useState<any[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [riskLevel,  setRiskLevel]  = useState("");
  const [scanType,   setScanType]   = useState("");
  const [expanded,   setExpanded]   = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (search)    params.search    = search;
      if (riskLevel) params.risk_level = riskLevel;
      if (scanType)  params.scan_type  = scanType;
      const res: any = await api.getHistory(params);
      setScans(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, riskLevel, scanType]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    try { await api.deleteScan(id); fetchHistory(); } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Scan History</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Browse, search, and manage your past scans</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search scans..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] py-2.5 pl-9 pr-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select
          value={riskLevel}
          onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
        >
          <option value="">All Risks</option>
          {RISK_LEVELS.filter(Boolean).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={scanType}
          onChange={(e) => { setScanType(e.target.value); setPage(1); }}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
        >
          <option value="">All Types</option>
          {SCAN_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-16 flex flex-col items-center text-center">
          <ScanSearch className="h-10 w-10 text-[var(--text-faint)]" strokeWidth={1.5} />
          <p className="mt-3 text-base font-medium text-[var(--text-primary)]">No scans found</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {search || riskLevel || scanType ? "Try adjusting your filters." : "Your scan history will appear here."}
          </p>
          {!search && !riskLevel && !scanType && (
            <Link
              href="/scanner"
              className="mt-5 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              Run your first scan
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {scans.map((scan) => {
            const meta = riskMeta[scan.risk_level as keyof typeof riskMeta] || riskMeta.Low;
            const Icon = meta.icon;
            const isOpen = expanded === scan.id;
            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : scan.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: meta.bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.color }} strokeWidth={1.75} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {scan.input_text?.slice(0, 90) || `${scan.scan_type} scan`}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {scan.scan_type} · {scan.category} · <span suppressHydrationWarning>{new Date(scan.created_at).toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono text-base font-bold" style={{ color: meta.color }}>
                      {scan.risk_score}
                    </span>
                    <span
                      className="hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {scan.risk_level}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-[var(--text-muted)] transition-transform"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </div>
                </button>

                {/* Expanded */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[var(--border)] px-5 py-4 space-y-3">
                        {scan.explanation && (
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{scan.explanation}</p>
                        )}
                        {scan.reasons?.length > 0 && (
                          <ul className="space-y-1.5">
                            {scan.reasons.map((r: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: meta.color }} />
                                {r}
                              </li>
                            ))}
                          </ul>
                        )}
                        <button
                          onClick={() => handleDelete(scan.id)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[var(--red)] hover:bg-[var(--red-dim)] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete scan
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">{total} scans total</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-[var(--text-muted)] px-1">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
