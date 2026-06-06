# Mead Fermentation Research Brief

Prepared: 2026-06-06  
Purpose: background research for a mead projection website that estimates ABV, gravity, nutrient needs, fermentation timeline, and fermentation risk.

## Executive Summary

Mead is biologically closer to wine than beer: honey supplies abundant fermentable sugar but very little yeast nutrition, buffering, or minerals. The core calculator problem is therefore split in two:

1. **Relatively reliable calculations**: gravity, potential ABV, estimated honey required, one-third sugar break, and nutrient schedule timing can be calculated from measured or estimated sugar concentration.
2. **Biological projections**: final gravity, actual ABV, fermentation duration, and aging readiness must be presented as estimates with confidence bands because yeast strain, nutrition, temperature, pH, osmotic stress, oxygen exposure, and ingredient composition all shift the outcome.

The site should make measured values first-class. A measured OG and measured/stable FG are far more accurate than recipe-only ABV projections. Recipe projections are still useful, but every projection should disclose its assumptions, especially honey moisture/PPG, yeast alcohol tolerance, nutrient regimen, and fermentation temperature.

High-impact findings for product design:

- Honey-only must is commonly nitrogen-deficient. Academic mead literature and winemaking guidance consistently identify low yeast assimilable nitrogen (YAN), low minerals, pH instability, and high osmotic pressure as major causes of slow/stuck mead fermentations.
- A nutrient calculator should support both YAN-based logic and community mead protocols such as TOSNA, while clearly labeling TOSNA as a practical meadmaking protocol rather than a lab YAN measurement.
- Timeline predictions should be shown as ranges and adjusted by gravity, temperature, yeast health, and nutrient status. Do not imply airlock bubbling proves fermentation completion.
- Sweet or backsweetened mead needs a safety warning: fermentation must be stable before packaging, and backsweetening without stabilization, sterile filtration, pasteurization, or force carbonation can cause refermentation and dangerous pressure.
- The best UX model is a **recipe estimator plus batch tracker**. The estimator predicts; the tracker updates predictions from actual gravity, pH, temperature, and date readings.

## Source Quality Notes

This brief prioritizes:

- Peer-reviewed mead and wine fermentation studies.
- Manufacturer technical sheets for yeast and nutrient product data.
- Winemaking institute guidance for YAN and fermentation chemistry.
- BJCP/AHA/mead community material for practical process conventions.

Some practical meadmaking protocols, including TOSNA, come from expert/community practice rather than peer-reviewed controlled trials. They are widely used and useful, but the site should avoid presenting them as universal scientific law.

## Mead Fermentation Basics

### Definition and Composition

Traditional mead is an alcoholic beverage produced by fermenting diluted honey with yeast. Peer-reviewed review literature describes typical mead ethanol ranges around 8-18% ABV, with outcomes strongly affected by honey source, yeast strain, nutrient supplementation, and processing choices.

Honey composition varies by floral source and handling, but typical honey is mostly sugar plus water:

- Average U.S. honey composition reported in USDA-linked apiculture standards includes about 38.38% fructose, 30.31% glucose, 17.2% moisture, 76.75% reducing sugars, and average pH around 3.91.
- Other honey composition literature gives similar averages: roughly 17% water and roughly 80% total sugars, mostly fructose and glucose.
- Honey also contains acids, minerals, amino acids/proteins, aroma compounds, enzymes, phenolics, and pollen traces. These minor components are important for flavor, color, and fermentation behavior but are too variable for precise default calculations.

Implication for the website: honey should have a default sugar/density assumption, but users should be able to override honey moisture, PPG, or measured OG.

Key sources:

- USDA National Organic Program apiculture recommendation document, honey composition table: <https://www.ams.usda.gov/sites/default/files/media/Rec%20Apiculture%20Standards.pdf>
- "Developments in the Fermentation Process and Quality Improvement Strategies for Mead Production": <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>
- AHA, "The Sweet Life: Making Mead the Easy Way": <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>

### Yeast Conversion

Yeast metabolizes fermentable sugars, especially glucose and fructose, into ethanol, CO2, biomass, glycerol, organic acids, esters, higher alcohols, and other aroma compounds. The simple sugar-to-alcohol view is enough for ABV estimation, but not enough for timeline or flavor projection.

Major fermentation stressors in mead:

- High osmotic pressure from high starting gravity.
- Low YAN and low mineral content.
- Poor buffering and pH drop during fermentation.
- Temperature outside the yeast's healthy operating range.
- Insufficient yeast pitch or poor rehydration.
- Excessive heat, oxygen exposure after active fermentation, or contamination.

Academic review literature identifies delayed or stuck fermentations, unpleasant aromas, re-fermentation, volatile acidity, and inconsistent product quality as common mead production problems when these factors are not controlled.

## Website Input Model

The site should distinguish **recipe inputs**, **process inputs**, and **measured readings**.

### Recipe Inputs

Recommended fields:

- Batch volume and whether it is target final volume or water volume.
- Honey weight.
- Honey moisture percent or PPG override.
- Other fermentable ingredients:
  - fruit weight
  - juice volume and Brix/SG
  - concentrate dilution ratio
  - added sugar type and weight
  - maple/agave/malt additions if supported
- Desired style:
  - hydromel/table/session
  - standard
  - sack/high gravity
  - dry/semi-sweet/sweet
- Target OG or target ABV.
- Target FG or sweetness band.

### Yeast and Fermentation Inputs

Recommended fields:

- Yeast strain.
- Alcohol tolerance.
- Recommended temperature range.
- Current/expected fermentation temperature.
- Nitrogen requirement category: low, medium, high, or unknown.
- Pitch rate or packets/grams.
- Rehydration method:
  - dry pitch
  - water rehydration
  - Go-Ferm or equivalent
  - starter
- Nutrient protocol:
  - none
  - upfront nutrient
  - TOSNA/Fermaid O
  - Fermaid K/DAP SNA
  - custom YAN target
  - boiled yeast or other organic nutrient method
