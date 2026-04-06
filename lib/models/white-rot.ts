// ---------------------------------------------------------------------------
// White Rot Disease Model — Botryosphaeria dothidea
//
// Evaluates white rot risk by counting hot wet events (>25°C with >6h
// wetness) from June through harvest.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WhiteRotResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  /** Events with >25°C and >6h wetness since June. */
  hotWetEvents: number;
  details: string;
  recommendation: string;
  productSuggestions: string[];
  scoutingProtocol: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEMP_MIN = 25;
const WET_DURATION_MIN = 6;
const SCOUTING =
  "Check fruit for light tan, soft, watery rot. Inspect bark for sunken cankers.";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isWetHour(r: { humidity_pct: number; precip_mm: number }): boolean {
  return r.precip_mm > 0.1 || r.humidity_pct >= 90;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function evaluateWhiteRot(
  hourlyData: Array<{ timestamp: string; temp_c: number; humidity_pct: number; precip_mm: number }>,
): WhiteRotResult {
  // Determine year from data
  const year = hourlyData.length > 0
    ? new Date(hourlyData[0].timestamp).getFullYear()
    : new Date().getFullYear();
  const juneFirst = new Date(year, 5, 1);

  // Count hot wet events from June onward
  let hotWetEvents = 0;
  let consecutiveHotWet = 0;

  for (const r of hourlyData) {
    const ts = new Date(r.timestamp);
    if (ts < juneFirst) continue;

    if (isWetHour(r) && r.temp_c > TEMP_MIN) {
      consecutiveHotWet++;
    } else {
      if (consecutiveHotWet >= WET_DURATION_MIN) hotWetEvents++;
      consecutiveHotWet = 0;
    }
  }
  if (consecutiveHotWet >= WET_DURATION_MIN) hotWetEvents++;

  // Risk classification
  let riskLevel: WhiteRotResult["riskLevel"];
  let riskScore: number;

  if (hotWetEvents > 3) {
    riskLevel = "high";
    riskScore = 82;
  } else if (hotWetEvents >= 1) {
    riskLevel = "moderate";
    riskScore = 30 + hotWetEvents * 12;
  } else {
    riskLevel = "low";
    riskScore = 8;
  }

  const products =
    riskLevel === "low" ? [] : ["Captan", "Mancozeb"];

  let details: string;
  if (riskLevel === "high") {
    details = `Frequent hot wet conditions are creating high white rot risk. ${hotWetEvents} events of 25°C+ with extended wetness since June — inspect fruit and bark for soft, watery rot and cankers.`;
  } else if (riskLevel === "moderate") {
    details = `Some hot wet conditions detected since June. White rot thrives in hot weather with prolonged wetness — ${hotWetEvents} qualifying event(s) so far.`;
  } else {
    details = "No significant hot wet events detected. White rot needs sustained heat (>25°C) with prolonged wetness to infect — those conditions haven't occurred yet.";
  }

  let recommendation: string;
  if (riskLevel === "high") {
    recommendation =
      "Frequent hot wet conditions favor white rot. Apply fungicide and remove cankers from limbs. Improve canopy ventilation.";
  } else if (riskLevel === "moderate") {
    recommendation =
      "Some hot wet events detected. Maintain cover spray program and scout fruit and bark for symptoms.";
  } else {
    recommendation =
      "Low risk. Continue monitoring; remove any detected cankers promptly.";
  }

  return {
    riskLevel,
    riskScore,
    hotWetEvents,
    details,
    recommendation,
    productSuggestions: products,
    scoutingProtocol: SCOUTING,
  };
}
