import type { Mead } from "./mead";

const KEY = "feedback-loop-site:meads:v1";

export function loadMeads(): Mead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Mead[];
  } catch {
    return [];
  }
}

export function saveMeads(meads: Mead[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(meads));
}

export function upsertMead(mead: Mead): Mead[] {
  const meads = loadMeads();
  const idx = meads.findIndex((m) => m.id === mead.id);
  if (idx === -1) meads.push(mead);
  else meads[idx] = mead;
  saveMeads(meads);
  return meads;
}

export function deleteMead(id: string): Mead[] {
  const meads = loadMeads().filter((m) => m.id !== id);
  saveMeads(meads);
  return meads;
}

export function getMead(id: string): Mead | undefined {
  return loadMeads().find((m) => m.id === id);
}