- Oxygenation/aeration during early fermentation.
- pH at pitch and pH during fermentation if available.

### Measured Batch Readings

These should override estimates whenever available:

- OG from hydrometer.
- OG from refractometer/Brix, with optional wort/must correction factor.
- Reading temperature and hydrometer calibration temperature.
- Current gravity readings with dates.
- Refractometer readings after fermentation, corrected for alcohol.
- pH readings with dates.
- Temperature readings with dates.
- Visible activity notes only as secondary evidence.

### Packaging and Stability Inputs

Recommended fields:

- Fermentation complete? Based on stable gravity, not bubbling.
- Stabilized? Method:
  - potassium metabisulfite plus potassium sorbate
  - sterile filtration
  - pasteurization
  - natural stability at dry/high ABV, with caution
- Backsweetened? How much honey/sugar added.
- Carbonation:
  - still
  - force carbonated
  - bottle conditioned
- Package type and pressure-rated status.

## Gravity and ABV Calculations

### Prefer Measured OG

For user-facing accuracy:

1. If measured hydrometer OG exists, use it as the source of truth.
2. If measured pre-fermentation Brix exists, convert to SG and mark as measured/refractometer-derived.
3. If no measured OG exists, estimate from ingredient sugar and volume, then label the result as recipe-estimated.

Airlock activity should not be used for ABV or completion calculations.

### Honey Gravity Estimate

A practical estimate can use points per pound per gallon (PPG):

```text
estimated_og_points = (honey_lb * honey_ppg) / final_volume_gal
estimated_og = 1 + (estimated_og_points / 1000)
```

Important implementation details:

- Use final must volume, not water volume.
- Honey PPG varies with moisture.
- AHA reports honey PPG ranging roughly from 36.58 at 21% moisture to 40.29 at 13% moisture.
- Many home mead calculators use a lower rough default around 35 PPG. That can be useful as a conservative default, but it may underpredict compared with AHA's moisture-based table.

Recommended defaults:

- Default honey moisture: 17%.
- Default honey PPG: 38.4 if using final volume and moisture-based calculation.
- Optional "conservative homebrew default": 35 PPG.
- Best option: let users choose "measured OG" or "estimate from honey."

Source: AHA honey moisture/PPG table: <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>

### Brix to SG Before Fermentation

For sugar-water style must before fermentation, this common approximation is useful:

```text
SG = 1 + (Brix / (258.6 - ((Brix / 258.2) * 227.1)))
```

Approximate sugar concentration:

```text
sugar_g_per_L = Brix * SG * 10
```

Reason: Brix is grams sucrose-equivalent per 100 g solution, and 1 L solution weighs about SG * 1000 g.

Caution: honey is not pure sucrose. Brix/SG conversions are close enough for recipe planning, but measured hydrometer readings are better for mixed honey/fruit musts.

### Refractometer Readings After Fermentation

Post-fermentation refractometer readings are distorted by alcohol. A site should never convert final Brix to final SG directly unless it applies an alcohol correction using original Brix and current Brix.

Sean Terrill's cubic correction is widely implemented:

```text
corrected_FG =
  1.001843
  - 0.002318474 * OB
  - 0.000007775 * OB^2
  - 0.000000034 * OB^3
  + 0.00574 * FB
  + 0.00003344 * FB^2
  + 0.000000086 * FB^3
```

Where:

- `OB` = original Brix, preferably corrected for the user's refractometer/must.
- `FB` = current apparent Brix.

Source: Sean Terrill refractometer final gravity notes: <https://seanterrill.com/2010/06/11/refractometer-estimates-of-final-gravity/>

Product recommendation: if a user enters only current refractometer Brix without original Brix, show a warning that ABV and FG cannot be accurately determined from that value alone.

### ABV From OG and FG

Basic formula:

```text
ABV = (OG - FG) * 131.25
```

This is the familiar homebrew approximation. It is easy to understand and works reasonably for many standard-strength fermentations.

Higher-gravity empirical formula:

```text
ABV = (76.08 * (OG - FG) / (1.775 - OG)) * (FG / 0.794)
```

This is commonly used for stronger ferments because density change is not perfectly linear at higher alcohol levels.

Recommendation:

- Use the basic formula by default for transparency.
- Optionally show "advanced ABV estimate" for high gravity meads.
- For legal/commercial ABV, lab measurement or regulated methods are required. Do not imply a recipe calculator can certify label ABV.

### Potential ABV

Potential ABV is the ABV if fermentable sugars are consumed to an assumed FG:

```text
potential_abv = ABV_formula(OG, assumed_FG)
```

Recommended assumed FG options:

- Dry estimate: 1.000.
- Very dry wine/mead can finish below 1.000 due to ethanol density, often around 0.996-1.000.
- Sweetness target: user-specified FG.

Product copy should say "potential ABV" rather than "will be ABV."

### Yeast-Limited Final Gravity Estimate

Yeast alcohol tolerance is not a hard stop. It is affected by strain, pitch rate, nutrient status, temperature, pH, and osmotic stress. Manufacturer sheets often say tolerance is subject to fermentation conditions.

Useful estimator:

1. Calculate dry potential ABV from OG to 1.000.
2. Compare dry potential to yeast tolerance.
3. If dry potential is less than or near yeast tolerance, predict dry or near-dry finish.
4. If dry potential exceeds tolerance, predict residual sugar but mark confidence as low/medium.

Approximate residual points if yeast stops at tolerance:

```text
abv_capacity_points = yeast_tolerance_abv / 131.25
estimated_fg = OG - abv_capacity_points
```

Example:

```text
OG = 1.130
yeast tolerance = 14%
abv_capacity_points = 14 / 131.25 = 0.1067
estimated_fg = 1.130 - 0.1067 = 1.023
```

