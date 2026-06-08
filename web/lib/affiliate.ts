// Affiliate link registry (Amazon Associates).
//
// Real affiliate URLs. The `BuyLink` component reads from this registry, so
// updating a URL here updates every surface that recommends that product.
// Categories without a real link yet (juices, spices, fruit/oak/hops adjuncts)
// are intentionally left EMPTY rather than pointed at a placeholder, so no
// broken links ship. Add entries when you have the URLs.
//
// rel="sponsored nofollow" is added by the renderer per Google's affiliate
// guidance; a visible disclosure lives on /gear and in the footer.

export interface Affiliate {
  url: string;
  label: string;            // short product name for the link text
  blurb?: string;           // one-line description for catalog rows
}
export interface AffiliateLine extends Affiliate { key: string; }

// ---------- keyed by app-canonical values (used inline in the planner) ----------

// VesselKind from lib/mead.ts
export const AFFILIATE_VESSEL: Record<string, Affiliate> = {
  "jar-1gal":    { url: "https://amzn.to/4vBNlWe", label: "1-gallon wide-mouth fermenter",   blurb: "Beginner entry point. Wide mouth makes fruit additions easy." },
  "jug-1gal":    { url: "https://amzn.to/3QutN7h", label: "Traditional 1-gallon glass carboy", blurb: "Classic small-batch fermenter." },
  "jug-5gal":    { url: "https://amzn.to/4e6ezNy", label: "5–6 gallon glass carboy",         blurb: "Scaling up — better oxygen barrier than plastic." },
  "bucket-5gal": { url: "https://amzn.to/4vwiz0P", label: "5-gallon food-grade fermenting bucket", blurb: "Cheap, light primary fermenter with drilled lid." },
};
const VESSEL_EXTRA: AffiliateLine[] = [
  { key: "speidel", url: "https://amzn.to/3S9fHsn", label: "Speidel 7.9-gallon plastic fermenter", blurb: "Premium — popular with serious meadmakers." },
];

// HoneyType from lib/mead.ts (only those with a real link)
export const AFFILIATE_HONEY: Record<string, Affiliate> = {
  clover:         { url: "https://amzn.to/4uSZCFK", label: "Clover honey",         blurb: "Mild, clean, widely available — great neutral base." },
  wildflower:     { url: "https://amzn.to/4xir80S", label: "Wildflower honey",     blurb: "Balanced floral complexity — classic traditional mead." },
  orange_blossom: { url: "https://amzn.to/3RMXu3U", label: "Orange-blossom honey", blurb: "Bright citrus-floral — carries a mead on its own." },
  buckwheat:      { url: "https://amzn.to/43mJArG", label: "Buckwheat honey",      blurb: "Dark, bold, malty/molasses — blend ~1:3 with lighter honey." },
};
const HONEY_EXTRA: AffiliateLine[] = [
  { key: "tupelo",   url: "https://amzn.to/4ohPR1w", label: "Tupelo honey",   blurb: "Sweet, fruity/floral — prized Southern varietal." },
  { key: "alfalfa",  url: "https://amzn.to/4v8BsXZ", label: "Alfalfa honey",  blurb: "Mild — good for melomels and spiced meads." },
  { key: "bulk-5",   url: "https://amzn.to/3Q4sxYs", label: "Bulk honey — 5 lb",  blurb: "Volume pricing for repeat brewers." },
  { key: "bulk-12",  url: "https://amzn.to/43mJBvK", label: "Bulk honey — 12 lb" },
  { key: "bulk-60",  url: "https://amzn.to/4uobEGa", label: "Bulk honey — 60 lb pail" },
];

// JuiceKind — no affiliate links yet (kept empty so the form renders nothing).
export const AFFILIATE_JUICE: Record<string, Affiliate> = {};

