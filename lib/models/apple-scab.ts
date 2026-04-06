// ---------------------------------------------------------------------------
// Apple Scab Disease Model — Modified Mills Table
//
// Tracks continuous leaf-wetness periods against the Mills Table to determine
// whether a scab infection event has occurred and at what severity.  Also
// tracks ascospore maturity via cumulative degree-days (base 0 °C) from
// January 1 to determine primary scab season status.
//
// Enhanced with:
//   - New Hampshire model ascospore maturity curve
//   - Season infection history & inoculum buildup warnings
//   - Spray recommendations with specific product timings
//   - Post-infection kickback timers
// ---------------------------------------------------------------------------

import {
  calcDegreeDaysSine,
  calcCumulativeDegreeDays,
} from "@/lib/degree-days";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScabSeverity = "none" | "light" | "moderate" | "severe";

export interface WetPeriod {
  startTime: string;
  endTime: string;
  durationHours: number;
  meanTemp: number;
  infectionOccurred: boolean;
  severity: ScabSeverity;
  hoursNeeded: { light: number; moderate: number; severe: number } | null;
  /** How close to the light-infection threshold (0-100+). */
  percentComplete: number;
}

export interface ScabInfectionEvent {
  date: string;
  severity: ScabSeverity;
  meanTemp: number;
  wetnessHours: number;
  /** Was a fungicide applied beforehand? */
  protected: boolean;
}

export interface SprayRecommendation {
  urgency: "immediate" | "soon" | "preventive" | "none";
  message: string;
  products: Array<{
    name: string;
    timing: string;
    kickbackHours?: number;
  }>;
}

export interface KickbackTimer {
  infectionTime: string;
  hoursSinceInfection: number;
  kickbackProducts: Array<{
    name: string;
    hoursRemaining: number;
    expired: boolean;
  }>;
}

export interface AppleScabResult {
  currentWetPeriod: WetPeriod | null;
  recentInfections: WetPeriod[];
  /** Ascospore maturity percentage (0-100). */
  ascosporeMaturity: number;
  /** Cumulative degree-days base 0 °C from January 1. */
  cumulativeDegreeDays: number;
  /** True while ascospores are still being released. */
  primaryScabSeason: boolean;
  riskLevel: ScabSeverity;
  /** Numeric risk score on a 0-100 scale. */
  riskScore: number;
  /** Spray recommendation with product details. */
  sprayRecommendation: SprayRecommendation;
  /** Spray window recommendation (backward compat — mirrors sprayRecommendation.message). */
  sprayWindow: string | null;
  /** Season infection history. */
  seasonInfections: ScabInfectionEvent[];
  /** Total number of infections this season. */
  seasonInfectionCount: number;
  /** Warning when inoculum is building up (>3 unprotected infections). */
  inoculumWarning: string | null;
  /** Post-infection kickback timers for infections in the last 96 hours. */
  kickbackTimers: KickbackTimer[];
  details: string;
}

// ---------------------------------------------------------------------------
// Mills Table — minimum hours of continuous leaf wetness for infection
//
// Each row maps a temperature band (°C) to the hours of wetness required for
// light, moderate, and severe infection events.
// ---------------------------------------------------------------------------

interface MillsBand {
  minTemp: number;
  maxTemp: number;
  light: number;
  moderate: number;
  severe: number;
}

const MILLS_TABLE: readonly MillsBand[] = [
  { minTemp: 1, maxTemp: 5, light: 48, moderate: 41, severe: 35 },
  { minTemp: 6, maxTemp: 8, light: 30, moderate: 25, severe: 20 },
  { minTemp: 9, maxTemp: 11, light: 20, moderate: 17, severe: 14 },
  { minTemp: 12, maxTemp: 15, light: 15, moderate: 12, severe: 9 },
  { minTemp: 16, maxTemp: 19, light: 12, moderate: 9, severe: 7 },
  { minTemp: 20, maxTemp: 24, light: 11, moderate: 8, severe: 6 },
  { minTemp: 25, maxTemp: 26, light: 15, moderate: 12, severe: 9 },
];

// ---------------------------------------------------------------------------
// Mills Table look-up with linear interpolation
// ---------------------------------------------------------------------------

