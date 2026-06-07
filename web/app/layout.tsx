import type { Metadata } from "next";
import { Fraunces, Mulish, Press_Start_2P } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { UnitsToggle } from "@/components/UnitsToggle";
import { HeroBand } from "@/components/HeroBand";
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

const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mead Planner — design and track your batch",
  description:
    "Design a virtual mead batch, see a projected fermentation timeline, and update it as fermentation progresses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${pixel.variable}`}>
      <body>
        <Analytics />
        <main className="max-w-5xl mx-auto px-5 py-7">
          <HeroBand
            rightSlot={
              <>
                <a
                  href="/yeast"
                  className="text-sm no-underline text-[#f6e2b9] hover:text-white hover:underline drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                >
                  Yeast guide
                </a>
                <UnitsToggle />
              </>
            }
          />
          <div className="workspace mt-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
