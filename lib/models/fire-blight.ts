// ---------------------------------------------------------------------------
// Fire Blight Disease Model — CougarBlight v5.1 + MaryBlyt v7.1 (combined)
//
// CougarBlight v5.1: rolling 4-day degree-hour accumulation above 15.5 °C
//   with temperature peak at 31 °C / decline to 40 °C, 5-level inoculum
//   adjustment, wetting-event gating, 4-day rolling breakdown, and 3-day
//   forward forecast projection.
// MaryBlyt v7.1: blossom-cohort tracking, EIP (Epiphytic Infection Potential),
//   symptom-appearance prediction via degree hours base 12.7 °C, four
//   simultaneous conditions indicating an active infection event.
// Combined logic merges both models into a single risk level, numeric score,
// spray recommendation, and product suggestions.
// ---------------------------------------------------------------------------

import { calcDegreeHoursFromHourly } from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RiskLevel = "low" | "caution" | "high" | "extreme";

export type BloomStage =
  | "dormant"
  | "silver-tip"
  | "green-tip"
  | "tight-cluster"
  | "pink"
  | "bloom"
  | "petal-fall"
  | "fruit-set";

export type InoculumLevel = "none" | "low" | "moderate" | "high" | "extreme";

export interface DayBreakdown {
  date: string;
  degreeHours: number;
  hadWetting: boolean;
}

export interface ForecastRisk {
  date: string;
  projectedDH: number;
  projectedRisk: RiskLevel;
}

export interface CougarBlightResult {
  /** Accumulated degree hours (base 15.5 °C) over the 4-day window. */
  degreeHours4Day: number;
  /** Risk before inoculum adjustment. */
  rawRisk: RiskLevel;
  /** Risk after inoculum-factor threshold adjustment. */
  adjustedRisk: RiskLevel;
  /** Multiplier applied to the thresholds (lower = more sensitive). */
  inoculumFactor: number;
  /** Per-day DH breakdown for the 4-day rolling window. */
  dayBreakdown: DayBreakdown[];
  /** 3-day forward risk projection from forecast data. */
  forecast: ForecastRisk[];
}

export interface BlossomCohort {
  openDate: string;
  cumulativeDH183: number;
  /** true when cumulative DH base 18.3 °C >= 198 */
  isSusceptible: boolean;
  isInfected: boolean;
  infectionDate: string | null;
  /** infection date + 103 DH base 12.7 °C */
  symptomDate: string | null;
}

export interface MaryBlytResult {
  /** Condition 1: bloom stage is 'bloom'. */
  openBlossoms: boolean;
  /** Condition 2: cumulative DH base 18.3 °C since bloom >= 198. */
  degreehoursMet: boolean;
  /** Condition 3: rain > 0.25 mm OR humidity > 90 % in last 24 h. */
  wettingEvent: boolean;
  /** Condition 4: mean temperature of last 24 h >= 15.6 °C. */
  tempMet: boolean;
  /** Count of true conditions (0-4). */
  conditionsMet: number;
  /** Actual degree hours accumulated (base 18.3 °C). */
  cumulativeDH183: number;
  /** True when all four conditions are met simultaneously. */
  infectionEvent: boolean;
  /** Epiphytic Infection Potential — bacterial population estimate on stigma. */
  eip: number;
  /** Blossom cohorts being tracked. */
  blossomCohorts: BlossomCohort[];
  /** Expected date when symptoms would first appear after infection. */
  expectedSymptomDate: string | null;
}