/**
 * Look up the wetness-hour thresholds for a given mean temperature.
 *
 * Returns `null` when the temperature falls outside the Mills range
 * (below 1 °C or above 26 °C).  Within a temperature band the values are
 * linearly interpolated so that, for example, 3 °C returns a value between
 * the 1 °C and 5 °C endpoints rather than a hard bucket edge.
 */
export function getMillsThreshold(
  meanTempC: number,
): { light: number; moderate: number; severe: number } | null {
  if (meanTempC < 1 || meanTempC > 26) return null;

  // Find which band the temperature falls into
  for (let i = 0; i < MILLS_TABLE.length; i++) {
    const band = MILLS_TABLE[i];

    if (meanTempC >= band.minTemp && meanTempC <= band.maxTemp) {
      // If this is the only band the temperature could belong to, or the
      // temperature sits exactly at a band boundary, check whether we should
      // interpolate with the adjacent band.

      // Fraction within the current band (0 at minTemp, 1 at maxTemp).
      const range = band.maxTemp - band.minTemp;
      if (range === 0) {
        return { light: band.light, moderate: band.moderate, severe: band.severe };
      }

      const fraction = (meanTempC - band.minTemp) / range;

      // Determine what values to interpolate toward.  At the low end of the
      // band we stay at the band values; at the high end we interpolate
      // toward the next band (if one exists).
      const next = i < MILLS_TABLE.length - 1 ? MILLS_TABLE[i + 1] : null;

      if (next) {
        // Interpolate between midpoints of the current and next bands.
        // When fraction = 1 we are at the boundary between bands, so we
        // blend toward the next band's values.
        return {
          light: band.light + (next.light - band.light) * fraction,
          moderate: band.moderate + (next.moderate - band.moderate) * fraction,
          severe: band.severe + (next.severe - band.severe) * fraction,
        };
      }

      // Last band — no interpolation target, return band values directly.
      return { light: band.light, moderate: band.moderate, severe: band.severe };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Wet period detection
// ---------------------------------------------------------------------------

/** Hourly observation record expected by the wet-period finder. */
interface HourlyRecord {
  timestamp: string;
  temp_c: number;
  humidity_pct: number;
  precip_mm: number;
}

/**
 * Determine whether a single hour counts as "wet" (leaf wetness).
 *
 * Wet criteria:
 *   - Precipitation > 0.1 mm, OR
 *   - Relative humidity >= 90 %
 */
function isWetHour(record: HourlyRecord): boolean {
  return record.precip_mm > 0.1 || record.humidity_pct >= 90;
}

/**
 * Classify the severity of a wet period given its duration and mean
 * temperature.
 */
function classifyWetPeriod(
  durationHours: number,
  meanTemp: number,
): {
  severity: ScabSeverity;
  hoursNeeded: { light: number; moderate: number; severe: number } | null;
  percentComplete: number;
  infectionOccurred: boolean;
} {
  const thresholds = getMillsThreshold(meanTemp);

  if (!thresholds) {
    return {
      severity: "none",
      hoursNeeded: null,
      percentComplete: 0,
      infectionOccurred: false,
    };
  }

  const percentComplete = Math.min(
    (durationHours / thresholds.light) * 100,
    100,
  );

  let severity: ScabSeverity = "none";
  let infectionOccurred = false;

  if (durationHours >= thresholds.severe) {
    severity = "severe";
    infectionOccurred = true;
  } else if (durationHours >= thresholds.moderate) {
    severity = "moderate";
    infectionOccurred = true;
  } else if (durationHours >= thresholds.light) {
    severity = "light";
    infectionOccurred = true;
  }

  return { severity, hoursNeeded: thresholds, percentComplete, infectionOccurred };
}

/**
 * Identify continuous wet periods from hourly data.
 *
 * A wet period is a stretch of consecutive wet hours.  Gaps of up to 2 dry
 * hours within an otherwise wet sequence are tolerated (the period is
 * considered unbroken).  A gap of 3 or more dry hours terminates the
 * current wet period.
 */
export function findWetPeriods(
  hourlyData: HourlyRecord[],
): WetPeriod[] {
  if (hourlyData.length === 0) return [];

  const periods: WetPeriod[] = [];

  // Track the current wet period being built.
  let wetStart: number | null = null; // index into hourlyData
  let wetEnd: number | null = null;
  let consecutiveDry = 0;
  const wetIndices: number[] = []; // indices of all hours in the period (wet + bridged dry)

  function finalizePeriod(): void {
    if (wetStart === null || wetEnd === null || wetIndices.length === 0) return;

    // Gather temperatures for all hours within the period.
    const temps: number[] = [];
    for (let i = wetIndices[0]; i <= wetIndices[wetIndices.length - 1]; i++) {
      temps.push(hourlyData[i].temp_c);
    }

    const durationHours = wetIndices[wetIndices.length - 1] - wetIndices[0] + 1;
    const meanTemp =
      temps.length > 0
        ? temps.reduce((sum, t) => sum + t, 0) / temps.length
        : 0;

    const { severity, hoursNeeded, percentComplete, infectionOccurred } =
      classifyWetPeriod(durationHours, meanTemp);

    periods.push({
      startTime: hourlyData[wetIndices[0]].timestamp,
      endTime: hourlyData[wetIndices[wetIndices.length - 1]].timestamp,
      durationHours,
      meanTemp: Math.round(meanTemp * 10) / 10,
      infectionOccurred,
      severity,
      hoursNeeded,
      percentComplete: Math.round(percentComplete * 10) / 10,
    });
  }

  for (let i = 0; i < hourlyData.length; i++) {
    if (isWetHour(hourlyData[i])) {
      if (wetStart === null) {
        wetStart = i;
        wetIndices.length = 0;
      }
      // If there were 1-2 bridging dry hours, include them retroactively.
      if (consecutiveDry > 0 && consecutiveDry <= 2) {
        for (let j = i - consecutiveDry; j < i; j++) {
          wetIndices.push(j);
        }
      }
      wetIndices.push(i);
      wetEnd = i;
      consecutiveDry = 0;
    } else {
      // Dry hour
      consecutiveDry++;

      if (consecutiveDry > 2 && wetStart !== null) {
        // Gap too long — finalize the current wet period.
        finalizePeriod();
        wetStart = null;
        wetEnd = null;
        wetIndices.length = 0;
      }
    }
  }

  // Finalize any trailing wet period.
  if (wetStart !== null) {
    finalizePeriod();
  }

  return periods;
}

// ---------------------------------------------------------------------------
// Ascospore maturity — New Hampshire model
// ---------------------------------------------------------------------------

/**
 * Estimate ascospore maturity percentage using the New Hampshire model
 * logistic curve based on cumulative degree-days (base 0 °C) from January 1.
 *
 * New Hampshire model calibration points:
 * 0% at 0 DD, 1% at ~90 DD, 10% at ~200 DD, 50% at ~390 DD,
 * 90% at ~600 DD, 100% at ~750 DD
 *
 * Logistic: 100 / (1 + exp(-k * (dd - midpoint)))
 * Fit: k = 0.0115, midpoint = 390
 */
export function calcAscosporeMaturity(degreeDaysBase0: number): number {
  if (degreeDaysBase0 <= 0) return 0;
  const raw = 100 / (1 + Math.exp(-0.0115 * (degreeDaysBase0 - 390)));
  return Math.round(Math.min(Math.max(raw, 0), 100) * 10) / 10;
}

// ---------------------------------------------------------------------------
// Risk scoring
// ---------------------------------------------------------------------------

/** Ordered severity levels for comparison. */
const SEVERITY_ORDER: readonly ScabSeverity[] = [
  "none",
  "light",
  "moderate",
  "severe",
];

function severityIndex(s: ScabSeverity): number {
  return SEVERITY_ORDER.indexOf(s);
}

/** Map severity to a base 0-100 risk score. */
function severityToScore(
  s: ScabSeverity,
  percentComplete: number,
): number {
  switch (s) {
    case "none":
      // Scale 0-39 based on how close a current wet period is to threshold.
      return Math.round(Math.min(percentComplete * 0.39, 39));
    case "light":
      return 50;
    case "moderate":
      return 75;
    case "severe":
      return 95;
  }
}

// ---------------------------------------------------------------------------
// Post-infection kickback timers
// ---------------------------------------------------------------------------

const KICKBACK_PRODUCTS = [
  { name: "Syllit", kickbackHours: 48 },
  { name: "Nova", kickbackHours: 72 },
  { name: "Inspire Super", kickbackHours: 96 },
];

function buildKickbackTimers(
  recentInfections: WetPeriod[],
  now: Date,
): KickbackTimer[] {
  const timers: KickbackTimer[] = [];
  const cutoff96h = 96 * 60 * 60 * 1000;

  for (const wp of recentInfections) {
    if (!wp.infectionOccurred) continue;

    const infectionEnd = new Date(wp.endTime);
    const hoursSince = Math.max(
      (now.getTime() - infectionEnd.getTime()) / (1000 * 60 * 60),
      0,
    );

    // Only include infections within the last 96 hours
    if (hoursSince * 60 * 60 * 1000 > cutoff96h) continue;

    const kickbackProducts = KICKBACK_PRODUCTS.map((p) => {
      const hoursRemaining = Math.max(p.kickbackHours - hoursSince, 0);
      return {
        name: p.name,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        expired: hoursRemaining <= 0,
      };
    });

    timers.push({
      infectionTime: wp.endTime,
      hoursSinceInfection: Math.round(hoursSince * 10) / 10,
      kickbackProducts,
    });
  }

  return timers;
}

// ---------------------------------------------------------------------------
// Season infection history
// ---------------------------------------------------------------------------

function buildSeasonInfections(
  allWetPeriods: WetPeriod[],
  protectedDates: Set<string>,
): ScabInfectionEvent[] {
  const events: ScabInfectionEvent[] = [];

  for (const wp of allWetPeriods) {
    if (!wp.infectionOccurred) continue;

    const dateStr = wp.startTime.slice(0, 10); // YYYY-MM-DD
    events.push({
      date: dateStr,
      severity: wp.severity,
      meanTemp: wp.meanTemp,
      wetnessHours: wp.durationHours,
      protected: protectedDates.has(dateStr),
    });
  }

  return events;
}

// ---------------------------------------------------------------------------
// Enhanced spray recommendation
// ---------------------------------------------------------------------------

function buildSprayRecommendation(
  currentWet: WetPeriod | null,
  recentInfections: WetPeriod[],
  primarySeason: boolean,
  now: Date,
): SprayRecommendation {
  if (!primarySeason) {
    return {
      urgency: "none",
      message: "Primary scab season has ended. No spray needed for scab.",
      products: [],
    };
  }

  // Case 1: currently in a wet period approaching infection threshold
  if (currentWet && !currentWet.infectionOccurred && currentWet.hoursNeeded) {
    const hoursRemaining = Math.max(
      currentWet.hoursNeeded.light - currentWet.durationHours,
      0,
    );
    if (hoursRemaining > 0 && currentWet.percentComplete >= 30) {
      return {
        urgency: "immediate",
        message:
          `Spray window closing in ~${Math.round(hoursRemaining)} hours. ` +
          `Current wet period is ${currentWet.percentComplete.toFixed(0)}% toward light infection.`,
        products: [
          { name: "Captan", timing: "Apply now (protectant)" },
          { name: "Mancozeb", timing: "Apply now (protectant)" },
        ],
      };
    }
  }

  // Case 2: infection occurred — determine kickback timing
  if (recentInfections.length > 0) {
    const latest = recentInfections[recentInfections.length - 1];
    const infectionEnd = new Date(latest.endTime);
    const hoursSince = Math.max(
      (now.getTime() - infectionEnd.getTime()) / (1000 * 60 * 60),
      0,
    );

    if (hoursSince < 24) {
      // Infection just occurred (<24h ago)
      return {
        urgency: "immediate",
        message:
          `Infection occurred ~${Math.round(hoursSince)} hours ago (${latest.severity}). ` +
          `Full kickback window available — apply curative fungicide immediately.`,
        products: [
          { name: "Inspire Super", timing: "Curative — apply ASAP", kickbackHours: 96 },
          { name: "Nova", timing: "Curative — apply ASAP", kickbackHours: 72 },
          { name: "Syllit", timing: "Curative — apply ASAP", kickbackHours: 48 },
        ],
      };
    }

    if (hoursSince >= 24 && hoursSince <= 72) {
      // Infection occurred 24-72h ago
      return {
        urgency: "soon",
        message:
          `Infection occurred ~${Math.round(hoursSince)} hours ago (${latest.severity}). ` +
          `Kickback window narrowing — apply curative fungicide soon.`,
        products: [
          { name: "Nova", timing: "Curative — window closing", kickbackHours: 72 },
          { name: "Inspire Super", timing: "Curative — best remaining option", kickbackHours: 96 },
        ],
      };
    }

    if (hoursSince > 72) {
      // Infection occurred >72h ago
      return {
        urgency: "preventive",
        message:
          "Kickback window expired. Apply protectant before next rain.",
        products: [
          { name: "Captan", timing: "Protectant — before next rain" },
          { name: "Mancozeb", timing: "Protectant — before next rain" },
        ],
      };
    }
  }

  // Case 3: currently in a wet period below 30% — low urgency
  if (currentWet && !currentWet.infectionOccurred) {
    return {
      urgency: "preventive",
      message: "Wet period in progress but below infection thresholds. Monitor closely.",
      products: [
        { name: "Captan", timing: "Protectant — apply if rain continues" },
        { name: "Mancozeb", timing: "Protectant — apply if rain continues" },
      ],
    };
  }

  // Case 4: dry conditions, primary season active
  return {
    urgency: "preventive",
    message: "No current risk. Maintain protectant coverage before next rain.",
    products: [
      { name: "Captan", timing: "Protectant — before next rain" },
      { name: "Mancozeb", timing: "Protectant — before next rain" },
      { name: "Merivon", timing: "Protectant — before next rain" },
    ],
  };
}

// ---------------------------------------------------------------------------
// Details summary
// ---------------------------------------------------------------------------

function buildDetails(
  currentWet: WetPeriod | null,
  recentInfections: WetPeriod[],
  ascosporeMaturity: number,
  cdd: number,
  primarySeason: boolean,
  riskLevel: ScabSeverity,
  seasonInfections: ScabInfectionEvent[],
  inoculumWarning: string | null,
  kickbackTimers: KickbackTimer[],
): string {
  const parts: string[] = [];

  // Primary season status
  if (!primarySeason) {
    parts.push("Primary scab season has ended — ascospore supply is exhausted. Only secondary spread from existing infections is possible.");
    if (seasonInfections.length > 0) {
      const unprotected = seasonInfections.filter((e) => !e.protected).length;
      parts.push(`This season had ${seasonInfections.length} infection event(s)${unprotected > 0 ? ` (${unprotected} unprotected)` : ""}.`);
    }
    return parts.join(" ");
  }

  // Active season — describe current situation
  if (currentWet && currentWet.infectionOccurred) {
    parts.push(`Active ${currentWet.severity} infection — ${currentWet.durationHours} hours of leaf wetness at ${currentWet.meanTemp}°C has exceeded the Mills Table threshold.`);
  } else if (currentWet && currentWet.percentComplete >= 60) {
    const hoursLeft = currentWet.hoursNeeded
      ? Math.max(Math.round(currentWet.hoursNeeded.light - currentWet.durationHours), 0)
      : 0;
    parts.push(`Wet period in progress — ${currentWet.percentComplete.toFixed(0)}% toward infection threshold.${hoursLeft > 0 ? ` About ${hoursLeft} more hours of wetness at ${currentWet.meanTemp}°C would trigger infection.` : ""}`);
  } else if (currentWet) {
    parts.push(`Wet period in progress (${currentWet.durationHours}h so far) but below infection thresholds. Monitoring.`);
  } else if (riskLevel === "none" && recentInfections.length === 0) {
    parts.push("Conditions are dry. No active wet period and no recent infections.");
  }

  // Recent infections
  if (recentInfections.length > 0 && !(currentWet?.infectionOccurred)) {
    parts.push(`${recentInfections.length} infection event(s) in the past 7 days.`);
  }

  // Kickback window (most actionable info)
  if (kickbackTimers.length > 0) {
    const latestTimer = kickbackTimers[kickbackTimers.length - 1];
    const available = latestTimer.kickbackProducts.filter((p) => !p.expired);
    if (available.length > 0) {
      parts.push(`Curative fungicide window still open — ${available.map((p) => `${p.name} (${p.hoursRemaining.toFixed(0)}h left)`).join(", ")}.`);
    }
  }

  // Ascospore maturity context
  parts.push(`Ascospore maturity: ${ascosporeMaturity.toFixed(0)}% — ${ascosporeMaturity < 50 ? "early in primary scab season" : ascosporeMaturity < 90 ? "mid-season, most spores still available" : "late season, spore supply nearly exhausted"}.`);

  // Inoculum buildup warning
  if (inoculumWarning) {
    parts.push("Multiple unprotected infections are building inoculum — increase spray frequency.");
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate apple scab risk using the Modified Mills Table model.
 *
 * @param hourlyData      Hourly weather observations (ideally covering the
 *                        full current season and at minimum the last 7 days).
 * @param dailyData       Daily max/min temperature records from January 1 of
 *                        the current year for degree-day accumulation.
 * @param petalFallDate   ISO date string for petal fall, or `null` if
 *                        petal fall has not yet occurred.
 * @param bloomStage      Current bloom/phenological stage (defaults to
 *                        "bloom").
 * @param protectedDates  Set of ISO date strings (YYYY-MM-DD) on which a
 *                        fungicide was applied.  Used to mark season
 *                        infections as protected or unprotected.
 * @returns               Complete apple scab risk assessment.
 */
export function evaluateAppleScab(
  hourlyData: Array<{
    timestamp: string;
    temp_c: number;
    humidity_pct: number;
    precip_mm: number;
  }>,
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  petalFallDate: string | null,
  bloomStage: string = "bloom",
  protectedDates: Set<string> = new Set(),
): AppleScabResult {
  // ------------------------------------------------------------------
  // 0. Bloom-stage gate — apple scab requires green tissue to infect.
  //    Before green-tip there is nothing for the fungus to colonise.
  // ------------------------------------------------------------------

  const PRE_GREEN_TIP_STAGES = ["dormant", "silver-tip"];

  if (PRE_GREEN_TIP_STAGES.includes(bloomStage)) {
    const cdd = calcCumulativeDegreeDays(dailyData, 0);
    const noSpray: SprayRecommendation = {
      urgency: "none",
      message: "No green tissue — no spray needed.",
      products: [],
    };
    return {
      currentWetPeriod: null,
      recentInfections: [],
      ascosporeMaturity: calcAscosporeMaturity(cdd),
      cumulativeDegreeDays: Math.round(cdd * 10) / 10,
      primaryScabSeason: false,
      riskLevel: "none",
      riskScore: 0,
      sprayRecommendation: noSpray,
      sprayWindow: null,
      seasonInfections: [],
      seasonInfectionCount: 0,
      inoculumWarning: null,
      kickbackTimers: [],
      details:
        "No green tissue exposed yet — scab season has not started. " +
        `Current stage: ${bloomStage}. Model activates at green-tip.`,
    };
  }

  // ------------------------------------------------------------------
  // 1. Cumulative degree-days (base 0 °C) from Jan 1
  // ------------------------------------------------------------------

  const cumulativeDD = calcCumulativeDegreeDays(dailyData, 0);

  // ------------------------------------------------------------------
  // 2. Ascospore maturity
  // ------------------------------------------------------------------

  const ascosporeMaturity = calcAscosporeMaturity(cumulativeDD);

  // ------------------------------------------------------------------
  // 3. Primary scab season — active while ascospores remain AND before
  //    petal fall + 2 weeks.
  // ------------------------------------------------------------------

  let primaryScabSeason = ascosporeMaturity < 100;

  if (petalFallDate) {
    const petalFallEnd = new Date(petalFallDate);
    petalFallEnd.setDate(petalFallEnd.getDate() + 14);

    const now = hourlyData.length > 0
      ? new Date(hourlyData[hourlyData.length - 1].timestamp)
      : new Date();

    if (now <= petalFallEnd) {
      // Still within 2 weeks of petal fall — season remains active even
      // if maturity has reached 100 %.
      primaryScabSeason = true;
    }
  }

  // ------------------------------------------------------------------
  // 4. Find all wet periods and classify infections
  // ------------------------------------------------------------------

  const allWetPeriods = findWetPeriods(hourlyData);

  // Determine the "current" wet period (last one, if it ends at or near
  // the final hourly timestamp).
  let currentWetPeriod: WetPeriod | null = null;
  if (allWetPeriods.length > 0 && hourlyData.length > 0) {
    const lastPeriod = allWetPeriods[allWetPeriods.length - 1];
    const lastDataTime = new Date(
      hourlyData[hourlyData.length - 1].timestamp,
    ).getTime();
    const periodEndTime = new Date(lastPeriod.endTime).getTime();

    // Consider a wet period "current" if it ends within 3 hours of the
    // latest data point (allows for short dry gaps already bridged).
    if (lastDataTime - periodEndTime <= 3 * 60 * 60 * 1000) {
      currentWetPeriod = lastPeriod;
    }
  }

  // Recent infections — all wet periods where an infection occurred,
  // limited to the last 7 days of data.
  const sevenDaysAgo = hourlyData.length > 0
    ? new Date(
        new Date(hourlyData[hourlyData.length - 1].timestamp).getTime() -
          7 * 24 * 60 * 60 * 1000,
      )
    : new Date();

  const recentInfections = allWetPeriods.filter(
    (wp) =>
      wp.infectionOccurred &&
      new Date(wp.startTime).getTime() >= sevenDaysAgo.getTime(),
  );

  // ------------------------------------------------------------------
  // 5. Season infection history
  // ------------------------------------------------------------------

  const seasonInfections = buildSeasonInfections(allWetPeriods, protectedDates);
  const seasonInfectionCount = seasonInfections.length;

  const unprotectedCount = seasonInfections.filter((e) => !e.protected).length;
  const inoculumWarning: string | null =
    unprotectedCount > 3
      ? "Scab inoculum building — increase spray frequency and consider post-infection fungicide."
      : null;

  // ------------------------------------------------------------------
  // 6. Overall risk level — worst of current wet period and recent
  //    infections, tempered by primary scab season status.
  // ------------------------------------------------------------------

  let riskLevel: ScabSeverity = "none";

  if (primaryScabSeason) {
    if (currentWetPeriod) {
      if (
        severityIndex(currentWetPeriod.severity) >
        severityIndex(riskLevel)
      ) {
        riskLevel = currentWetPeriod.severity;
      }
      // Even if no infection yet, an approaching threshold raises risk.
      if (
        !currentWetPeriod.infectionOccurred &&
        currentWetPeriod.percentComplete >= 60 &&
        riskLevel === "none"
      ) {
        riskLevel = "light";
      }
    }

    for (const wp of recentInfections) {
      if (severityIndex(wp.severity) > severityIndex(riskLevel)) {
        riskLevel = wp.severity;
      }
    }
  }

  // ------------------------------------------------------------------
  // 7. Numeric risk score (0-100)
  // ------------------------------------------------------------------

  let riskScore: number;

  if (!primaryScabSeason) {
    // Outside primary season, risk is inherently lower.
    riskScore = Math.min(
      severityToScore(riskLevel, currentWetPeriod?.percentComplete ?? 0),
      25,
    );
  } else {
    riskScore = severityToScore(
      riskLevel,
      currentWetPeriod?.percentComplete ?? 0,
    );

    // Boost slightly if there are multiple recent infections.
    if (recentInfections.length > 1) {
      riskScore = Math.min(riskScore + recentInfections.length * 3, 100);
    }
  }

  // ------------------------------------------------------------------
  // 8. Kickback timers
  // ------------------------------------------------------------------

  const now = hourlyData.length > 0
    ? new Date(hourlyData[hourlyData.length - 1].timestamp)
    : new Date();

  const kickbackTimers = buildKickbackTimers(recentInfections, now);

  // ------------------------------------------------------------------
  // 9. Spray recommendation (enhanced) + backward-compat sprayWindow
  // ------------------------------------------------------------------

  const sprayRecommendation = buildSprayRecommendation(
    currentWetPeriod,
    recentInfections,
    primaryScabSeason,
    now,
  );

  const sprayWindow = primaryScabSeason ? sprayRecommendation.message : null;

  // ------------------------------------------------------------------
  // 10. Details summary
  // ------------------------------------------------------------------

  const details = buildDetails(
    currentWetPeriod,
    recentInfections,
    ascosporeMaturity,
    cumulativeDD,
    primaryScabSeason,
    riskLevel,
    seasonInfections,
    inoculumWarning,
    kickbackTimers,
  );

  return {
    currentWetPeriod,
    recentInfections,
    ascosporeMaturity,
    cumulativeDegreeDays: Math.round(cumulativeDD * 10) / 10,
    primaryScabSeason,
    riskLevel,
    riskScore,
    sprayRecommendation,
    sprayWindow,
    seasonInfections,
    seasonInfectionCount,
    inoculumWarning,
    kickbackTimers,
    details,
  };
}
