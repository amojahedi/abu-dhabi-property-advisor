"use client";

import { useState } from "react";
import {
  HUBS,
  LIFESTYLE_TAGS,
  PROPERTY_TYPES,
  type BuyerProfile,
  type Purpose,
  type PropertyType,
} from "@/lib/types";
import { humanizeTag } from "@/lib/format";

const fieldClass =
  "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:outline-none";
const labelClass = "block text-xs font-medium text-fg-muted mb-1";

export interface AdvisorFormProps {
  onSubmit: (profile: BuyerProfile) => void;
  loading: boolean;
}

export function AdvisorForm({ onSubmit, loading }: AdvisorFormProps) {
  const [budgetMin, setBudgetMin] = useState("800000");
  const [budgetMax, setBudgetMax] = useState("2500000");
  const [bedrooms, setBedrooms] = useState("2");
  const [purpose, setPurpose] = useState<Purpose>("live");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [lifestyle, setLifestyle] = useState<string[]>(["family"]);
  const [familySize, setFamilySize] = useState("3");
  const [hub, setHub] = useState<string>("");
  const [maxCommute, setMaxCommute] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggleLifestyle(tag: string) {
    setLifestyle((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const min = Number(budgetMin);
    const max = Number(budgetMax);
    if (!(max > 0) || !(min >= 0)) {
      setError("Please enter a valid budget range.");
      return;
    }
    if (max < min) {
      setError("Maximum budget must be greater than or equal to the minimum.");
      return;
    }
    setError(null);
    onSubmit({
      budget_min_aed: min,
      budget_max_aed: max,
      bedrooms: bedrooms === "" ? null : Number(bedrooms),
      purpose,
      property_type: propertyType === "" ? null : propertyType,
      lifestyle_preferences: lifestyle,
      family_size: familySize === "" ? null : Number(familySize),
      hub: hub === "" ? null : hub,
      max_commute_min: maxCommute === "" ? null : Number(maxCommute),
      top_n: 6,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="Buyer profile">
      {/* Purpose */}
      <fieldset>
        <legend className={labelClass}>Purpose</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["live", "invest"] as Purpose[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPurpose(p)}
              aria-pressed={purpose === p}
              className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                purpose === p
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-bg text-fg-muted hover:text-fg"
              }`}
            >
              {p === "live" ? "Live in it" : "Invest"}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Budget */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="budget-min" className={labelClass}>
            Min budget (AED)
          </label>
          <input
            id="budget-min"
            type="number"
            min={0}
            step={50000}
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="budget-max" className={labelClass}>
            Max budget (AED)
          </label>
          <input
            id="budget-max"
            type="number"
            min={0}
            step={50000}
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Bedrooms + property type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bedrooms" className={labelClass}>
            Bedrooms
          </label>
          <select
            id="bedrooms"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className={fieldClass}
          >
            <option value="">Any</option>
            {[0, 1, 2, 3, 4, 5].map((b) => (
              <option key={b} value={b}>
                {b === 0 ? "Studio" : b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ptype" className={labelClass}>
            Property type
          </label>
          <select
            id="ptype"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType | "")}
            className={fieldClass}
          >
            <option value="">Any</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {humanizeTag(t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Family size */}
      <div>
        <label htmlFor="family" className={labelClass}>
          Family size
        </label>
        <input
          id="family"
          type="number"
          min={0}
          max={12}
          value={familySize}
          onChange={(e) => setFamilySize(e.target.value)}
          className={fieldClass}
        />
      </div>

      {/* Commute */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="hub" className={labelClass}>
            Commute hub
          </label>
          <select
            id="hub"
            value={hub}
            onChange={(e) => setHub(e.target.value)}
            className={fieldClass}
          >
            <option value="">None</option>
            {HUBS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="commute" className={labelClass}>
            Max commute (min)
          </label>
          <input
            id="commute"
            type="number"
            min={0}
            placeholder="e.g. 30"
            value={maxCommute}
            onChange={(e) => setMaxCommute(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Lifestyle tags */}
      <fieldset>
        <legend className={labelClass}>Lifestyle preferences</legend>
        <div className="flex flex-wrap gap-2">
          {LIFESTYLE_TAGS.map((tag) => {
            const active = lifestyle.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleLifestyle(tag)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-bg text-fg-muted hover:text-fg"
                }`}
              >
                {humanizeTag(tag)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-gradient-to-r from-accent to-accent-2 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Finding matches…" : "Get recommendations"}
      </button>
    </form>
  );
}
