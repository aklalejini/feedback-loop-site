// Affiliate link registry (PLACEHOLDERS).
//
// Every URL here is a placeholder of the form
//   https://AFFILIATE_PLACEHOLDER/<category>/<slug>
// Replace each one with the real affiliate URL when you have it. The
// `BuyLink` component reads from this registry, so swapping the URLs
// here updates every surface that recommends that product.
//
// rel="sponsored nofollow" is added by the renderer per Google's
// affiliate-link guidance; a short visible "Some links are affiliate
// links" disclosure lives on /gear and in the footer.

const P = "https://AFFILIATE_PLACEHOLDER";

export interface Affiliate {
  url: string;
  label: string;            // short product name for the link text
  blurb?: string;           // one-line description for catalog rows
}

// ---------- by app-canonical key ----------

// VesselKind from lib/mead.ts
export const AFFILIATE_VESSEL: Record<string, Affiliate> = {
  "jar-1gal":     { url: `${P}/vessels/1gal-glass-jar`,           label: "1-gallon wide-mouth glass jar",        blurb: "Beginner entry point. Wide mouth makes fruit additions easy." },
  "jug-1gal":     { url: `${P}/vessels/1gal-glass-jug`,           label: "1-gallon glass jug",                   blurb: "Classic small-batch fermenter with airlock." },
  "jug-5gal":     { url: `${P}/vessels/5gal-glass-carboy`,        label: "5–6 gallon glass carboy",              blurb: "Scaling up — better oxygen barrier than plastic." },
  "bucket-5gal":  { url: `${P}/vessels/5gal-plastic-bucket`,      label: "5-gallon food-grade fermentation bucket", blurb: "Cheap, light primary fermenter with drilled lid." },
};

// HoneyType from lib/mead.ts
export const AFFILIATE_HONEY: Record<string, Affiliate> = {
  clover:           { url: `${P}/honey/clover`,           label: "Clover honey (3 lb)",           blurb: "Mild, clean, widely available — great neutral base." },
  wildflower:       { url: `${P}/honey/wildflower`,       label: "Wildflower honey (3 lb)",       blurb: "Balanced floral complexity — classic traditional mead." },
  orange_blossom:   { url: `${P}/honey/orange-blossom`,   label: "Orange-blossom honey (3 lb)",   blurb: "Bright citrus-floral — carries a mead on its own." },
  buckwheat:        { url: `${P}/honey/buckwheat`,        label: "Buckwheat honey (1 lb)",        blurb: "Dark, bold, malty/molasses — blend ~1:3 with lighter honey." },
  raw_mixed:        { url: `${P}/honey/raw-mixed-3lb`,    label: "Raw mixed-floral honey (3 lb)", blurb: "Unfiltered raw honey — varietal character varies by source." },
  maple:            { url: `${P}/syrup/grade-a-amber-maple`, label: "Grade-A amber maple syrup", blurb: "For acerglyn meads." },
};

// JuiceKind from lib/mead.ts
export const AFFILIATE_JUICE: Record<string, Affiliate> = {
  apple:        { url: `${P}/juice/100pct-apple-cider`,    label: "100% apple cider / juice",            blurb: "For cyser. Look for additive-free, no sorbate." },
  grape:        { url: `${P}/juice/welch-100pct-grape`,    label: "100% Concord grape juice",            blurb: "Classic pyment base." },
  tart_cherry:  { url: `${P}/juice/100pct-tart-cherry`,    label: "100% tart cherry juice",              blurb: "Punchy tart fruit for melomel." },
  pomegranate:  { url: `${P}/juice/100pct-pomegranate`,    label: "100% pomegranate juice",              blurb: "Deep colour + tannic structure." },
  orange:       { url: `${P}/juice/100pct-orange`,         label: "100% orange juice",                   blurb: "Bright citrus melomel." },
  blueberry:    { url: `${P}/juice/100pct-blueberry`,      label: "100% blueberry juice",                blurb: "Deep blue pigment, soft fruit." },
  blackcurrant: { url: `${P}/juice/100pct-blackcurrant`,   label: "100% blackcurrant juice",             blurb: "Intense colour and tannin." },
};

