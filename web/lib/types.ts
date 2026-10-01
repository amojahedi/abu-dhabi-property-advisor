/**
 * TypeScript types mirroring the FastAPI/Pydantic response shapes in
 * `src/ad_property_advisor/models.py` and `api.py`. Keep these in sync with
 * the backend models.
 */

export type LifestyleTag =
  | "family"
  | "waterfront"
  | "golf"
  | "urban"
  | "investment"
  | "schools-nearby"
  | "beach"
  | "quiet";

export const LIFESTYLE_TAGS: LifestyleTag[] = [
  "family",
  "waterfront",
  "golf",
  "urban",
  "investment",
  "schools-nearby",
  "beach",
  "quiet",
];

export type Hub =
  | "Abu Dhabi Downtown"
  | "Corniche"
  | "Yas Island"
  | "Reem"
  | "Airport";

export const HUBS: Hub[] = [
  "Abu Dhabi Downtown",
  "Corniche",
  "Yas Island",
  "Reem",
  "Airport",
];

export type PropertyType = "apartment" | "townhouse" | "villa";
export const PROPERTY_TYPES: PropertyType[] = ["apartment", "townhouse", "villa"];

export type Purpose = "live" | "invest";

export interface Community {
  id: string;
  name: string;
  zone: string;
  description: string;
  lifestyle_tags: string[];
  avg_price_per_sqft_aed: number;
  typical_service_charge_aed_sqft_yr: number;
  amenities: string[];
  commute_minutes: Record<string, number>;
}

export interface Unit {
  id: string;
  community_id: string;
  type: PropertyType;
  bedrooms: number;
  size_sqft: number;
  price_aed: number;
  expected_annual_rent_aed: number;
  service_charge_aed_yr: number;
  status: string;
}

export interface BuyerProfile {
  budget_min_aed: number;
  budget_max_aed: number;
  bedrooms?: number | null;
  purpose: Purpose;
  lifestyle_preferences: string[];
  family_size?: number | null;
  hub?: string | null;
  max_commute_min?: number | null;
  property_type?: PropertyType | null;
  top_n?: number;
}

export interface Recommendation {
  unit: Unit;
  community: Community;
  score: number;
  reasons: string[];
}

export interface CommunityAnalytics {
  community_id: string;
  unit_count: number;
  avg_price_per_sqft_aed: number;
  avg_gross_yield_pct: number;
  avg_net_yield_pct: number;
  price_trend_5yr_aed_per_sqft: number[];
}

export interface RecommendResponse {
  disclaimer: string;
  count: number;
  recommendations: Recommendation[];
}

export interface CommunitiesResponse {
  disclaimer: string;
  communities: Community[];
}

export interface AnalyticsSummaryResponse {
  disclaimer: string;
  community_count: number;
  unit_count: number;
  portfolio_avg_price_per_sqft_aed: number;
  portfolio_avg_gross_yield_pct: number;
  portfolio_avg_net_yield_pct: number;
  communities: CommunityAnalytics[];
}
