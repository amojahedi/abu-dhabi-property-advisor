"use client";

import { useMemo, useState } from "react";
import { ComparisonBarChart, type CommunityBar } from "@/components/charts";
import {
  Card,
  ErrorState,
  FallbackNotice,
  LoadingState,
  SectionHeading,
} from "@/components/ui";
import { getAnalyticsSummary, getCommunities } from "@/lib/api";
import { formatAed, formatPct } from "@/lib/format";
import { useAsyncData } from "@/lib/useAsyncData";

type Metric = "ppsf" | "gross" | "net";

export default function MarketPage() {
  const { status, data, reload } = useAsyncData(async () => {
    const [s, c] = await Promise.all([getAnalyticsSummary(), getCommunities()]);
    return {
      summary: s.data,
      communities: c.data,
      fallback: s.source === "fallback" || c.source === "fallback",
    };
  }, []);

  const [metric, setMetric] = useState<Metric>("net");

  const summary = data?.summary ?? null;

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    (data?.communities ?? []).forEach((c) => m.set(c.id, c.name));
    return m;
  }, [data?.communities]);

  const chartData: CommunityBar[] = useMemo(() => {
    if (!summary) return [];
    const rows = summary.communities.map((ca) => {
      const value =
        metric === "ppsf"
          ? ca.avg_price_per_sqft_aed
          : metric === "gross"
            ? ca.avg_gross_yield_pct
            : ca.avg_net_yield_pct;
      return { name: nameById.get(ca.community_id) ?? ca.community_id, value };
    });
    return rows.sort((a, b) => b.value - a.value);
  }, [summary, metric, nameById]);

  const metricMeta: Record<
    Metric,
    { label: string; color: string; fmt: (v: number) => string }
  > = {
    ppsf: { label: "Price / sqft", color: "var(--accent)", fmt: (v) => formatAed(v) },
    gross: { label: "Gross yield", color: "var(--accent-2)", fmt: (v) => formatPct(v) },
    net: { label: "Net yield", color: "var(--accent-2)", fmt: (v) => formatPct(v) },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Portfolio view"
        title="Market analytics"
        description="Aggregate, illustrative figures across the synthetic portfolio: average yields, price per square foot, and a per-community comparison."
      />

      <div className="mt-8 space-y-6">
        {status === "loading" && <LoadingState label="Loading analytics…" />}

        {status === "error" && (
          <ErrorState message="Could not load market analytics." onRetry={reload} />
        )}

        {status === "done" && summary && (
          <>
            {data?.fallback && <FallbackNotice />}

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Kpi label="Communities" value={`${summary.community_count}`} />
              <Kpi label="Units" value={`${summary.unit_count}`} />
              <Kpi
                label="Avg price/sqft"
                value={formatAed(summary.portfolio_avg_price_per_sqft_aed)}
              />
              <Kpi
                label="Avg gross yield"
                value={formatPct(summary.portfolio_avg_gross_yield_pct)}
                tone="success"
              />
              <Kpi
                label="Avg net yield"
                value={formatPct(summary.portfolio_avg_net_yield_pct)}
                tone="success"
              />
            </div>

            {/* Comparison chart */}
            <Card className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">
                  Compare communities · {metricMeta[metric].label}
                </h2>
                <div
                  role="tablist"
                  aria-label="Comparison metric"
                  className="flex gap-1 rounded-lg border border-border bg-bg p-1"
                >
                  {(Object.keys(metricMeta) as Metric[]).map((m) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={metric === m}
                      onClick={() => setMetric(m)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        metric === m
                          ? "bg-bg-elev-2 text-fg"
                          : "text-fg-muted hover:text-fg"
                      }`}
                    >
                      {metricMeta[m].label}
                    </button>
                  ))}
                </div>
              </div>
              <ComparisonBarChart
                data={chartData}
                color={metricMeta[metric].color}
                valueFormatter={metricMeta[metric].fmt}
              />
            </Card>

            {/* Per-community table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Per-community analytics</caption>
                  <thead className="border-b border-border bg-bg-elev-2 text-left text-xs uppercase tracking-wider text-fg-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3">Community</th>
                      <th scope="col" className="px-4 py-3 text-right">Units</th>
                      <th scope="col" className="px-4 py-3 text-right">Price/sqft</th>
                      <th scope="col" className="px-4 py-3 text-right">Gross yield</th>
                      <th scope="col" className="px-4 py-3 text-right">Net yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.communities.map((ca) => (
                      <tr
                        key={ca.community_id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          {nameById.get(ca.community_id) ?? ca.community_id}
                        </td>
                        <td className="px-4 py-3 text-right text-fg-muted">
                          {ca.unit_count}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatAed(ca.avg_price_per_sqft_aed)}
                        </td>
                        <td className="px-4 py-3 text-right text-accent-2">
                          {formatPct(ca.avg_gross_yield_pct)}
                        </td>
                        <td className="px-4 py-3 text-right text-accent-2">
                          {formatPct(ca.avg_net_yield_pct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({
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
        className={`mt-1 text-xl font-bold ${
          tone === "success" ? "text-accent-2" : ""
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
