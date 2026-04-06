// Brown Marmorated Stink Bug (BMSB) — degree-day phenology from Jan 1
import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface BMSBResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  adultsActive: boolean;
  lateSeasonRisk: boolean;
  details: string;
  recommendation: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const BASE = 14;
const ADULTS_DD = 500;
const SCOUTING = "Focus on perimeter rows near buildings, hedgerows, woods (border effect). Beat-tray 10 trees per border row.";
const PRODUCTS = ["Actara (thiamethoxam)", "Assail", "Sevin"];

export function evaluateBMSB(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): BMSBResult {
  const cdd = calcCumulativeDegreeDays(dailyData, BASE);
  const roundedDD = Math.round(cdd * 10) / 10;
  const adultsActive = cdd >= ADULTS_DD;

  const lastMonth = dailyData.length > 0
    ? parseInt(dailyData[dailyData.length - 1].date.substring(5, 7), 10) : 0;
  const lateSeasonRisk = lastMonth >= 8;

  const riskLevel: "low" | "moderate" | "high" =
    adultsActive && lateSeasonRisk ? "high" : adultsActive || cdd >= 350 ? "moderate" : "low";
  const riskScore = riskLevel === "high" ? 85 : riskLevel === "moderate" ? 45 : 10;

  let details: string;
  if (riskLevel === "high") {
    details = "Brown marmorated stink bugs are active during the late-season damage window. They feed by puncturing fruit with their needle-like mouthparts, causing corky, sunken spots under the skin. Damage is heaviest on perimeter rows near woods or buildings.";
  } else if (riskLevel === "moderate") {
    details = "BMSB adults are emerging or approaching activity thresholds. This invasive pest moves into orchards from surrounding habitat — start checking border rows with beat-tray sampling to catch them early.";
  } else {
    details = "No brown marmorated stink bug activity expected yet. This invasive pest overwinters in sheltered structures and moves into orchards mid-to-late summer, feeding on fruit and causing dimpled, unmarketable apples.";
  }

  const recommendation = riskLevel === "high"
    ? "BMSB adults active during peak damage period. Border effect — worst on perimeter rows near buildings, hedgerows, woods."
    : riskLevel === "moderate"
      ? "Adults emerging or approaching threshold. Begin perimeter scouting with beat-tray sampling."
      : "Low risk. Invasive pest — monitor local BMSB population reports.";

  return { riskLevel, riskScore, cumulativeDD: roundedDD, adultsActive, lateSeasonRisk,
    details, recommendation, scoutingProtocol: SCOUTING, productSuggestions: PRODUCTS };
}