// YeastStrain (planner key)
export const AFFILIATE_YEAST: Record<string, Affiliate> = {
  "71B-1122":    { url: `${P}/yeast/lalvin-71b-1122`,    label: "Lalvin 71B-1122", blurb: "Most forgiving; softens acidity — best beginner/fruit-mead pick." },
  "D-47":        { url: `${P}/yeast/lalvin-icv-d47`,     label: "Lalvin ICV-D47",  blurb: "Medium-sweet meads. Keep below ~70°F." },
  "EC-1118":     { url: `${P}/yeast/lalvin-ec-1118`,     label: "Lalvin EC-1118",  blurb: "Bulletproof. Dry / high-alcohol / sparkling." },
  "K1-V1116":    { url: `${P}/yeast/lalvin-k1-v1116`,    label: "Lalvin K1-V1116", blurb: "Very popular all-purpose mead/wine strain." },
  "Wyeast-4632": { url: `${P}/yeast/wyeast-4632-dry-mead`, label: "Wyeast 4632 Dry Mead", blurb: "Dry mead profile, residual character." },
  "Bread":       { url: `${P}/yeast/red-star-active-dry`, label: "Bread yeast (Fleischmann's / Red Star)", blurb: "Cheap, works in a pinch. Lower alcohol tolerance." },
};

// Yeast guide pages use slugs from lib/knowledge/yeasts.ts
export const AFFILIATE_YEAST_BY_SLUG: Record<string, Affiliate> = {
  "lalvin-71b":      AFFILIATE_YEAST["71B-1122"],
  "lalvin-icv-d47":  AFFILIATE_YEAST["D-47"],
  "lalvin-ec-1118":  AFFILIATE_YEAST["EC-1118"],
  "lalvin-k1-v1116": AFFILIATE_YEAST["K1-V1116"],
};

// COMMON_SPICES from components/MeadForm.tsx
export const AFFILIATE_SPICE: Record<string, Affiliate> = {
  "cinnamon":     { url: `${P}/spice/ceylon-cinnamon-sticks`, label: "Ceylon cinnamon sticks" },
  "vanilla bean": { url: `${P}/spice/madagascar-vanilla-beans`, label: "Madagascar vanilla beans" },
  "orange peel":  { url: `${P}/spice/dried-orange-peel`,     label: "Dried sweet orange peel" },
  "clove":        { url: `${P}/spice/whole-cloves`,          label: "Whole cloves" },
  "ginger":       { url: `${P}/spice/dried-ginger-root`,     label: "Dried ginger root" },
  "elderberry":   { url: `${P}/spice/dried-elderberry`,      label: "Dried elderberries" },
  "cayenne":      { url: `${P}/spice/cayenne-pepper`,        label: "Cayenne pepper" },
  "habanero":     { url: `${P}/spice/dried-habanero`,        label: "Dried habanero" },
};

// ---------- standalone categories (not keyed by an app value) ----------

export interface AffiliateLine extends Affiliate { key: string; }

export const AFFILIATE_NUTRIENTS: AffiliateLine[] = [
  { key: "fermaid-o",      url: `${P}/nutrients/fermaid-o`,             label: "Fermaid-O (organic)",          blurb: "The modern standard for staggered / TOSNA feeding." },
  { key: "fermaid-k",      url: `${P}/nutrients/fermaid-k`,             label: "Fermaid-K",                    blurb: "Broader-spectrum blend with DAP." },
  { key: "go-ferm",        url: `${P}/nutrients/go-ferm`,               label: "Go-Ferm rehydration nutrient", blurb: "Pitch healthier yeast — used before fermentation, not during." },
  { key: "dap",            url: `${P}/nutrients/dap`,                   label: "DAP (diammonium phosphate)",   blurb: "Early-ferment nitrogen booster." },
  { key: "yeast-energizer",url: `${P}/nutrients/generic-yeast-nutrient`,label: "Generic yeast nutrient/energizer", blurb: "Budget option." },
  { key: "k2co3",          url: `${P}/nutrients/potassium-carbonate`,   label: "Potassium carbonate",          blurb: "pH buffering — e.g. for BOMM method." },
];