// YeastStrain (planner key) — only those with a real link
export const AFFILIATE_YEAST: Record<string, Affiliate> = {
  "71B-1122": { url: "https://amzn.to/4g8VMUp", label: "Lalvin 71B-1122", blurb: "Most forgiving; softens acidity — best beginner/fruit-mead pick." },
  "D-47":     { url: "https://amzn.to/43jxjnV", label: "Lalvin ICV-D47",  blurb: "Medium-sweet meads. Keep below ~70°F." },
  "EC-1118":  { url: "https://amzn.to/3QvVg8y", label: "Lalvin EC-1118",  blurb: "Bulletproof. Dry / high-alcohol / sparkling." },
  "K1-V1116": { url: "https://amzn.to/4vAIEvI", label: "Lalvin K1-V1116", blurb: "Very popular all-purpose mead/wine strain." },
};
const YEAST_EXTRA: AffiliateLine[] = [
  { key: "premier-cuvee", url: "https://amzn.to/4vt9RjS", label: "Red Star Premier Cuvée", blurb: "High-alcohol, consistent." },
  { key: "qa23",          url: "https://amzn.to/43WFtTm", label: "Lalvin QA23",            blurb: "Crisp, fruit-forward — specialty character." },
  { key: "rc212",         url: "https://amzn.to/4vCVGZL", label: "Lalvin RC212",           blurb: "Red-fruit / tannic structure for darker meads." },
  { key: "sampler",       url: "https://amzn.to/3Q5aUaW", label: "Lalvin yeast sampler pack", blurb: "Try several strains in one order." },
];

// Yeast guide page slugs (lib/knowledge/yeasts.ts)
export const AFFILIATE_YEAST_BY_SLUG: Record<string, Affiliate> = {
  "lalvin-71b":      AFFILIATE_YEAST["71B-1122"],
  "lalvin-icv-d47":  AFFILIATE_YEAST["D-47"],
  "lalvin-ec-1118":  AFFILIATE_YEAST["EC-1118"],
  "lalvin-k1-v1116": AFFILIATE_YEAST["K1-V1116"],
};

// COMMON_SPICES — no affiliate links yet (kept empty so the form renders nothing).
export const AFFILIATE_SPICE: Record<string, Affiliate> = {};

// ---------- standalone categories ----------

// order matters: [0]=Fermaid-O and [2]=Go-Ferm are referenced inline.
export const AFFILIATE_NUTRIENTS: AffiliateLine[] = [
  { key: "fermaid-o", url: "https://amzn.to/4xg9Hyd", label: "Fermaid-O (organic)",          blurb: "The modern standard for staggered / TOSNA feeding." },
  { key: "fermaid-k", url: "https://amzn.to/4xm8Ig0", label: "Fermaid-K",                    blurb: "Broader-spectrum blend with DAP." },
  { key: "go-ferm",   url: "https://amzn.to/4fyZh6y", label: "Go-Ferm rehydration nutrient", blurb: "Pitch healthier yeast — used before fermentation, not during." },
  { key: "dap",       url: "https://amzn.to/4ofpAAN", label: "DAP (diammonium phosphate)",   blurb: "Early-ferment nitrogen booster." },
  { key: "energizer", url: "https://amzn.to/4e8It3M", label: "Yeast nutrient / energizer",   blurb: "Budget option." },
  { key: "k2co3",     url: "https://amzn.to/3Q9cDMc", label: "Potassium carbonate",          blurb: "pH buffering — e.g. for the BOMM method." },
];

// order matters: [0]=triple-scale hydrometer and [1]=test jar are referenced inline.
export const AFFILIATE_HYDROMETER: AffiliateLine[] = [
  { key: "triple-hydro",  url: "https://amzn.to/3Qcz1ED", label: "Triple-scale hydrometer", blurb: "SG · Brix · potential alcohol. Essential for tracking fermentation and real ABV." },
  { key: "test-jar",      url: "https://amzn.to/4ojqGLY", label: "Hydrometer test jar",     blurb: "Graduated cylinder for sample readings." },
  { key: "refractometer", url: "https://amzn.to/4vh9xp3", label: "Brix refractometer",      blurb: "Tiny-sample convenience reading. Popular upgrade." },
  { key: "thermometer",   url: "https://amzn.to/4dXEGYd", label: "Thermometer (probe / stick-on)", blurb: "45–120°F range." },
  { key: "ph-meter",      url: "https://amzn.to/4vAbRHh", label: "pH meter / test strips",  blurb: "Must-pH management." },
  { key: "scale-001",     url: "https://amzn.to/4um0gdW", label: "0.01 g digital scale",    blurb: "For accurate nutrient dosing." },
];

