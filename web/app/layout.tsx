import type { Metadata } from "next";
import { Fraunces, Mulish } from "next/font/google";
import { PlausibleScript } from "@/components/PlausibleScript";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <PlausibleScript />
        <main className="max-w-5xl mx-auto px-5 py-9">
          <header className="mb-9">
            <div className="flex items-center justify-between gap-4">
              <a href="/" className="inline-flex items-center gap-2.5 no-underline text-[var(--ink)]">
                <DropMark />
                <span className="font-display text-2xl font-semibold tracking-tight">Mead Planner</span>
              </a>
              <span className="eyebrow">improving via daily loop</span>
            </div>
            <div className="divider mt-4" />
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
