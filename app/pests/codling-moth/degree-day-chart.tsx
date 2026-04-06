"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface DegreeDayChartProps {
  data: Array<{ date: string; dd: number }>;
  thresholds: Array<{ dd: number; label: string; gen: number }>;
}

const genColors: Record<number, string> = {
  1: "#3b82f6",
  2: "#8b5cf6",
};

export function DegreeDayChart({ data, thresholds }: DegreeDayChartProps) {
  const maxDD = Math.max(
    ...data.map((d) => d.dd),
    ...thresholds.map((t) => t.dd)
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => {
            const d = new Date(value + "T00:00:00");
            return d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, Math.ceil(maxDD / 100) * 100 + 50]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          label={{
            value: "Degree Days",
            angle: -90,
            position: "insideLeft",
            style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelFormatter={(value) => {
            const d = new Date(String(value) + "T00:00:00");
            return d.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
          }}
          formatter={(value) => [
            `${Number(value).toFixed(1)} DD`,
            "Cumulative DD",
          ]}
        />

        {/* Generation marker reference lines */}
        {thresholds.map((t) => (
          <ReferenceLine
            key={t.dd}
            y={t.dd}
            stroke={genColors[t.gen] ?? "#94a3b8"}
            strokeDasharray="5 5"
            label={{
              value: `${t.label} (${t.dd})`,
              position: "right",
              fill: genColors[t.gen] ?? "#94a3b8",
              fontSize: 10,
            }}
          />
        ))}

        <Line
          type="monotone"
          dataKey="dd"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "#059669" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
