import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { UnitsToggle } from "@/components/UnitsToggle";
import { SceneProvider } from "@/components/Scene";
import { Ornament } from "@/components/Ornament";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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

const TITLE = "Meadbook — design and track your mead";
const DESCRIPTION =
  "Design a mead batch, get gravity, ABV, and nutrient projections, and log readings as it ferments. Free, private, runs in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Meadbook",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Meadbook" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // Optional: paste the Search Console "HTML tag" code into this env var if you
  // verify by meta tag instead of DNS. No-op when unset.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#14110b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Analytics />
        <GoogleAnalytics />
        <SceneProvider>
        <main className="max-w-5xl mx-auto px-5 py-9">
          <header className="mb-9">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <a href="/" className="inline-flex items-center no-underline shrink-0" aria-label="Meadbook — home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/meadbook-logo.png"
                  alt="Meadbook"
                  width={183}
                  height={52}
                  className="h-11 sm:h-12 w-auto"
                />
              </a>
              <nav className="flex items-center gap-3 text-sm ml-auto">
                <a href="/yeast" className="no-underline text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline">
                  Yeast<span className="hidden sm:inline"> guide</span>
                </a>
                <a href="/calculators" className="no-underline text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline">
                  Calc<span className="hidden sm:inline">ulator</span>s
                </a>
                <a href="/resources" className="no-underline text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline">
                  Resources
                </a>
                <a href="/gear" className="no-underline text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline">
                  Gear
                </a>
                <UnitsToggle />
              </nav>
            </div>
            <div className="divider mt-4" />
          </header>
          {children}
          <footer className="mt-16 grid gap-4">
            <Ornament />
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-[var(--muted)]">
              <span className="inline-flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon-192.png" alt="" width={16} height={16} className="h-4 w-auto opacity-90" aria-hidden />
                <span className="font-display text-[13px] tracking-wide text-[var(--ink-soft)]">Meadbook</span>
                <span aria-hidden>·</span>
                <span className="italic">plan well, brew slow</span>
              </span>
              <span className="flex flex-wrap gap-x-5 gap-y-1">
                <a href="/yeast" className="no-underline hover:underline">Yeast guide</a>
                <a href="/calculators" className="no-underline hover:underline">Calculators</a>
                <a href="/resources" className="no-underline hover:underline">Resources</a>
                <a href="/gear" className="no-underline hover:underline">Gear list</a>
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--muted)] opacity-80">
              Some product links are affiliate links: as an Amazon Associate, Meadbook earns from
              qualifying purchases, at no cost to you. Brew notes never leave your browser.
            </p>
          </footer>
        </main>
        </SceneProvider>
      </body>
    </html>
  );
}
