"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS = { fontSize: 11, fill: "var(--fg-muted)" } as const;

function tooltipStyle() {
  return {
    backgroundColor: "var(--bg-elev-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--fg)",
    fontSize: 12,
  };
}

/** 5-year illustrative price/sqft trend. Data: series of AED/sqft starting "today". */
export function PriceTrendChart({ series }: { series: number[] }) {
  const data = series.map((v, i) => ({
    year: i === 0 ? "Now" : `Y+${i}`,
    ppsf: v,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year" tick={AXIS} stroke="var(--border)" />
        <YAxis
          tick={AXIS}
          stroke="var(--border)"
          width={56}
          tickFormatter={(v: number) => `${Math.round(v)}`}
          domain={["dataMin - 50", "dataMax + 50"]}
        />
        <Tooltip
          contentStyle={tooltipStyle()}
          formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Price/sqft"]}
        />
        <Line
          type="monotone"
          dataKey="ppsf"
          stroke="var(--accent)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--accent)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export interface CommunityBar {
  name: string;
  value: number;
}

/** Horizontal comparison across communities for a single metric. */
export function ComparisonBarChart({
  data,
  color = "var(--accent)",
  unitLabel = "",
  valueFormatter,
}: {
  data: CommunityBar[];
  color?: string;
  unitLabel?: string;
  valueFormatter?: (v: number) => string;
}) {
  const height = Math.max(180, data.length * 42);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
      >
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS}
          stroke="var(--border)"
          tickFormatter={(v: number) =>
            valueFormatter ? valueFormatter(v) : `${v}`
          }
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={AXIS}
          stroke="var(--border)"
          width={120}
        />
        <Tooltip
          cursor={{ fill: "var(--bg-elev-2)" }}
          contentStyle={tooltipStyle()}
          formatter={(v: number) => [
            valueFormatter ? valueFormatter(v) : `${v}${unitLabel}`,
            "",
          ]}
        />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
