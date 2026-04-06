// ---------------------------------------------------------------------------
// Sooty Blotch & Flyspeck Disease Model
//
// Tracks cumulative hours of high humidity (>97%) since petal fall. The
// first appearance of sooty blotch/flyspeck symptoms occurs at a threshold
// that varies by microclimate (175-270 cumulative humid hours). Enhanced
// reset logic subtracts hours for dry days and fully resets after 7+
// consecutive dry days.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SootyBlotchRiskLevel = "low" | "moderate" | "high";

export type Microclimate = "cool_wet" | "moderate" | "warm_dry";

export interface SootyBlotchResult {
  riskLevel: SootyBlotchRiskLevel;
  /** Numeric risk score on a 0-100 scale. */
  riskScore: number;
  /** Cumulative hours of humidity >97% since petal fall (with dry resets). */
  cumulativeHumidHours: number;
  /** Hours needed for first symptom appearance (varies by microclimate). */
  threshold: number;
  /** How close to the threshold (0-100+). */
  percentToThreshold: number;
  /** Days since petal fall (0 if petal fall has not occurred). */
  daysSincePetalFall: number;
  /** The microclimate classification used for threshold selection. */
  microclimate: string;
  /** The appearance threshold for the selected microclimate. */
  thresholdForMicroclimate: number;
  /** Trend direction based on the last 48 hours. */
  trendDirection: "increasing" | "stable" | "decreasing";
  /** Product suggestions when approaching or at threshold. */
  productSuggestions: string[];
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Cumulative humid hours thresholds by microclimate. */
const APPEARANCE_THRESHOLDS: Record<Microclimate, number> = {
  cool_wet: 175,
  moderate: 200,
  warm_dry: 270,
};

/** Default appearance threshold (for backward compatibility). */
const DEFAULT_APPEARANCE_THRESHOLD = 270;

/** Hours of continuous dry conditions required for a full reset (7 days). */
const FULL_RESET_DRY_DAYS = 7;

/** Hours to subtract from accumulation per dry day (partial reset). */
const PARTIAL_RESET_HOURS = 24;

/** Humidity threshold for a "humid" hour. */
const HUMIDITY_THRESHOLD_PCT = 97;

/** Humidity threshold below which a day counts as "dry" for resets. */
const DRY_HUMIDITY_THRESHOLD_PCT = 90;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Clamp a number into a range. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Determine whether a single hour counts as "humid" for sooty blotch
 * accumulation (humidity > 97%).
 */
function isHumidHour(record: { humidity_pct: number }): boolean {
  return record.humidity_pct > HUMIDITY_THRESHOLD_PCT;
}

/**
 * Determine whether a single hour counts as "dry" for the dry-period
 * reset logic (humidity < 90% AND no precipitation).
 */
function isDryHour(record: { humidity_pct: number; precip_mm: number }): boolean {
  return record.humidity_pct < DRY_HUMIDITY_THRESHOLD_PCT && record.precip_mm === 0;
}

/**
 * Accumulate humid hours since petal fall with enhanced dry-period resets.
 *
 * Only hours on or after the petal fall date are counted. Dry-day logic:
 * - Partial reset: subtract 24 hours for each full dry day (24h+ of
 *   humidity <90% and no precipitation).
 * - Full reset: 7+ consecutive dry days resets accumulation to zero.
 */
function accumulateHumidHours(
  hourlyData: Array<{
    timestamp: string;
    humidity_pct: number;
    precip_mm: number;
  }>,
  petalFallDate: string,
): number {
  const petalFallTime = new Date(petalFallDate).getTime();

  let cumulativeHours = 0;
  let consecutiveDryHours = 0;

  for (const record of hourlyData) {
    const recordTime = new Date(record.timestamp).getTime();

    // Only count hours on or after petal fall
    if (recordTime < petalFallTime) continue;

    if (isDryHour(record)) {
      consecutiveDryHours++;

      // Full reset: 7+ consecutive dry days (168 hours)
      if (consecutiveDryHours >= FULL_RESET_DRY_DAYS * 24) {
        cumulativeHours = 0;
      }
      // Partial reset: subtract 24 hours for each completed dry day
      else if (consecutiveDryHours > 0 && consecutiveDryHours % 24 === 0) {
        cumulativeHours = Math.max(0, cumulativeHours - PARTIAL_RESET_HOURS);
      }
    } else {
      consecutiveDryHours = 0;
    }

    if (isHumidHour(record)) {
      cumulativeHours++;
    }
  }

  return cumulativeHours;
}

/**
 * Determine the trend direction based on the last 48 hours.
 *
 * Compare humid hours in the first 24h vs the last 24h of the trailing
 * 48-hour window.
 */
function determineTrend(
  hourlyData: Array<{
    timestamp: string;
    humidity_pct: number;
    precip_mm: number;
  }>,
): "increasing" | "stable" | "decreasing" {
  if (hourlyData.length < 48) {
    return "stable";
  }

  const last48 = hourlyData.slice(-48);
  const firstHalf = last48.slice(0, 24);
  const secondHalf = last48.slice(24);

  const firstHumidCount = firstHalf.filter((r) => isHumidHour(r)).length;
  const secondHumidCount = secondHalf.filter((r) => isHumidHour(r)).length;

  const diff = secondHumidCount - firstHumidCount;

  if (diff >= 3) return "increasing";
  if (diff <= -3) return "decreasing";
  return "stable";
}

/**
 * Classify risk level based on cumulative humid hours and threshold.
 *
 * - high:     >= threshold hours (at or past threshold)
 * - moderate: >= threshold * 0.74 (approaching threshold)
 * - low:      < threshold * 0.74
 */
function classifyRisk(
  cumulativeHours: number,
  threshold: number,
): SootyBlotchRiskLevel {
  if (cumulativeHours >= threshold) return "high";
  // "Moderate" threshold is approximately 74% of the appearance threshold
  const moderateThreshold = Math.round(threshold * 0.74);
  if (cumulativeHours >= moderateThreshold) return "moderate";
  return "low";
}

/** Convert risk level to a 0-100 score based on progress toward threshold. */
function computeRiskScore(
  riskLevel: SootyBlotchRiskLevel,
  percentToThreshold: number,
): number {
  if (riskLevel === "high") {
    // At or past threshold: 80-100 based on how far past
    return clamp(80 + Math.round((percentToThreshold - 100) / 5), 80, 100);
  }

  if (riskLevel === "moderate") {
    // Approaching threshold: map to 45-75
    return clamp(Math.round(percentToThreshold * 0.75), 45, 75);
  }

  // Low: scale 0-40 based on percentage
  return clamp(Math.round(percentToThreshold * 0.4), 0, 40);
}

/** Get product suggestions based on risk level. */
function getProductSuggestions(riskLevel: SootyBlotchRiskLevel): string[] {
  if (riskLevel === "high" || riskLevel === "moderate") {
    return ["Captan", "Flint", "Merivon"];
  }
  return [];
}

/** Build a plain-English recommendation. */
function getRecommendation(
  riskLevel: SootyBlotchRiskLevel,
  percentToThreshold: number,
  daysSincePetalFall: number,
  microclimate: Microclimate,
  threshold: number,
): string {
  if (daysSincePetalFall === 0) {
    return "Petal fall has not occurred. Sooty blotch model not yet active. No action needed.";
  }

  switch (riskLevel) {
    case "high":
      return (
        `High sooty blotch/flyspeck risk — cumulative humid hours have reached the ${threshold}-hour threshold ` +
        `(${microclimate} microclimate). ` +
        "Apply protectant fungicide (captan or ziram) immediately if not already applied. " +
        "Maintain fungicide coverage through harvest."
      );
    case "moderate":
      return (
        `Moderate sooty blotch/flyspeck risk — ${percentToThreshold.toFixed(0)}% of ${threshold}-hour threshold reached ` +
        `(${microclimate} microclimate). ` +
        "Ensure fungicide coverage is current. Plan next application before threshold is reached."
      );
    case "low":
      return (
        "Low sooty blotch/flyspeck risk. Continue monitoring humid hour accumulation. " +
        "Maintain standard summer fungicide program."
      );
  }
}

/** Build a conversational details string. */
function buildDetails(
  cumulativeHours: number,
  percentToThreshold: number,
  daysSincePetalFall: number,
  riskLevel: SootyBlotchRiskLevel,
  petalFallDate: string | null,
  microclimate: Microclimate,
  threshold: number,
  trendDirection: "increasing" | "stable" | "decreasing",
): string {
  if (!petalFallDate) {
    return "Petal fall hasn't occurred yet. Sooty blotch and flyspeck are tracked from petal fall onward — set the petal fall date when it occurs.";
  }

  if (riskLevel === "high") {
    return `Cumulative humid hours have reached the ${threshold}-hour threshold — sooty blotch and flyspeck symptoms may appear on fruit. ${cumulativeHours} hours of high humidity (>97%) accumulated since petal fall. Apply protectant fungicide now and maintain coverage through harvest.`;
  }

  if (riskLevel === "moderate") {
    const trendNote = trendDirection === "increasing" ? "Humidity trend is increasing." : trendDirection === "decreasing" ? "Humidity trend is decreasing — a good sign." : "";
    return `${percentToThreshold.toFixed(0)}% of the way to the ${threshold}-hour humid threshold. ${cumulativeHours} hours of high humidity accumulated since petal fall (${daysSincePetalFall} days ago). ${trendNote} Keep fungicide coverage current.`;
  }

  return `Low risk. ${cumulativeHours} humid hours accumulated since petal fall — well below the ${threshold}-hour threshold for your microclimate. Sooty blotch and flyspeck develop when high humidity (>97%) persists for many hours across the summer.`;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate sooty blotch and flyspeck risk by accumulating hours of high
 * humidity (>97%) since petal fall, with resets for extended dry periods.
 *
 * @param hourlyData     Hourly observations including humidity and
 *                       precipitation.
 * @param petalFallDate  ISO date string for petal fall, or `null` if not
 *                       yet occurred.
 * @param microclimate   Microclimate classification for threshold selection
 *                       (defaults to 'moderate').
 * @returns              Complete sooty blotch/flyspeck risk assessment.
 */
export function evaluateSootyBlotch(
  hourlyData: Array<{
    timestamp: string;
    humidity_pct: number;
    precip_mm: number;
  }>,
  petalFallDate: string | null,
  microclimate: Microclimate = "moderate",
): SootyBlotchResult {
  // ------------------------------------------------------------------
  // 1. Determine threshold based on microclimate
  // ------------------------------------------------------------------

  const threshold = APPEARANCE_THRESHOLDS[microclimate];

  // ------------------------------------------------------------------
  // 2. Calculate days since petal fall
  // ------------------------------------------------------------------

  let daysSincePetalFall = 0;

  if (petalFallDate) {
    const now =
      hourlyData.length > 0
        ? new Date(hourlyData[hourlyData.length - 1].timestamp)
        : new Date();

    const petalFallTime = new Date(petalFallDate).getTime();
    const diffMs = now.getTime() - petalFallTime;
    daysSincePetalFall = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // ------------------------------------------------------------------
  // 3. Accumulate humid hours (only meaningful after petal fall)
  // ------------------------------------------------------------------

  let cumulativeHumidHours = 0;

  if (petalFallDate) {
    cumulativeHumidHours = accumulateHumidHours(hourlyData, petalFallDate);
  }

  // ------------------------------------------------------------------
  // 4. Calculate progress toward threshold
  // ------------------------------------------------------------------

  const percentToThreshold =
    threshold > 0
      ? (cumulativeHumidHours / threshold) * 100
      : 0;

  // ------------------------------------------------------------------
  // 5. Determine trend direction
  // ------------------------------------------------------------------

  const trendDirection = determineTrend(hourlyData);

  // ------------------------------------------------------------------
  // 6. Classify risk
  // ------------------------------------------------------------------

  const riskLevel = petalFallDate
    ? classifyRisk(cumulativeHumidHours, threshold)
    : "low";
  const riskScore = computeRiskScore(riskLevel, percentToThreshold);

  // ------------------------------------------------------------------
  // 7. Product suggestions
  // ------------------------------------------------------------------

  const productSuggestions = getProductSuggestions(riskLevel);

  // ------------------------------------------------------------------
  // 8. Recommendation and details
  // ------------------------------------------------------------------

  const recommendation = getRecommendation(
    riskLevel,
    percentToThreshold,
    daysSincePetalFall,
    microclimate,
    threshold,
  );

  const details = buildDetails(
    cumulativeHumidHours,
    percentToThreshold,
    daysSincePetalFall,
    riskLevel,
    petalFallDate,
    microclimate,
    threshold,
    trendDirection,
  );

  return {
    riskLevel,
    riskScore,
    cumulativeHumidHours,
    threshold,
    percentToThreshold: Math.round(percentToThreshold * 10) / 10,
    daysSincePetalFall,
    microclimate,
    thresholdForMicroclimate: threshold,
    trendDirection,
    productSuggestions,
    details,
    recommendation,
  };
}
