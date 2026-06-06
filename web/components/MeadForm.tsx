"use client";
import { useState } from "react";
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
  gravitySource,
  HONEY_DENSITY_L_PER_KG,
} from "@/lib/mead";
import { defaultNitrogenNeed, NITROGEN_NEED_LABELS } from "@/lib/nutrients";
import { applyHoneyChangeKg, applyJuiceChangeL, applyWaterChangeL } from "@/lib/capacity";
import { unitsFor } from "@/lib/units";
import { NutrientSchedule } from "@/components/NutrientSchedule";
import { SpriteVessel } from "@/components/SpriteVessel";
import { useUnits } from "@/components/UnitsToggle";

const NITROGEN_OPTS: NitrogenNeed[] = ["low", "medium", "high"];

interface Props {
  initial?: Mead;
  onSubmit: (mead: Mead) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const COMMON_SPICES = ["cinnamon", "vanilla bean", "orange peel", "clove", "ginger", "elderberry"];

export function MeadForm({ initial, onSubmit, onCancel, submitLabel = "Save batch" }: Props) {
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
    setDraft((d) => ({
      ...d,
      juiceType: kind,
      // If picking a juice for the first time, seed a small default volume; if
      // clearing it, drop juice volume too. Push-down via setter keeps capacity.
      juiceL: kind == null ? 0 : (d.juiceL && d.juiceL > 0 ? d.juiceL : Math.min(0.5, VESSELS[d.vessel].capacityL - (d.waterL + d.honeyKg * HONEY_DENSITY_L_PER_KG))),
    }));

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

  return (
    <form
      className="pixel-card p-5 sm:p-6 grid gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      <div className="grid sm:grid-cols-[180px,1fr] gap-6 items-start">
        {/* live pixel preview */}
        <div className="mx-auto sm:mx-0 sm:sticky sm:top-4 text-center">
          <div className="pixel-card-sm p-3 inline-block bg-[var(--bg)]">
            <SpriteVessel
              vessel={draft.vessel}
              honeyType={draft.honeyType}
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

          {/* Honey cards */}
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
          </Field>

          {/* Vessel cards */}
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
              <p className="text-xs text-[var(--muted)] mt-1">
                {JUICES[draft.juiceType].note} <span className="text-[var(--ink-soft)]">≈ {JUICES[draft.juiceType].typicalBrix}° Brix typical</span>
              </p>
            ) : (
              <p className="text-xs text-[var(--muted)] mt-1">Substitute or supplement water with juice to make a melomel.</p>
            )}
          </Field>

          {/* Amount sliders — capacity-aware push-down (raising one reduces the
              others proportionally; at capacity the slider stops). Honey is
              in mass but counted in volume against the vessel. */}
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
            {atCapacity ? <strong className="text-amber-900"> · at capacity</strong> : null}
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
          </Field>
        </div>
      </div>

      {/* stats */}
      <div className="grid gap-1 border-t border-[var(--line)] pt-4">
        <p className="eyebrow text-[var(--ink-soft)]">
          {gravitySource(draft) === "measured" ? "Measured" : "Recipe estimate"}
        </p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat
            label={gravitySource(draft) === "measured" ? "Measured OG" : "Starting gravity"}
            value={isEmpty ? "—" : sg.toFixed(3)}
          />
          <Stat label="Est. final gravity" value={isEmpty ? "—" : estFG.toFixed(3)} />
          <Stat label="Est. ABV" value={isEmpty ? "—" : `${estABV.toFixed(1)}%`} />
        </div>
        <p className="text-xs text-[var(--muted)] mt-1">
          {gravitySource(draft) === "measured"
            ? "Using your hydrometer reading. FG and ABV are still estimates from yeast attenuation."
            : "Estimated from the recipe. A hydrometer reading of your actual must is more accurate."}
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
              className="text-sm text-amber-900 bg-amber-50 border border-amber-300 rounded-md px-3 py-2"
            >
              {r.message}
            </p>
          ))
        : null}

      {headspace < vessel.capacityL * 0.05 && !isEmpty ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-300 rounded-md px-3 py-2">
          Only {u.toDisplayVolume(Math.max(0, headspace)).toFixed(2)} {u.volume} of headspace left — leave room so foaming mead doesn&apos;t push into the airlock.
        </p>
      ) : null}

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
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="eyebrow text-[var(--ink-soft)]">
          {label}
          {displayAtCapacity ? <span className="ml-2 text-[10px] font-semibold text-amber-900">vessel full</span> : null}
        </label>
        <span className="font-mono text-base tabular-nums">{displayValue.toFixed(2)} {unit}</span>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="eyebrow">{label}</span>
      <span className="font-mono text-base">{value}</span>
    </div>
  );
}
