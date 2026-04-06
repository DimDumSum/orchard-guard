// ---------------------------------------------------------------------------
// Winter Moth (Operophtera brumata) — Degree-day phenology from January 1
//
// Invasive species.  Tracks larval emergence using cumulative degree-days
// (base 5°C) from January 1.  Larvae emerge at 50–100 DD coinciding with
// green tip, feeding on expanding buds and blossoms.
// ---------------------------------------------------------------------------

import { calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface WinterMothResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  larvaeActive: boolean;
  details: string;
  recommendation: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const BASE_TEMP = 5;
const LARVAE_START_DD = 50;
const LARVAE_PEAK_DD = 100;
const SCOUTING_PROTOCOL = "Sticky bands on trunks November-December. Check expanding buds for tiny green larvae at green tip.";
const PRODUCT_SUGGESTIONS = ["Btk (Bacillus thuringiensis)", "Entrust (spinosad)"];

function filterFromJan1(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
) {
  if (dailyData.length === 0) return [];
  const year = dailyData[0].date.substring(0, 4);
  return dailyData.filter((d) => d.date >= `${year}-01-01`);
}

export function evaluateWinterMoth(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): WinterMothResult {
  const filtered = filterFromJan1(dailyData);
  const cumulativeDD = calcCumulativeDegreeDays(filtered, BASE_TEMP);
  const roundedDD = Math.round(cumulativeDD * 10) / 10;

  const larvaeActive = cumulativeDD >= LARVAE_START_DD && cumulativeDD <= 300;
  const pastPeak = cumulativeDD > 300;

  let riskLevel: "low" | "moderate" | "high";
  let riskScore: number;

  if (larvaeActive && cumulativeDD >= LARVAE_PEAK_DD) {
    riskLevel = "high";
    riskScore = 78;
  } else if (larvaeActive) {
    riskLevel = "moderate";
    riskScore = 50;
  } else {
    riskLevel = "low";
    riskScore = pastPeak ? 15 : 10;
  }

  let details: string;
  let recommendation: string;

  if (larvaeActive && cumulativeDD >= LARVAE_PEAK_DD) {
    details =
      `Invasive caterpillar larvae are active and feeding in expanding buds. ${roundedDD} degree days accumulated \u2014 peak feeding window.`;
    recommendation =
      "Apply Btk or spinosad now, targeting small larvae in expanding buds before they get inside rolled leaves.";
  } else if (larvaeActive) {
    details =
      `Invasive caterpillar larvae are beginning to emerge. ${roundedDD} degree days of ${LARVAE_START_DD}\u2013${LARVAE_PEAK_DD} needed for peak activity.`;
    recommendation =
      "Scout expanding buds for tiny green larvae. Prepare Btk or spinosad application.";
  } else if (pastPeak) {
    details =
      `Past larval feeding period (${roundedDD} degree days). Assess any defoliation damage from this season.`;
    recommendation =
      "Feeding period is over. Assess defoliation damage and plan for next season\u2019s monitoring.";
  } else {
    details =
      `An invasive caterpillar that hatches at bud break and feeds on opening leaves. Still too early \u2014 larvae won\u2019t emerge until green tip stage. ${roundedDD} degree days accumulated of ${LARVAE_START_DD}\u2013${LARVAE_PEAK_DD} needed.`;
    recommendation =
      "No action yet. Will alert you when emergence approaches.";
  }

  return {
    riskLevel, riskScore, cumulativeDD: roundedDD, larvaeActive,
    details, recommendation, scoutingProtocol: SCOUTING_PROTOCOL,
    productSuggestions: PRODUCT_SUGGESTIONS,
  };
}
