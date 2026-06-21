"use client";

import { motion } from "framer-motion";
import { FileText, ScanSearch, Clock } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ReportsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Generated scan reports and summaries</p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-16 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-hover)]">
          <FileText className="h-6 w-6 text-[var(--text-muted)]" strokeWidth={1.5} />
        </div>
        <h2 className="mt-5 text-base font-semibold text-[var(--text-primary)]">Reports coming soon</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)] max-w-sm mx-auto">
          Export detailed PDF reports, share scan results, and generate security summaries for your team.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <Clock className="h-3.5 w-3.5" />
          On the roadmap
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3 max-w-md mx-auto text-left">
          {[
            "PDF export of scan results",
            "Weekly security digest",
            "Team sharing & collaboration",
          ].map((feature) => (
            <div key={feature} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-xs text-[var(--text-muted)]">
              {feature}
            </div>
          ))}
        </div>

        <a
          href="/scanner"
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <ScanSearch className="h-4 w-4" />
          Run a scan instead
        </a>
      </motion.div>
    </motion.div>
  );
}
