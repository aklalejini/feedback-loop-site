"use client";
import { useEffect, useRef, useState } from "react";
import { honeyToTarget, SWEETNESS_BANDS } from "@/lib/calculators";
import { events } from "@/lib/analytics";
import { unitsFor } from "@/lib/units";
import { useUnits } from "@/components/UnitsToggle";

// Backsweetening calculator. Batch volume (in the maker's chosen units) +
// current and target gravity → honey to add. The result always carries the
// stabilization warning: backsweetened mead referments in the bottle unless
// it's been stabilized, and that's a safety issue, not a style choice.
export function BacksweetenCalculator() {
  const [unitSystem] = useUnits();
  const u = unitsFor(unitSystem);
  const [volText, setVolText] = useState("");
  const [curText, setCurText] = useState("");
  const [tgtText, setTgtText] = useState("");
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  const volDisplay = parseFloat(volText);
  const cur = parseFloat(curText);
  const tgt = parseFloat(tgtText);
  const haveAll = Number.isFinite(volDisplay) && Number.isFinite(cur) && Number.isFinite(tgt);
  const result = haveAll ? honeyToTarget(u.fromDisplayVolume(volDisplay), cur, tgt) : null;
  const hasResult = result != null && result.error == null;

  const touch = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      events.calcStarted("backsweeten");
    }
  };

  useEffect(() => {
    if (hasResult && !completedRef.current) {
      completedRef.current = true;
      events.calcCompleted("backsweeten");
    }
  }, [hasResult]);

  const honeyDisplay = result ? u.toDisplayWeight(result.honeyKg) : 0;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <NumInput id="vol" label={`Batch volume (${u.volume})`} placeholder={u.volume === "L" ? "18.9" : "5"} step="0.1"
          value={volText} onChange={(v) => { touch(); setVolText(v); }} />
        <NumInput id="cur" label="Current gravity" placeholder="0.998" step="0.001"
          value={curText} onChange={(v) => { touch(); setCurText(v); }} />
        <NumInput id="tgt" label="Target gravity" placeholder="1.015" step="0.001"
          value={tgtText} onChange={(v) => { touch(); setTgtText(v); }} />
      </div>

      {/* AHA band chips seed the target; the field stays editable. */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="eyebrow text-[var(--ink-soft)]">Aim for</span>
        {SWEETNESS_BANDS.map((b) => (
          <button
            key={b.key}
            type="button"
            aria-pressed={parseFloat(tgtText) === b.target}
            onClick={() => { touch(); setTgtText(b.target.toFixed(3)); }}
            className="opt px-2.5 py-1 text-xs font-semibold"
          >
            {b.label} <span className="font-mono font-normal text-[var(--muted)]">{b.target.toFixed(3)}</span>
          </button>
        ))}
      </div>

      <div className="pixel-card-sm p-4 grid gap-2" role="status" aria-live="polite">
        {!haveAll ? (
          <p className="text-sm text-[var(--muted)]">
            Enter the batch volume and both gravities to see how much honey to add.
          </p>
        ) : result!.error ? (
          <p className="text-sm alert-warn rounded-md px-3 py-2">{result!.error}</p>
        ) : (
          <>
            <p className="font-display text-4xl leading-none">
              {honeyDisplay.toFixed(2)}
              <span className="text-xl"> {u.weight} honey</span>
            </p>
            <p className="text-xs text-[var(--muted)]">
              Adds ~{u.toDisplayVolume(result!.addedVolumeL).toFixed(2)} {u.volume} of volume
              (new total ~{u.toDisplayVolume(result!.newVolumeL).toFixed(2)} {u.volume}).
              Stir in gradually and re-check the gravity — perceived sweetness varies with acid,
              tannin, and alcohol.
            </p>
            {result!.warnings.map((w) => (
              <p key={w} className="text-xs alert-warn rounded-md px-2.5 py-1.5">{w}</p>
            ))}
            <p className="text-xs alert-warn rounded-md px-2.5 py-1.5">
              <strong>Stabilize before you sweeten.</strong> If viable yeast remains, this honey
              restarts fermentation — overcarbonated or bursting bottles. Sweeten only after
              stabilizing (potassium metabisulfite + sorbate), sterile filtration, or
              pasteurization, and confirm the gravity stays put before bottling.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function NumInput({
  id, label, placeholder, step, value, onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  step: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="eyebrow text-[var(--ink-soft)]">{label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        placeholder={placeholder}
        className="in font-mono text-xl py-3 text-center tabular-nums"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
