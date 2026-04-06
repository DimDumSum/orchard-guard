// ---------------------------------------------------------------------------
// Nectria Canker Disease Model — Neonectria ditissima
//
// Evaluates European canker risk from rain events at optimal infection
// temperatures (11-16°C) during fall leaf drop (Oct-Nov) and spring
// pruning season (Mar-Apr).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NectriaCancerResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Rain at 11-16°C during leaf drop (Oct-Nov). */
  fallLeafDropRisk: boolean;
  /** Rain at 11-16°C during pruning season (Mar-Apr). */
  springWoundRisk: boolean;
  details: string;
  recommendation: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEMP_LOW = 11;
const TEMP_HIGH = 16;
const RAIN_THRESHOLD = 0.5; // mm per hour

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateNectriaCanker(
  hourlyData: Array<{ timestamp: string; temp_c: number; precip_mm: number }>,
): NectriaCancerResult {
  let fallRainHours = 0;
  let springRainHours = 0;

  for (const r of hourlyData) {
    if (r.precip_mm < RAIN_THRESHOLD) continue;
    if (r.temp_c < TEMP_LOW || r.temp_c > TEMP_HIGH) continue;

    const ts = new Date(r.timestamp);
    const month = ts.getMonth(); // 0-based

    // Oct (9) or Nov (10)
    if (month === 9 || month === 10) {
      fallRainHours++;
    }
    // Mar (2) or Apr (3)
    if (month === 2 || month === 3) {
      springRainHours++;
    }
  }

  const fallLeafDropRisk = fallRainHours >= 6;
  const springWoundRisk = springRainHours >= 6;

  // Risk classification
  let riskLevel: NectriaCancerResult["riskLevel"];
  let riskScore: number;

  if (fallLeafDropRisk) {
    riskLevel = "high";
    riskScore = 80;
  } else if (springWoundRisk) {
    riskLevel = "moderate";
    riskScore = 50;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const products =
    riskLevel === "low"
      ? []
      : [
          "Copper (at 50% and 90% leaf drop)",
          "Copper (dormant at silver tip)",
        ];

  let details: string;
  let recommendation: string;

  if (riskLevel === "high") {
    details =
      `High infection risk — ${fallRainHours} hours of rain at 11\u201316\u00B0C during leaf drop. ` +
      `Canker spores enter through leaf scars when conditions stay wet and mild.`;
    recommendation =
      "Apply copper at 50% and 90% leaf drop. Remove and destroy any visible cankers during dormant pruning.";
  } else if (riskLevel === "moderate") {
    details =
      `Spring wound infection risk — ${springRainHours} hours of rain at 11\u201316\u00B0C during pruning season. ` +
      `Fresh pruning cuts are vulnerable to canker infection in wet, mild weather.`;
    recommendation =
      "Avoid pruning during wet weather. Apply copper at silver tip. Seal large pruning wounds.";
  } else {
    details =
      "Canker infection needs rain at 11\u201316\u00B0C during wound-healing periods. Conditions haven\u2019t aligned recently.";
    recommendation =
      "Good time to prune \u2014 dry weather means low infection risk for cuts. Remove any visible cankers while pruning.";
  }

  return {
    riskLevel,
    riskScore,
    fallLeafDropRisk,
    springWoundRisk,
    details,
    recommendation,
    productSuggestions: products,
  };
}
