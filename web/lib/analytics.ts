// Thin wrapper over Vercel Web Analytics custom events.
//
// Vercel's track() is a no-op in development and on non-Vercel hosts, and only
// reports once the <Analytics /> component (in app/layout.tsx) is mounted, so
// no env var or gating is needed here. We keep the typeof-window guard so the
// helpers are safe to reference from any module without crashing during SSR.

import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null>;

export function track(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  vercelTrack(event, props);
}

export const events = {
  batchCreated: (props: { yeast: string; vessel: string; honey_type: string }) =>
    track("batch_created", props),
  observationLogged: (props: { has_gravity: boolean; phase: string }) =>
    track("observation_logged", props),
  batchViewed: (props: { phase: string; age_days: number }) =>
    track("batch_viewed", props),
  sampleLoaded: () => track("sample_loaded"),
};
