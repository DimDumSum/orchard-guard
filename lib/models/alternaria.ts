// ---------------------------------------------------------------------------
// Alternaria Disease Model — Alternaria mali
//
// Evaluates two phases:
//   1. Core rot risk — rain events (>0.5mm/h) during open bloom.
//   2. Leaf blotch risk — wet periods >12h at >20°C during summer.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AlternariaResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Rain events (>0.5mm in an hour) during open bloom. */
  bloomRainEvents: number;
  /** Wet periods >12h at >20°C (leaf blotch risk). */
  summerWetPeriods: number;
  coreRotRisk: string;
  leafBlotchRisk: string;
  details: string;
  recommendation: string;
  productSuggestions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BLOOM_RAIN_THRESHOLD = 0.5; // mm per hour
const LEAF_WET_DURATION = 12;     // hours
const LEAF_TEMP_MIN = 20;         // °C
const BLOOM_STAGES = ["bloom", "full-bloom", "open-bloom"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isWetHour(r: { humidity_pct: number; precip_mm: number }): boolean {
  return r.precip_mm > 0.1 || r.humidity_pct >= 90;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateAlternaria(
  hourlyData: Array<{ timestamp: string; temp_c: number; humidity_pct: number; precip_mm: number }>,
  bloomStage: string,
): AlternariaResult {
  // --- Core rot: count rain events during bloom ---
  const inBloom = BLOOM_STAGES.includes(bloomStage.toLowerCase());
  let bloomRainEvents = 0;

  if (inBloom) {
    for (const r of hourlyData) {
      if (r.precip_mm > BLOOM_RAIN_THRESHOLD) {
        bloomRainEvents++;
      }
    }
  }

  // --- Leaf blotch: wet periods >12h at >20°C in summer months (Jun-Sep) ---
  const year = hourlyData.length > 0
    ? new Date(hourlyData[0].timestamp).getFullYear()
    : new Date().getFullYear();
  const summerStart = new Date(year, 5, 1);
  const summerEnd = new Date(year, 9, 1);

  let summerWetPeriods = 0;
  let consecutiveWarmWet = 0;

  for (const r of hourlyData) {
    const ts = new Date(r.timestamp);
    if (ts < summerStart || ts >= summerEnd) continue;

    if (isWetHour(r) && r.temp_c > LEAF_TEMP_MIN) {
      consecutiveWarmWet++;
    } else {
      if (consecutiveWarmWet >= LEAF_WET_DURATION) summerWetPeriods++;
      consecutiveWarmWet = 0;
    }
  }
  if (consecutiveWarmWet >= LEAF_WET_DURATION) summerWetPeriods++;

  // Sub-risk labels
  const coreRotRisk = bloomRainEvents >= 3 ? "high" : bloomRainEvents >= 1 ? "moderate" : "low";
  const leafBlotchRisk = summerWetPeriods >= 3 ? "high" : summerWetPeriods >= 1 ? "moderate" : "low";

  // Overall risk
  let riskLevel: AlternariaResult["riskLevel"];
  let riskScore: number;

  if (coreRotRisk === "high" || leafBlotchRisk === "high") {
    riskLevel = "high";
    riskScore = 80;
  } else if (coreRotRisk === "moderate" || leafBlotchRisk === "moderate") {
    riskLevel = "moderate";
    riskScore = 45;
  } else {
    riskLevel = "low";
    riskScore = 10;
  }

  const products = riskLevel === "low" ? [] : ["Captan", "Mancozeb"];

  let details: string;
  if (riskLevel === "high") {
    details = inBloom
      ? `Heavy rain during bloom is creating conditions for Alternaria core rot — ${bloomRainEvents} rain events detected. Infection enters through open flowers and shows up as internal rot at harvest.`
      : `Warm wet summer conditions are driving Alternaria leaf blotch risk. ${summerWetPeriods} wet periods of 12+ hours above 20°C detected. Scout for brown leaf spots expanding from leaf margins.`;
  } else if (riskLevel === "moderate") {
    details = inBloom
      ? `Some rain during bloom could lead to Alternaria core rot. ${bloomRainEvents} rain event(s) so far — the fungus enters through open flowers.`
      : summerWetPeriods > 0
        ? `Warm wet conditions this summer could promote Alternaria leaf blotch. ${summerWetPeriods} qualifying wet period(s) detected so far.`
        : `Some bloom rain events (${bloomRainEvents}) detected earlier. Continue monitoring for summer leaf blotch conditions.`;
  } else {
    details = inBloom
      ? "In bloom but no significant rain events detected. Alternaria core rot risk is low — dry bloom weather keeps flowers safe."
      : "No significant Alternaria conditions detected. Core rot depends on rain during bloom, and leaf blotch needs warm (>20°C) wet periods lasting 12+ hours in summer.";
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Significant Alternaria pressure. Apply fungicide during bloom to reduce core rot and maintain summer cover sprays for leaf blotch control.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Moderate Alternaria risk. Monitor bloom rain and apply protectant if rain persists. Scout for leaf spots in summer.";
  } else {
    recommendation =
      "Low risk. Continue standard fungicide program and monitor for symptoms.";
  }

  return {
    riskLevel,
    riskScore,
    bloomRainEvents,
    summerWetPeriods,
    coreRotRisk,
    leafBlotchRisk,
    details,
    recommendation,
    productSuggestions: products,
  };
}
