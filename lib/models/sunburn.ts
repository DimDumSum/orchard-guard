// ---------------------------------------------------------------------------
// Fruit Sunburn Model — High-temperature exposure tracking
//
// Tracks days with maximum temperature >32°C from June through harvest.
// Sunburn risk is especially elevated after thinning or pruning operations
// that expose previously shaded fruit.
// ---------------------------------------------------------------------------

import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SunburnResult {
  riskLevel: "low" | "moderate" | "high"
  riskScore: number
  daysAbove32: number
  details: string
  recommendation: string
  productSuggestions: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUNBURN_THRESHOLD = 32
const PRODUCTS: string[] = ["Surround WP (kaolin clay)"]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isJuneThroughOctober(dateStr: string): boolean {
  const month = new Date(dateStr + "T00:00:00Z").getUTCMonth() // 0-indexed
  return month >= 5 && month <= 9 // Jun=5 through Oct=9
}

function classifyRisk(days: number): "low" | "moderate" | "high" {
  if (days > 5) return "high"
  if (days >= 2) return "moderate"
  return "low"
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateSunburn(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): SunburnResult {
  const seasonDays = dailyData.filter((d) => isJuneThroughOctober(d.date))
  const daysAbove32 = seasonDays.filter(
    (d) => d.max_temp > SUNBURN_THRESHOLD,
  ).length

  const riskLevel = classifyRisk(daysAbove32)

  const scoreMap = { low: 10, moderate: 45, high: 80 }
  const riskScore = clamp(
    scoreMap[riskLevel] + Math.min(daysAbove32 * 2, 15),
    0,
    100,
  )

  let details: string;
  if (riskLevel === "high") {
    details = `${daysAbove32} days above 32°C this season are creating significant sunburn risk. Recently thinned or pruned blocks are most vulnerable — previously shaded fruit is suddenly exposed to direct sun.`;
  } else if (riskLevel === "moderate") {
    details = `${daysAbove32} hot days (>32°C) detected so far. Fruit sunburn is most likely on recently thinned blocks where shaded fruit is suddenly exposed. Watch the forecast for upcoming heat events.`;
  } else {
    const now = new Date();
    const month = now.getMonth();
    details = month < 5
      ? "Too early for sunburn concern. Fruit sunburn risk is tracked from June through October when temperatures can exceed 32°C."
      : "No significant heat events detected. Fruit sunburn becomes a concern when temperatures exceed 32°C, especially after thinning or pruning exposes shaded fruit.";
  }

  const recommendation =
    riskLevel === "high"
      ? "Apply Surround WP (kaolin clay) to exposed fruit. Recently thinned blocks at highest risk. Avoid mid-day thinning or pruning during heat waves."
      : riskLevel === "moderate"
        ? "Monitor fruit exposure. Recently thinned blocks at highest risk. Consider kaolin clay application before next heat event."
        : "Low risk. Continue monitoring forecasts for upcoming heat events."

  return {
    riskLevel,
    riskScore,
    daysAbove32,
    details,
    recommendation,
    productSuggestions: PRODUCTS,
  }
}
