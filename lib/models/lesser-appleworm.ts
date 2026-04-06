// ---------------------------------------------------------------------------
// Lesser Appleworm (Grapholita prunivora) — Degree-day phenology from biofix
//
// Tracks lesser appleworm development using cumulative degree-days (base 10°C)
// from biofix.  First generation emerges ~2 weeks before codling moth.
// Usually controlled by codling moth spray programs.
// ---------------------------------------------------------------------------

import { calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface LesserApplewormResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  details: string;
  recommendation: string;
  economicThreshold: string | null;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const BASE_TEMP = 10;
const FIRST_GEN_DD = 80;
const SCOUTING_PROTOCOL = "Check pheromone traps weekly. Inspect 20 fruit clusters per 50 trees for shallow entry holes.";
const PRODUCT_SUGGESTIONS = ["Altacor (chlorantraniliprole)", "Assail (acetamiprid)", "Imidan (phosmet)"];

export function evaluateLesserAppleworm(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  biofixDate: string | null,
): LesserApplewormResult {
  if (!biofixDate) {
    return {
      riskLevel: "low", riskScore: 5, cumulativeDD: 0,
      details: "Biofix date has not been set.",
      recommendation: "Set biofix date (first sustained moth catch) to enable tracking. Usually controlled by codling moth spray program.",
      economicThreshold: null, scoutingProtocol: SCOUTING_PROTOCOL,
      productSuggestions: PRODUCT_SUGGESTIONS,
    };
  }

  const biofixData = dailyData.filter((d) => d.date >= biofixDate);
  const cumulativeDD = calcCumulativeDegreeDays(biofixData, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;
  const firstGenActive = cumulativeDD >= FIRST_GEN_DD;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (firstGenActive && cumulativeDD < 200) {
    riskLevel = "moderate";
    riskScore = 40;
  } else {
    riskLevel = "low";
    riskScore = firstGenActive ? 15 : 10;
  }

  let details: string;
  if (firstGenActive) {
    details = `First generation lesser appleworm is active at ${roundedDD} degree-days since biofix. These larvae make shallow tunnels in fruit, but your codling moth spray program usually provides adequate control.`;
  } else {
    details = `Not yet active at ${roundedDD} degree-days since biofix. First generation egg hatch happens around ${FIRST_GEN_DD} degree-days, about two weeks ahead of codling moth.`;
  }

  const recommendation = firstGenActive
    ? "First generation active. Verify codling moth spray coverage is in place — usually sufficient for lesser appleworm control."
    : "Low risk. Continue monitoring. Codling moth spray program typically provides adequate control.";

  return {
    riskLevel, riskScore, cumulativeDD: roundedDD, details, recommendation,
    economicThreshold: null, scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
