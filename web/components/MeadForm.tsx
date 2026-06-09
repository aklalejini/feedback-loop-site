"use client";
import { useEffect, useState } from "react";
import {
  type Mead,
  type HoneyType,
  type JuiceKind,
  type YeastStrain,
  type VesselKind,
  type NitrogenNeed,
  HONEYS,
  JUICES,
  YEASTS,
  VESSELS,
  mustComposition,
  startingGravity,
  blankMead,
  fermentationRisks,
  HONEY_DENSITY_L_PER_KG,
} from "@/lib/mead";
import { defaultNitrogenNeed, NITROGEN_NEED_LABELS } from "@/lib/nutrients";
import { applyHoneyChangeKg, applyJuiceChangeL, applyWaterChangeL } from "@/lib/capacity";
import { applySolvedRecipe, solveRecipe } from "@/lib/recipeSolver";
import { STYLE_PROFILES, type StyleKind } from "@/lib/styles";
import { unitsFor } from "@/lib/units";
import { NutrientSchedule } from "@/components/NutrientSchedule";
import { SpecSheet } from "@/components/SpecSheet";
import { SpriteVessel } from "@/components/SpriteVessel";
import { StylePicker } from "@/components/StylePicker";
import { useUnits } from "@/components/UnitsToggle";
import { useScene } from "@/components/Scene";
import { BuyLink } from "@/components/BuyLink";
import { AFFILIATE_AIRLOCK, AFFILIATE_HONEY, AFFILIATE_HYDROMETER, AFFILIATE_JUICE, AFFILIATE_KITS, AFFILIATE_NUTRIENTS, AFFILIATE_SANITIZER, AFFILIATE_SPICE, AFFILIATE_TRANSFER, AFFILIATE_VESSEL, AFFILIATE_YEAST } from "@/lib/affiliate";

const NITROGEN_OPTS: NitrogenNeed[] = ["low", "medium", "high"];

