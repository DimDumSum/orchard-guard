// ---------------------------------------------------------------------------
// Frost Ring Model — Post-bloom frost damage prediction
//
// Tracks frost events (min temp < 0°C) during the first 30 days after bloom.
// Bloom start is approximated as petal_fall_date minus 7 days. Severity is
// classified by the lowest temperature recorded during the post-bloom window.
// ---------------------------------------------------------------------------

import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FrostRingResult {
  riskLevel: "low" | "moderate" | "high"
  riskScore: number
  postBloomFrostEvents: number
  worstFrostTemp: number | null
  details: string
  recommendation: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateFrostRing(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  petalFallDate: string | null,
): FrostRingResult {
  // Without a petal fall date we cannot define the post-bloom window
  if (!petalFallDate) {
    return {
      riskLevel: "low",
      riskScore: 0,
      postBloomFrostEvents: 0,
      worstFrostTemp: null,
      details: "Petal fall date not set — unable to evaluate post-bloom frost risk.",
      recommendation: "Set petal fall date to enable frost ring risk tracking.",
    }
  }

  const bloomStart = addDays(petalFallDate, -7)
  const windowEnd = addDays(bloomStart, 30)

  const windowDays = dailyData.filter(
    (d) => d.date >= bloomStart && d.date <= windowEnd,
  )

  let frostEvents = 0
  let worstTemp: number | null = null

  for (const day of windowDays) {
    if (day.min_temp < 0) {
      frostEvents++
      if (worstTemp === null || day.min_temp < worstTemp) {
        worstTemp = day.min_temp
      }
    }
  }

  let riskLevel: "low" | "moderate" | "high" = "low"
  if (worstTemp !== null && worstTemp < -2) {
    riskLevel = "high"
  } else if (worstTemp !== null && worstTemp < 0) {
    riskLevel = "moderate"
  }

  const scoreMap = { low: 10, moderate: 45, high: 80 }
  const riskScore = clamp(
    scoreMap[riskLevel] + Math.min(frostEvents * 3, 15),
    0,
    100,
  )

  let details: string;
  if (riskLevel === "high") {
    details = `Severe post-bloom frost detected — temperatures dropped to ${worstTemp!.toFixed(1)}°C during the critical fruit development window. ${frostEvents} frost event(s) since bloom. Watch for russeted rings or misshapen fruit as they develop.`;
  } else if (riskLevel === "moderate") {
    details = `Mild frost detected after bloom (${worstTemp!.toFixed(1)}°C). ${frostEvents} frost event(s) during the first 30 days after bloom. Some fruit may show russeting or minor deformity — monitor as fruit develops.`;
  } else {
    details = "No significant frost events detected during the post-bloom period. Frost rings form when developing fruitlets freeze, causing a russeted band — not a concern this season.";
  }

  const recommendation =
    riskLevel === "high"
      ? "Severe post-bloom frost detected (<-2°C). Monitor fruit for frost ring symptoms (russeted ring or misshapen fruit). Consider thinning damaged fruit early."
      : riskLevel === "moderate"
        ? "Mild post-bloom frost detected (0 to -2°C). Monitor fruit for frost ring symptoms (russeted ring or misshapen fruit)."
        : "No significant post-bloom frost detected. Continue normal monitoring."

  return {
    riskLevel,
    riskScore,
    postBloomFrostEvents: frostEvents,
    worstFrostTemp: worstTemp,
    details,
    recommendation,
  }
}