Show a warning: actual FG can differ significantly. A 14% yeast might stop earlier under stress or exceed tolerance in ideal conditions.

### One-Third Sugar Break

The one-third sugar break is the point where roughly one-third of fermentable extract has been consumed. It is commonly used for nutrient timing.

If the target is dry:

```text
one_third_break_sg = OG - ((OG - 1.000) / 3)
```

If a target FG is known:

```text
one_third_break_sg = OG - ((OG - target_FG) / 3)
```

Example:

```text
OG = 1.120
target_FG = 1.000
one_third_break = 1.120 - (0.120 / 3) = 1.080
```

The site should use actual gravity readings to determine whether the break has been reached.

## Sweetness, FG, and Residual Sugar

FG is not identical to perceived sweetness. Alcohol, acidity, tannin, fruit, spices, carbonation, and honey aroma all change perceived sweetness. Still, FG is useful for user expectations.

Practical FG bands from AHA:

| Sweetness band | FG range |
|---|---:|
| Dry | 0.999-1.010 |
| Semi-sweet | 1.010-1.025 |
| Sweet | 1.025-1.050 |

Product recommendation:

- Use FG bands for simple UX.
- Add a note that fruit acid/tannin can make a mead taste drier, while honey aroma and glycerol/body can make it taste sweeter.
- Do not estimate exact residual sugar from hydrometer FG after fermentation without a more complex alcohol/extract model or lab data.

Source: AHA, "The Sweet Life": <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>

## Style and Gravity Ranges

AHA practical original gravity ranges:

| Strength band | OG range | Product implications |
|---|---:|---|
| Hydromel/session/table mead | 1.035-1.080 | Faster fermentation, lower aging demand, often ready sooner. |
| Standard mead | 1.080-1.120 | Typical wine-strength mead; needs nutrient and temperature control. |
| Sack/high-gravity mead | 1.120-1.170 | Higher osmotic stress, longer fermentation/aging, more risk of stalls. |

Source: AHA, "The Sweet Life": <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>

## Yeast Selection

### Product Table for Common Mead Yeasts

Manufacturer data should be stored as structured reference data and editable by admins.

| Yeast | Temperature range | Alcohol tolerance | Nitrogen need / notes | Source |
|---|---:|---:|---|---|
| Lalvin 71B | 15-30 deg C / 59-86 deg F | 14% | Low nutrient need; moderate fermentation; ester profile; can partially metabolize malic acid. | Lallemand 71B |
| Lalvin ICV-D47 | 15-30 deg C / 59-86 deg F | 15% | Low relative nitrogen demand under lab conditions; sensitive below 15 deg C in clarified juice; round/full-bodied profile. | Lallemand D47 |
| Lalvin EC-1118 | 10-30 deg C / 50-86 deg F | up to 18% | Robust, neutral, pressure/osmotic tolerant; useful for difficult ferments and restart-style use. | Lallemand EC-1118 |
| Lalvin K1-V1116 | 10-35 deg C / 50-95 deg F | up to 18% | Floral ester producer, robust under difficult conditions; low-temp aromatic use with good nutrition. | Lallemand K1-V1116 |

Sources:

- 71B: <https://www.lallemandwine.com/en/united-states/products/wine-yeasts/lalvin-71b/>
- D47: <https://www.lallemandbrewing.com/fr/canada/produits/levure-lalvin-icv-d47/>
- EC-1118: <https://www.lallemandbrewing.com/en/united-states/product-details/lalvin-ec-1118/>
- K1-V1116: <https://www.lallemandbrewing.com/es/continental-europe/productos/lalvin-icv-k1-v1116/>

### Yeast UX Recommendations

For each yeast strain, store:

- Name and aliases.
- Alcohol tolerance.
- Temperature min/max.
- Preferred range if available.
- Nitrogen demand category.
- Fermentation speed category.
- Sensory profile.
- Malic acid behavior if relevant.
- Restart suitability.
- Source URL and date reviewed.

UI warnings:

- "Temperature below range: slow/stalled fermentation risk."
- "Temperature above range: faster but increased off-flavor risk."
- "Potential ABV exceeds yeast tolerance: expect sweetness/stall risk unless step-feeding or using a higher-tolerance yeast."
- "Yeast tolerance depends on conditions; this is not a guaranteed stop point."

## Yeast Nutrition and YAN

### Why YAN Matters

Yeast assimilable nitrogen (YAN) is nitrogen yeast can use during fermentation. AWRI defines YAN as ammonia nitrogen plus alpha-amino nitrogen:

```text
YAN = 0.8225 * [NH3] + [alpha-amino nitrogen]
```

In wine, nitrogen affects fermentation rate, completion, aroma profile, hydrogen sulfide/reductive character, and risk of slow/stuck fermentation. Mead has a similar issue but often more severe because honey-water must has very little nitrogen and limited minerals.

Useful reference points:

- AWRI gives approximate minimum low-risk YAN guidance for grape must: about 150 mg/L for white wines and about 100 mg/L for reds, with higher levels for clean/fruity Chardonnay style.
- Mead Made Right states that healthy fermentation often targets 150-200 ppm nitrogen and that honey can average around 30 ppm.
- A peer-reviewed mead paper notes honey-must assimilable nitrogen can be far below wine fermentation ideals, around one-fourth of an approximately 150 mg/L ideal depending on dilution.
- Recent mead studies continue to report low-YAN honey must controls, for example around 47 mg N/L in one control must.

Sources:

- AWRI YAN guidance: <https://www.awri.com.au/industry_support/winemaking_resources/wine_fermentation/yan/>
- Mead Made Right nutrient additions: <https://www.meadmaderight.com/nutrient-additions>
- Low-nitrogen mead strain study: <https://pmc.ncbi.nlm.nih.gov/articles/PMC7316929/>
- Mead review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>

### Nutrient Product Reference

