"use client";

import { use } from "react";
import Link from "next/link";
import { PriceTrendChart } from "@/components/charts";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  FallbackNotice,
  LoadingState,
} from "@/components/ui";
import { getCommunity, getCommunityAnalytics } from "@/lib/api";
import { formatAed, formatPct, humanizeTag } from "@/lib/format";
import { useAsyncData } from "@/lib/useAsyncData";

export default function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { status, data, reload } = useAsyncData(
    async () => {
      const [c, a] = await Promise.all([
        getCommunity(id),
        getCommunityAnalytics(id),
      ]);
      return {
        community: c.data,
        analytics: a.data,
        fallback: c.source === "fallback" || a.source === "fallback",
      };
    },
    [id],
  );

  const community = data?.community ?? null;
  const analytics = data?.analytics ?? null;
  const notFound = status === "done" && !community;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/communities" className="text-sm text-fg-muted hover:text-accent">
        ← All communities
      </Link>

      <div className="mt-4">
        {status === "loading" && <LoadingState label="Loading community…" />}

        {status === "error" && (
          <ErrorState message="Could not load this community." onRetry={reload} />
        )}

        {notFound && (
          <EmptyState
            title="Community not found"
            message={`No community matches "${id}".`}
          />
        )}

        {status === "done" && community && (
          <article className="space-y-8">
            {data?.fallback && <FallbackNotice />}

            {/* Header */}
            <header>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {community.name}
                </h1>
                <Badge tone="neutral">{community.zone}</Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-fg-muted">
                {community.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {community.lifestyle_tags.map((tag) => (
                  <Badge key={tag} tone="accent">
                    {humanizeTag(tag)}
                  </Badge>
                ))}
              </div>
            </header>

            {/* Analytics panel */}
            {analytics && (
              <section aria-label="Investment analytics">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-fg-muted">
                  Investment analytics
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat
                    label="Avg price / sqft"
                    value={formatAed(analytics.avg_price_per_sqft_aed)}
                  />
                  <Stat
                    label="Gross yield"
                    value={formatPct(analytics.avg_gross_yield_pct)}
                    tone="success"
                  />
                  <Stat
                    label="Net yield"
                    value={formatPct(analytics.avg_net_yield_pct)}
                    tone="success"
                  />
                  <Stat
                    label="Service charge"
                    value={`${formatAed(community.typical_service_charge_aed_sqft_yr)}/sqft·yr`}
                  />
                </div>
              </section>
            )}

            {/* Price trend chart */}
            {analytics && (
              <section aria-label="5-year price trend">
                <Card className="p-5">
                  <div className="mb-1 flex items-baseline justify-between">
                    <h2 className="text-sm font-semibold">
                      5-year price/sqft trend
                    </h2>
                    <span className="text-xs text-fg-muted">
                      illustrative projection
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-fg-muted">
                    Synthetic, deterministic path — not a forecast.
                  </p>
                  <PriceTrendChart
                    series={analytics.price_trend_5yr_aed_per_sqft}
                  />
                </Card>
              </section>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Amenities */}
              <section aria-label="Amenities">
                <Card className="h-full p-5">
                  <h2 className="mb-3 text-sm font-semibold">Amenities</h2>
                  <ul className="flex flex-wrap gap-1.5">
                    {community.amenities.map((a) => (
                      <li key={a}>
                        <Badge tone="neutral">{a}</Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>

              {/* Commute times */}
              <section aria-label="Commute times">
                <Card className="h-full p-5">
                  <h2 className="mb-3 text-sm font-semibold">
                    Commute times (minutes)
                  </h2>
                  <dl className="space-y-2">
                    {Object.entries(community.commute_minutes).map(
                      ([hub, mins]) => (
                        <div
                          key={hub}
                          className="flex items-center justify-between text-sm"
                        >
                          <dt className="text-fg-muted">{hub}</dt>
                          <dd className="font-medium">{mins} min</dd>
                        </div>
                      ),
                    )}
                  </dl>
                </Card>
              </section>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success";
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-fg-muted">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          tone === "success" ? "text-accent-2" : ""
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
