import assert from "node:assert/strict";
import { test } from "node:test";
import {
  communityAnalytics,
  grossRentalYield,
  netRentalYield,
  priceTrend5yr,
} from "./analytics.ts";
import type { Community, Unit } from "./types.ts";

// Mirrors U0001 from the synthetic dataset.
const unit: Unit = {
  id: "U0001",
  community_id: "yas-island",
  type: "apartment",
  bedrooms: 1,
  size_sqft: 740,
  price_aed: 1126000,
  expected_annual_rent_aed: 70000,
  service_charge_aed_yr: 11840,
  status: "available",
};

const community: Community = {
  id: "yas-island",
  name: "Yas Island",
  zone: "Yas Island",
  description: "",
  lifestyle_tags: [],
  avg_price_per_sqft_aed: 1450,
  typical_service_charge_aed_sqft_yr: 16,
  amenities: [],
  commute_minutes: {},
};

test("grossRentalYield matches rent/price*100", () => {
  assert.equal(grossRentalYield(unit), 6.2167);
});

test("netRentalYield subtracts service charge and 8% mgmt", () => {
  // (70000 - 11840 - 5600) / 1126000 * 100
  assert.equal(netRentalYield(unit), 4.6679);
});

test("priceTrend5yr is deterministic and starts at base", () => {
  const series = priceTrend5yr(community);
  assert.equal(series.length, 5);
  assert.equal(series[0], 1450);
  // same input -> same output
  assert.deepEqual(series, priceTrend5yr(community));
});

test("communityAnalytics aggregates matching units only", () => {
  const other: Unit = { ...unit, id: "U9999", community_id: "elsewhere" };
  const result = communityAnalytics(community, [unit, other]);
  assert.equal(result.unit_count, 1);
  assert.equal(result.avg_gross_yield_pct, grossRentalYield(unit));
});
