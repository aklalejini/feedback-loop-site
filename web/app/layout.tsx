import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import { PlausibleScript } from "@/components/PlausibleScript";
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mead Planner — design and track your batch",
  description:
    "Design a virtual mead batch, see a projected fermentation timeline, and update it as fermentation progresses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={pixelifySans.variable}>
      <body>
        <PlausibleScript />
        <main className="max-w-5xl mx-auto px-5 py-8">
          <header className="mb-8 flex items-baseline justify-between">
            <a href="/" className="text-2xl font-display no-underline text-[var(--ink)]">
              Mead Planner
            </a>
            <span className="text-sm text-[var(--muted)]">v1 · improving via daily loop</span>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
