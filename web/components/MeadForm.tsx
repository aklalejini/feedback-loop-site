"use client";
import { useState } from "react";
import {
  type Mead,
  type HoneyType,
  type YeastStrain,
  type VesselKind,
  type NitrogenNeed,
  HONEYS,
  YEASTS,
  VESSELS,
  startingGravity,
  blankMead,
  fermentationRisks,
  gravitySource,
} from "@/lib/mead";
import { defaultNitrogenNeed, NITROGEN_NEED_LABELS } from "@/lib/nutrients";
import { NutrientSchedule } from "@/components/NutrientSchedule";
import { ProjectionStats } from "@/components/ProjectionStats";
import { SpriteVessel } from "@/components/SpriteVessel";

const NITROGEN_OPTS: NitrogenNeed[] = ["low", "medium", "high"];

interface Props {
  initial?: Mead;
  onSubmit: (mead: Mead) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const HONEY_DENSITY = 0.7; // L per kg, matches lib/mead
const COMMON_SPICES = ["cinnamon", "vanilla bean", "orange peel", "clove", "ginger", "elderberry"];

export function MeadForm({ initial, onSubmit, onCancel, submitLabel = "Save batch" }: Props) {
  const [draft, setDraft] = useState<Mead>(() => initial ?? blankMead());

  const update = <K extends keyof Mead>(key: K, value: Mead[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const vessel = VESSELS[draft.vessel];
  const totalL = draft.waterL + draft.honeyKg * HONEY_DENSITY;
  const isEmpty = totalL <= 0.01;
  const sg = startingGravity(draft);
  const estFG = 1 + (sg - 1) * (1 - YEASTS[draft.yeast].attenuationPct);
  const estABV = Math.max(0, (sg - estFG) * 131.25);
  const headspace = vessel.capacityL - totalL;

  // when vessel changes, keep water within the new capacity
  const changeVessel = (kind: VesselKind) => {
    const cap = VESSELS[kind].capacityL;
    setDraft((d) => ({ ...d, vessel: kind, waterL: Math.min(d.waterL, cap) }));
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
            {isEmpty ? "empty — add honey + water" : `${totalL.toFixed(1)} L in a ${vessel.capacityL.toFixed(1)} L vessel`}
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

          {/* Amount sliders */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Slider
              id="honeyKg"
              label="Honey"
              unit="kg"
              min={0}
              max={6}
              step={0.1}
              value={draft.honeyKg}
              onChange={(v) => update("honeyKg", v)}
            />
            <Slider
              id="waterL"
              label="Water"
              unit="L"
              min={0}
              max={Number(vessel.capacityL.toFixed(1))}
              step={0.1}
              value={draft.waterL}
              onChange={(v) => update("waterL", v)}
            />
          </div>

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
      <div className="border-t border-[var(--line)] pt-4">
        {isEmpty ? (
          <p className="text-sm text-[var(--muted)]">
            Add honey and water to see gravity, ABV, and a nutrient schedule.
          </p>
        ) : (
          <ProjectionStats
            startingGravity={sg}
            estFinalGravity={estFG}
            estABV={estABV}
            source={gravitySource(draft)}
          />
        )}
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
          Only {Math.max(0, headspace).toFixed(1)} L of headspace left — leave room so foaming mead doesn&apos;t push into the airlock.
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

function Slider({
  id, label, unit, min, max, step, value, onChange,
}: {
  id: string; label: string; unit: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="eyebrow text-[var(--ink-soft)]">{label}</label>
        <span className="font-mono text-base tabular-nums">{value.toFixed(1)} {unit}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(value, max)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}
