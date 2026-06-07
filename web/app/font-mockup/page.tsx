import {
  Fraunces,
  Source_Serif_4,
  Alegreya_Sans,
  IM_Fell_English,
  Pirata_One,
  Cardo,
  Spectral,
} from "next/font/google";

// --- candidate faces (fetched + self-hosted by next/font at build) ---
const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], style: ["normal", "italic"] });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"] });
const alegreyaSans = Alegreya_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });
const imFell = IM_Fell_English({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"] });
const pirata = Pirata_One({ subsets: ["latin"], weight: ["400"] });
const cardo = Cardo({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const spectral = Spectral({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const FAM = {
  fraunces: { fontFamily: fraunces.style.fontFamily, fontVariationSettings: '"opsz" 144, "SOFT" 60, "WONK" 0' },
  sourceSerif: { fontFamily: sourceSerif.style.fontFamily },
  alegreyaSans: { fontFamily: alegreyaSans.style.fontFamily },
  imFell: { fontFamily: imFell.style.fontFamily },
  pirata: { fontFamily: pirata.style.fontFamily },
  cardo: { fontFamily: cardo.style.fontFamily },
  spectral: { fontFamily: spectral.style.fontFamily },
} as const;

type FamKey = keyof typeof FAM;

interface Opt {
  id: number;
  title: string;
  blurb: string;
  mark: FamKey;
  head: FamKey;
  body: FamKey;
  display: string;
  bodyName: string;
}

const OPTIONS: Opt[] = [
  { id: 1, title: "Fraunces (soft) + Source Serif 4", blurb: "Reviewer’s first pick — old-world character up top, clean serif in the data.", mark: "fraunces", head: "fraunces", body: "sourceSerif", display: "Fraunces, soft optical", bodyName: "Source Serif 4" },
  { id: 2, title: "Fraunces + Alegreya Sans", blurb: "Same display, but a warm humanist sans for crisp, dense data.", mark: "fraunces", head: "fraunces", body: "alegreyaSans", display: "Fraunces, soft optical", bodyName: "Alegreya Sans" },
  { id: 3, title: "IM Fell English + Source Serif 4", blurb: "Old printing-press / apothecary character. Most ‘aged’, least neutral.", mark: "imFell", head: "imFell", body: "sourceSerif", display: "IM Fell English", bodyName: "Source Serif 4" },
  { id: 4, title: "Blackletter wordmark + Fraunces + Source Serif", blurb: "One word of blackletter for the logo only; clean serif everywhere else.", mark: "pirata", head: "fraunces", body: "sourceSerif", display: "Pirata One (mark) · Fraunces (headers)", bodyName: "Source Serif 4" },
  { id: 5, title: "Cardo + Source Serif 4", blurb: "Caslon-ish Renaissance serif — aged, handmade apothecary-label feel.", mark: "cardo", head: "cardo", body: "sourceSerif", display: "Cardo", bodyName: "Source Serif 4" },
  { id: 6, title: "Spectral throughout", blurb: "Old-style serif for display and body — calm, characterful, very readable on dark.", mark: "spectral", head: "spectral", body: "spectral", display: "Spectral", bodyName: "Spectral" },
];

// Improved body contrast per the feedback (warm off-white instead of mid-brown).
const INK = "#f3ead6";
const BODY = "#e8dcc4";
const CAP = "#b6a684";

function Sample({ opt }: { opt: Opt }) {
  return (
    <section className="pixel-card p-6 sm:p-7 grid gap-3" data-opt={opt.id}>
      <div className="flex items-baseline justify-between gap-3">
        <span style={{ ...FAM[opt.mark], color: INK, fontSize: opt.mark === "pirata" || opt.mark === "imFell" ? 30 : 26, fontWeight: 600, letterSpacing: opt.mark === "pirata" ? 1 : 0 }}>
          Mead Planner
        </span>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: CAP }}>Option {opt.id}</span>
      </div>

      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--accent-glow)" }}>A brewer’s workbench</p>

      <h1 style={{ ...FAM[opt.head], color: INK }} className="text-4xl leading-[1.05]">Plan and track your mead.</h1>

      <p style={{ ...FAM[opt.body], color: BODY }} className="text-[15px] leading-relaxed max-w-xl">
        Design a batch, watch a projected fermentation timeline unfold, and log observations as it
        progresses. Nothing leaves your browser — your batches live on this device.
      </p>

      {/* mini spec sheet — shows how the body face handles dense data + numerals */}
      <dl className="grid grid-cols-[max-content,1fr] gap-x-5 gap-y-1 text-[14px] mt-1" style={{ ...FAM[opt.body] }}>
        {[["Starting gravity", "1.090"], ["Final gravity", "1.000"], ["ABV", "12.1%"], ["Sweetness", "Off-dry"]].map(([k, v]) => (
          <div key={k} className="contents">
            <dt style={{ color: CAP }} className="uppercase tracking-wide text-[11px] self-center">{k}</dt>
            <dd style={{ color: INK }} className="tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center gap-3 mt-1">
        <button className="btn px-4 py-2" style={{ ...FAM[opt.body], fontWeight: 700 }}>New batch</button>
        <span style={{ color: CAP, ...FAM[opt.body] }} className="text-xs">
          Display: {opt.display} · Body: {opt.bodyName}
        </span>
      </div>
    </section>
  );
}

export default function FontMockupPage() {
  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <h1 style={{ ...FAM.fraunces, color: INK }} className="text-3xl">Font direction mockups</h1>
        <p style={{ color: BODY }} className="text-sm max-w-2xl">
          Each card is the same hero + spec-sheet content, on the live dark/torch theme, with a
          different display + body pairing. Body text is bumped to a warm off-white ({BODY}) for
          contrast in all of them.
        </p>
      </header>
      {OPTIONS.map((o) => (
        <Sample key={o.id} opt={o} />
      ))}
    </div>
  );
}
