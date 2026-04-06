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

interface DegreeHourChartProps {
  data: Array<{ date: string; degreeHours: number }>;
}

export function DegreeHourChart({ data }: DegreeHourChartProps) {
  const maxDH = Math.max(...data.map((d) => d.degreeHours), 450);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
        />
        <YAxis
          domain={[0, Math.ceil(maxDH / 50) * 50]}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          label={{
            value: "Degree Hours",
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
            `${Number(value).toFixed(1)} DH`,
            "Cumulative DH",
          ]}
        />

        {/* Threshold reference lines */}
        <ReferenceLine
          y={110}
          stroke="#eab308"
          strokeDasharray="5 5"
          label={{
            value: "Caution (110)",
            position: "right",
            fill: "#eab308",
            fontSize: 11,
          }}
        />
        <ReferenceLine
          y={220}
          stroke="#f97316"
          strokeDasharray="5 5"
          label={{
            value: "High (220)",
            position: "right",
            fill: "#f97316",
            fontSize: 11,
          }}
        />
        <ReferenceLine
          y={400}
          stroke="#ef4444"
          strokeDasharray="5 5"
          label={{
            value: "Extreme (400)",
            position: "right",
            fill: "#ef4444",
            fontSize: 11,
          }}
        />

        <Line
          type="monotone"
          dataKey="degreeHours"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4 }}
          activeDot={{ r: 6, fill: "#2563eb" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
