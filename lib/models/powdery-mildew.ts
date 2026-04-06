// ---------------------------------------------------------------------------
// Powdery Mildew Disease Model
//
// Tracks consecutive hours of favorable conditions (moderate temperature,
// high humidity, no rain) and cross-references with susceptible bloom stages
// to determine powdery mildew infection risk.
//
// Favorable conditions: temp 10-25°C, humidity > 70%, no rain (< 0.1 mm).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MildewRiskLevel = "low" | "moderate" | "high";

export type VarietySusceptibility =
  | "resistant"
  | "moderate"
  | "susceptible"
  | "highly_susceptible";

export interface PowderyMildewResult {
  riskLevel: MildewRiskLevel;
  /** Numeric risk score on a 0-100 scale. */
  riskScore: number;
  /** Longest streak of consecutive favorable hours in the data. */
  consecutiveFavorableHours: number;
  /** Number of days that contain at least 6 favorable hours. */
  favorableDays: number;
  /** True if the current bloom stage is pink, bloom, or petal-fall. */
  susceptibleStage: boolean;
  /** True from green-tip through tight-cluster (ascospore release from overwintering chasmothecia). */
  primaryInfectionWindow: boolean;
  /** True from pink through fruit-set (conidial spread). */
  secondaryInfectionWindow: boolean;
  /** True if rain >2.5mm occurred after green-tip. */
  ascosporeReleaseTriggered: boolean;
  /** The variety susceptibility label. */
  varietyRisk: string;
  /** Specific product recommendations based on risk and stage. */
  productSuggestions: string[];
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Bloom stages considered susceptible to powdery mildew. */
const SUSCEPTIBLE_STAGES = new Set(["pink", "bloom", "petal-fall"]);

/** Stages within the primary infection window (ascospore release). */
const PRIMARY_WINDOW_STAGES = new Set([
  "green-tip",
  "half-inch-green",
  "tight-cluster",
]);

/** Stages within the secondary infection window (conidial spread). */
const SECONDARY_WINDOW_STAGES = new Set([
  "pink",
  "bloom",
  "petal-fall",
  "fruit-set",
]);

/** Stages at or past green-tip (ascospore release can be triggered). */
const AT_OR_PAST_GREEN_TIP = new Set([
  "green-tip",
  "half-inch-green",
  "tight-cluster",
  "pink",
  "bloom",
  "petal-fall",
  "fruit-set",
]);

/** Bloom stages where flag-leaf infection risk is highest. */
const FLAG_LEAF_STAGES = new Set(["pink", "bloom", "petal-fall"]);

/** Rain threshold (mm) for triggering ascospore release. */
const ASCOSPORE_RAIN_THRESHOLD_MM = 2.5;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Clamp a number into a range. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Determine whether a single hour is favorable for powdery mildew. */
function isFavorableHour(record: {
  temp_c: number;
  humidity_pct: number;
  precip_mm: number;
}): boolean {
  return (
    record.temp_c >= 10 &&
    record.temp_c <= 25 &&
    record.humidity_pct > 70 &&
    record.precip_mm < 0.1
  );
}

/**
 * Find the longest streak of consecutive favorable hours and count
 * favorable days (days with at least 6 favorable hours).
 */
function analyzeFavorableConditions(
  hourlyData: Array<{
    timestamp: string;
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
  }>,
): { maxConsecutive: number; favorableDays: number } {
  let maxConsecutive = 0;
  let currentStreak = 0;

  // Track favorable hours per calendar day for favorableDays count
  const dayHours: Map<string, number> = new Map();

  for (const record of hourlyData) {
    if (isFavorableHour(record)) {
      currentStreak++;
      if (currentStreak > maxConsecutive) {
        maxConsecutive = currentStreak;
      }

      // Count favorable hours per day
      const day = record.timestamp.slice(0, 10);
      dayHours.set(day, (dayHours.get(day) ?? 0) + 1);
    } else {
      currentStreak = 0;
    }
  }

  // A day is "favorable" if it has at least 6 favorable hours
  let favorableDays = 0;
  dayHours.forEach((hours) => {
    if (hours >= 6) favorableDays++;
  });

  return { maxConsecutive, favorableDays };
}

/**
 * Check whether rain >2.5mm occurred in the hourly data (for ascospore
 * release triggering after green-tip).
 */
function checkAscosporeRainTrigger(
  hourlyData: Array<{ precip_mm: number }>,
): boolean {
  // Aggregate total precip and check if any single hour exceeds threshold
  // or if cumulative rain in any 24h window exceeds threshold
  let rollingSum = 0;
  const window: number[] = [];

  for (const record of hourlyData) {
    window.push(record.precip_mm);
    rollingSum += record.precip_mm;

    if (window.length > 24) {
      rollingSum -= window.shift()!;
    }

    if (rollingSum > ASCOSPORE_RAIN_THRESHOLD_MM) {
      return true;
    }
  }

  return false;
}

/**
 * Classify risk level based on consecutive favorable hours and bloom stage.
 *
 * - high:     72+ consecutive favorable hours AND susceptible stage
 * - moderate: 48+ favorable hours OR (favorable + susceptible stage)
 * - low:      otherwise
 */
function classifyRisk(
  consecutiveHours: number,
  susceptibleStage: boolean,
): MildewRiskLevel {
  if (consecutiveHours >= 72 && susceptibleStage) return "high";
  if (consecutiveHours >= 48) return "moderate";
  if (consecutiveHours > 0 && susceptibleStage) return "moderate";
  return "low";
}

/**
 * Adjust risk level based on variety susceptibility.
 *
 * - highly_susceptible: step up one level
 * - resistant: step down one level
 * - moderate / susceptible: no change
 */
function adjustRiskForVariety(
  riskLevel: MildewRiskLevel,
  susceptibility: VarietySusceptibility,
): MildewRiskLevel {
  const levels: MildewRiskLevel[] = ["low", "moderate", "high"];
  const idx = levels.indexOf(riskLevel);

  if (susceptibility === "highly_susceptible") {
    return levels[Math.min(idx + 1, levels.length - 1)];
  }

  if (susceptibility === "resistant") {
    return levels[Math.max(idx - 1, 0)];
  }

  return riskLevel;
}

/** Convert risk level to a 0-100 score, refined by consecutive hours. */
function computeRiskScore(
  riskLevel: MildewRiskLevel,
  consecutiveHours: number,
  susceptibleStage: boolean,
): number {
  const baseScores: Record<MildewRiskLevel, number> = {
    low: 10,
    moderate: 45,
    high: 80,
  };

  let score = baseScores[riskLevel];

  // Refine within the band based on how many consecutive hours
  if (riskLevel === "high") {
    // 72-120+ hours maps to 75-95
    score = 75 + Math.min((consecutiveHours - 72) / 48, 1) * 20;
  } else if (riskLevel === "moderate") {
    // Scale based on hours and susceptibility
    if (consecutiveHours >= 48) {
      score = 45 + Math.min((consecutiveHours - 48) / 24, 1) * 20;
    } else if (susceptibleStage) {
      score = 40 + Math.min(consecutiveHours / 48, 1) * 15;
    }
  } else {
    // Low: scale 0-25 based on hours accumulated
    score = Math.min(consecutiveHours / 48, 1) * 25;
  }

  return clamp(Math.round(score), 0, 100);
}

/** Determine product suggestions based on risk level and bloom stage. */
function getProductSuggestions(
  riskLevel: MildewRiskLevel,
  susceptibleStage: boolean,
): string[] {
  if (riskLevel === "high" || (riskLevel === "moderate" && susceptibleStage)) {
    return [
      "Nova (myclobutanil)",
      "Flint (trifloxystrobin)",
      "Merivon",
      "Sulfur (organic)",
    ];
  }

  if (riskLevel === "moderate") {
    return ["Sulfur", "Nova"];
  }

  return ["Continue monitoring"];
}

/** Build a plain-English recommendation. */
function getRecommendation(
  riskLevel: MildewRiskLevel,
  susceptibleStage: boolean,
): string {
  switch (riskLevel) {
    case "high":
      return (
        "High powdery mildew risk. Apply protectant fungicide (sulfur, myclobutanil, or trifloxystrobin) " +
        "immediately. Reapply on 7-10 day intervals while conditions persist."
      );
    case "moderate":
      if (susceptibleStage) {
        return (
          "Moderate powdery mildew risk during susceptible bloom stage. " +
          "Apply protectant fungicide within the next 1-2 days. Monitor humidity levels."
        );
      }
      return (
        "Moderate powdery mildew risk. Extended favorable conditions detected. " +
        "Have fungicide ready and monitor for early symptoms on new growth."
      );
    case "low":
      return "Low powdery mildew risk. Continue routine monitoring. No fungicide action needed at this time.";
  }
}

/** Build a conversational details string. */
function buildDetails(
  consecutiveHours: number,
  favorableDays: number,
  susceptibleStage: boolean,
  bloomStage: string,
  riskLevel: MildewRiskLevel,
  primaryInfectionWindow: boolean,
  secondaryInfectionWindow: boolean,
  ascosporeReleaseTriggered: boolean,
  varietySusceptibility: VarietySusceptibility,
  flagLeafRisk: boolean,
): string {
  if (riskLevel === "high") {
    let msg = `Extended favorable conditions (${consecutiveHours} consecutive hours of mild, humid, rain-free weather) are driving high powdery mildew risk.`;
    if (flagLeafRisk) {
      msg += " Flag-leaf infection risk is elevated at this bloom stage — infected flag leaves reduce fruit quality.";
    }
    if (varietySusceptibility === "highly_susceptible") {
      msg += " Your variety is highly susceptible.";
    }
    return msg;
  }

  if (riskLevel === "moderate") {
    if (susceptibleStage) {
      return `The current bloom stage (${bloomStage}) is susceptible to powdery mildew, and ${consecutiveHours > 0 ? `${consecutiveHours} hours of favorable conditions (mild, humid, no rain) have been detected` : "conditions are being monitored"}. Have fungicide ready.`;
    }
    return `${consecutiveHours} consecutive hours of favorable conditions (10–25°C, >70% humidity, no rain) detected. Powdery mildew thrives in warm, humid weather without rain washing spores off leaves.`;
  }

  if (primaryInfectionWindow) {
    return `Primary infection window is open (${bloomStage} stage). Powdery mildew overwinters in buds and releases spores during this period. No extended favorable conditions detected yet.`;
  }

  if (secondaryInfectionWindow) {
    return `Secondary infection window is open. Watch for white powdery patches on new shoot growth. No extended favorable conditions detected recently.`;
  }

  return "No significant powdery mildew conditions detected. The fungus needs extended periods of mild (10–25°C), humid (>70%) weather without rain.";
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate powdery mildew risk based on hourly weather conditions and
 * current bloom stage.
 *
 * @param hourlyData            Hourly observations including temperature, humidity,
 *                              and precipitation.
 * @param bloomStage            Current phenological bloom stage.
 * @param varietySusceptibility Variety susceptibility rating (defaults to 'moderate').
 * @returns                     Complete powdery mildew risk assessment.
 */
export function evaluatePowderyMildew(
  hourlyData: Array<{
    timestamp: string;
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
  }>,
  bloomStage: string,
  varietySusceptibility: VarietySusceptibility = "moderate",
): PowderyMildewResult {
  // ------------------------------------------------------------------
  // 1. Determine susceptibility from bloom stage
  // ------------------------------------------------------------------

  const susceptibleStage = SUSCEPTIBLE_STAGES.has(bloomStage);

  // ------------------------------------------------------------------
  // 2. Determine infection windows
  // ------------------------------------------------------------------

  const primaryInfectionWindow = PRIMARY_WINDOW_STAGES.has(bloomStage);
  const secondaryInfectionWindow = SECONDARY_WINDOW_STAGES.has(bloomStage);

  // ------------------------------------------------------------------
  // 3. Check ascospore release trigger
  // ------------------------------------------------------------------

  const ascosporeReleaseTriggered =
    AT_OR_PAST_GREEN_TIP.has(bloomStage) &&
    checkAscosporeRainTrigger(hourlyData);

  // ------------------------------------------------------------------
  // 4. Analyze favorable conditions
  // ------------------------------------------------------------------

  const { maxConsecutive, favorableDays } =
    analyzeFavorableConditions(hourlyData);

  // ------------------------------------------------------------------
  // 5. Classify risk (with variety adjustment)
  // ------------------------------------------------------------------

  const baseRiskLevel = classifyRisk(maxConsecutive, susceptibleStage);
  const riskLevel = adjustRiskForVariety(baseRiskLevel, varietySusceptibility);
  const riskScore = computeRiskScore(riskLevel, maxConsecutive, susceptibleStage);

  // ------------------------------------------------------------------
  // 6. Flag-leaf infection risk
  // ------------------------------------------------------------------

  const flagLeafRisk =
    FLAG_LEAF_STAGES.has(bloomStage) && maxConsecutive > 0;

  // ------------------------------------------------------------------
  // 7. Product suggestions
  // ------------------------------------------------------------------

  const productSuggestions = getProductSuggestions(riskLevel, susceptibleStage);

  // ------------------------------------------------------------------
  // 8. Recommendation and details
  // ------------------------------------------------------------------

  const recommendation = getRecommendation(riskLevel, susceptibleStage);
  const details = buildDetails(
    maxConsecutive,
    favorableDays,
    susceptibleStage,
    bloomStage,
    riskLevel,
    primaryInfectionWindow,
    secondaryInfectionWindow,
    ascosporeReleaseTriggered,
    varietySusceptibility,
    flagLeafRisk,
  );

  return {
    riskLevel,
    riskScore,
    consecutiveFavorableHours: maxConsecutive,
    favorableDays,
    susceptibleStage,
    primaryInfectionWindow,
    secondaryInfectionWindow,
    ascosporeReleaseTriggered,
    varietyRisk: varietySusceptibility,
    productSuggestions,
    details,
    recommendation,
  };
}
