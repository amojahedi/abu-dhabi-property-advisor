import Link from "next/link";
import type { Recommendation } from "@/lib/types";
import { formatAed, humanizeTag } from "@/lib/format";
import { Badge, Card } from "./ui";

export function RecommendationCard({
  rec,
  rank,
}: {
  rec: Recommendation;
  rank: number;
}) {
  const { unit, community, score, reasons } = rec;
  return (
    <Card className="animate-fade-up overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-fg-muted">#{rank}</span>
            <Link
              href={`/communities/${community.id}`}
              className="truncate text-lg font-semibold hover:text-accent"
            >
              {community.name}
            </Link>
          </div>
          <p className="mt-0.5 text-sm text-fg-muted">
            {unit.bedrooms} bd · {humanizeTag(unit.type)} ·{" "}
            {unit.size_sqft.toLocaleString()} sqft · {community.zone}
          </p>
        </div>
        <ScoreDial score={score} />
      </div>

      <div className="flex items-baseline justify-between gap-4 px-5 pt-4">
        <div>
          <p className="text-2xl font-bold tracking-tight">
            {formatAed(unit.price_aed)}
          </p>
          <p className="text-xs text-fg-muted">
            {formatAed(unit.expected_annual_rent_aed)} / yr expected rent
          </p>
        </div>
        <Badge tone="neutral">{unit.id}</Badge>
      </div>

      <div className="px-5 pb-5 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
          Why it fits
        </p>
        <ul className="space-y-1.5">
          {reasons.map((reason, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span aria-hidden className="mt-0.5 text-accent-2">
                ✓
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/** Compact circular score indicator (0-100). */
function ScoreDial({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div
      className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--bg-elev-2) 0deg)`,
      }}
      role="img"
      aria-label={`Match score ${pct.toFixed(0)} out of 100`}
    >
      <div className="grid h-11 w-11 place-items-center rounded-full bg-bg-elev">
        <span className="text-sm font-bold">{pct.toFixed(0)}</span>
      </div>
    </div>
  );
}
