import type { Metadata } from "next";
import { Fraunces, Source_Serif_4 } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Meadbook — design and track your batch",
  description:
    "Design a virtual mead batch, see a projected fermentation timeline, and update it as fermentation progresses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Analytics />
        <div className="page-bg" aria-hidden />
        <Torchlight />
        <main className="max-w-5xl mx-auto px-5 py-9">
          <header className="mb-9">
            <div className="flex items-center justify-between gap-4">
              <a href="/" className="inline-flex items-center no-underline" aria-label="Meadbook — home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/meadbook-logo.png"
                  alt="Meadbook"
                  width={183}
                  height={52}
                  className="h-11 sm:h-12 w-auto"
                />
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
