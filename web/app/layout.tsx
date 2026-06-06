import type { Metadata } from "next";
import { PlausibleScript } from "@/components/PlausibleScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mead Planner — design and track your batch",
  description:
    "Design a virtual mead batch, see a projected fermentation timeline, and update it as fermentation progresses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlausibleScript />
        <main className="max-w-4xl mx-auto px-5 py-8">
          <header className="mb-8 flex items-baseline justify-between">
            <a href="/" className="text-xl font-display font-semibold no-underline text-[var(--ink)]">
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
