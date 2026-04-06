// Apple Leaf Curling Midge — degree-day phenology from April 1
import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface AppleLeafMidgeResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  firstGeneration: boolean;
  details: string;
  recommendation: string;
  productSuggestions: string[];
}

const BASE = 5;
const FIRST_GEN_DD = 150;
const PRODUCTS = ["Admire"];

function filterFromApril1(data: Array<{ date: string; max_temp: number; min_temp: number }>) {
  if (data.length === 0) return [];
  const april1 = `${data[0].date.substring(0, 4)}-04-01`;
  return data.filter((d) => d.date >= april1);
}

export function evaluateAppleLeafMidge(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
): AppleLeafMidgeResult {
  const filtered = filterFromApril1(dailyData);
  const cdd = calcCumulativeDegreeDays(filtered, BASE);
  const roundedDD = Math.round(cdd * 10) / 10;
  const firstGeneration = cdd >= FIRST_GEN_DD;

  const riskLevel: "low" | "moderate" | "high" =
    firstGeneration ? "high" : cdd >= 100 ? "moderate" : "low";
  const riskScore = firstGeneration ? 65 : cdd >= 100 ? 35 : 10;

  let details: string;
  if (riskLevel === "high") {
    details = "First generation apple leaf curling midge adults are active now. Their larvae roll young leaf edges into tight tubes — scout shoot tips on young trees, which are most vulnerable.";
  } else if (riskLevel === "moderate") {
    details = "Degree-days are approaching the threshold for apple leaf curling midge emergence. This pest causes leaf edges to curl and thicken, but it's usually minor on mature trees.";
  } else {
    details = "No apple leaf curling midge activity expected yet. This tiny fly lays eggs on unfurling leaves, causing them to roll inward. It can go through 3-4 generations per season but rarely causes economic damage on mature trees.";
  }

  const recommendation = firstGeneration
    ? "First generation adults active (3–4 gen/year). Scout young trees — treat if >50% shoot tips affected."
    : riskLevel === "moderate"
      ? `Approaching first emergence (${roundedDD} of ${FIRST_GEN_DD} DD). Usually minor on mature trees.`
      : "Low risk. Usually a minor pest on mature trees.";

  return { riskLevel, riskScore, cumulativeDD: roundedDD, firstGeneration,
    details, recommendation, productSuggestions: PRODUCTS };
}
