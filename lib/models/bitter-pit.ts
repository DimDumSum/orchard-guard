// ---------------------------------------------------------------------------
// Bitter Pit Predictive Model — Heat stress + variety + crop load + calcium
//
// Evaluates bitter pit risk using cumulative heat stress hours (>30°C during
// June-July), variety susceptibility, crop load, and calcium spray compliance.
// ---------------------------------------------------------------------------

// Degree-day utilities available if needed for future enhancements

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BitterPitResult {
  riskLevel: "low" | "moderate" | "high" | "critical"
  riskScore: number
  heatStressHours: number
  varietyRisk: string
  cropLoadFactor: string
  calciumSpraysCompleted: number
  calciumSpraysRecommended: number
  nextCalciumSprayDue: string | null
  details: string
  recommendation: string
  productSuggestions: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VARIETY_SUSCEPTIBILITY: Record<string, number> = {
  honeycrisp: 4, spy: 4, mutsu: 4, "northern spy": 4,
  cortland: 3, jonagold: 3,
  empire: 2, gala: 2,
  mcintosh: 1, "red delicious": 1,
}

const VARIETY_LABEL: Record<number, string> = {
  4: "very_high", 3: "high", 2: "moderate", 1: "low",
}

const CROP_LOAD_FACTOR: Record<string, number> = {
  light: 3, moderate: 2, heavy: 1,
}

const TOTAL_RECOMMENDED_SPRAYS = 12

const PRODUCTS: string[] = [
  "Calcium chloride",
  "CalciMax",
  "Maestro (calcium + boron)",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function countHeatStressHours(
  hourlyData: Array<{ timestamp: string; temp_c: number }>,
): number {
  let count = 0
  for (const h of hourlyData) {
    const month = new Date(h.timestamp).getMonth() // 0-indexed: 5=Jun, 6=Jul
    if ((month === 5 || month === 6) && h.temp_c > 30) {
      count++
    }
  }
  return count
}

function scaleHeatStress(hours: number): number {
  // 0 hours → 0, ≥60 hours → 3 (linear)
  return clamp(hours / 20, 0, 3)
}

function scaleCalciumCompliance(
  completed: number,
  recommended: number,
): number {
  if (recommended === 0) return 0
  const deficit = (recommended - completed) / recommended
  return clamp(deficit * 3, 0, 3)
}

function classifyRisk(
  score: number,
): "low" | "moderate" | "high" | "critical" {
  if (score >= 24) return "critical"
  if (score >= 12) return "high"
  if (score >= 6) return "moderate"
  return "low"
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateBitterPit(
  hourlyData: Array<{ timestamp: string; temp_c: number }>,
  variety?: string,
  cropLoad?: "light" | "moderate" | "heavy",
  calciumSpraysCompleted?: number,
): BitterPitResult {
  const normalizedVariety = (variety ?? "").toLowerCase().trim()
  const varietyFactor = VARIETY_SUSCEPTIBILITY[normalizedVariety] ?? 2
  const varietyRisk = VARIETY_LABEL[varietyFactor] ?? "moderate"

  const load = cropLoad ?? "moderate"
  const loadFactor = CROP_LOAD_FACTOR[load]

  const heatStressHours = countHeatStressHours(hourlyData)
  const heatFactor = scaleHeatStress(heatStressHours)

  const completed = calciumSpraysCompleted ?? 0
  const calciumFactor = scaleCalciumCompliance(completed, TOTAL_RECOMMENDED_SPRAYS)

  const rawScore = varietyFactor * loadFactor * heatFactor * calciumFactor
  const riskLevel = classifyRisk(rawScore)
  const riskScore = clamp(Math.round((rawScore / 108) * 100), 0, 100)

  // Next spray due: every 10-14 days from pink (~May 15) through August
  const nextSprayDue =
    completed < TOTAL_RECOMMENDED_SPRAYS
      ? `Spray #${completed + 1} of ${TOTAL_RECOMMENDED_SPRAYS} — apply at 10–14 day interval`
      : null

  let details: string;
  const varietyNote = normalizedVariety ? `${normalizedVariety} (${varietyRisk} susceptibility)` : "unknown variety";
  if (riskLevel === "critical" || riskLevel === "high") {
    details = `High bitter pit risk for ${varietyNote}. ${heatStressHours > 0 ? `${heatStressHours} hours of heat stress (>30°C) in June–July are accelerating calcium deficiency. ` : ""}Calcium sprays: ${completed} of ${TOTAL_RECOMMENDED_SPRAYS} completed${completed < TOTAL_RECOMMENDED_SPRAYS ? " — behind schedule" : ""}.${load === "light" ? " Light crop load increases risk (larger fruit = more susceptible)." : ""}`;
  } else if (riskLevel === "moderate") {
    details = `Moderate bitter pit risk for ${varietyNote}. Calcium sprays: ${completed} of ${TOTAL_RECOMMENDED_SPRAYS} completed. ${load === "light" ? "Light crop load increases risk — larger fruit are more susceptible." : "Stay on schedule with calcium applications every 10–14 days."}`;
  } else {
    details = `Low bitter pit risk${normalizedVariety ? ` for ${normalizedVariety}` : ""}. Calcium sprays: ${completed} of ${TOTAL_RECOMMENDED_SPRAYS} completed. Continue the standard calcium spray program as insurance.`;
  }

  const recommendation =
    riskLevel === "critical" || riskLevel === "high"
      ? "Apply calcium spray immediately. Maintain 10–14 day interval from pink through August. Thin aggressively to increase fruit size and reduce risk."
      : riskLevel === "moderate"
        ? "Continue calcium spray program on schedule. Monitor fruit size — light crop loads increase risk."
        : "Low risk. Maintain standard calcium spray program as insurance."

  return {
    riskLevel,
    riskScore,
    heatStressHours,
    varietyRisk,
    cropLoadFactor: load,
    calciumSpraysCompleted: completed,
    calciumSpraysRecommended: TOTAL_RECOMMENDED_SPRAYS,
    nextCalciumSprayDue: nextSprayDue,
    details,
    recommendation,
    productSuggestions: PRODUCTS,
  }
}