| Product | Type | Typical use | YAN contribution | Source |
|---|---|---|---:|---|
| Fermaid O | Organic yeast-derived nutrient | Staggered additions early fermentation; TOSNA | Lallemand Australia sheet reports 40 g/hL gives 17.2 mg/L actual YAN and 48 mg/L inorganic YAN-equivalent. Product page recommends split additions around end lag and 1/3 sugar depletion. | Lallemand |
| Fermaid K | Complex nutrient with organic and inorganic N | Often at 1/3 sugar depletion if extra YAN is needed | Scott Labs lists 25 g/hL as 25 ppm measurable YAN; recommended 25-50 g/hL. | Scott Labs |
| DAP | Inorganic ammonium phosphate | Early nutrient addition where inorganic nitrogen is appropriate | Depends on dose; can accelerate fermentation; avoid excessive/late addition. | AWRI/mead practice |
| Go-Ferm Protect Evolution | Rehydration nutrient/protectant | During yeast rehydration, before pitching into must | Scott Labs lists YAN contribution as insignificant; provides vitamins, minerals, sterols. | Scott Labs |

Sources:

- Fermaid O product page: <https://www.lallemandwine.com/en/macedonia/products/nutrients-and-protectors/fermaid-o/>
- Lallemand nutrient PDF with Fermaid O YAN data: <https://products.lallemandwine.com/storage/files/nutrients-and-protectors/a8838776839e50b324e64592ba968550584be9a9.pdf>
- Fermaid K: <https://scottlab.com/fermentation-cellar/nutrients/fermaid-k-fermk>
- Go-Ferm Protect Evolution: <https://scottlab.com/go-ferm-protect-evolution-yeast-rehydration-nutrie-15251>
- AWRI YAN guidance: <https://www.awri.com.au/industry_support/winemaking_resources/wine_fermentation/yan/>

### TOSNA

TOSNA means Tailored Organic Staggered Nutrient Addition. The practical version popularized by Mead Made Right uses Fermaid O split across early fermentation.

Formula from Mead Made Right:

```text
total_fermaid_o_g =
  ((((Brix * 10) * nitrogen_requirement_factor) / 50) * batch_volume_gal)
```

Nitrogen requirement factors:

| Yeast nitrogen need | Factor |
|---|---:|
| Low | 0.75 |
| Medium | 0.90 |
| High | 1.25 |

Addition schedule:

- 24 hours after pitch.
- 48 hours after pitch.
- 72 hours after pitch.
- At the 1/3 sugar break, or day 7, whichever comes first.

Modern Meadmaking wiki summarizes the same broad TOSNA concept: Fermaid O broken into four additions over the first week, with the last dose at the one-third break or day 7.

Sources:

- Mead Made Right nutrient additions: <https://www.meadmaderight.com/nutrient-additions>
- Modern Meadmaking nutrient schedules: <https://wiki.meadtools.com/en/process/nutrient_schedules>

Product recommendation:

- Implement TOSNA as a protocol mode.
- Let users select yeast nitrogen requirement.
- Show total grams and per-addition grams.
- Use actual gravity tracking to alert the fourth addition.
- Add warnings if the batch has passed the one-third break before nutrient additions are complete.

### YAN-Based Custom Nutrient Calculator

For advanced users, support custom YAN targets:

```text
yan_deficit_mg_per_L = target_yan - measured_or_estimated_initial_yan
total_yan_needed_mg = yan_deficit_mg_per_L * volume_L
```

Then convert product dose based on known contribution:

```text
product_g = total_yan_needed_mg / yan_mg_per_g_product
```

Where:

- Fermaid K can be modeled from Scott Labs as 25 g/hL -> 25 mg/L YAN.
  - This equals 1 mg/L per 1 g/hL.
  - Since 1 g/hL = 0.01 g/L, this is roughly 100 mg YAN per gram product per liter of must equivalent. It is easier and safer to compute from g/hL tables.
- Fermaid O has "actual YAN" and "YAN-equivalent" ambiguity. Store both and label clearly.

Warnings:

- Measured YAN is rarely available to home meadmakers.
- Estimated honey YAN is highly uncertain.
- Excess nutrient can leave residual nitrogen and increase spoilage/off-flavor risk.
- Excessive inorganic nitrogen can increase heat, fermentation speed, and sensory problems.

## pH, Acidity, and Buffering

### The Mead pH Problem

Honey is acidic but poorly buffered. During fermentation, yeast can produce acids, and pH can fall enough to stress yeast. Scientific reviews and mead studies identify low pH and low buffer capacity as factors in stuck or sluggish mead fermentation.

The literature includes references to buffering honey must around pH 3.7-4.0 to support yeast efficiency, though modern home/process advice often recommends avoiding heavy acid additions before fermentation and balancing acid after fermentation.

Recommended site behavior:

- Ask for pH if the user has a meter.
- Do not require pH for beginner mode.
- Warn if pH is very low during active fermentation, especially below roughly 3.2.
- Warn if pH is high for finished low-ABV sweet mead because microbial stability risk rises.
- Suggest acid balancing after fermentation by bench trial rather than blind pre-fermentation acid additions.

Sources:

- Pereira et al., "Improvement of mead fermentation by honey-must supplementation": <https://onlinelibrary.wiley.com/doi/full/10.1002/jib.239>
- Mead production review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>
- AHA water/buffering discussion: <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>

### Website pH Risk Flags

These are practical flags, not hard rules:

| Condition | Suggested message |
|---|---|
| pH below 3.0 | High yeast stress risk. Verify calibration and consider corrective action if fermentation is sluggish. |
| pH 3.0-3.2 | Watch closely; some fermentations continue, but mead can become sluggish because honey must is poorly buffered. |
| pH 3.2-4.0 | Common workable fermentation range, depending on strain and process. |
| pH above 4.0 during/after fermentation | Fermentation may proceed, but finished stability and spoilage risk deserve attention, especially for sweet/low-ABV meads. |

## Temperature

