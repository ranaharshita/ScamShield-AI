"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fish, CreditCard, Briefcase, Trophy, TrendingUp, Video,
  ChevronRight, BookOpen, ChevronDown, Shield,
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const TOPICS = [
  {
    icon: Fish,
    title: "Phishing Attacks",
    category: "Email & Web",
    threat: "Critical",
    color: "#EF4444",
    colorDim: "rgba(239,68,68,0.10)",
    readTime: "3 min",
    description:
      "Phishing emails impersonate trusted brands — banks, delivery services, government bodies — to steal your credentials or infect your device. They create urgency and fear to bypass critical thinking.",
    tips: [
      "Always verify the sender's domain, not just the display name",
      "Hover over links to see the real URL before clicking",
      "Legitimate companies never ask for OTPs or passwords via email",
      "Look for spelling errors, generic greetings, and mismatched branding",
    ],
  },
  {
    icon: CreditCard,
    title: "UPI & Payment Fraud",
    category: "Financial",
    threat: "High",
    color: "#F59E0B",
    colorDim: "rgba(245,158,11,0.10)",
    readTime: "4 min",
    description:
      "Scammers exploit UPI payment requests and QR codes to reverse the flow of money — getting victims to scan 'receive money' QR codes that actually authorize a payment out.",
    tips: [
      "Receiving money never requires entering your UPI PIN",
      "Verify QR codes only from known, trusted sources",
      "Ignore calls claiming to 'send a refund' via UPI",
      "Use official banking apps, not third-party links",
    ],
  },
  {
    icon: Briefcase,
    title: "Job Scams",
    category: "Employment",
    threat: "High",
    color: "#8B5CF6",
    colorDim: "rgba(139,92,246,0.10)",
    readTime: "3 min",
    description:
      "Fake job offers promise high salaries for minimal work, then extract registration fees, training costs, or bank details before disappearing entirely.",
    tips: [
      "Legitimate jobs never ask for upfront registration fees",
      "Research the company independently on LinkedIn",
      "Be wary of jobs requiring no experience but offering high pay",
      "Never share Aadhaar, PAN, or banking details in initial applications",
    ],
  },
  {
    icon: Trophy,
    title: "Lottery & Prize Scams",
    category: "Advance Fee",
    threat: "Medium",
    color: "#10B981",
    colorDim: "rgba(16,185,129,0.10)",
    readTime: "2 min",
    description:
      "You cannot win a lottery you never entered. These scams use excitement and urgency to extract 'processing fees' that grow with each payment, with no prize ever delivered.",
    tips: [
      "You cannot win a contest you did not enter",
      "Legitimate lotteries never charge fees to claim winnings",
      "Ignore notifications from unknown international numbers",
      "Report to the National Cyber Crime Helpline: 1930",
    ],
  },
  {
    icon: TrendingUp,
    title: "Investment Fraud",
    category: "Financial",
    threat: "Critical",
    color: "#06B6D4",
    colorDim: "rgba(6,182,212,0.10)",
    readTime: "5 min",
    description:
      "Pig butchering scams and fake trading platforms build trust over weeks through social media, then convince victims to invest in platforms that show fake profits until funds are locked.",
    tips: [
      "SEBI-registered advisors cannot guarantee returns",
      "Avoid investment groups on WhatsApp or Telegram",
      "Research platforms through SEBI's official investor portal",
      "If profits cannot be withdrawn, the platform is fraudulent",
    ],
  },
  {
    icon: Video,
    title: "Deepfake Scams",
    category: "Emerging Threat",
    threat: "Critical",
    color: "#EC4899",
    colorDim: "rgba(236,72,153,0.10)",
    readTime: "4 min",
    description:
      "AI-generated voice and video clones of family members, executives, or celebrities are used to create urgent requests for money. The deception is increasingly convincing.",
    tips: [
      "Establish a family 'safe word' for emergencies",
      "Always call back on a known number, not the one provided",
      "Request they hold a unique gesture on video calls",
      "Be especially suspicious of urgency and unusual payment requests",
    ],
  },
];

const THREAT_STYLES: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "rgba(239,68,68,0.12)",  color: "#EF4444" },
  High:     { bg: "rgba(245,158,11,0.12)", color: "#F59E0B" },
  Medium:   { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
};

function TopicCard({ icon: Icon, title, category, threat, color, colorDim, readTime, description, tips }: typeof TOPICS[0]) {
  const [open, setOpen] = useState(false);
  const ts = THREAT_STYLES[threat] ?? THREAT_STYLES.Medium;

  return (
    <motion.div
      variants={fadeUp}
      className="glass-card overflow-hidden flex flex-col cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      {/* Top accent line */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon + badges */}
        <div className="flex items-start justify-between mb-5">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
            style={{ background: colorDim }}
          >
            <Icon className="h-5.5 w-5.5" style={{ color }} strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: ts.bg, color: ts.color }}
            >
              {threat}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] border border-[var(--border)] rounded-full px-2 py-0.5">
              {readTime} read
            </span>
          </div>
        </div>

        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>{category}</span>
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-[13px] leading-relaxed text-[var(--text-muted)] flex-1">{description}</p>

        {/* Expand toggle */}
        <button
          className="mt-5 flex items-center gap-1.5 text-[12px] font-medium transition-colors"
          style={{ color }}
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        >
          <span>{open ? "Hide" : "Show"} red flags</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {/* Tips */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12px] text-[var(--text-secondary)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                    {tip}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function LearnPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-dim)]">
            <BookOpen className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            Security Education
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Learn to Stay Safe
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)] max-w-lg">
          Understanding how scams work is your first line of defense. Know the patterns, spot the red flags.
          Click any card to reveal the warning signs.
        </p>
      </motion.div>

      {/* Topic Grid */}
      <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((topic) => (
          <TopicCard key={topic.title} {...topic} />
        ))}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        variants={fadeUp}
        className="glass-card p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-dim)]">
          <Shield className="h-6 w-6 text-[var(--accent)]" strokeWidth={1.75} />
        </div>
        <p className="text-sm text-[var(--text-muted)]">Think you&apos;ve received something suspicious?</p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Scan it instantly with AI</h2>
        <Link
          href="/scanner"
          className="btn-scan mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
        >
          Open Scanner <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
