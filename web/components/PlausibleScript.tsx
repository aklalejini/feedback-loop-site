"use client";
import Script from "next/script";

export function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST ?? "https://plausible.io";
  if (!domain) return null;
  return (
    <Script
      strategy="afterInteractive"
      data-domain={domain}
      src={`${host}/js/script.js`}
    />
  );
}