Temperature changes both speed and flavor. Warmer fermentation generally increases rate until the yeast becomes stressed; excessive warmth can increase higher alcohols, volatile acidity, and harsh solvent-like character. Cooler fermentation can preserve aromatics but may slow or stall if below the yeast's range.

Academic review literature reports higher Saccharomyces fermentation rates around 20-30 deg C, slower performance below 15 deg C, and reduced performance above 30 deg C. Manufacturer strain sheets should be the primary reference for strain-specific limits.

Product recommendation:

- Compare user temperature against yeast min/max.
- Also show "lower half of range" as a cleaner-but-slower default when practical.
- Timeline estimates should expand when temperature is below the middle of the yeast's recommended range.

Sources:

- Mead production review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>
- Lallemand yeast strain pages listed above.
- AHA process advice: <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>

## Oxygenation, Degassing, and Early Fermentation

Yeast needs oxygen early for sterol and fatty-acid synthesis, which supports healthy cell membranes under increasing alcohol/osmotic stress. After early fermentation, oxygen exposure becomes more harmful because it can oxidize aroma/flavor and support spoilage organisms.

Practical mead sources commonly pair early degassing/aeration with staggered nutrient additions. Degassing also reduces CO2 nucleation when adding powdered nutrients, lowering foam-over risk.

Product recommendations:

- Allow a process toggle for "early aeration/degassing."
- Add reminders only during early fermentation/first third.
- Warn against unnecessary oxygen exposure after active fermentation slows.
- If adding nutrients during active fermentation, suggest degassing gently first to prevent foam-over.

Sources:

- AHA staggered nutrient additions: <https://www.homebrewersassociation.org/beyond-beer/improve-mead-staggered-nutrient-additions/>
- AHA "The Sweet Life": <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>
- WineMakerMag oxygen role: <https://winemakermag.com/wine-wizard/oxygens-role-in-fermentation>
- Sterols in wine fermentation review: <https://www.mdpi.com/2311-5637/8/2/90>

## Timeline Projection

### Why Timeline Must Be a Range

Mead fermentation can take weeks to months. Academic review literature describes mead fermentation and maturing as time-consuming, with duration controlled by honey dilution, yeast strain, nutrition, pH, mixing, and temperature. Practical AHA guidance says many well-managed meads are nearly finished within a couple of weeks, while some recipes rack after three to four weeks and clear later.

The site should never say "done in exactly X days." It should say "estimated primary completion range" and "confirm with stable gravity."

Sources:

- Mead production review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>
- AHA "The Sweet Life": <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>
- BJCP advanced mead topics on aging: <https://www.bjcp.org/exam-certification/mead-judge-program/studying-for-the-mead-exams/mead-exam-study-guide/10-advanced-topics-in-mead-making/>

### Baseline Timeline Bands

Use these as starting estimates for a healthy fermentation with appropriate yeast, nutrients, and temperature.

| Mead strength | OG range | Active/primary fermentation estimate | Clarification/conditioning estimate | Aging/readiness estimate |
|---|---:|---:|---:|---:|
| Hydromel/session | 1.035-1.080 | 5-21 days | 2-8 weeks | 2-12 weeks |
| Standard | 1.080-1.120 | 14-35 days | 4-12 weeks | 3-6 months |
| Sack/high gravity | 1.120-1.170 | 28-90+ days | 2-6+ months | 6-18+ months |

These are not guarantees. They are product planning ranges. The batch tracker should narrow them after actual gravity trends are available.

### Timeline Adjustment Factors

Suggested heuristic adjustments:

| Factor | Timeline impact | Confidence |
|---|---|---|
| Measured temperature below yeast range | Major slow/stall risk | High |
| Measured temperature near low end | Slower but often cleaner | Medium |
| Measured temperature above range | Faster initially, off-flavor/stress risk | High |
| No nutrient plan in honey-only must | Slower/stuck risk, sometimes months | High |
| OG above 1.120 | Longer, more osmotic stress | High |
| OG above 1.150 | High stall risk without step feeding/strong nutrition | High |
| pH below 3.2 during active ferment | Slower/stress risk | Medium |
| Yeast potential ABV below recipe potential | Sweet/stall risk | High |
| Fruit in primary | Can add nutrients but also solids, cap management, pectin, losses | Medium |
| Strong early gravity drop | Timeline should shorten | High once measured |
| Same gravity for 3-7 days near expected FG | Likely complete | High |
| Same gravity above expected FG | Possible stall or yeast limit | Medium |

### Batch Tracker Logic

Use readings to update timeline:

```text
gravity_points_remaining = (current_sg - target_fg) * 1000
daily_drop = points_drop_since_last_reading / days_elapsed
estimated_days_remaining = gravity_points_remaining / daily_drop
```

Rules:

- Require at least two readings separated by 24+ hours.
- Smooth over multiple readings if available.
- If daily drop is near zero:
  - If current SG is at/near expected FG, mark "likely complete; verify stability."
  - If current SG is high, mark "possible stall; check temperature, pH, nutrient timing, yeast tolerance."
- Never project bottling safety from a single reading.

Completion check:

```text
stable = abs(reading_1 - reading_2) <= 0.001
and days_between >= 3
and current_sg <= expected_fg + tolerance
```

For sweet/stabilized meads, use a more conservative stability interval, such as one week, especially after backsweetening.

## Stuck or Sluggish Fermentation

### Signs

- Gravity stops dropping before expected FG.
- Gravity remains unchanged across multiple readings.
- Fermentation is much slower than expected for temperature/OG.
- Strong sulfur/rotten egg aroma appears.
- pH has dropped sharply.

### Common Causes

- Low YAN/nutrients.
- Temperature below yeast range.
- Temperature spike/heat stress.
- Yeast reached alcohol tolerance.
- Starting gravity too high.
- Low pH and low buffer capacity.
- Poor yeast viability or underpitching.
- Inhibitory ingredients or high sulfite.
- Oxygen/nutrient management problems early on.

