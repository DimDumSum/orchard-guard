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

interface DDChartProps {
  data: Array<{ date: string; cumulativeDD: number }>;
  biofixDate?: string | null;
  petalFallDate?: string | null;
}

export function DegreeDayChart({ data, biofixDate, petalFallDate }: DDChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
        No degree day data available yet. Weather data will populate this chart.
      </div>
    );
  }

  const maxDD = Math.max(...data.map((d) => d.cumulativeDD), 100);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
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
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, Math.ceil(maxDD / 100) * 100]}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          label={{
            value: "Cumulative DD (base 5\u00B0C)",
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

        {/* Biofix event marker */}
        {biofixDate && (
          <ReferenceLine
            x={biofixDate}
            stroke="#f97316"
            strokeDasharray="5 5"
            label={{
              value: "Biofix",
              position: "top",
              fill: "#f97316",
              fontSize: 11,
            }}
          />
        )}

        {/* Petal fall event marker */}
        {petalFallDate && (
          <ReferenceLine
            x={petalFallDate}
            stroke="#ec4899"
            strokeDasharray="5 5"
            label={{
              value: "Petal Fall",
              position: "top",
              fill: "#ec4899",
              fontSize: 11,
            }}
          />
        )}

        <Line
          type="monotone"
          dataKey="cumulativeDD"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "#059669" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
