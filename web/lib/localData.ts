/**
 * Bundled synthetic data, imported directly so it is available at build time
 * and in a static export (no network needed). These are copies of the backend's
 * `data/communities.json` / `data/units.json`.
 */

import communitiesRaw from "@/data/communities.json";
import unitsRaw from "@/data/units.json";
import type { Community, Unit } from "./types";

// The JSON files wrap the arrays in an object with a `_note` disclaimer field.
export const BUNDLED_COMMUNITIES = (communitiesRaw as { communities: Community[] })
  .communities;
export const BUNDLED_UNITS = (unitsRaw as { units: Unit[] }).units;
