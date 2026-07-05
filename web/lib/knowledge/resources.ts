// Curated reference list for the /resources page.
//
// Curation rule: every entry here is a source the site's own guidance is built
// on — they're the citations in docs/research/mead-fermentation.md, which the
// brief's "Source Quality Notes" restricts to peer-reviewed studies,
// manufacturer technical sheets, winemaking-institute guidance, and
// association/community process material. No SEO-farm blogs, no affiliate
// destinations. Update this list when the research brief's sources change.

export interface Resource {
  title: string;
  publisher: string;
  tag: string;   // credibility signal shown as a chip
  url: string;
  note: string;  // what it's good for
  pdf?: boolean;
}

export interface ResourceGroup {
  id: string;
  title: string;
  intro: string;
  items: Resource[];
}

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "guides",
    title: "Guides & process",
    intro: "Practical, well-established how-to from brewing associations and the mead community.",
    items: [
      {
        title: "The Sweet Life: Making Mead the Easy Way",
        publisher: "American Homebrewers Association",
        tag: "Association",
        url: "https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/",
        note: "A broad, beginner-friendly foundation: sweetness bands, honey basics, finishing.",
      },
      {
        title: "Improve Your Mead with Staggered Nutrient Additions",
        publisher: "American Homebrewers Association",
        tag: "Association",
        url: "https://www.homebrewersassociation.org/beyond-beer/improve-mead-staggered-nutrient-additions/",
        note: "The reasoning behind staggered (TOSNA-style) nutrient dosing.",
      },
      {
        title: "Making Mead: Heat or No Heat",
        publisher: "American Homebrewers Association",
        tag: "Association",
        url: "https://www.homebrewersassociation.org/beyond-beer/making-mead-heat-or-no-heat/",
        note: "Whether to heat the must — flavour, sanitation, and aroma trade-offs.",
      },
      {
        title: "Backsweetening",
        publisher: "WineMaker Magazine",
        tag: "Magazine",
        url: "https://winemakermag.com/technique/backsweetening",
        note: "Technique and safety for sweetening a finished batch.",
      },
      {
        title: "Oxygen's Role in Fermentation",
        publisher: "WineMaker Magazine",
        tag: "Magazine",
        url: "https://winemakermag.com/wine-wizard/oxygens-role-in-fermentation",
        note: "Why early oxygen helps yeast health and when to stop.",
      },
      {
        title: "Nutrient Schedules",
        publisher: "MeadTools Wiki (Modern Meadmaking)",
        tag: "Community wiki",
        url: "https://wiki.meadtools.com/en/process/nutrient_schedules",
        note: "Reference for TOSNA and other staggered schedules.",
      },
      {
        title: "Stabilization",
        publisher: "MeadTools Wiki (Modern Meadmaking)",
        tag: "Community wiki",
        url: "https://wiki.meadtools.com/en/process/stabilization",
        note: "How and when to stabilize before backsweetening or bottling.",
      },
      {
        title: "Nutrient Additions",
        publisher: "Mead Made Right",
        tag: "Community",
        url: "https://www.meadmaderight.com/nutrient-additions",
        note: "A practical walk-through of nutrient timing and amounts.",
      },
      {
        title: "Advanced Topics in Mead Making (aging)",
        publisher: "BJCP Mead Judge Program",
        tag: "Association",
        url: "https://www.bjcp.org/exam-certification/mead-judge-program/studying-for-the-mead-exams/mead-exam-study-guide/10-advanced-topics-in-mead-making/",
        note: "Judging-side perspective on aging, faults, and evaluation.",
      },
      {
        title: "Refractometer Estimates of Final Gravity",
        publisher: "Sean Terrill",
        tag: "Practitioner",
        url: "https://seanterrill.com/2010/06/11/refractometer-estimates-of-final-gravity/",
        note: "Why a refractometer misreads FG after fermentation, and the correction.",
      },
    ],
  },
  {
    id: "science",
    title: "Fermentation science",
    intro: "Peer-reviewed studies on mead and wine fermentation — the primary literature behind the estimates here.",
    items: [
      {
        title: "Developments in the Fermentation Process and Quality Improvement Strategies for Mead Production",
        publisher: "Molecules / PMC",
        tag: "Peer-reviewed",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/",
        note: "A comprehensive mead review — the backbone reference for the whole brief.",
      },
      {
        title: "Selection of Low Nitrogen Demand Yeast Strains and Their Impact on Mead",
        publisher: "PMC",
        tag: "Peer-reviewed",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7316929/",
        note: "How nitrogen demand shapes fermentation and aroma in mead.",
      },
      {
        title: "Mead Production: Effect of Nitrogen Supplementation on Growth, Fermentation and Aroma",
        publisher: "Journal of the Institute of Brewing (Pereira et al.)",
        tag: "Peer-reviewed",
        url: "https://onlinelibrary.wiley.com/doi/full/10.1002/jib.184",
        note: "Controlled look at nitrogen's effect on yeast and flavour.",
      },
      {
        title: "Improvement of Mead Fermentation by Honey-Must Supplementation",
        publisher: "Journal of the Institute of Brewing (Pereira et al.)",
        tag: "Peer-reviewed",
        url: "https://onlinelibrary.wiley.com/doi/full/10.1002/jib.239",
        note: "Supplementation strategies that improve a honey must.",
      },
      {
        title: "H₂S Production and Assimilable Nitrogen in Wine Yeast",
        publisher: "Fermentation (MDPI)",
        tag: "Peer-reviewed",
        url: "https://www.mdpi.com/2311-5637/7/4/213",
        note: "Nitrogen status and the sulfur off-aromas it can drive.",
      },
      {
        title: "Sterols in Wine Fermentation",
        publisher: "Fermentation (MDPI)",
        tag: "Peer-reviewed",
        url: "https://www.mdpi.com/2311-5637/8/2/90",
        note: "The role of oxygen and sterols in yeast stress tolerance.",
      },
      {
        title: "Standard Methods for Apis mellifera Honey Research",
        publisher: "Journal of Apicultural Research",
        tag: "Peer-reviewed",
        url: "https://www.tandfonline.com/doi/full/10.1080/00218839.2020.1738135",
        note: "Reference methods and composition data for honey itself.",
      },
    ],
  },
  {
    id: "data",
    title: "Yeast & nutrient data",
    intro: "Manufacturer technical sheets — the authoritative source for a strain's tolerance and a nutrient's YAN.",
    items: [
      {
        title: "Lalvin wine-yeast strain sheets (71B, D47, EC-1118, K1-V1116)",
        publisher: "Lallemand",
        tag: "Manufacturer",
        url: "https://www.lallemandwine.com/en/united-states/products/wine-yeasts/lalvin-71b/",
        note: "Official spec sheets — each strain in the yeast guide links to its own.",
      },
      {
        title: "Fermaid O — product page & YAN data",
        publisher: "Lallemand",
        tag: "Manufacturer",
        url: "https://www.lallemandwine.com/en/macedonia/products/nutrients-and-protectors/fermaid-o/",
        note: "Organic nutrient used by the TOSNA schedule.",
      },
      {
        title: "Fermaid K",
        publisher: "Scott Laboratories",
        tag: "Manufacturer",
        url: "https://scottlab.com/fermentation-cellar/nutrients/fermaid-k-fermk",
        note: "Blended organic/inorganic nutrient — composition and dosing.",
      },
      {
        title: "Go-Ferm Protect Evolution",
        publisher: "Scott Laboratories",
        tag: "Manufacturer",
        url: "https://scottlab.com/go-ferm-protect-evolution-yeast-rehydration-nutrie-15251",
        note: "Rehydration nutrient — used before pitching, not during ferment.",
      },
    ],
  },
  {
    id: "reference",
    title: "Technical references",
    intro: "Winemaking-institute and extension guidance on the chemistry.",
    items: [
      {
        title: "Yeast Assimilable Nitrogen (YAN)",
        publisher: "Australian Wine Research Institute",
        tag: "Research institute",
        url: "https://www.awri.com.au/industry_support/winemaking_resources/wine_fermentation/yan/",
        note: "The definitive primer on YAN and how it's measured.",
      },
      {
        title: "Using Potassium Sorbate to Inhibit Yeast Growth in Bottled Wines",
        publisher: "Iowa State University Extension",
        tag: "University extension",
        url: "https://www.extension.iastate.edu/wine/publications/using-potassium-sorbate-to-inhibit-yeast-growth-in-bottled-wines/",
        note: "What sorbate does — and, crucially, what it does not do.",
      },
      {
        title: "Apiculture Recommendations (honey composition)",
        publisher: "USDA Agricultural Marketing Service",
        tag: "Government",
        url: "https://www.ams.usda.gov/sites/default/files/media/Rec%20Apiculture%20Standards.pdf",
        note: "Honey composition statistics behind the sugar/PPG assumptions.",
        pdf: true,
      },
    ],
  },
  {
    id: "legal",
    title: "Labeling & legal",
    intro: "US regulatory references. General information, not legal advice — a home calculator can't certify a commercial label ABV.",
    items: [
      {
        title: "Alcohol FAQs — honey wine / mead",
        publisher: "US Alcohol and Tobacco Tax and Trade Bureau (TTB)",
        tag: "Government",
        url: "https://www.ttb.gov/faqs/alcohol?keyword=&tid=20",
        note: "Federal answers on how mead is treated.",
      },
      {
        title: "TTB Ruling 2016-2",
        publisher: "US Alcohol and Tobacco Tax and Trade Bureau (TTB)",
        tag: "Government",
        url: "https://www.ttb.gov/system/files/images/pdfs/rulings/2016-2.pdf",
        note: "Labeling and classification guidance for honey wines.",
        pdf: true,
      },
      {
        title: "27 CFR 24.203 — Honey wine",
        publisher: "Cornell Legal Information Institute",
        tag: "Regulation",
        url: "https://www.law.cornell.edu/cfr/text/27/24.203",
        note: "The federal regulation defining honey wine production.",
      },
    ],
  },
];