export const AFFILIATE_AIRLOCK: AffiliateLine[] = [
  { key: "airlock-3pc",    url: "https://amzn.to/49PXkyR", label: "3-piece airlock" },
  { key: "airlock-s",      url: "https://amzn.to/4vtRGe6", label: "S-shaped (bubbler) airlock" },
  { key: "bung-universal", url: "https://amzn.to/3RVaFzM", label: "Drilled rubber stoppers / universal bungs", blurb: "Size to match your vessel neck." },
  { key: "stopper-solid",  url: "https://amzn.to/4vFaQxN", label: "Silicone solid stoppers", blurb: "For aging without an airlock." },
];

export const AFFILIATE_TRANSFER: AffiliateLine[] = [
  { key: "auto-siphon", url: "https://amzn.to/4xiMjQB", label: "Auto-siphon kit",            blurb: "Racking cane + tubing — the core transfer tool." },
  { key: "funnel",      url: "https://amzn.to/4eaxarT", label: "Wide funnel with strainer" },
  { key: "stir-spoon",  url: "https://amzn.to/43rQImC", label: "Long-handled stirring spoon" },
  { key: "degas-whip",  url: "https://amzn.to/4g8xfij", label: "Drill-mounted degassing whip", blurb: "Stir out CO₂." },
];

export const AFFILIATE_BOTTLING: AffiliateLine[] = [
  { key: "bottles",        url: "https://amzn.to/3QpNA7T", label: "Wine bottles / swing-top bottles", blurb: "Punted 750 ml for still, swing-top for sparkling." },
  { key: "corks-corker",   url: "https://amzn.to/4vyWSgy", label: "Corks + corker",  blurb: "#8/#9 natural or synthetic, with a double-lever corker." },
  { key: "caps-capper",    url: "https://amzn.to/4ozWU5X", label: "Bottle caps + capper", blurb: "For beer bottles — session / sparkling mead." },
  { key: "shrink-capsules",url: "https://amzn.to/4ozX90R", label: "Shrink capsules", blurb: "Finishing touch over the cork." },
  { key: "bottle-brush",   url: "https://amzn.to/4umL8wG", label: "Bottle / carboy brush" },
];

export const AFFILIATE_SANITIZER: AffiliateLine[] = [
  { key: "star-san", url: "https://amzn.to/4usihHs", label: "Star San (no-rinse acid)", blurb: "The standard. A few drops per gallon, foam = working." },
  { key: "one-step", url: "https://amzn.to/3SctKgO", label: "One Step (oxygen-based)",  blurb: "\"More natural\" alternative." },
  { key: "campden",  url: "https://amzn.to/49R8Z0m", label: "Campden tablets",          blurb: "Sanitise must / stabilise. 1 tablet per gallon." },
];

export const AFFILIATE_STABILIZER: AffiliateLine[] = [
  { key: "sorbate",     url: "https://amzn.to/3SsbaRU", label: "Potassium sorbate", blurb: "Prevents refermentation — pair with sulfite before back-sweetening." },
  { key: "pectic",      url: "https://amzn.to/4vBSayW", label: "Pectic enzyme",     blurb: "Clears haze from fruit meads." },
  { key: "fining",      url: "https://amzn.to/4ulXiWA", label: "Fining agents (bentonite / Sparkolloid / kieselsol-chitosan)", blurb: "For brilliant clarity." },
  { key: "acid-blend",  url: "https://amzn.to/4umL5kw", label: "Acid blend",        blurb: "Tartaric / malic / citric — balance acidity." },
  { key: "wine-tannin", url: "https://amzn.to/4vWENJV", label: "Wine tannin (FT Rouge)", blurb: "Structure and mouthfeel." },
];

