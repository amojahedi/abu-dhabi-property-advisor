/**
 * Typed client for the Abu Dhabi Property Advisor FastAPI backend.
 *
 * Base URL is configurable via NEXT_PUBLIC_API_BASE_URL (default
 * http://localhost:8000). Every read-only call degrades gracefully to the
 * bundled synthetic data (see lib/localData.ts + lib/analytics.ts) when the API
 * is unreachable, so the UI renders standalone for reviewers. The live
 * `/recommend` call has NO offline substitute — it surfaces a clear error so
 * the caller can prompt the reviewer to start the API.
 */

import {
  communityAnalytics as computeCommunityAnalytics,
  grossRentalYield,
  netRentalYield,
  pricePerSqft,
} from "./analytics";
import { BUNDLED_COMMUNITIES, BUNDLED_UNITS } from "./localData";
import type {
  AnalyticsSummaryResponse,
  BuyerProfile,
  Community,
  CommunityAnalytics,
  RecommendResponse,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

/** How a given payload was sourced, so the UI can tell the reviewer. */
export type DataSource = "api" | "fallback";

export interface Sourced<T> {
  data: T;
  source: DataSource;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const TIMEOUT_MS = 4000;

async function getJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new ApiError(
        `Request to ${path} failed with ${res.status}`,
        res.status,
      );
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ---- Communities ------------------------------------------------------------

export async function getCommunities(): Promise<Sourced<Community[]>> {
  try {
    const json = await getJson<{ communities: Community[] }>("/communities");
    return { data: json.communities, source: "api" };
  } catch {
    return { data: BUNDLED_COMMUNITIES, source: "fallback" };
  }
}

export async function getCommunity(id: string): Promise<Sourced<Community | null>> {
  try {
    const json = await getJson<Community>(`/communities/${id}`);
    return { data: json, source: "api" };
  } catch {
    const found = BUNDLED_COMMUNITIES.find((c) => c.id === id) ?? null;
    return { data: found, source: "fallback" };
  }
}

export async function getCommunityAnalytics(
  id: string,
): Promise<Sourced<CommunityAnalytics | null>> {
  try {
    const json = await getJson<CommunityAnalytics>(`/communities/${id}/analytics`);
    return { data: json, source: "api" };
  } catch {
    const community = BUNDLED_COMMUNITIES.find((c) => c.id === id);
    if (!community) return { data: null, source: "fallback" };
    return {
      data: computeCommunityAnalytics(community, BUNDLED_UNITS),
      source: "fallback",
    };
  }
}

// ---- Market / analytics summary --------------------------------------------

export async function getAnalyticsSummary(): Promise<
  Sourced<AnalyticsSummaryResponse>
> {
  try {
    const json = await getJson<AnalyticsSummaryResponse>("/analytics/summary");
    return { data: json, source: "api" };
  } catch {
    return { data: computeSummaryFallback(), source: "fallback" };
  }
}

/** Mirror of AnalyticsSummaryResponse built from bundled data (ports api.py). */
function computeSummaryFallback(): AnalyticsSummaryResponse {
  const units = BUNDLED_UNITS;
  const n = units.length || 1;
  const perCommunity = BUNDLED_COMMUNITIES.map((c) =>
    computeCommunityAnalytics(c, units),
  );
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / n;
  return {
    disclaimer:
      "Synthetic data. Unaffiliated portfolio project — not affiliated with or endorsed by Aldar Properties. Figures are illustrative and not investment advice.",
    community_count: BUNDLED_COMMUNITIES.length,
    unit_count: units.length,
    portfolio_avg_price_per_sqft_aed: round(avg(units.map(pricePerSqft)), 2),
    portfolio_avg_gross_yield_pct: round(avg(units.map(grossRentalYield)), 4),
    portfolio_avg_net_yield_pct: round(avg(units.map(netRentalYield)), 4),
    communities: perCommunity,
  };
}

// ---- Recommend (no offline substitute) -------------------------------------

export async function postRecommend(
  profile: BuyerProfile,
): Promise<RecommendResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}/recommend`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      let detail = `Request failed with ${res.status}`;
      try {
        const body = (await res.json()) as { detail?: unknown };
        if (typeof body.detail === "string") detail = body.detail;
      } catch {
        /* ignore non-JSON error bodies */
      }
      throw new ApiError(detail, res.status);
    }
    return (await res.json()) as RecommendResponse;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network / abort — the scoring engine only lives server-side.
    throw new ApiError(
      "Could not reach the recommendation API. Start the Python API (see README) to get live recommendations.",
    );
  } finally {
    clearTimeout(timer);
  }
}

function round(x: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
}
