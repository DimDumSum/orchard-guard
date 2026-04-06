// ---------------------------------------------------------------------------
// Sunscald (Southwest Injury) Model — Winter thermal shock tracking
//
// Evaluates southwest injury risk by tracking thermal shock events from
// December through March. Bark temperature is estimated as air max + 15°C
// on south-facing exposure. A shock event occurs when estimated bark temp
// exceeds 0°C during the day and night minimum drops below -15°C.
// ---------------------------------------------------------------------------

import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SunscaldResult {
  riskLevel: "low" | "moderate" | "high" | "critical"
  riskScore: number
  thermalShockEvents: number
  estimatedBarkTempMax: number
  cumulativeEvents: number
  details: string
  recommendation: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isDecemberThroughMarch(dateStr: string): boolean {
  const month = new Date(dateStr + "T00:00:00Z").getUTCMonth() // 0-indexed
  return month === 11 || month <= 2 // Dec=11, Jan=0, Feb=1, Mar=2
}

function classifyRisk(
  events: number,
): "low" | "moderate" | "high" | "critical" {
  if (events > 5) return "critical"
  if (events >= 3) return "high"
  if (events >= 1) return "moderate"
  return "low"
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateSunscald(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): SunscaldResult {
  let thermalShockEvents = 0
  let maxBarkTemp = -Infinity

  const winterDays = dailyData.filter((d) => isDecemberThroughMarch(d.date))

  for (const day of winterDays) {
    const estimatedBark = day.max_temp + 15
    if (estimatedBark > maxBarkTemp) maxBarkTemp = estimatedBark

    if (estimatedBark > 0 && day.min_temp < -15) {
      thermalShockEvents++
    }
  }

  if (maxBarkTemp === -Infinity) maxBarkTemp = 0

  const riskLevel = classifyRisk(thermalShockEvents)

  const scoreMap = { low: 10, moderate: 35, high: 65, critical: 90 }
  const riskScore = clamp(
    scoreMap[riskLevel] + Math.min(thermalShockEvents * 2, 10),
    0,
    100,
  )

  let details: string;
  if (riskLevel === "critical" || riskLevel === "high") {
    details = `${thermalShockEvents} thermal shock events detected this winter — sunny days warm bark above freezing on south-facing sides, then overnight plunges below -15°C kill the tissue. Young trees (<5 years) are most vulnerable.`;
  } else if (riskLevel === "moderate") {
    details = `${thermalShockEvents} thermal shock event(s) this winter. When the sun warms south-facing bark during the day and temperatures drop sharply at night, bark cells can burst. Paint trunks of young trees with white latex before November.`;
  } else if (winterDays.length === 0) {
    details = "No winter data available yet. Southwest injury (sunscald) is tracked from December through March by monitoring day-to-night temperature swings.";
  } else {
    details = "No significant thermal shock events this winter. Southwest injury occurs when sunny days warm bark above freezing, then sharp overnight freezes kill the tissue — hasn't happened yet.";
  }

  const recommendation =
    riskLevel === "critical" || riskLevel === "high"
      ? "Young trees <5 years: apply white latex trunk paint before November. Consider trunk wraps for recently planted trees. Inspect for bark splitting on south/southwest sides."
      : riskLevel === "moderate"
        ? "Young trees <5 years: apply white latex trunk paint before November. Monitor trunks for discoloration on south-facing sides."
        : "Low risk. As preventive measure, paint trunks of young trees (<5 years) with white latex before November."

  return {
    riskLevel,
    riskScore,
    thermalShockEvents,
    estimatedBarkTempMax: Math.round(maxBarkTemp * 10) / 10,
    cumulativeEvents: thermalShockEvents,
    details,
    recommendation,
  }
}
