// ---------------------------------------------------------------------------
// Cedar Apple Rust Disease Model
//
// Evaluates cedar apple rust risk based on rain events during the susceptible
// window (bloom through 4 weeks post-bloom). Spore release from cedar galls
// requires warm rain — accumulation > 2.5 mm in a day with temperatures
// above 10°C. Enhanced with telial horn wetting detection and spore dispersal
// window tracking.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CedarRustRiskLevel = "low" | "moderate" | "high";

export interface CedarRustResult {
  riskLevel: CedarRustRiskLevel;
  /** Numeric risk score on a 0-100 scale. */
  riskScore: number;
  /** True if currently within the susceptible window (bloom through 4 weeks post-bloom). */
  inSusceptibleWindow: boolean;
  /** Number of qualifying rain events (>2.5mm daily accumulation AND temp >10°C) during the window. */
  recentRainEvents: number;
  /** Whether the infection window is open, closed, or approaching. */
  infectionWindowStatus: "open" | "closed" | "approaching";
  /** Whether juniper trees are known to be nearby. */
  juniperNearby: boolean;
  /** Count of qualifying telial horn wetting events. */
  sporulationEvents: number;
  /** Specific product recommendations. */
  productSuggestions: string[];
  details: string;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum daily precipitation (mm) to qualify as a spore-dispersal rain event. */
const RAIN_THRESHOLD_MM = 2.5;

/** Minimum temperature (°C) for spore release activity. */
const TEMP_THRESHOLD_C = 10;

/** Susceptible window extends this many days after petal fall. */
const POST_BLOOM_WINDOW_DAYS = 28;

/** Minimum consecutive hours of rain >2.5mm at >10°C for telial horn wetting. */
const TELIAL_WETTING_MIN_HOURS = 4;

/** Bloom stages that indicate the tree is at or past bloom. */
const AT_OR_PAST_BLOOM = new Set([
  "bloom",
  "petal-fall",
  "fruit-set",
]);

/** Bloom stages approaching bloom (for "approaching" infection window status). */
const APPROACHING_BLOOM = new Set(["pink", "tight-cluster"]);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Clamp a number into a range. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Determine whether the orchard is currently within the susceptible window.
 *
 * The window opens at bloom and closes 4 weeks after petal fall. If petal
 * fall has not occurred yet and the tree is at or past bloom, the window is
 * considered open.
 */
function isInSusceptibleWindow(
  bloomStage: string,
  petalFallDate: string | null,
  now: Date,
): boolean {
  // If we have a petal-fall date, the window is bloom through petalFall + 28 days.
  if (petalFallDate) {
    const windowEnd = new Date(petalFallDate);
    windowEnd.setDate(windowEnd.getDate() + POST_BLOOM_WINDOW_DAYS);
    return now <= windowEnd;
  }

  // No petal-fall date yet — window is open if currently at or past bloom.
  return AT_OR_PAST_BLOOM.has(bloomStage) || bloomStage === "bloom";
}

/**
 * Determine the infection window status.
 */
function getInfectionWindowStatus(
  inWindow: boolean,
  bloomStage: string,
): "open" | "closed" | "approaching" {
  if (inWindow) return "open";
  if (APPROACHING_BLOOM.has(bloomStage)) return "approaching";
  return "closed";
}

/**
 * Aggregate hourly data into daily buckets and count qualifying rain events.
 *
 * A qualifying event is a calendar day where:
 *   - total precipitation > 2.5 mm, AND
 *   - at least one hour had temp > 10°C
 */
function countRainEvents(
  hourlyData: Array<{ timestamp: string; temp_c: number; precip_mm: number }>,
): number {
  // Aggregate by calendar day
  const dailyBuckets: Map<
    string,
    { totalPrecip: number; maxTemp: number }
  > = new Map();

  for (const record of hourlyData) {
    const day = record.timestamp.slice(0, 10);
    const existing = dailyBuckets.get(day);

    if (existing) {
      existing.totalPrecip += record.precip_mm;
      if (record.temp_c > existing.maxTemp) {
        existing.maxTemp = record.temp_c;
      }
    } else {
      dailyBuckets.set(day, {
        totalPrecip: record.precip_mm,
        maxTemp: record.temp_c,
      });
    }
  }

  let events = 0;
  dailyBuckets.forEach(({ totalPrecip, maxTemp }) => {
    if (totalPrecip > RAIN_THRESHOLD_MM && maxTemp > TEMP_THRESHOLD_C) {
      events++;
    }
  });

  return events;
}

/**
 * Count telial horn wetting events: rain >2.5mm at temps >10°C for >4
 * consecutive hours. Also identifies spore dispersal windows (4-6 hours
 * after rain begins).
 */
function countSporulationEvents(
  hourlyData: Array<{ timestamp: string; temp_c: number; precip_mm: number }>,
): number {
  let sporulationEvents = 0;
  let consecutiveWetWarmHours = 0;
  let rollingPrecip = 0;
  const precipWindow: number[] = [];

  for (const record of hourlyData) {
    // Track rolling 4-hour precipitation
    precipWindow.push(record.precip_mm);
    rollingPrecip += record.precip_mm;

    if (precipWindow.length > TELIAL_WETTING_MIN_HOURS) {
      rollingPrecip -= precipWindow.shift()!;
    }

    const isWetWarm =
      record.precip_mm > 0 && record.temp_c > TEMP_THRESHOLD_C;

    if (isWetWarm) {
      consecutiveWetWarmHours++;

      // If we've had 4+ consecutive wet warm hours with sufficient total precip,
      // this is a telial horn wetting event
      if (
        consecutiveWetWarmHours >= TELIAL_WETTING_MIN_HOURS &&
        rollingPrecip > RAIN_THRESHOLD_MM
      ) {
        // Only count once per event (when we first cross the threshold)
        if (consecutiveWetWarmHours === TELIAL_WETTING_MIN_HOURS) {
          sporulationEvents++;
        }
      }
    } else {
      consecutiveWetWarmHours = 0;
    }
  }

  return sporulationEvents;
}

/**
 * Check whether there is rain in the forecast portion of the data (any
 * hour with precip > 0.1 mm and temp > 10°C).
 */
function hasRainForecast(
  hourlyData: Array<{ timestamp: string; temp_c: number; precip_mm: number }>,
): boolean {
  // Consider the last 48 hours as "forecast" data
  const forecastWindow = hourlyData.slice(-48);
  return forecastWindow.some(
    (h) => h.precip_mm > 0.1 && h.temp_c > TEMP_THRESHOLD_C,
  );
}

/**
 * Classify risk level.
 *
 * - high:     rain event during susceptible window
 * - moderate: in susceptible window with rain forecast
 * - low:      outside window or no rain
 */
function classifyRisk(
  inWindow: boolean,
  rainEvents: number,
  rainForecast: boolean,
): CedarRustRiskLevel {
  if (inWindow && rainEvents > 0) return "high";
  if (inWindow && rainForecast) return "moderate";
  return "low";
}

/**
 * Adjust risk level down one step if juniper is not nearby.
 */
function adjustRiskForJuniper(
  riskLevel: CedarRustRiskLevel,
  juniperNearby: boolean,
): CedarRustRiskLevel {
  if (juniperNearby) return riskLevel;

  const levels: CedarRustRiskLevel[] = ["low", "moderate", "high"];
  const idx = levels.indexOf(riskLevel);
  return levels[Math.max(idx - 1, 0)];
}

/** Convert risk level to a 0-100 score, adjusted by rain event count. */
function computeRiskScore(
  riskLevel: CedarRustRiskLevel,
  rainEvents: number,
  inWindow: boolean,
): number {
  if (!inWindow) return 5;

  const baseScores: Record<CedarRustRiskLevel, number> = {
    low: 10,
    moderate: 45,
    high: 75,
  };

  let score = baseScores[riskLevel];

  // Multiple rain events compound risk
  if (riskLevel === "high") {
    score += Math.min(rainEvents * 5, 20);
  }

  return clamp(Math.round(score), 0, 100);
}

/** Build a plain-English recommendation. */
function getRecommendation(
  riskLevel: CedarRustRiskLevel,
  inWindow: boolean,
): string {
  if (!inWindow) {
    return "Outside the susceptible window. No cedar apple rust action needed.";
  }

  switch (riskLevel) {
    case "high":
      return (
        "High cedar apple rust risk — warm rain event(s) detected during the susceptible window. " +
        "Apply protectant fungicide (myclobutanil or mancozeb) as soon as possible. " +
        "Reapply after additional rain events."
      );
    case "moderate":
      return (
        "Moderate cedar apple rust risk — susceptible window is open and rain is forecast. " +
        "Apply protectant fungicide before the next rain event for best coverage."
      );
    case "low":
      return (
        "Low cedar apple rust risk. Susceptible window may be open but no significant rain detected. " +
        "Monitor forecast for upcoming rain events."
      );
  }
}

/** Get product suggestions for cedar apple rust. */
function getProductSuggestions(riskLevel: CedarRustRiskLevel): string[] {
  if (riskLevel === "low") {
    return [];
  }
  return ["Mancozeb", "Nova (myclobutanil)", "Flint (trifloxystrobin)"];
}

/** Build a conversational details string. */
function buildDetails(
  inWindow: boolean,
  rainEvents: number,
  riskLevel: CedarRustRiskLevel,
  bloomStage: string,
  petalFallDate: string | null,
  infectionWindowStatus: "open" | "closed" | "approaching",
  juniperNearby: boolean,
  sporulationEvents: number,
): string {
  if (riskLevel === "high") {
    return `Warm rain during the susceptible window is creating high cedar apple rust risk. ${rainEvents} qualifying rain event(s) detected${juniperNearby ? " with juniper/cedar trees nearby as a spore source" : ""}. Apply protectant fungicide as soon as possible.`;
  }

  if (riskLevel === "moderate") {
    return `The susceptible window is open and rain is in the forecast. ${juniperNearby ? "Juniper/cedar trees nearby can release spores during warm rain. " : ""}Apply protectant fungicide before the next rain event.`;
  }

  if (infectionWindowStatus === "approaching") {
    return `Bloom is approaching — the cedar apple rust susceptible window will open soon. ${juniperNearby ? "Juniper/cedar trees nearby can serve as a spore source. " : ""}Have fungicide ready for first warm rain at bloom.`;
  }

  if (!inWindow && petalFallDate) {
    return "Outside the susceptible window. Cedar apple rust risk has passed for this season — the infection window runs from bloom through 4 weeks after petal fall.";
  }

  if (inWindow) {
    return `Susceptible window is open but no qualifying rain events detected yet. Cedar apple rust spores spread during warm rain (>10°C, >2.5mm) — monitor the forecast.`;
  }

  return "Too early for cedar apple rust concern. The susceptible window opens at bloom when spores from nearby cedar/juniper trees can spread to apple leaves during warm rain.";
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate cedar apple rust risk based on rain events during the
 * susceptible window (bloom through 4 weeks post-bloom).
 *
 * @param hourlyData     Hourly observations including temperature and
 *                       precipitation.
 * @param bloomStage     Current phenological bloom stage.
 * @param petalFallDate  ISO date string for petal fall, or `null` if not
 *                       yet occurred.
 * @param juniperNearby  Whether juniper/cedar trees are known to be nearby
 *                       (defaults to true for conservative assessment).
 * @returns              Complete cedar apple rust risk assessment.
 */
export function evaluateCedarRust(
  hourlyData: Array<{
    timestamp: string;
    temp_c: number;
    precip_mm: number;
  }>,
  bloomStage: string,
  petalFallDate: string | null,
  juniperNearby: boolean = true,
): CedarRustResult {
  // ------------------------------------------------------------------
  // 1. Determine if we are in the susceptible window
  // ------------------------------------------------------------------

  const now =
    hourlyData.length > 0
      ? new Date(hourlyData[hourlyData.length - 1].timestamp)
      : new Date();

  const inSusceptibleWindow = isInSusceptibleWindow(
    bloomStage,
    petalFallDate,
    now,
  );

  // ------------------------------------------------------------------
  // 2. Determine infection window status
  // ------------------------------------------------------------------

  const infectionWindowStatus = getInfectionWindowStatus(
    inSusceptibleWindow,
    bloomStage,
  );

  // ------------------------------------------------------------------
  // 3. Count qualifying rain events
  // ------------------------------------------------------------------

  const recentRainEvents = countRainEvents(hourlyData);

  // ------------------------------------------------------------------
  // 4. Count telial horn sporulation events
  // ------------------------------------------------------------------

  const sporulationEvents = countSporulationEvents(hourlyData);

  // ------------------------------------------------------------------
  // 5. Check for rain in forecast
  // ------------------------------------------------------------------

  const rainForecast = hasRainForecast(hourlyData);

  // ------------------------------------------------------------------
  // 6. Classify risk (with juniper adjustment)
  // ------------------------------------------------------------------

  const baseRiskLevel = classifyRisk(
    inSusceptibleWindow,
    recentRainEvents,
    rainForecast,
  );

  const riskLevel = adjustRiskForJuniper(baseRiskLevel, juniperNearby);

  const riskScore = computeRiskScore(
    riskLevel,
    recentRainEvents,
    inSusceptibleWindow,
  );

  // ------------------------------------------------------------------
  // 7. Product suggestions
  // ------------------------------------------------------------------

  const productSuggestions = getProductSuggestions(riskLevel);

  // ------------------------------------------------------------------
  // 8. Recommendation and details
  // ------------------------------------------------------------------

  const recommendation = getRecommendation(riskLevel, inSusceptibleWindow);
  const details = buildDetails(
    inSusceptibleWindow,
    recentRainEvents,
    riskLevel,
    bloomStage,
    petalFallDate,
    infectionWindowStatus,
    juniperNearby,
    sporulationEvents,
  );

  return {
    riskLevel,
    riskScore,
    inSusceptibleWindow,
    recentRainEvents,
    infectionWindowStatus,
    juniperNearby,
    sporulationEvents,
    productSuggestions,
    details,
    recommendation,
  };
}
