import type { Affiliate } from "@/lib/affiliate";

interface Props {
  item: Affiliate | undefined;
  /** Optional override for the visible link text. Defaults to "Buy <item.label>". */
  text?: string;
  /** "inline" (default, tiny chip) or "row" (full row with label + blurb). */
  variant?: "inline" | "row";
  className?: string;
}

// Renders an outbound affiliate link with rel="sponsored nofollow noopener"
// per Google's affiliate-link guidance. Always opens in a new tab so the
// maker doesn't lose their in-progress batch. Returns null if no product is
// registered for the key — safe to drop in anywhere.
//
// Disclosure: the inline variant carries its own muted "(affiliate)" tag so
// every placement is disclosed next to the link (FTC proximity + the goal
// contract's "visibly disclosed inline" rule). The row variant relies on the
// /gear page's top + bottom disclosures instead of tagging every row.
export function BuyLink({ item, text, variant = "inline", className = "" }: Props) {
  if (!item) return null;
  const label = text ?? `Buy ${item.label}`;
  const a = (
    <a
      href={item.url}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={
        variant === "inline"
          ? `inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-glow)] hover:underline ${className}`
          : `flex items-baseline justify-between gap-3 text-[var(--ink)] no-underline group ${className}`
      }
    >
      {variant === "inline" ? (
        <>
          <span>{label}</span>
          <span aria-hidden>↗</span>
          <span className="font-normal text-[var(--muted)]">(affiliate)</span>
        </>
      ) : (
        <>
          <span className="flex-1">
            <span className="block font-display text-base group-hover:underline">{item.label}</span>
            {item.blurb ? <span className="block text-xs text-[var(--ink-soft)] mt-0.5">{item.blurb}</span> : null}
          </span>
          <span className="text-[11px] font-semibold text-[var(--accent-glow)] whitespace-nowrap">Shop ↗</span>
        </>
      )}
    </a>
  );
  return a;
}