export const AFFILIATE_HYDROMETER: AffiliateLine[] = [
  { key: "triple-hydro",   url: `${P}/measure/triple-scale-hydrometer`, label: "Triple-scale hydrometer",   blurb: "SG · Brix · potential alcohol. Essential for tracking fermentation and calculating real ABV." },
  { key: "test-jar",       url: `${P}/measure/hydrometer-test-jar`,     label: "Hydrometer test jar",       blurb: "250 ml graduated cylinder for sample readings." },
  { key: "refractometer",  url: `${P}/measure/refractometer-brix`,      label: "Brix refractometer",        blurb: "Tiny-sample convenience reading. Popular upgrade." },
  { key: "thermometer",    url: `${P}/measure/digital-probe-thermometer`, label: "Digital probe thermometer", blurb: "45–120°F range. Stick-on LCD is the simpler alternative." },
  { key: "ph-meter",       url: `${P}/measure/digital-ph-meter`,        label: "Digital pH meter",          blurb: "Must-pH management. Strips work as a budget alternative." },
  { key: "scale-001",      url: `${P}/measure/jewelers-scale-001g`,     label: "0.01g jeweller's scale",    blurb: "For accurate nutrient dosing." },
];

export const AFFILIATE_AIRLOCK: AffiliateLine[] = [
  { key: "airlock-3pc",    url: `${P}/airlock/3-piece-airlock`,     label: "3-piece airlock" },
  { key: "airlock-s",      url: `${P}/airlock/s-shaped-bubbler`,    label: "S-shaped (bubbler) airlock" },
  { key: "bung-universal", url: `${P}/airlock/universal-rubber-bung`, label: "Universal drilled rubber bung" },
  { key: "stopper-solid",  url: `${P}/airlock/silicone-solid-stopper`, label: "Silicone solid stoppers (aging)" },
];

export const AFFILIATE_TRANSFER: AffiliateLine[] = [
  { key: "auto-siphon",    url: `${P}/transfer/auto-siphon-3-8`,   label: "Auto-siphon with clip (3/8\")" },
  { key: "tubing",         url: `${P}/transfer/food-grade-tubing`, label: "Food-grade siphon tubing" },
  { key: "bottling-wand",  url: `${P}/transfer/spring-bottling-wand`, label: "Spring-loaded bottling wand" },
  { key: "racking-cane",   url: `${P}/transfer/racking-cane`,      label: "Racking cane" },
  { key: "funnel",         url: `${P}/transfer/wide-funnel-strainer`, label: "Wide funnel with strainer" },
  { key: "stir-spoon",     url: `${P}/transfer/long-stir-spoon`,   label: "Long-handled stirring spoon" },
  { key: "degas-whip",     url: `${P}/transfer/drill-degas-whip`,  label: "Drill-mounted degassing whip" },
];

export const AFFILIATE_BOTTLING: AffiliateLine[] = [
  { key: "wine-bottles",   url: `${P}/bottling/750ml-wine-bottles`,  label: "750 ml punted wine bottles" },
  { key: "swing-tops",     url: `${P}/bottling/swing-top-bottles`,   label: "Swing-top (Grolsch-style) bottles" },
  { key: "corks",          url: `${P}/bottling/synthetic-corks-9`,   label: "#9 corks (natural or synthetic)" },
  { key: "corker",         url: `${P}/bottling/double-lever-corker`, label: "Double-lever corker" },
  { key: "beer-caps",      url: `${P}/bottling/oxygen-absorbing-caps`, label: "Beer-bottle caps" },
  { key: "capper",         url: `${P}/bottling/bench-capper`,        label: "Bench capper" },
  { key: "shrink-capsules",url: `${P}/bottling/shrink-capsules`,     label: "Shrink capsules" },
  { key: "bottle-brush",   url: `${P}/bottling/curved-bottle-brush`, label: "Bottle / carboy brush" },
];