export interface FireBlightResult {
  cougarBlight: CougarBlightResult;
  maryBlyt: MaryBlytResult;
  combinedRisk: RiskLevel;
  /** Numeric risk score on a 0-100 scale. */
  riskScore: number;
  sprayRecommendation: string;
  /** Specific product names recommended for the current situation. */
  productSuggestions: string[];
  details: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Hourly observation record expected by the model. */
interface HourlyRecord {
  timestamp: string;
  temp_c: number;
  humidity_pct: number;
  precip_mm: number;
}

/** Default CougarBlight thresholds (degree hours base 15.5 °C, 4-day). */
const CB_THRESHOLDS = {
  low: 0,
  caution: 110,
  high: 220,
  extreme: 400,
} as const;

// ---------------------------------------------------------------------------
// CougarBlight v5.1 — adjusted degree hour with temperature cap
// ---------------------------------------------------------------------------

/**
 * Compute the adjusted degree-hour contribution for a single hourly reading.
 * DH peaks at 31 °C and linearly declines to zero at 40 °C.
 */
function adjustedDegreeHour(tempC: number, baseTemp: number): number {
  if (tempC <= baseTemp) return 0;
  if (tempC <= 31) return tempC - baseTemp;
  if (tempC >= 40) return 0;
  // Linear decline from 31 °C to 40 °C
  const peakDH = 31 - baseTemp;
  return peakDH * (40 - tempC) / (40 - 31);
}

/**
 * Sum adjusted degree hours across an array of hourly temperature readings.
 */
function sumAdjustedDH(temps: number[], baseTemp: number): number {
  let total = 0;
  for (const t of temps) {
    total += adjustedDegreeHour(t, baseTemp);
  }
  return total;
}

// ---------------------------------------------------------------------------
// Inoculum factor — 5 levels (CougarBlight v5.1)
// ---------------------------------------------------------------------------

/** Map inoculum level to a threshold multiplier (lower = more sensitive). */
function getInoculumFactor(level: InoculumLevel): number {
  switch (level) {
    case "extreme":
      return 0.5;
    case "high":
      return 0.7;
    case "moderate":
      return 0.85;
    case "low":
      return 1.0;
    case "none":
      return 1.2;
    default:
      return 1.0;
  }
}

/**
 * Map legacy fire-blight history values ('none' | 'nearby' | 'in_orchard')
 * to the new 5-level InoculumLevel.
 */
export function mapLegacyHistory(h: string): InoculumLevel {
  switch (h) {
    case "in_orchard":
      return "high";
    case "nearby":
      return "moderate";
    case "none":
      return "low";
    default:
      return "low";
  }
}

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

/** Classify degree hours into a risk level using the given thresholds. */
function classifyDH(dh: number, factor: number): RiskLevel {
  const extreme = CB_THRESHOLDS.extreme * factor;
  const high = CB_THRESHOLDS.high * factor;
  const caution = CB_THRESHOLDS.caution * factor;

  if (dh >= extreme) return "extreme";
  if (dh >= high) return "high";
  if (dh >= caution) return "caution";
  return "low";
}

/** Ordered risk levels for comparison. */
const RISK_ORDER: readonly RiskLevel[] = [
  "low",
  "caution",
  "high",
  "extreme",
];

function riskIndex(r: RiskLevel): number {
  return RISK_ORDER.indexOf(r);
}

function stepUp(r: RiskLevel): RiskLevel {
  const idx = riskIndex(r);
  return RISK_ORDER[Math.min(idx + 1, RISK_ORDER.length - 1)];
}

/** Clamp a number into a range. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Wetting event detection
// ---------------------------------------------------------------------------

/** Check whether a set of hourly records contains a wetting event. */
function hasWettingEvent(records: HourlyRecord[]): boolean {
  return records.some(
    (h) => h.precip_mm > 0.25 || h.humidity_pct > 90,
  );
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Extract YYYY-MM-DD date string from an ISO timestamp. */
function toDateStr(timestamp: string): string {
  return timestamp.slice(0, 10);
}

/** Add `days` days to a YYYY-MM-DD string. */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Group hourly records by calendar day
// ---------------------------------------------------------------------------

function groupByDay(records: HourlyRecord[]): Map<string, HourlyRecord[]> {
  const map = new Map<string, HourlyRecord[]>();
  for (const r of records) {
    const day = toDateStr(r.timestamp);
    let arr = map.get(day);
    if (!arr) {
      arr = [];
      map.set(day, arr);
    }
    arr.push(r);
  }
  return map;
}

// ---------------------------------------------------------------------------
// CougarBlight v5.1
// ---------------------------------------------------------------------------

function runCougarBlight(
  hourlyData: HourlyRecord[],
  history: InoculumLevel,
  forecastData: HourlyRecord[],
): CougarBlightResult {
  // --- 4-day rolling window (last 96 hours) ---
  const window = hourlyData.slice(-96);
  const temps = window.map((h) => h.temp_c);
  const degreeHours4Day = sumAdjustedDH(temps, 15.5);

  // --- Wetting event in the 4-day window ---
  const windowHasWetting = hasWettingEvent(window);

  // --- Raw & adjusted risk ---
  const inoculumFactor = getInoculumFactor(history);
  const rawRisk = classifyDH(degreeHours4Day, 1.0);
  let adjustedRisk = classifyDH(degreeHours4Day, inoculumFactor);

  // Without a wetting event, cap risk at 'caution'
  if (!windowHasWetting && riskIndex(adjustedRisk) > riskIndex("caution")) {
    adjustedRisk = "caution";
  }

  // --- Day breakdown ---
  const dayMap = groupByDay(window);
  const dayBreakdown: DayBreakdown[] = [];
  for (const [date, records] of dayMap) {
    dayBreakdown.push({
      date,
      degreeHours: sumAdjustedDH(records.map((r) => r.temp_c), 15.5),
      hadWetting: hasWettingEvent(records),
    });
  }
  // Sort chronologically
  dayBreakdown.sort((a, b) => a.date.localeCompare(b.date));

  // --- 3-day forward forecast projection ---
  const forecast: ForecastRisk[] = [];
  if (forecastData.length > 0) {
    const forecastDayMap = groupByDay(forecastData);
    const forecastDates = [...forecastDayMap.keys()].sort();

    // Use up to 3 days of forecast
    for (const forecastDate of forecastDates.slice(0, 3)) {
      const forecastRecords = forecastDayMap.get(forecastDate)!;
      const forecastTemps = forecastRecords.map((r) => r.temp_c);
      const forecastDayDH = sumAdjustedDH(forecastTemps, 15.5);

      // Project total: current 4-day window minus oldest day, plus forecast day
      // (rolling window shifts forward)
      const oldestDayDH = dayBreakdown.length > 0 ? dayBreakdown[0].degreeHours : 0;
      const projectedDH = degreeHours4Day - oldestDayDH + forecastDayDH;

      // Determine wetting in forecast
      const forecastWetting = hasWettingEvent(forecastRecords);
      let projectedRisk = classifyDH(projectedDH, inoculumFactor);
      if (!forecastWetting && !windowHasWetting && riskIndex(projectedRisk) > riskIndex("caution")) {
        projectedRisk = "caution";
      }

      forecast.push({
        date: forecastDate,
        projectedDH,
        projectedRisk,
      });
    }
  }

  return {
    degreeHours4Day,
    rawRisk,
    adjustedRisk,
    inoculumFactor,
    dayBreakdown,
    forecast,
  };
}

// ---------------------------------------------------------------------------
// MaryBlyt v7.1
// ---------------------------------------------------------------------------

function runMaryBlyt(
  hourlyData: HourlyRecord[],
  bloomStage: BloomStage,
): MaryBlytResult {
  // Condition 1 — open blossoms present
  const openBlossoms = bloomStage === "bloom";

  // --- Blossom cohorts ---
  const blossomCohorts: BlossomCohort[] = [];

  if (openBlossoms) {
    // Assume bloom started ~3 days ago; create one cohort per day
    const now = hourlyData.length > 0
      ? toDateStr(hourlyData[hourlyData.length - 1].timestamp)
      : new Date().toISOString().slice(0, 10);

    for (let daysAgo = 3; daysAgo >= 0; daysAgo--) {
      const openDate = addDays(now, -daysAgo);

      // Accumulate DH base 18.3 for hours on or after cohort open date
      const cohortHours = hourlyData.filter(
        (h) => toDateStr(h.timestamp) >= openDate,
      );
      const cumulativeDH183 = calcDegreeHoursFromHourly(
        cohortHours.map((h) => h.temp_c),
        18.3,
      );

      const isSusceptible = cumulativeDH183 >= 198;

      // Determine infection: susceptible + wetting + temp conditions
      const last24 = cohortHours.slice(-24);
      const cohortWetting = hasWettingEvent(last24);
      const meanTemp24 =
        last24.length > 0
          ? last24.reduce((sum, h) => sum + h.temp_c, 0) / last24.length
          : 0;
      const isInfected = isSusceptible && cohortWetting && meanTemp24 >= 15.6;

      let infectionDate: string | null = null;
      let symptomDate: string | null = null;

      if (isInfected) {
        // Infection date is today (latest data date)
        infectionDate = now;

        // Symptom date: infection + 103 DH base 12.7 °C
        // Project forward using available data
        symptomDate = projectSymptomDate(hourlyData, infectionDate, 103, 12.7);
      }

      blossomCohorts.push({
        openDate,
        cumulativeDH183,
        isSusceptible,
        isInfected,
        infectionDate,
        symptomDate,
      });
    }
  }

  // Condition 2 — cumulative degree hours base 18.3 °C since bloom
  const allTemps = hourlyData.map((h) => h.temp_c);
  const cumulativeDH183 = calcDegreeHoursFromHourly(allTemps, 18.3);
  const degreehoursMet = cumulativeDH183 >= 198;

  // Condition 3 — wetting event in the last 24 hours
  const last24 = hourlyData.slice(-24);
  const wettingEvent = hasWettingEvent(last24);

  // Condition 4 — mean temperature of last 24 h >= 15.6 °C
  const meanTemp24 =
    last24.length > 0
      ? last24.reduce((sum, h) => sum + h.temp_c, 0) / last24.length
      : 0;
  const tempMet = meanTemp24 >= 15.6;

  const conditions = [openBlossoms, degreehoursMet, wettingEvent, tempMet];
  const conditionsMet = conditions.filter(Boolean).length;
  const infectionEvent = conditionsMet === 4;

  // --- EIP (Epiphytic Infection Potential) ---
  const eip = computeEIP(hourlyData, bloomStage);

  // --- Expected symptom date ---
  let expectedSymptomDate: string | null = null;
  if (infectionEvent && hourlyData.length > 0) {
    const infectionDate = toDateStr(hourlyData[hourlyData.length - 1].timestamp);
    expectedSymptomDate = projectSymptomDate(hourlyData, infectionDate, 103, 12.7);
  }

  return {
    openBlossoms,
    degreehoursMet,
    wettingEvent,
    tempMet,
    conditionsMet,
    cumulativeDH183,
    infectionEvent,
    eip,
    blossomCohorts,
    expectedSymptomDate,
  };
}

// ---------------------------------------------------------------------------
// Symptom date projection
// ---------------------------------------------------------------------------

/**
 * Project the date when accumulated degree hours (from infectionDate forward)
 * reach the target. If insufficient data, estimate using the last known
 * average hourly contribution.
 */
function projectSymptomDate(
  hourlyData: HourlyRecord[],
  infectionDate: string,
  targetDH: number,
  baseTemp: number,
): string | null {
  // Gather hours from infection date forward
  const postInfection = hourlyData.filter(
    (h) => toDateStr(h.timestamp) >= infectionDate,
  );

  let accum = 0;
  for (const h of postInfection) {
    const excess = h.temp_c - baseTemp;
    if (excess > 0) accum += excess;
    if (accum >= targetDH) {
      return toDateStr(h.timestamp);
    }
  }

  // Not enough data — extrapolate
  if (postInfection.length === 0) return null;

  const avgDHPerHour = accum / postInfection.length;
  if (avgDHPerHour <= 0) return null;

  const remainingDH = targetDH - accum;
  const remainingHours = Math.ceil(remainingDH / avgDHPerHour);
  const lastDate = toDateStr(postInfection[postInfection.length - 1].timestamp);
  const extraDays = Math.ceil(remainingHours / 24);

  return addDays(lastDate, extraDays);
}

// ---------------------------------------------------------------------------
// EIP (Epiphytic Infection Potential)
// ---------------------------------------------------------------------------

/**
 * Compute Epiphytic Infection Potential — a running estimate of bacterial
 * population on stigma surfaces.
 *
 * - Increases by degree hours base 15.5 °C on warm days.
 * - Decreases on days with average temp below 10 °C.
 * - Resets at petal fall.
 */
function computeEIP(
  hourlyData: HourlyRecord[],
  bloomStage: BloomStage,
): number {
  if (bloomStage === "petal-fall" || bloomStage === "fruit-set") {
    return 0; // EIP resets at petal fall
  }

  // Only accumulate EIP during bloom-related stages
  if (bloomStage !== "bloom" && bloomStage !== "pink") {
    return 0;
  }

  const dayMap = groupByDay(hourlyData);
  const sortedDays = [...dayMap.keys()].sort();

  let eip = 0;

  for (const day of sortedDays) {
    const records = dayMap.get(day)!;
    const temps = records.map((r) => r.temp_c);
    const avgTemp = temps.reduce((s, t) => s + t, 0) / temps.length;

    if (avgTemp < 10) {
      // Cold day: bacterial population declines
      eip = Math.max(0, eip - 20);
    } else {
      // Warm day: accumulate DH base 15.5
      const dayDH = calcDegreeHoursFromHourly(temps, 15.5);
      eip += dayDH;
    }
  }

  return Math.round(eip * 100) / 100;
}

// ---------------------------------------------------------------------------
// Combined logic (updated)
// ---------------------------------------------------------------------------

function computeCombinedRisk(
  cb: CougarBlightResult,
  mb: MaryBlytResult,
  bloomStage: BloomStage,
): RiskLevel {
  const duringBloom = bloomStage === "bloom";

  // MaryBlyt 4/4 + CB High/Extreme → EXTREME
  if (
    mb.infectionEvent &&
    riskIndex(cb.adjustedRisk) >= riskIndex("high")
  ) {
    return "extreme";
  }

  // MaryBlyt 3/4 + CB elevated + high EIP → EXTREME
  if (
    mb.conditionsMet >= 3 &&
    riskIndex(cb.adjustedRisk) >= riskIndex("caution") &&
    mb.eip > 300
  ) {
    return "extreme";
  }

  // MaryBlyt 3/4 + CB elevated → step up one level
  if (
    mb.conditionsMet >= 3 &&
    riskIndex(cb.adjustedRisk) >= riskIndex("caution")
  ) {
    return stepUp(cb.adjustedRisk);
  }

  // High EIP (>300) alone during bloom + CB caution+ → step up one level
  if (
    duringBloom &&
    mb.eip > 300 &&
    riskIndex(cb.adjustedRisk) >= riskIndex("caution")
  ) {
    return stepUp(cb.adjustedRisk);
  }

  // Otherwise CB as baseline
  return cb.adjustedRisk;
}

/** Convert a combined risk + bloom stage into a 0-100 numeric score. */
function computeRiskScore(
  risk: RiskLevel,
  mb: MaryBlytResult,
): number {
  const baseScores: Record<RiskLevel, number> = {
    low: 10,
    caution: 35,
    high: 65,
    extreme: 90,
  };

  let score = baseScores[risk];

  // Fine-tune based on how many MaryBlyt conditions are met (0-10 points)
  score += mb.conditionsMet * 2.5;

  // EIP bonus (up to 5 extra points)
  if (mb.eip > 300) {
    score += 5;
  } else if (mb.eip > 150) {
    score += 2.5;
  }

  return clamp(Math.round(score), 0, 100);
}

// ---------------------------------------------------------------------------
// Spray recommendations (updated with product suggestions)
// ---------------------------------------------------------------------------

interface SprayAdvice {
  recommendation: string;
  products: string[];
}

function getSprayAdvice(
  risk: RiskLevel,
  bloomStage: BloomStage,
): SprayAdvice {
  const duringBloom = bloomStage === "bloom";
  const duringPetalFall = bloomStage === "petal-fall";

  if (risk === "extreme" && duringBloom) {
    return {
      recommendation:
        "Apply streptomycin immediately (100 ppm). If 3+ applications already made, use Kasumin 2L (3.3 L/ha). Reapply if rain within 24h.",
      products: ["Streptomycin (100 ppm)", "Kasumin 2L (3.3 L/ha)"],
    };
  }

  if (risk === "high" && duringBloom) {
    return {
      recommendation:
        "Apply streptomycin or Kasumin within 24h. Consider Blossom Protect if 2-3 days before next wetting event.",
      products: ["Streptomycin", "Kasumin 2L", "Blossom Protect"],
    };
  }

  if (risk === "caution" && duringBloom) {
    return {
      recommendation:
        "Have streptomycin ready. Consider preventive Blossom Protect application.",
      products: ["Streptomycin", "Blossom Protect"],
    };
  }

  if (risk === "extreme" && duringPetalFall) {
    return {
      recommendation:
        "Apply streptomycin. Prune any visible cankers. Consider Apogee for shoot blight suppression.",
      products: ["Streptomycin", "Apogee"],
    };
  }

  if (
    (risk === "high" || risk === "extreme") &&
    !duringBloom &&
    !duringPetalFall
  ) {
    return {
      recommendation:
        "Monitor. Consider Apogee for shoot growth suppression.",
      products: ["Apogee"],
    };
  }

  // low / caution outside bloom
  return {
    recommendation: "No action needed. Continue monitoring.",
    products: [],
  };
}

// ---------------------------------------------------------------------------
// Details summary
// ---------------------------------------------------------------------------

function buildDetails(
  cb: CougarBlightResult,
  mb: MaryBlytResult,
  risk: RiskLevel,
): string {
  // For low risk, provide a concise conversational summary
  if (risk === "low") {
    const dh = cb.degreeHours4Day.toFixed(1);
    return (
      `No risk right now. Temperatures are too cold for the fire blight bacteria to multiply ` +
      `(${dh} degree hours accumulated). Risk increases when warm weather (above 15\u00B0C) ` +
      `coincides with bloom.`
    );
  }

  // For elevated risk, provide a clear summary with key data
  const lines: string[] = [];

  if (mb.infectionEvent) {
    lines.push(
      `INFECTION EVENT \u2014 all 4 MaryBlyt conditions met. ` +
      `CougarBlight at ${cb.degreeHours4Day.toFixed(1)} degree hours (${cb.adjustedRisk} risk).`
    );
    if (mb.expectedSymptomDate) {
      lines.push(`Symptoms could appear by ${mb.expectedSymptomDate}.`);
    }
  } else if (risk === "extreme" || risk === "high") {
    lines.push(
      `${cb.degreeHours4Day.toFixed(1)} degree hours accumulated over 4 days \u2014 ${cb.adjustedRisk} risk. ` +
      `MaryBlyt: ${mb.conditionsMet}/4 infection conditions met.`
    );
  } else {
    // caution
    lines.push(
      `Warming trend detected \u2014 ${cb.degreeHours4Day.toFixed(1)} degree hours (4-day). ` +
      `MaryBlyt: ${mb.conditionsMet}/4 conditions met. Monitor closely.`
    );
  }

  if (cb.forecast.length > 0) {
    const worstForecast = cb.forecast.reduce((worst, f) =>
      f.projectedDH > worst.projectedDH ? f : worst
    );
    if (worstForecast.projectedRisk !== "low") {
      lines.push(
        `Forecast: risk trending ${worstForecast.projectedRisk} by ${worstForecast.date}.`
      );
    }
  }

  return lines.join(" ");
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate fire blight risk by running both the CougarBlight v5.1 and
 * MaryBlyt v7.1 models and merging the results.
 *
 * @param hourlyData        At least 96 hours of hourly observations
 *                          (ideally covering the full bloom period).
 * @param bloomStage        Current phenological bloom stage.
 * @param fireBlightHistory Inoculum pressure level (5-level scale).
 * @param forecastData      Optional hourly forecast for 3-day forward
 *                          projection. Defaults to empty array.
 * @returns                 Complete fire-blight risk assessment.
 */
export function evaluateFireBlight(
  hourlyData: Array<{
    timestamp: string;
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
  }>,
  bloomStage: BloomStage,
  fireBlightHistory: InoculumLevel,
  forecastData: Array<{
    timestamp: string;
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
  }> = [],
): FireBlightResult {
  const cougarBlight = runCougarBlight(
    hourlyData,
    fireBlightHistory,
    forecastData,
  );
  const maryBlyt = runMaryBlyt(hourlyData, bloomStage);

  const risk = computeCombinedRisk(cougarBlight, maryBlyt, bloomStage);
  const riskScore = computeRiskScore(risk, maryBlyt);
  const { recommendation: sprayRecommendation, products: productSuggestions } =
    getSprayAdvice(risk, bloomStage);
  const details = buildDetails(cougarBlight, maryBlyt, risk);

  return {
    cougarBlight,
    maryBlyt,
    combinedRisk: risk,
    riskScore,
    sprayRecommendation,
    productSuggestions,
    details,
  };
}

// ---------------------------------------------------------------------------
// Utility — risk-level to Tailwind-friendly color name
// ---------------------------------------------------------------------------

/**
 * Map a risk level to a Tailwind-compatible color string.
 */
export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case "low":
      return "green";
    case "caution":
      return "yellow";
    case "high":
      return "orange";
    case "extreme":
      return "red";
  }
}
