"use client";
import { useEffect, useRef, useState } from "react";
import { computeAbv } from "@/lib/calculators";
import { events } from "@/lib/analytics";

// Hydrometer ABV calculator. Two readings in, ABV out — the result sits
// directly under the inputs (mobile: key output near input). Implausible
// readings warn but still compute; FG > OG is an error with an explanation,
// never a negative ABV.
export function AbvCalculator() {
  const [ogText, setOgText] = useState("");
  const [fgText, setFgText] = useState("");
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  const og = parseFloat(ogText);
  const fg = parseFloat(fgText);
  const haveBoth = Number.isFinite(og) && Number.isFinite(fg);
  const result = haveBoth ? computeAbv(og, fg) : null;
  const hasResult = result != null && result.error == null;

  const touch = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      events.calcStarted("abv");
    }
  };

  useEffect(() => {
    if (hasResult && !completedRef.current) {
      completedRef.current = true;
      events.calcCompleted("abv");
    }
  }, [hasResult]);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <GravityInput
          id="og"
          label="Original gravity (OG)"
          placeholder="1.092"
          value={ogText}
          onChange={(v) => { touch(); setOgText(v); }}
        />
        <GravityInput
          id="fg"
          label="Final gravity (FG)"
          placeholder="1.004"
          value={fgText}
          onChange={(v) => { touch(); setFgText(v); }}
        />
      </div>

      <div className="pixel-card-sm p-4 grid gap-2" role="status" aria-live="polite">
        {!haveBoth ? (
          <p className="text-sm text-[var(--muted)]">
            Enter both hydrometer readings to see the alcohol estimate.
          </p>
        ) : result!.error ? (
          <p className="text-sm alert-warn rounded-md px-3 py-2">{result!.error}</p>
        ) : (
          <>
            <p className="font-display text-4xl leading-none">
              {result!.abv.toFixed(1)}
              <span className="text-xl">% ABV</span>
            </p>
            <p className="text-xs text-[var(--muted)]">
              (OG − FG) × 131.25 — the standard homebrew approximation.
            </p>
            {result!.highGravity ? (
              <p className="text-xs text-[var(--ink-soft)]">
                High-gravity estimate: <strong className="font-mono">{result!.abvHighGravity.toFixed(1)}%</strong> — an
                empirical formula for stronger ferments, where density change isn&apos;t linear with alcohol.
              </p>
            ) : null}
            {result!.warnings.map((w) => (
              <p key={w} className="text-xs alert-warn rounded-md px-2.5 py-1.5">{w}</p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function GravityInput({
  id, label, placeholder, value, onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
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
        step="0.001"
        placeholder={placeholder}
        className="in font-mono text-2xl py-3 text-center tabular-nums"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
