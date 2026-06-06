"use client";
import { useEffect, useState } from "react";
import { loadUnits, saveUnits, type UnitSystem } from "@/lib/units";

// Listens for a custom "units-changed" event so multiple toggles + the form
// stay in sync without a context.
const EVENT = "units-changed";

export function useUnits(): [UnitSystem, (u: UnitSystem) => void] {
  const [units, setUnits] = useState<UnitSystem>("metric");
  useEffect(() => {
    setUnits(loadUnits());
    const onChange = (e: Event) => setUnits((e as CustomEvent<UnitSystem>).detail);
    window.addEventListener(EVENT, onChange as EventListener);
    return () => window.removeEventListener(EVENT, onChange as EventListener);
  }, []);
  const set = (u: UnitSystem) => {
    saveUnits(u);
    setUnits(u);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: u }));
  };
  return [units, set];
}

export function UnitsToggle({ className = "" }: { className?: string }) {
  const [units, setUnits] = useUnits();
  const opt = (value: UnitSystem, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setUnits(value)}
      aria-pressed={units === value}
      className={`px-2 py-1 text-[11px] font-semibold rounded-sm transition-colors ${
        units === value
          ? "bg-[var(--ink)] text-[var(--card)]"
          : "text-[var(--muted)] hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded border border-[var(--line)] bg-[var(--card)] p-0.5 ${className}`}
      role="group"
      aria-label="Units"
    >
      {opt("metric", "kg · L")}
      {opt("imperial", "lb · gal")}
    </div>
  );
}