### Product Troubleshooting Prompts

Ask:

- What is the current gravity and when was the previous reading?
- What was OG?
- What yeast strain?
- What temperature?
- What pH?
- What nutrient schedule?
- How much honey/fruit and final volume?
- Was the yeast rehydrated?
- Any sulfur, vinegar, solvent, or film?

Do not suggest adding nutrients blindly late in fermentation. Especially flag DAP/inorganic nitrogen timing issues.

Sources:

- Mead review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>
- AWRI YAN guidance: <https://www.awri.com.au/industry_support/winemaking_resources/wine_fermentation/yan/>
- Modern Meadmaking nutrient schedules: <https://wiki.meadtools.com/en/process/nutrient_schedules>

## Off-Flavors and Faults

| Fault / symptom | Likely causes | Site guidance |
|---|---|---|
| Rotten egg / H2S | Low YAN, yeast strain, stress, sulfur metabolism imbalance | Early detection matters. Check nutrient status, temperature, and timing. |
| Hot/solvent/rocket fuel | High temperature, high OG stress, undernutrition, young mead | Prevention is better than aging it out; age may reduce harshness. |
| Vinegar / volatile acidity | Oxygen plus acetic acid bacteria, contamination, stressed ferment | Sanitation and oxygen control. Severe cases may not be recoverable. |
| Green apple / acetaldehyde | Young mead, stressed yeast, oxygen exposure | Allow fermentation/conditioning; avoid premature racking/bottling. |
| Oxidized/wet cardboard/sherry-like | Oxygen after active fermentation | Minimize headspace and splashing post-primary. |
| Geranium-like | Sorbate plus lactic acid bacteria risk | Use sorbate correctly with sulfite and avoid MLF/LAB issues. |
| Medicinal/plastic/phenolic | Contamination, chlorine/chloramine, certain yeasts/spices | Use good sanitation and chlorine-free water. |

Sources:

- H2S assay/wine yeast study: <https://www.mdpi.com/2311-5637/7/4/213>
- AWRI YAN guidance: <https://www.awri.com.au/industry_support/winemaking_resources/wine_fermentation/yan/>
- Mead production review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>

## Stabilization, Backsweetening, and Packaging Safety

### Core Safety Principle

Sweet mead in a sealed bottle can restart fermentation if viable yeast remains and fermentable sugar is present. This can create overcarbonation or bursting bottles. The site should always warn users before backsweetening or packaging sweet still mead.

### Stabilization Concepts

Common home winemaking stabilization uses potassium metabisulfite plus potassium sorbate:

- Potassium metabisulfite contributes SO2 and helps suppress microbes/oxidation.
- Potassium sorbate inhibits yeast reproduction but does not reliably stop an active fermentation.
- Stabilizers are used after fermentation is complete and the mead is racked/clearing.
- Sweetening after stabilization should still be followed by gravity monitoring to confirm stability.

Other stability options:

- Sterile filtration.
- Pasteurization.
- Cold storage only as a temporary control, not shelf-stable assurance.
- Force carbonation in a keg for sweet sparkling mead is safer than bottle conditioning sweet mead.

Sources:

- Iowa State Extension, potassium sorbate: <https://www.extension.iastate.edu/wine/publications/using-potassium-sorbate-to-inhibit-yeast-growth-in-bottled-wines/>
- WineMakerMag backsweetening: <https://winemakermag.com/technique/backsweetening>
- AHA "The Sweet Life" finishing section: <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>
- Modern Meadmaking stabilization: <https://wiki.meadtools.com/en/process/stabilization>

### Product Safety Warnings

Trigger warnings when:

- User plans to backsweeten and bottle without stabilization.
- User plans sparkling sweet mead by bottle conditioning.
- FG is above 1.000 and fermentation has not been stable.
- There is only one gravity reading.
- User relies on airlock activity.
- Yeast tolerance is below remaining sugar potential.
- Mead was stabilized while still actively fermenting.

Suggested copy:

"Do not bottle based on bubbling alone. Confirm stable gravity first. If you add honey or sugar after fermentation, use a stabilization method or force carbonate in pressure-rated equipment."

## Fruit, Juice, and Adjuncts

Fruit meads complicate projections:

- Fruit adds water, sugar, acid, tannin, pectin, color, aroma, and nutrients.
- Fruit sugar varies widely by fruit type, ripeness, processing, and concentration.
- Fruit solids create volume loss and cap-management needs.
- Fruit acids/tannins can make a mead taste drier than its FG suggests.
- Pectic enzyme may help clarify fruit meads.

Calculator strategy:

- Beginner mode: fruit contributes flavor/volume loss but not precise sugar unless the user provides Brix/SG.
- Advanced mode: fruit juice/puree sugar = Brix * SG * 10 * volume_L.
- Whole fruit: use approximate sugar tables only with low confidence, or ask for juice/puree Brix.
- Always allow measured OG to override ingredient estimates.

Source: AHA fruit mead process notes: <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>

## Heat vs No-Heat Must Preparation

Historically, mead recipes often boiled or heated honey must to reduce microbial load. Modern practice often avoids boiling to preserve honey aroma, relying instead on sanitation, sulfite where appropriate, quality honey, and healthy yeast pitch.

Research review notes:

- Heat can reduce undesirable microbes.
- Heat can change phenolic profiles, antioxidant capacity, HMF, aroma, and flavor.
- Excessive heating of honey is associated with quality concerns including HMF formation.

Product recommendation:

- Do not make heat treatment a default requirement.
- If the site includes process guidance, offer "no heat" and "pasteurized/heated" as process choices.
- Warn that heating can change honey character.

Sources:

- Mead production review: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>
- AHA heat/no-heat mead article: <https://www.homebrewersassociation.org/beyond-beer/making-mead-heat-or-no-heat/>

## Legal and Regulatory Note for U.S. Context

