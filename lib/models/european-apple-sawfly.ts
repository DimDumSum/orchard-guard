// European Apple Sawfly — degree-day phenology from April 1
import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface EuropeanAppleSawflyResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  cumulativeDD: number;
  adultsActive: boolean;
  details: string;
  recommendation: string;
  economicThreshold: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const BASE = 5;
const ADULTS_DD = 100;
const THRESHOLD = "2–3 adults per white sticky trap.";
const SCOUTING = "Place white sticky traps at bloom height. Check every 2–3 days during pink/bloom stage.";
const PRODUCTS = ["Imidan", "Assail"];

function filterFromApril1(data: Array<{ date: string; max_temp: number; min_temp: number }>) {
  if (data.length === 0) return [];
  const april1 = `${data[0].date.substring(0, 4)}-04-01`;
  return data.filter((d) => d.date >= april1);
}

export function evaluateEuropeanAppleSawfly(
  dailyData: Array<{ date: string; max_temp: number; min_temp: number }>,
  bloomStage: string,
): EuropeanAppleSawflyResult {
  const filtered = filterFromApril1(dailyData);
  const cdd = calcCumulativeDegreeDays(filtered, BASE);
  const roundedDD = Math.round(cdd * 10) / 10;
  const adultsActive = cdd >= ADULTS_DD;
  const atBloom = bloomStage === "bloom" || bloomStage === "petal-fall";

  const riskLevel: "low" | "moderate" | "high" =
    adultsActive && atBloom ? "high" : adultsActive || cdd >= 70 ? "moderate" : "low";
  const riskScore = riskLevel === "high" ? 75 : riskLevel === "moderate" ? 40 : 10;

  let details: string;
  if (riskLevel === "high") {
    details = "European apple sawfly adults are active during bloom — this is when they lay eggs in open flowers. Their larvae bore into developing fruitlets, leaving a distinctive ribbon-like scar on the skin.";
  } else if (riskLevel === "moderate") {
    details = "Conditions are building toward European apple sawfly emergence. Adults fly during bloom and are attracted to white sticky traps — get those deployed now so you can gauge pressure before petal fall.";
  } else {
    details = "Too early for European apple sawfly. This wasp-like insect lays eggs in flowers at bloom, and its larvae tunnel into young fruit. At low populations, the damage can actually help thin your crop.";
  }

  const recommendation = adultsActive
    ? "Adults active during bloom. Spray at petal fall if trap counts exceed threshold. " +
      "Note: low populations may provide beneficial fruit thinning."
    : riskLevel === "moderate"
      ? `Approaching adult emergence (${roundedDD} of ${ADULTS_DD} DD). Deploy white sticky traps.`
      : "Low risk. Deploy traps at pink stage to be ready for bloom.";

  return { riskLevel, riskScore, cumulativeDD: roundedDD, adultsActive, details,
    recommendation, economicThreshold: THRESHOLD, scoutingProtocol: SCOUTING,
    productSuggestions: PRODUCTS };
}
