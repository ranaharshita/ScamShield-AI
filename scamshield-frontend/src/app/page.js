import Link from "next/link";
import {
  FileText,
  Link2,
  ImageUp,
  BarChart3,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import Hero from "@/components/Hero";

const FEATURES = [
  {
    href: "/analyze-text",
    icon: FileText,
    title: "Analyze text",
    description:
      "Paste an SMS, email, WhatsApp message, or job offer. We check for urgency tactics, OTP requests, and impersonation patterns.",
  },
  {
    href: "/analyze-url",
    icon: Link2,
    title: "Analyze URL",
    description:
      "Drop in a link before you click it. We flag suspicious domains, brand impersonation, and unusual TLDs.",
  },
  {
    href: "/upload-screenshot",
    icon: ImageUp,
    title: "Upload screenshot",
    description:
      "Upload a screenshot of a suspicious message. We extract the text with OCR and run the same scam analysis.",
  },
  {
    href: "/reports",
    icon: BarChart3,
    title: "Community reports",
    description:
      "See which scam categories are trending and how frequently they're being reported right now.",
  },
  {
    href: "/learn",
    icon: GraduationCap,
    title: "Scam education hub",
    description:
      "Learn how phishing, OTP fraud, and investment scams actually work — and how to spot them yourself.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-signal">
            What ScamShield AI does
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium text-paper sm:text-3xl">
            Five ways to stay ahead of fraud
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-lg border border-wire bg-ink-raised p-5 transition-colors hover:border-wire-soft hover:bg-ink-raised/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <Icon className="h-6 w-6 text-signal" strokeWidth={1.75} />
              <h3 className="mt-4 font-display text-lg font-medium text-paper">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                {description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-signal opacity-0 transition-opacity group-hover:opacity-100">
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