For a consumer/hobby site, calculations are educational. If the website later supports commercial production, labeling, or compliance, consult current TTB rules and legal/compliance experts.

U.S. TTB materials allow "mead" as a designation for qualifying honey wine. TTB honey wine production rules include limits and requirements such as water addition to facilitate fermentation, with the honey-water mixture not reduced below 13 Brix under 27 CFR 24.203.

Sources:

- TTB alcohol FAQs, honey wine/mead: <https://www.ttb.gov/faqs/alcohol?keyword=&tid=20>
- 27 CFR 24.203 Honey wine: <https://www.law.cornell.edu/cfr/text/27/24.203>
- TTB Ruling 2016-2: <https://www.ttb.gov/system/files/images/pdfs/rulings/2016-2.pdf>

## Recommended Calculator Outputs

### Recipe Projection Output

Show:

- Estimated OG.
- Potential ABV to dry.
- Estimated ABV at target FG.
- Yeast-limited FG/ABV estimate, if applicable.
- Honey required for target OG/ABV.
- Sweetness band.
- Nutrient recommendation:
  - total grams
  - per-addition grams
  - schedule
  - one-third break SG
- Timeline range:
  - active fermentation
  - primary completion
  - clearing
  - suggested aging/readiness
- Risk flags.
- Confidence level and assumptions.

### Batch Tracker Output

Show:

- Current apparent attenuation.
- Current ABV estimate from OG/current SG.
- Gravity trend.
- Estimated days to target FG.
- Nutrient addition status.
- pH/temperature risk warnings.
- "Likely complete" only after stable gravity.
- Packaging safety status.

### Confidence Labels

Recommended labels:

- **Measured/high confidence**: uses measured OG and stable measured FG.
- **Tracked/medium-high confidence**: uses measured OG and multiple current readings.
- **Recipe-estimated/medium confidence**: uses ingredient estimates plus volume.
- **Assumption-heavy/low confidence**: missing measured OG or using whole fruit estimates.
- **Biological estimate/variable**: timeline, final FG, yeast tolerance outcomes.

## Suggested Data Structures

### Yeast

```json
{
  "id": "lalvin-71b",
  "name": "Lalvin 71B",
  "aliases": ["71B", "71B-1122"],
  "temperature_min_c": 15,
  "temperature_max_c": 30,
  "alcohol_tolerance_abv": 14,
  "nitrogen_requirement": "low",
  "fermentation_rate": "moderate",
  "profile": ["esters", "fruity", "malic acid reduction"],
  "source_url": "https://www.lallemandwine.com/en/united-states/products/wine-yeasts/lalvin-71b/",
  "source_reviewed": "2026-06-06"
}
```

### Nutrient Product

```json
{
  "id": "fermaid-o",
  "name": "Fermaid O",
  "nitrogen_type": "organic",
  "actual_yan_mg_l_at_40g_hl": 17.2,
  "yan_equivalent_mg_l_at_40g_hl": 48,
  "default_schedule": "tosna",
  "source_url": "https://products.lallemandwine.com/storage/files/nutrients-and-protectors/a8838776839e50b324e64592ba968550584be9a9.pdf",
  "source_reviewed": "2026-06-06"
}
```

### Batch Reading

```json
{
  "batch_id": "example",
  "date": "2026-06-06",
  "reading_type": "hydrometer_sg",
  "value": 1.042,
  "sample_temperature_c": 20,
  "instrument_calibration_c": 20,
  "notes": "day 7 reading before nutrient decision"
}
```

## Important UX Warnings and Microcopy

Use direct, calm warnings:

- "Measured OG is the best way to estimate ABV. Without it, ABV is recipe-estimated."
- "Refractometer readings after fermentation need alcohol correction."
- "Yeast alcohol tolerance is an estimate, not a switch."
- "Do not bottle based on airlock activity. Use stable gravity readings."
- "Backsweetening adds fermentable sugar. Stabilize or use pressure-rated/force-carbonated packaging."
- "Honey-only must is nutrient-poor. Underfeeding can cause sulfur, slow fermentation, or stalls."
- "The one-third sugar break is based on gravity, not the calendar."
- "Timeline is a range. Yeast, temperature, pH, nutrients, and gravity decide the actual pace."

## Validation Examples

### Example 1: Standard Dry Traditional

Inputs:

- 5 gal final volume.
- 15 lb honey.
- Honey PPG 38.4.
- Yeast: 71B, 14% tolerance.
- Target dry FG 1.000.

Estimate:

```text
OG points = (15 * 38.4) / 5 = 115.2
OG = 1.115
Potential ABV to 1.000 = (1.115 - 1.000) * 131.25 = 15.1%
```

Interpretation:

- Potential ABV is above 71B's listed 14% tolerance.
- Expected finish may be semi-sweet unless conditions allow tolerance to exceed spec.
- If the user wants dry, recommend lower OG or a higher-tolerance yeast.

### Example 2: One-Third Break

Inputs:

- OG 1.105.
- Target FG 1.000.

```text
one_third_break = 1.105 - ((1.105 - 1.000) / 3)
one_third_break = 1.070
```

Interpretation:

- Schedule the final TOSNA addition at SG 1.070 or day 7, whichever comes first, depending on the selected protocol.

### Example 3: TOSNA

Inputs:

- 5 gal.
- 24 Brix.
- Medium nitrogen requirement.

```text
total Fermaid O =
((((24 * 10) * 0.90) / 50) * 5)
= 21.6 g

per addition = 21.6 / 4 = 5.4 g
```

Interpretation:

- Add about 5.4 g at 24h, 48h, 72h, and the one-third break/day 7.
- Confirm timing with actual gravity when possible.

### Example 4: Current ABV From Reading

Inputs:

- OG 1.110.
- Current SG 1.035.

```text
current ABV = (1.110 - 1.035) * 131.25 = 9.84%
```

Interpretation:

