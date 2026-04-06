// Two-Spotted Spider Mite — hot/dry streak outbreak risk model
import { calcDegreeDaysSine, calcCumulativeDegreeDays } from "@/lib/degree-days";

export interface TwoSpottedSpiderMiteResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  hotDryStreak: number;
  details: string;
  recommendation: string;
  scoutingProtocol: string;
  productSuggestions: string[];
}

const SCOUTING = "Check 10 leaves/tree on 10 trees (lower canopy). Threshold: 5 mites/leaf with visible stippling and no predators.";
const PRODUCTS = ["Nexter (pyridaben)", "Acramite (bifenazate)", "Superior Oil (summer rate)"];

function aggregateDays(hourly: Array<{ timestamp: string; temp_c: number; precip_mm: number }>) {
  const map = new Map<string, { max: number; precip: number }>();
  for (const h of hourly) {
    const d = h.timestamp.substring(0, 10);
    const e = map.get(d);
    if (e) { e.max = Math.max(e.max, h.temp_c); e.precip += h.precip_mm; }
    else map.set(d, { max: h.temp_c, precip: h.precip_mm });
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
}

export function evaluateTwoSpottedSpiderMite(
  hourlyData: Array<{ timestamp: string; temp_c: number; precip_mm: number }>,
): TwoSpottedSpiderMiteResult {
  const days = aggregateDays(hourlyData);

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].max > 30 && days[i].precip === 0) streak++;
    else break;
  }

  const riskLevel: "low" | "moderate" | "high" =
    streak > 5 ? "high" : streak >= 3 ? "moderate" : "low";
  const riskScore = streak > 5 ? 85 : streak >= 3 ? 50 : 10;

  let details: string;
  if (riskLevel === "high") {
    details = `There have been ${streak} consecutive hot, dry days — ideal conditions for a spider mite explosion. Mites thrive in dusty, drought-stressed canopies and can bronze entire trees if left unchecked.`;
  } else if (riskLevel === "moderate") {
    details = `A ${streak}-day hot and dry streak is building, which favours two-spotted spider mite populations. These tiny mites feed on leaf undersides, causing a stippled, bronzed appearance that reduces photosynthesis.`;
  } else {
    details = "No spider mite pressure expected right now. Two-spotted spider mites become a problem during extended hot, dry weather when their populations outpace natural predators. Rain and cool spells keep them in check.";
  }
  const recommendation = riskLevel === "low"
    ? "Low risk. Continue monitoring during hot dry weather."
    : `${riskLevel === "high" ? "Extended" : "Building"} hot/dry conditions favour mite outbreaks. ` +
      "Scout lower canopy for stippling. Avoid carbaryl (Sevin) — known to cause mite outbreaks.";

  return { riskLevel, riskScore, hotDryStreak: streak, details, recommendation,
    scoutingProtocol: SCOUTING, productSuggestions: PRODUCTS };
}
