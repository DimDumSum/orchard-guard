// ---------------------------------------------------------------------------
// Frost Risk Model — Michigan State Bud Stage Thresholds
//
// Evaluates frost damage risk by comparing forecast low temperatures against
// critical temperature thresholds for the current phenological bud stage.
// Thresholds are based on Michigan State University research for 10% and 90%
// bud kill temperatures.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FrostRiskLevel = "none" | "low" | "moderate" | "high" | "critical";

export type BudStage =
  | "dormant"
  | "silver-tip"
  | "green-tip"
  | "tight-cluster"
  | "pink"
  | "bloom"
  | "petal-fall"
  | "fruit-set";

export interface FrostRiskResult {
  riskLevel: FrostRiskLevel;
  /** Numeric risk score on a 0-100 scale. */
  riskScore: number;
  /** Lowest temperature in the next 48 hours of forecast data (°C). */
  forecastLow: number;
  /** Temperature at which 10% bud kill occurs for the current stage (°C). */
  killThreshold10: number;
  /** Temperature at which 90% bud kill occurs for the current stage (°C). */
  killThreshold90: number;
  /** Degrees above the 10% kill threshold (positive = safe margin). */
  marginC: number;
  /** Number of forecast hours below the 10% kill threshold. */
  hoursBelow: number;
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Michigan State bud stage kill thresholds (°C)
// ---------------------------------------------------------------------------

interface KillThresholds {
  kill10: number;
  kill90: number;
}

const BUD_STAGE_THRESHOLDS: Record<BudStage, KillThresholds> = {
  dormant: { kill10: -17, kill90: -25 },
  "silver-tip": { kill10: -12, kill90: -17 },
  "green-tip": { kill10: -8, kill90: -12 },
  "tight-cluster": { kill10: -5, kill90: -8 },
  pink: { kill10: -3, kill90: -5 },
  bloom: { kill10: -2, kill90: -3 },
  "petal-fall": { kill10: -1, kill90: -2 },
  "fruit-set": { kill10: -1, kill90: -2 },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Clamp a number into a range. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Determine risk level from the forecast low relative to kill thresholds.
 *
 * - critical: forecast low <= 90% kill threshold
 * - high:     forecast low <= 10% kill threshold
 * - moderate: forecast low within 2°C of 10% kill threshold
 * - low:      forecast low within 5°C of 10% kill threshold
 * - none:     forecast low > 5°C above 10% kill threshold
 */
function classifyFrostRisk(
  forecastLow: number,
  kill10: number,
  kill90: number,
): FrostRiskLevel {
  if (forecastLow <= kill90) return "critical";
  if (forecastLow <= kill10) return "high";
  if (forecastLow <= kill10 + 2) return "moderate";
  if (forecastLow <= kill10 + 5) return "low";
  return "none";
}

/** Convert risk level to a base 0-100 score, refined by margin and hours. */
function computeRiskScore(
  riskLevel: FrostRiskLevel,
  marginC: number,
  hoursBelow: number,
): number {
  const baseScores: Record<FrostRiskLevel, number> = {
    none: 0,
    low: 20,
    moderate: 45,
    high: 70,
    critical: 90,
  };

  let score = baseScores[riskLevel];

  // Adjust within the band based on margin (closer to threshold = higher)
  if (riskLevel === "low") {
    // margin is between 2 and 5 — map linearly to 15-35
    score = 15 + ((5 - marginC) / 3) * 20;
  } else if (riskLevel === "moderate") {
    // margin is between 0 and 2 — map to 40-60
    score = 40 + ((2 - marginC) / 2) * 20;
  } else if (riskLevel === "high" || riskLevel === "critical") {
    // Boost by hours below threshold (each hour adds ~0.5 points)
    score += Math.min(hoursBelow * 0.5, 10);
  }

  return clamp(Math.round(score), 0, 100);
}

/** Build a plain-English recommendation for the dashboard. */
function getRecommendation(
  riskLevel: FrostRiskLevel,
  forecastLow: number,
  marginC: number,
): string {
  switch (riskLevel) {
    case "critical":
      return (
        `Critical frost risk — forecast low of ${forecastLow.toFixed(1)}°C is at or below the 90% kill threshold. ` +
        "Deploy all available frost protection immediately (wind machines, heaters, overhead irrigation)."
      );
    case "high":
      return (
        `High frost risk — forecast low of ${forecastLow.toFixed(1)}°C is at or below the 10% kill threshold. ` +
        "Activate frost protection measures. Monitor conditions through the night."
      );
    case "moderate":
      return (
        `Moderate frost risk — forecast low is within ${marginC.toFixed(1)}°C of the damage threshold. ` +
        "Prepare frost protection equipment and monitor overnight temperatures closely."
      );
    case "low":
      return (
        `Low frost risk — forecast low is ${marginC.toFixed(1)}°C above the damage threshold. ` +
        "No immediate action needed but remain aware of changing forecasts."
      );
    case "none":
      return "No frost risk. Temperatures are well above damage thresholds for the current bud stage.";
  }
}

/** Build a conversational details string. */
function buildDetails(
  forecastLow: number,
  kill10: number,
  kill90: number,
  marginC: number,
  hoursBelow: number,
  riskLevel: FrostRiskLevel,
  bloomStage: string,
): string {
  if (riskLevel === "critical") {
    return `Forecast low of ${forecastLow.toFixed(1)}°C is at or below the 90% bud kill temperature (${kill90}°C) for ${bloomStage} stage. ${hoursBelow} hours below the damage threshold forecast. Deploy all frost protection immediately.`;
  }

  if (riskLevel === "high") {
    return `Forecast low of ${forecastLow.toFixed(1)}°C could cause bud damage at the ${bloomStage} stage — the 10% kill threshold is ${kill10}°C. ${hoursBelow} hours below the damage threshold in the forecast. Activate frost protection.`;
  }

  if (riskLevel === "moderate") {
    return `Forecast low of ${forecastLow.toFixed(1)}°C is within ${marginC.toFixed(1)}°C of the damage threshold (${kill10}°C) for ${bloomStage} stage. Prepare frost protection equipment and monitor overnight.`;
  }

  if (riskLevel === "low") {
    return `Forecast low of ${forecastLow.toFixed(1)}°C is ${marginC.toFixed(1)}°C above the damage threshold for ${bloomStage} stage. No immediate concern but watch for forecast changes.`;
  }

  return `No frost risk. Temperatures are well above the ${kill10}°C damage threshold for ${bloomStage} stage buds.`;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate frost damage risk by comparing the 48-hour hourly temperature
 * forecast against Michigan State bud stage kill thresholds.
 *
 * @param hourlyForecast  Up to 48 hours of forecast data with temperatures.
 * @param bloomStage      Current phenological bud stage.
 * @returns               Complete frost risk assessment.
 */
export function evaluateFrostRisk(
  hourlyForecast: Array<{ timestamp: string; temp_c: number }>,
  bloomStage: string,
): FrostRiskResult {
  // ------------------------------------------------------------------
  // 1. Resolve kill thresholds for the current bud stage
  // ------------------------------------------------------------------

  const stage = (bloomStage as BudStage) in BUD_STAGE_THRESHOLDS
    ? (bloomStage as BudStage)
    : "dormant";

  const { kill10, kill90 } = BUD_STAGE_THRESHOLDS[stage];

  // ------------------------------------------------------------------
  // 2. Find the forecast low and count hours below threshold
  // ------------------------------------------------------------------

  const temps = hourlyForecast.map((h) => h.temp_c);
  const forecastLow = temps.length > 0 ? Math.min(...temps) : 0;

  const hoursBelow = temps.filter((t) => t <= kill10).length;

  // ------------------------------------------------------------------
  // 3. Classify risk
  // ------------------------------------------------------------------

  const marginC = forecastLow - kill10;
  const riskLevel = classifyFrostRisk(forecastLow, kill10, kill90);
  const riskScore = computeRiskScore(riskLevel, marginC, hoursBelow);

  // ------------------------------------------------------------------
  // 4. Recommendation and details
  // ------------------------------------------------------------------

  const recommendation = getRecommendation(riskLevel, forecastLow, marginC);
  const details = buildDetails(
    forecastLow,
    kill10,
    kill90,
    marginC,
    hoursBelow,
    riskLevel,
    bloomStage,
  );

  return {
    riskLevel,
    riskScore,
    forecastLow,
    killThreshold10: kill10,
    killThreshold90: kill90,
    marginC,
    hoursBelow,
    details,
    recommendation,
  };
}
