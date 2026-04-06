// ---------------------------------------------------------------------------
// Water Core Model — Pre-harvest temperature differential tracking
//
// Evaluates water core risk by counting consecutive days with nighttime temps
// <10°C and daytime temps >20°C during September-October. Susceptible
// varieties (Fuji, Red Delicious) are at elevated risk.
// ---------------------------------------------------------------------------

import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WaterCoreResult {
  riskLevel: "low" | "moderate" | "high"
  riskScore: number
  nightDayDifferential: boolean
  consecutiveDays: number
  details: string
  recommendation: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUSCEPTIBLE_VARIETIES = new Set(["fuji", "red delicious"])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isSeptemberOrOctober(dateStr: string): boolean {
  const month = new Date(dateStr + "T00:00:00Z").getUTCMonth() // 0-indexed
  return month === 8 || month === 9 // Sep=8, Oct=9
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateWaterCore(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  variety?: string,
): WaterCoreResult {
  const harvestDays = dailyData
    .filter((d) => isSeptemberOrOctober(d.date))
    .sort((a, b) => a.date.localeCompare(b.date))

  let maxConsecutive = 0
  let currentRun = 0
  let hasDifferential = false

  for (const day of harvestDays) {
    if (day.min_temp < 10 && day.max_temp > 20) {
      currentRun++
      hasDifferential = true
      if (currentRun > maxConsecutive) maxConsecutive = currentRun
    } else {
      currentRun = 0
    }
  }

  const normalizedVariety = (variety ?? "").toLowerCase().trim()
  const isSusceptible = SUSCEPTIBLE_VARIETIES.has(normalizedVariety)

  let riskLevel: "low" | "moderate" | "high" = "low"
  if (maxConsecutive > 7 && isSusceptible) {
    riskLevel = "high"
  } else if (maxConsecutive >= 3) {
    riskLevel = "moderate"
  }

  const scoreMap = { low: 10, moderate: 45, high: 80 }
  const riskScore = clamp(
    scoreMap[riskLevel] + Math.min(maxConsecutive * 2, 15),
    0,
    100,
  )

  let details: string;
  if (riskLevel === "high") {
    details = `${maxConsecutive} consecutive days of large day-night temperature swings (>20°C days, <10°C nights) are driving water core risk.${isSusceptible ? ` ${normalizedVariety} is especially susceptible — consider advancing harvest.` : ""} Test fruit with starch-iodine at maturity testing.`;
  } else if (riskLevel === "moderate") {
    details = `${maxConsecutive} days of significant day-night temperature swings detected in the pre-harvest window. Water core develops when warm days and cool nights cause sorbitol to accumulate in fruit tissue.${isSusceptible ? ` ${normalizedVariety} is a susceptible variety.` : ""}`;
  } else {
    const now = new Date();
    const month = now.getMonth();
    details = month < 8
      ? "Too early for water core concern. This condition develops in September–October when large day-night temperature differentials cause sorbitol to accumulate in fruit."
      : "No significant day-night temperature swings detected. Water core needs cool nights (<10°C) combined with warm days (>20°C) over several consecutive days.";
  }

  const recommendation =
    riskLevel === "high"
      ? "Consider advancing harvest on susceptible varieties. Test fruit for water core at starch-iodine maturity testing."
      : riskLevel === "moderate"
        ? "Monitor closely. Consider advancing harvest on susceptible varieties if trend continues."
        : "Low risk. Continue standard harvest timing and maturity testing."

  return {
    riskLevel,
    riskScore,
    nightDayDifferential: hasDifferential,
    consecutiveDays: maxConsecutive,
    details,
    recommendation,
  }
}