export const AFFILIATE_SANITIZER: AffiliateLine[] = [
  { key: "star-san",       url: `${P}/sanitize/star-san`,            label: "Star San (no-rinse acid)",  blurb: "The standard. A few drops per gallon, foam = working." },
  { key: "one-step",       url: `${P}/sanitize/one-step`,            label: "One Step (oxygen-based)",   blurb: "\"More natural\" alternative." },
  { key: "pbw",            url: `${P}/sanitize/pbw`,                 label: "PBW heavy cleaner",         blurb: "For deep-cleaning vessels." },
  { key: "campden",        url: `${P}/sanitize/campden-tablets`,     label: "Campden tablets",           blurb: "Sanitise must / stabilise. 1 tablet per gallon." },
];

export const AFFILIATE_STABILIZER: AffiliateLine[] = [
  { key: "potassium-sorbate", url: `${P}/stabilize/potassium-sorbate`, label: "Potassium sorbate",        blurb: "Prevents refermentation — pair with sulfite before back-sweetening." },
  { key: "k-meta",            url: `${P}/stabilize/potassium-metabisulfite`, label: "Potassium metabisulfite", blurb: "Bulk-powder antioxidant/stabiliser. Same active as Campden." },
  { key: "pectic-enzyme",     url: `${P}/stabilize/pectic-enzyme`,    label: "Pectic enzyme",             blurb: "Clears haze from fruit meads." },
  { key: "bentonite",         url: `${P}/stabilize/bentonite`,        label: "Bentonite (fining)",        blurb: "Clay-based clarifier." },
  { key: "sparkolloid",       url: `${P}/stabilize/sparkolloid`,      label: "Sparkolloid (fining)",      blurb: "Quick polish for stubborn haze." },
  { key: "acid-blend",        url: `${P}/stabilize/acid-blend`,       label: "Acid blend",                blurb: "Tartaric / malic / citric — balance acidity." },
  { key: "wine-tannin",       url: `${P}/stabilize/wine-tannin`,      label: "Wine tannin (FT Rouge)",    blurb: "Structure and mouthfeel." },
];

export const AFFILIATE_ADJUNCTS: AffiliateLine[] = [
  { key: "fruit-puree",    url: `${P}/adjunct/vintners-harvest-puree`, label: "Vintner's Harvest fruit purée", blurb: "Aseptic fruit purées for melomel." },
  { key: "oak-cubes",      url: `${P}/adjunct/medium-toast-oak-cubes`, label: "Oak cubes / chips / spirals",    blurb: "Aged-oak character — French or American, light/medium/dark toast." },
  { key: "hops-pellets",   url: `${P}/adjunct/hops-pellets`,           label: "Hop pellets",                    blurb: "For hopped/short meads." },
  { key: "muslin-bags",    url: `${P}/adjunct/muslin-bags`,            label: "Muslin / nylon straining bags",  blurb: "Hold fruit, spices, dry-hops in the fermenter." },
  { key: "bulk-honey",     url: `${P}/honey/bulk-honey-pail`,          label: "Bulk honey (5/12/60 lb)",        blurb: "Volume pricing for repeat brewers." },
];

export const AFFILIATE_BOOKS: AffiliateLine[] = [
  { key: "compleat-meadmaker", url: `${P}/books/compleat-meadmaker`,    label: "The Compleat Meadmaker — Ken Schramm", blurb: "The canonical text." },
  { key: "viking-mead",        url: `${P}/books/make-mead-like-a-viking`, label: "Make Mead Like a Viking — Jereme Zimmerman" },
  { key: "big-book-recipes",   url: `${P}/books/big-book-of-mead-recipes`, label: "The Big Book of Mead Recipes — Rob Ratliff" },
  { key: "brew-journal",       url: `${P}/books/mead-making-journal`,   label: "Mead-making journal" },
];

