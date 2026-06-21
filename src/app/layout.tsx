import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "ScamShield AI — Detect Scams Before They Detect You",
  description:
    "Premium AI-powered scam detection and digital safety platform. Verify suspicious messages, links, screenshots, and documents instantly.",
  keywords: ["scam detection", "phishing", "AI security", "cybersecurity", "fraud prevention", "digital safety"],
  openGraph: {
    title: "ScamShield AI",
    description: "AI-powered protection against scams and phishing attacks.",
    type: "website",
  },
};

// Prevent white flash on dark mode load
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('scamshield-theme') || 'dark';
    document.documentElement.classList.add(t === 'light' ? 'light' : 'dark');
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