- If using DAP, warn that late inorganic nutrient additions become less appropriate as alcohol rises and fermentation advances.
- Use actual protocol-specific thresholds for messages.

## Research Gaps and Design Implications

Known gaps:

- Honey YAN varies widely and is rarely measured by hobbyists.
- Fruit sugar and nutrient contribution are hard to estimate without Brix/SG and composition data.
- Yeast alcohol tolerance is probabilistic, not deterministic.
- Timeline models are inherently noisy unless updated with real gravity readings.
- Fermaid O "actual YAN" versus "YAN-equivalent" can confuse users.
- pH correction advice is context-dependent; blind additions can cause new problems.

Design response:

- Make uncertainty visible.
- Prefer measured readings.
- Store assumptions.
- Use warnings and confidence levels.
- Allow advanced overrides.
- Separate "calculator says" from "batch has proven."

## Source List

### Mead Science

- Iglesias et al., "Developments in the Fermentation Process and Quality Improvement Strategies for Mead Production": <https://pmc.ncbi.nlm.nih.gov/articles/PMC6271869/>
- "Selection of low nitrogen demand yeast strains and their impact on the physicochemical and volatile composition of mead": <https://pmc.ncbi.nlm.nih.gov/articles/PMC7316929/>
- Pereira et al., "Mead production: effect of nitrogen supplementation on growth, fermentation profile and aroma formation by yeasts in mead fermentation": <https://onlinelibrary.wiley.com/doi/full/10.1002/jib.184>
- Pereira et al., "Improvement of mead fermentation by honey-must supplementation": <https://onlinelibrary.wiley.com/doi/full/10.1002/jib.239>

### Honey Composition

- USDA/AMS apiculture recommendation document with honey composition statistics: <https://www.ams.usda.gov/sites/default/files/media/Rec%20Apiculture%20Standards.pdf>
- "Standard methods for Apis mellifera honey research": <https://www.tandfonline.com/doi/full/10.1080/00218839.2020.1738135>

### Yeast and Nutrients

- AWRI, "Yeast Assimilable Nitrogen (YAN)": <https://www.awri.com.au/industry_support/winemaking_resources/wine_fermentation/yan/>
- Lallemand Lalvin 71B: <https://www.lallemandwine.com/en/united-states/products/wine-yeasts/lalvin-71b/>
- Lallemand Lalvin ICV-D47: <https://www.lallemandbrewing.com/fr/canada/produits/levure-lalvin-icv-d47/>
- Lallemand Lalvin EC-1118: <https://www.lallemandbrewing.com/en/united-states/product-details/lalvin-ec-1118/>
- Lallemand Lalvin K1-V1116: <https://www.lallemandbrewing.com/es/continental-europe/productos/lalvin-icv-k1-v1116/>
- Lallemand Fermaid O product page: <https://www.lallemandwine.com/en/macedonia/products/nutrients-and-protectors/fermaid-o/>
- Lallemand nutrient PDF with Fermaid O YAN data: <https://products.lallemandwine.com/storage/files/nutrients-and-protectors/a8838776839e50b324e64592ba968550584be9a9.pdf>
- Scott Labs Fermaid K: <https://scottlab.com/fermentation-cellar/nutrients/fermaid-k-fermk>
- Scott Labs Go-Ferm Protect Evolution: <https://scottlab.com/go-ferm-protect-evolution-yeast-rehydration-nutrie-15251>

### Practical Meadmaking and Style Guidance

- AHA, "The Sweet Life: Making Mead the Easy Way": <https://homebrewersassociation.org/zymurgy/sweet-life-making-mead-easy-way/>
- AHA, "Improve Your Mead with Staggered Nutrient Additions": <https://www.homebrewersassociation.org/beyond-beer/improve-mead-staggered-nutrient-additions/>
- AHA, "Making Mead: Heat or No Heat?": <https://www.homebrewersassociation.org/beyond-beer/making-mead-heat-or-no-heat/>
- Mead Made Right, "Nutrient Additions": <https://www.meadmaderight.com/nutrient-additions>
- Modern Meadmaking wiki, "Nutrient Schedules": <https://wiki.meadtools.com/en/process/nutrient_schedules>
- Modern Meadmaking wiki, "Stabilization": <https://wiki.meadtools.com/en/process/stabilization>
- BJCP Mead Exam Study Guide, advanced topics: <https://www.bjcp.org/exam-certification/mead-judge-program/studying-for-the-mead-exams/mead-exam-study-guide/10-advanced-topics-in-mead-making/>

### Measurement, Oxygen, and Stability

- Sean Terrill, refractometer final gravity correction: <https://seanterrill.com/2010/06/11/refractometer-estimates-of-final-gravity/>
- WineMakerMag, "Oxygen's Role in Fermentation": <https://winemakermag.com/wine-wizard/oxygens-role-in-fermentation>
- "Characterization and Role of Sterols in Saccharomyces cerevisiae during White Wine Alcoholic Fermentation": <https://www.mdpi.com/2311-5637/8/2/90>
- "Development of a New Assay for Measuring H2S Production during Alcoholic Fermentation": <https://www.mdpi.com/2311-5637/7/4/213>
- Iowa State Extension, "Using Potassium Sorbate to Inhibit Yeast Growth in Bottled Wines": <https://www.extension.iastate.edu/wine/publications/using-potassium-sorbate-to-inhibit-yeast-growth-in-bottled-wines/>
- WineMakerMag, "Backsweetening": <https://winemakermag.com/technique/backsweetening>

### U.S. Regulatory

- TTB alcohol FAQs for honey wine/mead: <https://www.ttb.gov/faqs/alcohol?keyword=&tid=20>
- 27 CFR 24.203 Honey wine: <https://www.law.cornell.edu/cfr/text/27/24.203>
- TTB Ruling 2016-2: <https://www.ttb.gov/system/files/images/pdfs/rulings/2016-2.pdf>

