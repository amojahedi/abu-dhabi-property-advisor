/** Small pure formatting helpers used across the UI. */

/** Format an AED amount with thousands separators, no decimals. */
export function formatAed(value: number): string {
  return `AED ${Math.round(value).toLocaleString("en-US")}`;
}

/** Compact AED for tight spaces, e.g. 1.13M / 950K. */
export function formatAedCompact(value: number): string {
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `AED ${Math.round(value / 1_000)}K`;
  return `AED ${Math.round(value)}`;
}

/** Format a percentage already expressed in percent units (e.g. 6.1 -> "6.1%"). */
export function formatPct(value: number, dp = 1): string {
  return `${value.toFixed(dp)}%`;
}

/** Title-case a hyphenated lifestyle tag, e.g. "schools-nearby" -> "Schools Nearby". */
export function humanizeTag(tag: string): string {
  return tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
