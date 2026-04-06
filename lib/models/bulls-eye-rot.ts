// ---------------------------------------------------------------------------
// Bull's Eye Rot Disease Model — Neofabraea spp.
//
// Evaluates bull's eye rot risk by counting rain events (>2mm daily
// equivalent) during the late-season infection window (Aug-Oct).
// Infections are latent and appear in storage.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BullsEyeRotResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Rain events (>2mm in a day) during Aug-Oct. */
  lateSeasonRainEvents: number;
  details: string;
  recommendation: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RAIN_DAY_THRESHOLD = 2; // mm accumulated per day

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateBullsEyeRot(
  hourlyData: Array<{ timestamp: string; temp_c: number; precip_mm: number }>,
): BullsEyeRotResult {
  // Aggregate hourly precip into daily totals for Aug-Oct
  const dailyPrecip = new Map<string, number>();

  for (const r of hourlyData) {
    const ts = new Date(r.timestamp);
    const month = ts.getMonth(); // 0-based
    // Aug (7), Sep (8), Oct (9)
    if (month < 7 || month > 9) continue;

    const dateKey = ts.toISOString().slice(0, 10);
    dailyPrecip.set(dateKey, (dailyPrecip.get(dateKey) ?? 0) + r.precip_mm);
  }

  // Count rain days exceeding threshold
  let lateSeasonRainEvents = 0;
  dailyPrecip.forEach((total) => {
    if (total > RAIN_DAY_THRESHOLD) lateSeasonRainEvents++;
  });

  // Risk classification
  let riskLevel: BullsEyeRotResult["riskLevel"];
  let riskScore: number;

  if (lateSeasonRainEvents > 8) {
    riskLevel = "high";
    riskScore = 82;
  } else if (lateSeasonRainEvents >= 4) {
    riskLevel = "moderate";
    riskScore = 35 + lateSeasonRainEvents * 4;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const products =
    riskLevel === "low" ? [] : ["Captan (pre-harvest)"];

  let details: string;
  const now = new Date();
  const month = now.getMonth();
  if (riskLevel === "high") {
    details = `Frequent late-season rain (${lateSeasonRainEvents} rain days Aug–Oct) is creating high risk of latent bull's eye rot infections. The fungus infects fruit now but symptoms won't appear until storage.`;
  } else if (riskLevel === "moderate") {
    details = `Some late-season rain detected (${lateSeasonRainEvents} rain days Aug–Oct). Bull's eye rot infections are latent — fruit looks fine at harvest but rots in cold storage.`;
  } else if (month < 7) {
    details = "Too early for bull's eye rot concern. This disease infects fruit during late-season rain (August through October) and shows up in storage.";
  } else {
    details = "Low late-season rain so far. Bull's eye rot needs repeated rain events from August through October to build up enough latent infections to cause storage losses.";
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Frequent late-season rain creates high risk of latent bull's eye rot infections. " +
      "Apply captan pre-harvest (observe PHI). Ensure prompt cooling after harvest and maintain cold storage at 0-1°C.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Moderate late-season rain. Consider a pre-harvest captan application on susceptible cultivars. " +
      "Minimize time from harvest to cold storage.";
  } else {
    recommendation =
      "Low risk. Standard harvest and storage practices should be sufficient.";
  }

  return {
    riskLevel,
    riskScore,
    lateSeasonRainEvents,
    details,
    recommendation,
    productSuggestions: products,
  };
}
