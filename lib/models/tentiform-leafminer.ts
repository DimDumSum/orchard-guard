// ---------------------------------------------------------------------------
// Spotted Tentiform Leafminer — Degree-day phenology from March 1
//
// Tracks three generations of Phyllonorycter blancardella using cumulative
// degree-days (base 6.1°C) from March 1.  Sap-feeding larvae of the 2nd
// generation (~850 DD) cause the most economic damage.
// ---------------------------------------------------------------------------

import { calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface TentiformLeafminerResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  generation: number;
  currentStage: string;
  details: string;
  recommendation: string;
  economicThreshold: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const BASE_TEMP = 6.1;

const STAGES: Array<{ dd: number; label: string; gen: number }> = [
  { dd: 0, label: "between generations", gen: 1 },
  { dd: 200, label: "adults", gen: 1 },
  { dd: 350, label: "sap-feeding larvae", gen: 1 },
  { dd: 650, label: "adults", gen: 2 },
  { dd: 850, label: "sap-feeding larvae", gen: 2 },
  { dd: 1150, label: "adults", gen: 3 },
];

const ECONOMIC_THRESHOLD = ">5 sap-feeding mines/leaf on >50% of leaves sampled";
const SCOUTING_PROTOCOL = "Count mines per leaf on 10 leaves/tree, 5 trees/block.";
const PRODUCT_SUGGESTIONS = ["Admire (imidacloprid)", "Assail (acetamiprid)"];

function filterFromMarch1(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
) {
  if (dailyData.length === 0) return [];
  const year = dailyData[0].date.substring(0, 4);
  return dailyData.filter((d) => d.date >= `${year}-03-01`);
}

function getCurrentStage(cdd: number) {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (cdd >= s.dd) current = s;
  }
  return current;
}

export function evaluateTentiformLeafminer(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): TentiformLeafminerResult {
  const filtered = filterFromMarch1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;
  const stage = getCurrentStage(cumulativeDD);

  const isSapFeeding = stage.label === "sap-feeding larvae";
  const is2ndGenSap = isSapFeeding && stage.gen === 2;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (is2ndGenSap) {
    riskLevel = "high";
    riskScore = 80;
  } else if (isSapFeeding || (cumulativeDD >= 800 && cumulativeDD < 850)) {
    riskLevel = "moderate";
    riskScore = 50;
  } else {
    riskLevel = "low";
    riskScore = 12;
  }

  let details: string;
  if (riskLevel === "high") {
    details = "Second generation sap-feeding leafminer larvae are active — this is the most damaging stage. Their mines reduce leaf photosynthesis and can weaken trees if counts are high. Check whether parasitoid wasps are already keeping numbers down before spraying.";
  } else if (riskLevel === "moderate") {
    details = `Generation ${stage.gen} sap-feeding larvae are present in leaf mines. Tentiform leafminers create blister-like mines on the underside of leaves, but natural parasitoid wasps often keep them below damaging levels.`;
  } else {
    details = "No significant leafminer risk right now. Spotted tentiform leafminer larvae create small blotch mines on leaf undersides. Tiny parasitoid wasps usually do a good job controlling them — avoid broad-spectrum sprays early in the season to protect these natural enemies.";
  }

  const recommendation = is2ndGenSap
    ? "2nd generation sap-feeding larvae active — most damaging stage. Scout and treat if threshold exceeded."
    : isSapFeeding
      ? `Generation ${stage.gen} sap-feeding larvae active. Scout for mines and assess parasitism levels.`
      : "Low risk. Monitor degree-day accumulation and preserve natural parasitoid enemies.";

  return {
    riskLevel, riskScore, cumulativeDD: roundedDD, generation: stage.gen,
    currentStage: stage.label, details, recommendation,
    economicThreshold: ECONOMIC_THRESHOLD, scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
