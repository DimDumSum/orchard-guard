// ---------------------------------------------------------------------------
// Apple Phenology — 16-stage BBCH scale for Ontario apple production
//
// Degree-day thresholds (base 4.4°C / 40°F from Jan 1) derived from
// Ontario OMAFRA extension data and Michigan State University phenology guides.
// ---------------------------------------------------------------------------

import { calcCumulativeDegreeDays } from "./degree-days"

// ---------------------------------------------------------------------------
// Stage definitions
// ---------------------------------------------------------------------------

export interface PhenologyStage {
  id: string
  bbch: string
  name: string
  ddMin: number      // DD (base 4.4°C) from Jan 1 to enter this stage
  ddMax: number      // DD at which next stage begins
  description: string
  /** Model keys most relevant/active during this stage */
  activeModels: string[]
}

export const PHENOLOGY_STAGES: PhenologyStage[] = [
  {
    id: "dormancy",
    bbch: "00",
    name: "Dormancy",
    ddMin: 0,
    ddMax: 30,
    description: "Buds fully dormant. Monitor for vole/deer damage, sunscald on trunks.",
    activeModels: ["voles", "deer", "sunscald", "nectriaCanker", "frostRisk"],
  },
  {
    id: "silver-tip",
    bbch: "05",
    name: "Silver Tip",
    ddMin: 30,
    ddMax: 55,
    description: "Buds swelling, showing silver. Last window for dormant oil sprays.",
    activeModels: ["europeanRedMite", "frostRisk", "winterMoth", "sanJoseScale"],
  },
  {
    id: "green-tip",
    bbch: "07",
    name: "Green Tip",
    ddMin: 55,
    ddMax: 85,
    description: "First green tissue exposed. Apple scab monitoring begins.",
    activeModels: ["appleScab", "frostRisk", "europeanRedMite", "rosyAppleAphid", "appleFleaWeevil"],
  },
  {
    id: "half-inch-green",
    bbch: "09",
    name: "Half-inch Green",
    ddMin: 85,
    ddMax: 120,
    description: "Leaves emerging ~1cm. Scab and mildew risk increasing.",
    activeModels: ["appleScab", "powderyMildew", "frostRisk", "rosyAppleAphid", "leafroller", "greenAppleAphid"],
  },
  {
    id: "tight-cluster",
    bbch: "53",
    name: "Tight Cluster",
    ddMin: 120,
    ddMax: 165,
    description: "Flower buds tightly clustered. Maintain fungicide protection.",
    activeModels: ["appleScab", "powderyMildew", "cedarRust", "frostRisk", "rosyAppleAphid", "tentiformLeafminer"],
  },
  {
    id: "pink",
    bbch: "56",
    name: "Pink",
    ddMin: 165,
    ddMax: 195,
    description: "Flower buds showing color. Fire blight risk begins. Frost damage severe at this stage.",
    activeModels: ["fireBlight", "appleScab", "cedarRust", "frostRisk", "powderyMildew", "tarnishedPlantBug"],
  },
  {
    id: "first-pink",
    bbch: "57",
    name: "First Pink",
    ddMin: 195,
    ddMax: 220,
    description: "First blossoms showing pink petals. Critical fire blight risk period approaching.",
    activeModels: ["fireBlight", "appleScab", "cedarRust", "frostRisk", "powderyMildew", "europeanAppleSawfly"],
  },
  {
    id: "full-bloom",
    bbch: "60",
    name: "Full Bloom",
    ddMin: 220,
    ddMax: 280,
    description: "Flowers open. Highest fire blight risk. Do NOT spray insecticides — pollinators active.",
    activeModels: ["fireBlight", "appleScab", "cedarRust", "frostRisk", "powderyMildew", "tarnishedPlantBug", "mulleinBug"],
  },
  {
    id: "petal-fall",
    bbch: "67",
    name: "Petal Fall",
    ddMin: 280,
    ddMax: 350,
    description: "Petals falling. Key spray window for codling moth, plum curculio, and scab.",
    activeModels: ["codlingMoth", "plumCurculio", "appleScab", "fireBlight", "powderyMildew", "orientalFruitMoth", "leafroller"],
  },
  {
    id: "fruit-set",
    bbch: "71",
    name: "Fruit Set (6mm)",
    ddMin: 350,
    ddMax: 450,
    description: "Fruitlets 6mm. Codling moth DD tracking critical. First cover sprays.",
    activeModels: ["codlingMoth", "plumCurculio", "appleScab", "orientalFruitMoth", "tentiformLeafminer", "sootyBlotch"],
  },
  {
    id: "12mm-fruitlet",
    bbch: "75",
    name: "12mm Fruitlet",
    ddMin: 450,
    ddMax: 600,
    description: "Fruitlets 12mm. Second cover timing. Thin fruit if needed.",
    activeModels: ["codlingMoth", "orientalFruitMoth", "sootyBlotch", "europeanRedMite", "greenAppleAphid", "sanJoseScale"],
  },
  {
    id: "20mm-fruitlet",
    bbch: "79",
    name: "20mm Fruitlet",
    ddMin: 600,
    ddMax: 800,
    description: "Fruitlets 20mm. Continue cover sprays. Monitor mite populations.",
    activeModels: ["codlingMoth", "twoSpottedSpiderMite", "europeanRedMite", "sootyBlotch", "bitterRot", "appleLeafMidge"],
  },
  {
    id: "summer-growth",
    bbch: "81",
    name: "Summer Growth",
    ddMin: 800,
    ddMax: 1400,
    description: "Fruit sizing. Hot/humid conditions favor summer diseases. Watch codling moth 2nd gen.",
    activeModels: [
      "codlingMoth", "twoSpottedSpiderMite", "europeanRedMite", "sootyBlotch",
      "bitterRot", "blackRot", "whiteRot", "japaneseBeetle", "appleMaggot",
      "bmsb", "woollyAppleAphid", "sunburn", "bitterPit",
    ],
  },
  {
    id: "pre-harvest",
    bbch: "87",
    name: "Pre-harvest Maturity",
    ddMin: 1400,
    ddMax: 1800,
    description: "Fruit approaching maturity. PHI restrictions apply. Monitor BMSB and SWD.",
    activeModels: ["bmsb", "swd", "codlingMoth", "appleMaggot", "waterCore", "sunburn", "bitterPit", "bitterRot", "sootyBlotch"],
  },
  {
    id: "harvest",
    bbch: "89",
    name: "Harvest",
    ddMin: 1800,
    ddMax: 2200,
    description: "Harvest window. Handle fruit carefully to minimize post-harvest disease.",
    activeModels: ["postHarvest", "bmsb", "swd", "waterCore", "bitterPit"],
  },
  {
    id: "post-harvest",
    bbch: "93",
    name: "Post-harvest",
    ddMin: 2200,
    ddMax: 9999,
    description: "Season complete. Apply fall nitrogen. Protect trunks for winter.",
    activeModels: ["postHarvest", "nectriaCanker", "voles", "deer", "bullsEyeRot", "phytophthora", "sunscald"],
  },
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Map from stage id to stage object */
const STAGE_MAP = new Map(PHENOLOGY_STAGES.map((s) => [s.id, s]))

export function getStageById(id: string): PhenologyStage | undefined {
  return STAGE_MAP.get(id)
}

/** Determine the current phenological stage from accumulated DD (base 4.4°C). */
export function getStageFromDD(dd: number): PhenologyStage {
  for (let i = PHENOLOGY_STAGES.length - 1; i >= 0; i--) {
    if (dd >= PHENOLOGY_STAGES[i].ddMin) return PHENOLOGY_STAGES[i]
  }
  return PHENOLOGY_STAGES[0]
}

/** Calculate DD (base 4.4°C) from Jan 1 using daily weather data. */
export function calcSeasonDD(
  dailyData: { max_temp: number; min_temp: number; date: string }[],
): number {
  const year = new Date().getFullYear()
  const jan1 = `${year}-01-01`
  const today = new Date().toISOString().slice(0, 10)
  const filtered = dailyData.filter((d) => d.date >= jan1 && d.date <= today)
  return calcCumulativeDegreeDays(filtered, 4.4)
}

/**
 * Estimate days until the next stage transition, using forecast daily data
 * to project DD accumulation forward.
 */
export function estimateDaysToNextStage(
  currentDD: number,
  currentStage: PhenologyStage,
  forecastDaily: { max_temp: number; min_temp: number }[],
): number | null {
  const targetDD = currentStage.ddMax
  if (targetDD >= 9999) return null // post-harvest, no next stage

  const remaining = targetDD - currentDD
  if (remaining <= 0) return 0

  // Project using forecast
  let accum = 0
  for (let i = 0; i < forecastDaily.length; i++) {
    const day = forecastDaily[i]
    const dd = Math.max(0, (day.max_temp + day.min_temp) / 2 - 4.4)
    accum += dd
    if (accum >= remaining) return i + 1
  }

  // Extrapolate beyond forecast
  if (forecastDaily.length === 0 || accum <= 0) return null
  const avgDaily = accum / forecastDaily.length
  return Math.round(forecastDaily.length + (remaining - accum) / avgDaily)
}

/**
 * Map the existing 8-stage bloom_stage value to the closest 16-stage phenology id.
 */
export function mapBloomToPheno(bloomStage: string): string {
  const mapping: Record<string, string> = {
    dormant: "dormancy",
    "silver-tip": "silver-tip",
    "green-tip": "green-tip",
    "tight-cluster": "tight-cluster",
    pink: "pink",
    bloom: "full-bloom",
    "petal-fall": "petal-fall",
    "fruit-set": "fruit-set",
  }
  return mapping[bloomStage] ?? "dormancy"
}

// ---------------------------------------------------------------------------
// Stage relevance for model alerts
// ---------------------------------------------------------------------------

export type StageRelevance = "active" | "upcoming" | "complete"

/**
 * Determine whether a model is active, upcoming, or season-complete
 * relative to the current phenological stage.
 */
export function getModelStageRelevance(
  modelKey: string,
  currentStageIdx: number,
): StageRelevance {
  const stages = PHENOLOGY_STAGES

  // Check if model is active in the current stage
  if (stages[currentStageIdx]?.activeModels.includes(modelKey)) {
    return "active"
  }

  // Check if model will be active in a future stage
  for (let i = currentStageIdx + 1; i < stages.length; i++) {
    if (stages[i].activeModels.includes(modelKey)) {
      return "upcoming"
    }
  }

  // Check if model was active in a past stage (season complete)
  for (let i = 0; i < currentStageIdx; i++) {
    if (stages[i].activeModels.includes(modelKey)) {
      return "complete"
    }
  }

  return "upcoming"
}
