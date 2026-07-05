// Thin wrapper over the site's two blessed analytics sources (goal.yaml v3):
// every custom event fires to Vercel Web Analytics AND GA4, so the engaged-
// sessions metric can be read from either.
//
// Vercel's track() is a no-op in development and on non-Vercel hosts, and only
// reports once the <Analytics /> component (in app/layout.tsx) is mounted, so
// no env var or gating is needed here. GA4's gtag global is only defined once
// <GoogleAnalytics /> mounts (production only), hence the optional call. We
// keep the typeof-window guard so the helpers are safe to reference from any
// module without crashing during SSR.

import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null>;

export function track(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  vercelTrack(event, props);
  (window as { gtag?: (...args: unknown[]) => void }).gtag?.("event", event, props ?? {});
}

export const events = {
  batchCreated: (props: { yeast: string; vessel: string; honey_type: string }) =>
    track("batch_created", props),
  observationLogged: (props: { has_gravity: boolean; phase: string }) =>
    track("observation_logged", props),
  batchViewed: (props: { phase: string; age_days: number }) =>
    track("batch_viewed", props),
  sampleLoaded: (kind?: string) => track("sample_loaded", kind ? { kind } : undefined),
  nutrientAdded: () => track("nutrient_added"),
  // Standalone calculators: started = first input touched, completed = first
  // valid result shown. Both fire once per page view, so
  // calculator_completion_rate (goal.yaml) is completions / starts.
  calcStarted: (calc: string) => track("calc_started", { calc }),
  calcCompleted: (calc: string) => track("calc_completed", { calc }),
};
