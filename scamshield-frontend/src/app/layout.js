import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ScamShield AI — Detect scams before they detect you",
  description:
    "AI-powered scam detection for text messages, URLs, and screenshots. Built for Elevate 2026.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ink text-foreground font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