export const AFFILIATE_BOOKS: AffiliateLine[] = [
  { key: "compleat-meadmaker", url: "https://amzn.to/3QqaLPo", label: "The Compleat Meadmaker — Ken Schramm", blurb: "The canonical text." },
  { key: "viking-mead",        url: "https://amzn.to/4odmygi", label: "Make Mead Like a Viking — Jereme Zimmerman" },
  { key: "big-book-recipes",   url: "https://amzn.to/49MYLOz", label: "The Big Book of Mead Recipes — Rob Ratliff" },
];

export const AFFILIATE_KITS: AffiliateLine[] = [
  { key: "kit-1gal-starter", url: "https://amzn.to/4fuoFKw", label: "1-gallon all-in-one starter kit", blurb: "Perfect first batch — vessel, airlock, hydrometer, basic ingredients." },
  { key: "kit-5gal-equip",   url: "https://amzn.to/4xcv2Zv", label: "5-gallon equipment kit" },
  { key: "kit-recipe",       url: "https://amzn.to/4xm2wok", label: "Recipe / ingredient kit", blurb: "Traditional, melomel, or cyser — measured ingredients for a batch." },
];

// Convenience aggregator for the catalog page.
const keyed = (rec: Record<string, Affiliate>): AffiliateLine[] =>
  Object.entries(rec).map(([key, v]) => ({ key, ...v }));

export const AFFILIATE_CATEGORIES: Array<{
  id: string;
  title: string;
  intro: string;
  items: AffiliateLine[];
}> = [
  { id: "kits",      title: "Starter kits",              intro: "Cleanest way in if you don't have anything yet.",                items: AFFILIATE_KITS },
  { id: "vessels",   title: "Fermentation vessels",      intro: "Pick the size you'll actually brew.",                            items: [...keyed(AFFILIATE_VESSEL), ...VESSEL_EXTRA] },
  { id: "airlocks",  title: "Airlocks & stoppers",       intro: "One airlock per vessel; size the bung to your neck.",            items: AFFILIATE_AIRLOCK },
  { id: "measure",   title: "Measurement & monitoring",  intro: "A hydrometer is the highest-leverage buy after a vessel.",       items: AFFILIATE_HYDROMETER },
  { id: "transfer",  title: "Transfer & bottling tools", intro: "An auto-siphon kit covers most of it.",                          items: AFFILIATE_TRANSFER },
  { id: "bottling",  title: "Bottles & closures",        intro: "Wine bottles + corks for still mead, swing-tops for sparkling.", items: AFFILIATE_BOTTLING },
  { id: "sanitize",  title: "Cleaning & sanitising",     intro: "Star San on brew day; Campden to treat the must.",               items: AFFILIATE_SANITIZER },
  { id: "yeast",     title: "Yeast",                     intro: "Match the strain to the style and your fermentation temps.",     items: [...keyed(AFFILIATE_YEAST), ...YEAST_EXTRA] },
  { id: "nutrients", title: "Yeast nutrients",           intro: "Fermaid-O + Go-Ferm covers most TOSNA recipes.",                 items: AFFILIATE_NUTRIENTS },
  { id: "stabilize", title: "Stabilisers & adjustments", intro: "Sorbate + sulfite is the standard back-sweetening pair.",        items: AFFILIATE_STABILIZER },
  { id: "honey",     title: "Honey",                     intro: "~2.5 lb per gallon for a standard mead.",                        items: [...keyed(AFFILIATE_HONEY), ...HONEY_EXTRA] },
  { id: "books",     title: "Books & reference",         intro: "If you want to go deeper than the planner.",                     items: AFFILIATE_BOOKS },
];
