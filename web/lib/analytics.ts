/**
 * OFFLINE FALLBACK ANALYTICS ONLY.
 *
 * These are faithful ports of the documented, deterministic finance formulas in
 * `src/ad_property_advisor/analytics.py`. They exist solely so the read-only
 * Communities and Market views still render when the Python API is unreachable
 * (e.g. a static deploy for reviewers). When the API IS reachable we always use
 * the server's computed numbers instead.
 *
 * This is NOT the recommendation scoring engine — that is never reimplemented in
 * TS. The live `/recommend` endpoint has no offline substitute.
 *
 * SYNTHETIC DATA / illustrative only — not investment advice.
 */

import type { Community, CommunityAnalytics, Unit } from "./types";

// Documented default assumptions (see analytics.py).
const MGMT_MAINTENANCE_PCT = 0.08; // of gross annual rent

export function pricePerSqft(u: Unit): number {
  return round(u.price_aed / u.size_sqft, 2);
}

export function grossRentalYield(u: Unit): number {
  return round((u.expected_annual_rent_aed / u.price_aed) * 100, 4);
}

function netOperatingIncome(u: Unit): number {
  const mgmt = u.expected_annual_rent_aed * MGMT_MAINTENANCE_PCT;
  return u.expected_annual_rent_aed - u.service_charge_aed_yr - mgmt;
}

export function netRentalYield(u: Unit): number {
  return round((netOperatingIncome(u) / u.price_aed) * 100, 4);
}

/** Deterministic, illustrative 5-year price/sqft trend — ports price_trend_5yr. */
export function priceTrend5yr(community: Community): number[] {
  const base = community.avg_price_per_sqft_aed;
  const rotation =
    community.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 5;
  const basePattern = [0.03, 0.05, 0.04, 0.06, 0.05];
  const pattern = [...basePattern.slice(rotation), ...basePattern.slice(0, rotation)];
  const series = [base];
  let val = base;
  for (const g of pattern.slice(0, 4)) {
    val = val * (1 + g);
    series.push(round(val, 2));
  }
  return series;
}

/** Aggregate per-community analytics from raw units — ports community_analytics. */
export function communityAnalytics(
  community: Community,
  units: Unit[],
): CommunityAnalytics {
  const commUnits = units.filter((u) => u.community_id === community.id);
  let avgPpsf: number;
  let avgGross: number;
  let avgNet: number;
  if (commUnits.length) {
    avgPpsf = round(mean(commUnits.map(pricePerSqft)), 2);
    avgGross = round(mean(commUnits.map(grossRentalYield)), 4);
    avgNet = round(mean(commUnits.map(netRentalYield)), 4);
  } else {
    avgPpsf = community.avg_price_per_sqft_aed;
    avgGross = 0;
    avgNet = 0;
  }
  return {
    community_id: community.id,
    unit_count: commUnits.length,
    avg_price_per_sqft_aed: avgPpsf,
    avg_gross_yield_pct: avgGross,
    avg_net_yield_pct: avgNet,
    price_trend_5yr_aed_per_sqft: priceTrend5yr(community),
  };
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function round(x: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
}
