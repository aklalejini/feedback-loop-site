import Script from "next/script";

// Google Analytics 4. Loaded with next/script (strategy: afterInteractive) so
// it never blocks page paint. Only mounts in production builds — dev/preview
// traffic would skew the data otherwise. The measurement ID can be swapped via
// the NEXT_PUBLIC_GA_MEASUREMENT_ID env var in Vercel without a code change;
// falls back to the live meadbook.com property if unset.
const ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-4GDMREWZFE";

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ID}');`}
      </Script>
    </>
  );
}
