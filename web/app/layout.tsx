import type { Metadata } from "next";
import { Fraunces, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { UnitsToggle } from "@/components/UnitsToggle";
import { SceneProvider } from "@/components/Scene";
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
  "Design a mead batch, watch a projected fermentation timeline unfold, and log observations as it progresses. Free, private, runs in your browser.";

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
  // Optional: paste the Search Console "HTML tag" code into this env var if you
  // verify by meta tag instead of DNS. No-op when unset.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Analytics />
        <SceneProvider>
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
                <a href="/gear" className="no-underline text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline">
                  Gear
                </a>
                <UnitsToggle />
              </nav>
            </div>
            <div className="divider mt-4" />
          </header>
          {children}
          <footer className="mt-16 pt-6 border-t border-[var(--line)] text-xs text-[var(--muted)] flex flex-wrap gap-x-6 gap-y-2 items-baseline">
            <span>© Meadbook</span>
            <a href="/yeast" className="no-underline hover:underline">Yeast guide</a>
            <a href="/gear" className="no-underline hover:underline">Gear list</a>
            <span className="text-[var(--muted)]">Some product links are affiliate links — Meadbook may earn a small commission. Costs you nothing.</span>
          </footer>
        </main>
        </SceneProvider>
      </body>
    </html>
  );
}
