"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WetPeriodChartData {
  startTime: string;
  duration: number;
  meanTemp: number;
  lightThreshold: number | null;
  moderateThreshold: number | null;
  severeThreshold: number | null;
  severity: string;
  percentComplete: number;
}

interface WetPeriodChartProps {
  data: WetPeriodChartData[];
}

const severityColors: Record<string, string> = {
  none: "#22c55e",
  light: "#eab308",
  moderate: "#f97316",
  severe: "#ef4444",
};

export function WetPeriodChart({ data }: WetPeriodChartProps) {
  // Build chart data with the wet period duration and the Mills threshold overlay
  const chartItems = data.map((wp, i) => {
    const d = new Date(wp.startTime);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      name: label,
      duration: wp.duration,
      lightThreshold: wp.lightThreshold,
      meanTemp: wp.meanTemp,
      severity: wp.severity,
      percentComplete: wp.percentComplete,
    };
  });

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartItems}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            label={{
              value: "Hours",
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
            formatter={(value, name) => {
              if (name === "duration") return [`${value}h`, "Wet Duration"];
              if (name === "lightThreshold")
                return [value ? `${Number(value).toFixed(0)}h` : "N/A", "Light Infection Threshold"];
              return [String(value), String(name)];
            }}
          />
          <Bar dataKey="duration" name="duration" radius={[4, 4, 0, 0]}>
            {chartItems.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={severityColors[entry.severity] ?? severityColors.none}
              />
            ))}
          </Bar>
          <Bar
            dataKey="lightThreshold"
            name="lightThreshold"
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-500" /> No infection
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-yellow-500" /> Light
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-orange-500" /> Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500" /> Severe
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm border border-dashed border-slate-400" /> Mills threshold (light)
        </span>
      </div>
    </div>
  );
}
