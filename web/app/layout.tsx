import type { Metadata } from "next";
import { Fraunces, Source_Serif_4, Pirata_One } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { UnitsToggle } from "@/components/UnitsToggle";
import { Torchlight } from "@/components/Torchlight";
import "./globals.css";

// Display: Fraunces with its "old style" soft optical axes for an aged,
// handmade-yet-readable headline voice.
const display = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Body: Source Serif 4 — warm, open, very legible on dark for dense data.
const body = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

// Wordmark only: a single word of blackletter for the logo — old-world signal
// with no readability cost since it never touches headers or body.
const wordmark = Pirata_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-wordmark",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mead Planner — design and track your batch",
  description:
    "Design a virtual mead batch, see a projected fermentation timeline, and update it as fermentation progresses.",
};

function DropMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path
        d="M12 2.5C12 2.5 5 10.2 5 15a7 7 0 0 0 14 0c0-4.8-7-12.5-7-12.5Z"
        fill="var(--accent)"
        stroke="var(--ink)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <ellipse cx="9.4" cy="13.2" rx="1.5" ry="2.3" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${wordmark.variable}`}>
      <body>
        <Analytics />
        <div className="page-bg" aria-hidden />
        <Torchlight />
        <main className="max-w-5xl mx-auto px-5 py-9">
          <header className="mb-9">
            <div className="flex items-center justify-between gap-4">
              <a href="/" className="inline-flex items-center gap-2.5 no-underline text-[var(--ink)]">
                <DropMark />
                <span className="wordmark text-[26px] leading-none">Mead Planner</span>
              </a>
              <nav className="flex items-center gap-3 text-sm">
                <a href="/yeast" className="no-underline text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline">
                  Yeast guide
                </a>
                <UnitsToggle />
              </nav>
            </div>
            <div className="divider mt-4" />
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
