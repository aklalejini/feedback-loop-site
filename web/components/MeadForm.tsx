"use client";
import { useState } from "react";
import {
  type Mead,
  type HoneyType,
  type YeastStrain,
  type VesselKind,
  HONEYS,
  YEASTS,
  VESSELS,
  startingGravity,
  blankMead,
} from "@/lib/mead";
import { VesselSVG } from "@/components/VesselSVG";

interface Props {
  initial?: Mead;
  onSubmit: (mead: Mead) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function MeadForm({ initial, onSubmit, onCancel, submitLabel = "Save batch" }: Props) {
  const [draft, setDraft] = useState<Mead>(() => initial ?? blankMead());

  const update = <K extends keyof Mead>(key: K, value: Mead[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const sg = startingGravity(draft);
  const estFG = 1 + (sg - 1) * (1 - YEASTS[draft.yeast].attenuationPct);
  const estABV = Math.max(0, (sg - estFG) * 131.25);
  const vessel = VESSELS[draft.vessel];
  const totalL = draft.waterL + draft.honeyKg * 0.7;
  const overCapacity = totalL > vessel.capacityL * 0.95;

  return (
    <form
      className="grid gap-4 border border-[var(--line)] rounded-lg p-5 bg-white/40"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      <div className="grid sm:grid-cols-[160px,1fr] gap-5 items-start">
        <div className="mx-auto sm:mx-0 sm:sticky sm:top-4">
          <VesselSVG mead={draft} phase="lag" size={150} />
          <p className="text-xs text-center text-[var(--muted)] mt-1">
            {totalL <= 0.01 ? "empty — add honey + water" : `${totalL.toFixed(1)} L of ${vessel.capacityL.toFixed(1)} L`}
          </p>
        </div>
        <div className="grid gap-4">

      <div className="grid gap-1">
        <label htmlFor="name" className="text-sm font-medium">Batch name</label>
        <input
          id="name"
          className="border border-[var(--line)] rounded px-3 py-2 bg-white"
          value={draft.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="grid gap-1">
          <label htmlFor="honeyType" className="text-sm font-medium">Honey</label>
          <select
            id="honeyType"
            className="border border-[var(--line)] rounded px-3 py-2 bg-white"
            value={draft.honeyType}
            onChange={(e) => update("honeyType", e.target.value as HoneyType)}
          >
            {Object.values(HONEYS).map((h) => (
              <option key={h.type} value={h.type}>{h.label}</option>
            ))}
          </select>
          <p className="text-xs text-[var(--muted)]">{HONEYS[draft.honeyType].note}</p>
        </div>

        <div className="grid gap-1">
          <label htmlFor="vessel" className="text-sm font-medium">Vessel</label>
          <select
            id="vessel"
            className="border border-[var(--line)] rounded px-3 py-2 bg-white"
            value={draft.vessel}
            onChange={(e) => update("vessel", e.target.value as VesselKind)}
          >
            {Object.values(VESSELS).map((v) => (
              <option key={v.kind} value={v.kind}>{v.label} ({v.capacityL.toFixed(1)} L)</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="honeyKg" className="text-sm font-medium">Honey (kg)</label>
          <input
            id="honeyKg"
            type="number"
            min={0}
            step={0.1}
            className="border border-[var(--line)] rounded px-3 py-2 bg-white"
            value={draft.honeyKg}
            onChange={(e) => update("honeyKg", Number(e.target.value))}
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="waterL" className="text-sm font-medium">Water (L)</label>
          <input
            id="waterL"
            type="number"
            min={0}
            step={0.1}
            className="border border-[var(--line)] rounded px-3 py-2 bg-white"
            value={draft.waterL}
            onChange={(e) => update("waterL", Number(e.target.value))}
          />
        </div>

        <div className="grid gap-1 sm:col-span-2">
          <label htmlFor="yeast" className="text-sm font-medium">Yeast</label>
          <select
            id="yeast"
            className="border border-[var(--line)] rounded px-3 py-2 bg-white"
            value={draft.yeast}
            onChange={(e) => update("yeast", e.target.value as YeastStrain)}
          >
            {Object.values(YEASTS).map((y) => (
              <option key={y.strain} value={y.strain}>
                {y.strain} — {Math.round(y.attenuationPct * 100)}% attenuation
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--muted)]">{YEASTS[draft.yeast].note}</p>
        </div>

        <div className="grid gap-1 sm:col-span-2">
          <label htmlFor="spices" className="text-sm font-medium">Spices / additions (comma-separated, optional)</label>
          <input
            id="spices"
            className="border border-[var(--line)] rounded px-3 py-2 bg-white"
            value={draft.spices.join(", ")}
            onChange={(e) =>
              update(
                "spices",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              )
            }
            placeholder="cinnamon stick, vanilla bean, orange peel"
          />
        </div>
      </div>

        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm border-t border-[var(--line)] pt-4">
        <Stat label="Starting gravity" value={totalL <= 0.01 ? "—" : sg.toFixed(3)} />
        <Stat label="Est. final gravity" value={totalL <= 0.01 ? "—" : estFG.toFixed(3)} />
        <Stat label="Est. ABV" value={totalL <= 0.01 ? "—" : `${estABV.toFixed(1)}%`} />
      </div>

      {overCapacity ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          Total volume ({totalL.toFixed(1)} L) exceeds 95% of vessel capacity ({vessel.capacityL.toFixed(1)} L). Leave headspace for foaming.
        </p>
      ) : null}

      <div className="flex gap-3 justify-end">
        {onCancel ? (
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded border border-[var(--line)] bg-white">
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="px-4 py-2 rounded bg-[var(--accent)] text-white font-medium hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
