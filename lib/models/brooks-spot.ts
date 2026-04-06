// ---------------------------------------------------------------------------
// Brooks Spot Disease Model — Mycosphaerella pomi
//
// Evaluates Brooks spot risk by counting extended wet periods (>24h at
// 15-25°C) during the infection window from petal fall through mid-June
// (~45 days after petal fall).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BrooksSpotResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Wet periods >24h at 15-25°C from petal fall to ~45 days after. */
  extendedWetPeriods: number;
  details: string;
  recommendation: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WET_DURATION_MIN = 24;
const TEMP_LOW = 15;
const TEMP_HIGH = 25;
const WINDOW_DAYS = 45;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isWetHour(r: { humidity_pct: number; precip_mm: number }): boolean {
  return r.precip_mm > 0.1 || r.humidity_pct >= 90;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateBrooksSpot(
  hourlyData: Array<{ timestamp: string; temp_c: number; humidity_pct: number; precip_mm: number }>,
  petalFallDate: string | null,
): BrooksSpotResult {
  // If no petal fall date, we cannot evaluate the window
  if (!petalFallDate) {
    return {
      riskLevel: "low",
      riskScore: 5,
      extendedWetPeriods: 0,
      details: "Petal fall date not set; unable to evaluate infection window.",
      recommendation: "Set petal fall date to enable Brooks spot risk assessment.",
      productSuggestions: [],
    };
  }

  const pfDate = new Date(petalFallDate);
  const windowEnd = new Date(pfDate);
  windowEnd.setDate(windowEnd.getDate() + WINDOW_DAYS);

  // Filter hourly data to infection window
  const windowData = hourlyData.filter((r) => {
    const ts = new Date(r.timestamp);
    return ts >= pfDate && ts <= windowEnd;
  });

  // Count extended wet periods at 15-25°C
  let extendedWetPeriods = 0;
  let consecutiveWet = 0;
  let tempSum = 0;

  for (const r of windowData) {
    if (isWetHour(r)) {
      consecutiveWet++;
      tempSum += r.temp_c;
    } else {
      if (consecutiveWet >= WET_DURATION_MIN) {
        const meanTemp = tempSum / consecutiveWet;
        if (meanTemp >= TEMP_LOW && meanTemp <= TEMP_HIGH) {
          extendedWetPeriods++;
        }
      }
      consecutiveWet = 0;
      tempSum = 0;
    }
  }
  // Finalize trailing period
  if (consecutiveWet >= WET_DURATION_MIN) {
    const meanTemp = tempSum / consecutiveWet;
    if (meanTemp >= TEMP_LOW && meanTemp <= TEMP_HIGH) {
      extendedWetPeriods++;
    }
  }

  // Check if we are past the window
  const now = new Date();
  const pastWindow = now > windowEnd;

  // Risk classification
  let riskLevel: BrooksSpotResult["riskLevel"];
  let riskScore: number;

  if (pastWindow && extendedWetPeriods === 0) {
    riskLevel = "low";
    riskScore = 5;
  } else if (extendedWetPeriods > 2) {
    riskLevel = "high";
    riskScore = 80;
  } else if (extendedWetPeriods >= 1) {
    riskLevel = "moderate";
    riskScore = 40 + extendedWetPeriods * 10;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const products =
    riskLevel === "low" ? [] : ["Captan (in regular cover sprays)"];

  let details: string;
  if (riskLevel === "high") {
    details = `Multiple prolonged wet periods during the infection window have created high Brooks spot risk. ${extendedWetPeriods} events of 24+ hours of wetness at 15–25°C — fruit symptoms (small purple spots) may appear at harvest.`;
  } else if (riskLevel === "moderate") {
    details = `Extended wet weather during the infection window could lead to Brooks spot. ${extendedWetPeriods} period(s) of 24+ continuous wet hours at 15–25°C detected since petal fall.`;
  } else if (pastWindow) {
    details = "The infection window has closed (petal fall + 45 days). No significant extended wet periods were detected — Brooks spot risk is low this season.";
  } else {
    details = "Infection window is open but no extended wet periods detected yet. Brooks spot needs 24+ hours of continuous wetness at 15–25°C to infect fruit.";
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Multiple prolonged wet periods during the infection window. Ensure captan cover sprays were applied. Scout for small irregular purple spots on fruit at harvest.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Extended wet periods detected in infection window. Maintain regular cover spray program with captan.";
  } else {
    recommendation =
      "Low risk. Standard cover spray program should provide adequate protection.";
  }

  return {
    riskLevel,
    riskScore,
    extendedWetPeriods,
    details,
    recommendation,
    productSuggestions: products,
  };
}