interface Props {
  initial?: Mead;
  onSubmit: (mead: Mead) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const COMMON_SPICES = ["cinnamon", "vanilla bean", "orange peel", "clove", "ginger", "elderberry", "cayenne", "habanero"];

export function MeadForm({ initial, onSubmit, onCancel, submitLabel = "Save batch" }: Props) {
  // The batch form (new + edit) shows the cellar backdrop while it's open.
  useScene("cellar");
  const [draft, setDraft] = useState<Mead>(() => initial ?? blankMead());
  const [unitSystem] = useUnits();
  const u = unitsFor(unitSystem);

  const update = <K extends keyof Mead>(key: K, value: Mead[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const vessel = VESSELS[draft.vessel];
  const composition = mustComposition(draft);
  const totalL = composition.totalL;
  const isEmpty = totalL <= 0.01;
  const sg = startingGravity(draft);
  const estFG = 1 + (sg - 1) * (1 - YEASTS[draft.yeast].attenuationPct);
  const estABV = Math.max(0, (sg - estFG) * 131.25);
  const headspace = vessel.capacityL - totalL;
  const atCapacity = headspace <= 0.01;

  // Capacity-aware setters. Each takes the requested METRIC value and reduces
  // the other ingredients proportionally if it would overflow the vessel.
  const setHoneyKg = (newKg: number) =>
    setDraft((d) => ({ ...d, ...applyHoneyChangeKg(d.honeyKg, d.waterL, d.juiceL ?? 0, newKg, VESSELS[d.vessel].capacityL) }));
  const setWaterL = (newL: number) =>
    setDraft((d) => ({ ...d, ...applyWaterChangeL(d.honeyKg, d.waterL, d.juiceL ?? 0, newL, VESSELS[d.vessel].capacityL) }));
  const setJuiceL = (newL: number) =>
    setDraft((d) => ({ ...d, ...applyJuiceChangeL(d.honeyKg, d.waterL, d.juiceL ?? 0, newL, VESSELS[d.vessel].capacityL) }));

  const setJuiceType = (kind: JuiceKind | undefined) =>
    setDraft((d) => {
      if (kind == null) return { ...d, juiceType: undefined, juiceL: 0 };
      // Keep an existing juice amount when only switching the fruit.
      if (d.juiceL && d.juiceL > 0) return { ...d, juiceType: kind };
      // First time picking a juice: seed a real melomel fraction (~30% of the
      // vessel) by displacing WATER (honey character is preserved). A token
      // 0.5 L barely tinted the liquid, which is what made juice look like it
      // did "nothing" on a full vessel.
      const cap = VESSELS[d.vessel].capacityL;
      const honeyL = d.honeyKg * HONEY_DENSITY_L_PER_KG;
      const target = Math.min(cap * 0.3, Math.max(0, cap - honeyL));
      return { ...d, juiceType: kind, juiceL: target, waterL: Math.max(0, cap - honeyL - target) };
    });

  // when vessel changes, fit everything inside the new capacity proportionally
  const changeVessel = (kind: VesselKind) => {
    const cap = VESSELS[kind].capacityL;
    setDraft((d) => {
      const usedL = d.waterL + (d.juiceL ?? 0) + d.honeyKg * HONEY_DENSITY_L_PER_KG;
      if (usedL <= cap) return { ...d, vessel: kind };
      const scale = usedL > 0 ? cap / usedL : 1;
      return {
        ...d,
        vessel: kind,
        honeyKg: d.honeyKg * scale,
        waterL: d.waterL * scale,
        juiceL: (d.juiceL ?? 0) * scale,
      };
    });
  };

  const toggleSpice = (s: string) =>
    setDraft((d) => ({
      ...d,
      spices: d.spices.includes(s) ? d.spices.filter((x) => x !== s) : [...d.spices, s],
    }));

  // Style + target-sweetness seeding. Picking either chip solves backward for
  // honey/water/juice/yeast at the current vessel and applies it to the draft.
  // After applying, every slider is still free to nudge — style is just a
  // starting template, not a continuous binding.
  const currentStyle = (draft.style as StyleKind | undefined) ?? "custom";
  const currentSweetness = draft.targetSweetness ?? STYLE_PROFILES[currentStyle].defaultSweetness;

  const [styleWarning, setStyleWarning] = useState<string | null>(null);
  const seedFromStyle = (kind: StyleKind, sweetness?: number) => {
    if (kind === "custom") {
      // "Custom" just clears the tag — leave the user's current amounts alone.
      setDraft((d) => ({ ...d, style: "custom", targetSweetness: undefined }));
      setStyleWarning(null);
      return;
    }
    const styleProfile = STYLE_PROFILES[kind];
    const wantSweetness = sweetness ?? styleProfile.defaultSweetness;
    // For melomel preserve the user's existing juice pick if any (they may
    // have chosen tart cherry / pomegranate already); otherwise let the style
    // dictate.
    setDraft((d) => {
      const carryJuice = kind === "melomel" && d.juiceType ? d.juiceType : undefined;
      const solved = solveRecipe({
        vesselCapacityL: VESSELS[d.vessel].capacityL,
        style: kind,
        targetSweetness: wantSweetness,
        juiceType: carryJuice,
      });
      setStyleWarning(solved.warning ?? null);
      return applySolvedRecipe(d, solved, kind);
    });
  };

  return (
    <form
      className="pixel-card p-5 sm:p-6 grid gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      {!initial ? (
        // New batches only: a one-line nudge for first-time brewers. Hidden on
        // edit so existing brewers aren't pestered.
        <p className="text-xs text-[var(--ink-soft)] flex items-baseline gap-2 flex-wrap">
          <span className="text-[var(--muted)]">First batch?</span>
          <BuyLink item={AFFILIATE_KITS[0]} text="Get a 1-gallon starter kit (vessel, airlock, hydrometer, ingredients)" />
        </p>
      ) : null}
      <div className="grid sm:grid-cols-[180px,1fr] gap-6 items-start">
        {/* live pixel preview */}
        <div className="mx-auto sm:mx-0 sm:sticky sm:top-4 text-center">
          <div className="pixel-card-sm p-3 inline-block bg-[var(--bg)]">
            <SpriteVessel
              vessel={draft.vessel}
              honeyType={draft.honeyType}
              juiceType={draft.juiceType}
              juiceL={draft.juiceL}
              liters={totalL}
              phase="lag"
              size={150}
            />
          </div>
          <p className="text-xs text-[var(--muted)] mt-2">
            {isEmpty
              ? "empty — add honey + water (or juice)"
              : `${u.toDisplayVolume(totalL).toFixed(1)} ${u.volume} in a ${u.toDisplayVolume(vessel.capacityL).toFixed(1)} ${u.volume} vessel`}
          </p>
        </div>

        {/* inputs */}
        <div className="grid gap-5">
          <Field label="Batch name" htmlFor="name">
            <input
              id="name"
              className="in"
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </Field>

          {/* Vessel cards — chosen FIRST because every slider below is expressed
              as a fraction of vessel capacity (the "VESSEL FULL" tag, the
              capacity readout). Picking the container anchors everything. */}
          <Field label="Vessel">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(VESSELS).map((v) => (
                <button
                  key={v.kind}
                  type="button"
                  aria-pressed={draft.vessel === v.kind}
                  onClick={() => changeVessel(v.kind as VesselKind)}
                  className="opt p-2 flex flex-col items-center gap-1 text-center"
                >
                  <SpriteVessel
                    vessel={v.kind as VesselKind}
                    honeyType={draft.honeyType}
                    liters={v.capacityL * 0.6}
                    phase="lag"
                    size={40}
                    animated={false}
                  />
                  <span className="text-xs font-semibold leading-tight">{v.label}</span>
                  <span className="text-[10px] text-[var(--muted)]">{v.capacityL.toFixed(1)} L</span>
                </button>
              ))}
            </div>
            <div className="mt-1">
              <BuyLink item={AFFILIATE_VESSEL[draft.vessel]} text={`Buy this ${VESSELS[draft.vessel].label.toLowerCase()}`} />
            </div>
          </Field>

          {/* Style + target-sweetness picker — backward-designs the recipe at
              the vessel chosen above (so seeded amounts have a real volume to
              scale into). */}
          <StylePicker
            style={currentStyle}
            targetSweetness={currentSweetness}
            onPickStyle={(k) => seedFromStyle(k)}
            onPickSweetness={(s) => seedFromStyle(currentStyle, s)}
          />
          {styleWarning ? (
            <p className="text-xs alert-warn rounded-md px-2.5 py-1.5">
              {styleWarning}
            </p>
          ) : null}

          {/* Honey type */}
          <Field label="Honey">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(HONEYS).map((h) => (
                <button
                  key={h.type}
                  type="button"
                  aria-pressed={draft.honeyType === h.type}
                  onClick={() => update("honeyType", h.type as HoneyType)}
                  className="opt p-2 flex items-center gap-2 text-left"
                >
                  <span
                    aria-hidden
                    className="inline-block shrink-0 rounded-sm border border-[var(--ink)]"
                    style={{ width: 20, height: 20, background: h.color }}
                  />
                  <span className="text-sm font-semibold leading-tight">{h.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">{HONEYS[draft.honeyType].note}</p>
            <div className="mt-1">
              <BuyLink item={AFFILIATE_HONEY[draft.honeyType]} />
            </div>
          </Field>

          {/* Juice picker (optional — for melomels) */}
          <Field label="Fruit juice (optional)">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={!draft.juiceType}
                onClick={() => setJuiceType(undefined)}
                className="opt px-2.5 py-1 text-xs font-semibold"
              >
                {!draft.juiceType ? "✓ " : ""}None
              </button>
              {Object.values(JUICES).map((j) => (
                <button
                  key={j.kind}
                  type="button"
                  aria-pressed={draft.juiceType === j.kind}
                  onClick={() => setJuiceType(j.kind)}
                  className="opt px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-sm border border-[var(--ink)]"
                    style={{ background: j.color }}
                  />
                  {j.label}
                </button>
              ))}
            </div>
            {draft.juiceType ? (
              <>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {JUICES[draft.juiceType].note} <span className="text-[var(--ink-soft)]">≈ {JUICES[draft.juiceType].typicalBrix}° Brix typical</span>
                </p>
                <div className="mt-1">
                  <BuyLink item={AFFILIATE_JUICE[draft.juiceType]} />
                </div>
              </>
            ) : (
              <p className="text-xs text-[var(--muted)] mt-1">Substitute or supplement water with juice to make a melomel.</p>
            )}
          </Field>

          {/* Fill the vessel. Sliders share its capacity — raising one reduces
              the others proportionally; at capacity the slider stops. Honey is
              entered in weight but counted in volume against the vessel. */}
          <p className="eyebrow text-[var(--ink-soft)]">
            Fill the {u.toDisplayVolume(vessel.capacityL).toFixed(1)} {u.volume} {vessel.shape === "bucket" ? "bucket" : "jar"}
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <CapSlider
              id="honeyKg"
              label="Honey"
              unit={u.weight}
              displayValue={u.toDisplayWeight(draft.honeyKg)}
              displayMax={u.toDisplayWeight(6)}
              step={0.1}
              displayAtCapacity={atCapacity && draft.honeyKg > 0}
              onChange={(displayVal) => setHoneyKg(u.fromDisplayWeight(displayVal))}
            />
            <CapSlider
              id="waterL"
              label="Water"
              unit={u.volume}
              displayValue={u.toDisplayVolume(draft.waterL)}
              displayMax={u.toDisplayVolume(vessel.capacityL)}
              step={0.1}
              displayAtCapacity={atCapacity && draft.waterL > 0}
              onChange={(displayVal) => setWaterL(u.fromDisplayVolume(displayVal))}
            />
            {draft.juiceType ? (
              <CapSlider
                id="juiceL"
                label={`Juice (${JUICES[draft.juiceType].label})`}
                unit={u.volume}
                displayValue={u.toDisplayVolume(draft.juiceL ?? 0)}
                displayMax={u.toDisplayVolume(vessel.capacityL)}
                step={0.1}
                displayAtCapacity={atCapacity && (draft.juiceL ?? 0) > 0}
                onChange={(displayVal) => setJuiceL(u.fromDisplayVolume(displayVal))}
              />
            ) : null}
          </div>

          {/* Capacity readout */}
          <p className="text-xs text-[var(--muted)]">
            {u.toDisplayVolume(totalL).toFixed(2)} / {u.toDisplayVolume(vessel.capacityL).toFixed(2)} {u.volume} used
            {atCapacity ? <strong className="text-[var(--warn)]"> · at capacity</strong> : null}
          </p>

          {/* Yeast cards */}
          <Field label="Yeast">
            <div className="grid grid-cols-2 gap-2">
              {Object.values(YEASTS).map((y) => (
                <button
                  key={y.strain}
                  type="button"
                  aria-pressed={draft.yeast === y.strain}
                  onClick={() => update("yeast", y.strain as YeastStrain)}
                  className="opt p-2 grid gap-1 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{y.strain}</span>
                    <span className="text-[10px] font-mono border border-[var(--line)] rounded px-1.5 text-[var(--ink-soft)]">
                      {Math.round(y.attenuationPct * 100)}%
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] leading-snug">{y.note}</span>
                </button>
              ))}
            </div>
            <div className="mt-1">
              <BuyLink item={AFFILIATE_YEAST[draft.yeast]} />
            </div>
          </Field>

          {/* Yeast nitrogen need (drives the nutrient schedule) */}
          <Field label="Yeast nitrogen need (for nutrients)">
            <div className="flex gap-2">
              {NITROGEN_OPTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={(draft.nitrogenNeed ?? defaultNitrogenNeed(draft.yeast)) === n}
                  onClick={() => update("nitrogenNeed", n)}
                  className="opt px-3 py-1.5 text-xs font-semibold"
                >
                  {NITROGEN_NEED_LABELS[n]}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              Defaults from the yeast; adjust if you know its demand.
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <BuyLink item={AFFILIATE_NUTRIENTS[0]} text="Buy Fermaid-O" />
              <BuyLink item={AFFILIATE_NUTRIENTS[2]} text="Buy Go-Ferm" />
            </div>
          </Field>

          {/* Measured OG (optional override) */}
          <Field label="Measured OG (hydrometer, optional)" htmlFor="measuredOG">
            <div className="flex gap-2 items-center">
              <input
                id="measuredOG"
                type="number"
                step="0.001"
                min="1.000"
                max="1.200"
                className="in font-mono w-32"
                value={draft.measuredOG ?? ""}
                placeholder="e.g. 1.092"
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    measuredOG: v === "" ? undefined : Number(v),
                  }));
                }}
              />
              {draft.measuredOG != null ? (
                <button
                  type="button"
                  className="text-xs underline text-[var(--muted)] hover:text-[var(--ink)]"
                  onClick={() => setDraft((d) => ({ ...d, measuredOG: undefined }))}
                >
                  clear
                </button>
              ) : null}
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              A hydrometer reading of your must overrides the recipe estimate.
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <BuyLink item={AFFILIATE_HYDROMETER[0]} text="Buy a triple-scale hydrometer" />
              <BuyLink item={AFFILIATE_HYDROMETER[1]} text="+ test jar" />
            </div>
          </Field>

          {/* Spices */}
          <Field label="Spices / additions (optional)">
            <div className="flex flex-wrap gap-2">
              {COMMON_SPICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={draft.spices.includes(s)}
                  onClick={() => toggleSpice(s)}
                  className="opt px-2.5 py-1 text-xs font-semibold"
                >
                  {draft.spices.includes(s) ? "✓ " : "+ "}{s}
                </button>
              ))}
            </div>
            <input
              className="in mt-2"
              value={draft.spices.join(", ")}
              onChange={(e) =>
                update("spices", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
              }
              placeholder="or type your own, comma-separated"
            />
            {draft.spices.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {draft.spices
                  .map((s) => ({ s, item: AFFILIATE_SPICE[s.toLowerCase()] }))
                  .filter((x) => x.item)
                  .map(({ s, item }) => (
                    <BuyLink key={s} item={item} text={`Buy ${item!.label.toLowerCase()}`} />
                  ))}
              </div>
            ) : null}
          </Field>
        </div>
      </div>

      {/* Spec sheet — one consolidated table + visual; replaces the prior
          separate ProjectionStats + FlavorSummary blocks. */}
      <div className="border-t border-[var(--line)] pt-4">
        {isEmpty ? (
          <p className="text-sm text-[var(--muted)]">
            Add honey and water (or juice) to see the spec sheet.
          </p>
        ) : (
          <SpecSheet
            mead={draft}
            startingGravity={sg}
            estFinalGravity={estFG}
            estABV={estABV}
          />
        )}
      </div>

      {/* Things every batch needs that the form doesn't itself ask for — kept
          up by the recipe/spec sheet so they're seen while planning, not buried
          at the bottom. Sanitiser is the most-overlooked, hence first. */}
      <div className="grid gap-2">
        <p className="eyebrow text-[var(--ink-soft)]">Don&apos;t forget for brew day</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <BuyLink item={AFFILIATE_SANITIZER[0]} text="Buy Star San (sanitiser)" />
          <BuyLink item={AFFILIATE_AIRLOCK[0]} text="Buy 3-piece airlock" />
          <BuyLink item={AFFILIATE_TRANSFER[1]} text="Buy funnel + strainer" />
          <BuyLink item={AFFILIATE_TRANSFER[0]} text="Buy auto-siphon (for racking)" />
        </div>
        <p className="text-[11px] text-[var(--muted)]">
          <a href="/gear" className="underline">See the full gear list →</a>
        </p>
      </div>

      {!isEmpty ? (
        <div className="border-t border-[var(--line)] pt-4">
          <NutrientSchedule mead={draft} />
        </div>
      ) : null}

      {!isEmpty
        ? fermentationRisks(sg, YEASTS[draft.yeast]).map((r) => (
            <p
              key={r.kind}
              className="text-sm alert-warn rounded-md px-3 py-2"
            >
              {r.message}
            </p>
          ))
        : null}

      <div className="flex gap-3 justify-end">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn-ghost px-4 py-2">
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn px-5 py-2">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="eyebrow text-[var(--ink-soft)]">{label}</label>
      {children}
    </div>
  );
}

