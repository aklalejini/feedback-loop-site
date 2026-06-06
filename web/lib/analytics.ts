// Thin Plausible wrapper. No-op when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is unset.

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void;
  }
}

export function track(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return;
  window.plausible?.(event, props ? { props } : undefined);
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