export const AFFILIATE_KITS: AffiliateLine[] = [
  { key: "kit-1gal-starter", url: `${P}/kits/1gal-mead-starter`,        label: "1-gallon all-in-one starter kit",   blurb: "Perfect first batch — vessel, airlock, hydrometer, basic ingredients." },
  { key: "kit-5gal-equip",   url: `${P}/kits/5gal-equipment-kit`,       label: "5-gallon equipment kit" },
  { key: "kit-recipe-trad",  url: `${P}/kits/recipe-traditional`,       label: "Traditional mead recipe kit" },
  { key: "kit-recipe-mel",   url: `${P}/kits/recipe-melomel`,           label: "Melomel recipe kit" },
  { key: "kit-recipe-cyser", url: `${P}/kits/recipe-cyser`,             label: "Cyser recipe kit" },
  { key: "kit-gift",         url: `${P}/kits/gift-deluxe`,              label: "Gift / deluxe kit",                 blurb: "Strong Q4 / holiday option." },
];

// Convenience aggregator for the catalog page.
export const AFFILIATE_CATEGORIES: Array<{
  id: string;
  title: string;
  intro: string;
  items: AffiliateLine[];
}> = [
  { id: "kits",        title: "Starter kits",            intro: "Cleanest way in if you don't have anything yet.",                items: AFFILIATE_KITS },
  { id: "vessels",     title: "Fermentation vessels",    intro: "Pick the size you'll actually brew.",                            items: Object.entries(AFFILIATE_VESSEL).map(([k,v]) => ({ key:k, ...v })) },
  { id: "airlocks",    title: "Airlocks & stoppers",     intro: "One airlock per vessel; size the bung to your neck.",            items: AFFILIATE_AIRLOCK },
  { id: "measure",     title: "Measurement & monitoring",intro: "A hydrometer is the highest-leverage purchase after a vessel.",  items: AFFILIATE_HYDROMETER },
  { id: "transfer",    title: "Transfer & bottling tools", intro: "Auto-siphon + tubing covers most of it.",                      items: AFFILIATE_TRANSFER },
  { id: "bottling",    title: "Bottles & closures",      intro: "Wine bottles + corks for still mead, swing-tops for sparkling.", items: AFFILIATE_BOTTLING },
  { id: "sanitize",    title: "Cleaning & sanitising",   intro: "Star San on brew day, PBW for deep cleans.",                     items: AFFILIATE_SANITIZER },
  { id: "yeast",       title: "Yeast",                   intro: "Match the strain to the style and your fermentation temps.",     items: Object.entries(AFFILIATE_YEAST).map(([k,v]) => ({ key:k, ...v })) },
  { id: "nutrients",   title: "Yeast nutrients",         intro: "Fermaid-O + Go-Ferm covers most TOSNA recipes.",                  items: AFFILIATE_NUTRIENTS },
  { id: "stabilize",   title: "Stabilisers & adjustments", intro: "Sorbate + sulfite is the standard back-sweetening pair.",      items: AFFILIATE_STABILIZER },
  { id: "honey",       title: "Honey",                   intro: "~2.5 lb per gallon for a standard mead.",                        items: Object.entries(AFFILIATE_HONEY).map(([k,v]) => ({ key:k, ...v })) },
  { id: "juice",       title: "Juices for melomel",      intro: "100% juice, no preservatives (sorbate kills yeast).",            items: Object.entries(AFFILIATE_JUICE).map(([k,v]) => ({ key:k, ...v })) },
  { id: "spices",      title: "Spices & metheglin",      intro: "Whole forms keep their oils longer than ground.",                items: Object.entries(AFFILIATE_SPICE).map(([k,v]) => ({ key:k, ...v })) },
  { id: "adjuncts",    title: "Fruit, oak, hops & bags", intro: "Adjuncts to push a base recipe somewhere interesting.",          items: AFFILIATE_ADJUNCTS },
  { id: "books",       title: "Books & reference",       intro: "If you want to go deeper than the planner.",                     items: AFFILIATE_BOOKS },
];