// Capacity-aware slider: shows the value in the user's chosen units, and uses
// a high-resolution range (step) so push-down feels smooth. Bounding is enforced
// by the parent — if a value would overflow, the parent reduces the others.
function CapSlider({
  id, label, unit, displayValue, displayMax, step, displayAtCapacity, onChange,
}: {
  id: string;
  label: string;
  unit: string;
  displayValue: number;
  displayMax: number;
  step: number;
  displayAtCapacity: boolean;
  onChange: (displayVal: number) => void;
}) {
  const safeMax = Math.max(step, displayMax);
  // The number field can be typed directly. We keep a local string buffer while
  // it's focused so capacity push-down (which rewrites displayValue) doesn't
  // clobber what the user is typing; on blur we resync to the committed value.
  const [text, setText] = useState(displayValue.toFixed(2));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setText(displayValue.toFixed(2));
  }, [displayValue, editing]);
  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (Number.isFinite(n)) onChange(Math.max(0, n));
  };
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="eyebrow text-[var(--ink-soft)]">
          {label}
          {displayAtCapacity ? <span className="ml-2 text-[10px] font-semibold text-[var(--warn)]">vessel full</span> : null}
        </label>
        <span className="flex items-baseline gap-1">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={step}
            aria-label={`${label} amount in ${unit}`}
            className="w-16 bg-transparent text-right font-mono text-base tabular-nums border-b border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
            value={text}
            onFocus={() => setEditing(true)}
            onChange={(e) => { setText(e.target.value); commit(e.target.value); }}
            onBlur={() => { setEditing(false); commit(text); }}
          />
          <span className="font-mono text-sm text-[var(--muted)]">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={safeMax}
        step={step}
        value={Math.min(displayValue, safeMax)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
        <span>0 {unit}</span>
        <span>{safeMax.toFixed(1)} {unit}</span>
      </div>
    </div>
  );
}
