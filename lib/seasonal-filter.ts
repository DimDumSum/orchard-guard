// ---------------------------------------------------------------------------
// Seasonal Filter — Maps bloom stage to relevant models and provides
// card extraction/filtering for the dashboard seasonal mode.
// ---------------------------------------------------------------------------

export type Season =
  | "dormant"
  | "pre-bloom"
  | "bloom"
  | "post-bloom"
  | "summer"
  | "pre-harvest"
  | "post-harvest"

export interface ModelCardData {
  key: string
  title: string
  category: "disease" | "pest" | "abiotic"
  riskLevel: string
  riskScore: number
  details: string
  recommendation?: string
  forecastNote?: string
  watchNote?: string
  stageRelevance?: "active" | "upcoming" | "complete"
}

export const SEASON_LABELS: Record<Season, string> = {
  dormant: "Dormant Season",
  "pre-bloom": "Pre-Bloom",
  bloom: "Bloom Period",
  "post-bloom": "Post-Bloom",
  summer: "Summer Growing Season",
  "pre-harvest": "Pre-Harvest",
  "post-harvest": "Post-Harvest",
}

// Which models are most relevant during each season (from OMAFRA timing)
const SEASON_MODELS: Record<Season, string[]> = {
  dormant: [
    "fireBlight", "voles", "sunscald", "europeanRedMite", "frostRisk",
    "nectriaCanker", "deer", "winterMoth",
  ],
  "pre-bloom": [
    "appleScab", "powderyMildew", "frostRisk", "fireBlight", "rosyAppleAphid",
    "leafroller", "winterMoth", "appleBrownBug", "greenAppleAphid", "cedarRust",
    "europeanRedMite", "tentiformLeafminer", "appleFleaWeevil", "frostRing",
  ],
  bloom: [
    "fireBlight", "appleScab", "cedarRust", "europeanAppleSawfly",
    "tarnishedPlantBug", "frostRisk", "powderyMildew", "rosyAppleAphid",
    "appleBrownBug", "mulleinBug",
  ],
  "post-bloom": [
    "codlingMoth", "plumCurculio", "appleScab", "orientalFruitMoth",
    "leafroller", "fireBlight", "powderyMildew", "tentiformLeafminer",
    "sanJoseScale", "europeanRedMite", "greenAppleAphid", "sootyBlotch",
    "cedarRust",
  ],
  summer: [
    "twoSpottedSpiderMite", "europeanRedMite", "sootyBlotch", "bitterRot",
    "bitterPit", "japaneseBeetle", "appleMaggot", "codlingMoth",
    "orientalFruitMoth", "blackRot", "whiteRot", "leafroller", "sanJoseScale",
    "bmsb", "woollyAppleAphid", "appleLeafMidge", "brooksSpot", "sunburn",
    "alternaria",
  ],
  "pre-harvest": [
    "bmsb", "waterCore", "sunburn", "codlingMoth", "swd", "appleMaggot",
    "bitterPit", "postHarvest", "sootyBlotch", "bitterRot",
  ],
  "post-harvest": [
    "postHarvest", "nectriaCanker", "voles", "bullsEyeRot", "deer",
    "sunscald", "phytophthora", "replantDisease",
  ],
}

// Metadata for all 55 models
interface ModelMeta {
  title: string
  category: "disease" | "pest" | "abiotic"
}

const MODEL_META: Record<string, ModelMeta> = {
  // Disease
  fireBlight:       { title: "Fire Blight",              category: "disease" },
  appleScab:        { title: "Apple Scab",               category: "disease" },
  powderyMildew:    { title: "Powdery Mildew",           category: "disease" },
  cedarRust:        { title: "Cedar Apple Rust",         category: "disease" },
  sootyBlotch:      { title: "Sooty Blotch & Flyspeck",  category: "disease" },
  blackRot:         { title: "Black Rot",                category: "disease" },
  bitterRot:        { title: "Bitter Rot",               category: "disease" },
  whiteRot:         { title: "White Rot",                category: "disease" },
  brooksSpot:       { title: "Brooks Spot",              category: "disease" },
  alternaria:       { title: "Alternaria Leaf Blotch",   category: "disease" },
  nectriaCanker:    { title: "Nectria Canker",           category: "disease" },
  phytophthora:     { title: "Phytophthora Crown Rot",   category: "disease" },
  replantDisease:   { title: "Replant Disease",          category: "disease" },
  bullsEyeRot:      { title: "Bull's Eye Rot",          category: "disease" },
  postHarvest:      { title: "Post-Harvest Diseases",    category: "disease" },
  appleMosaic:      { title: "Apple Mosaic Virus",       category: "disease" },
  appleProliferation: { title: "Apple Proliferation",    category: "disease" },
  // Abiotic
  frostRisk:        { title: "Frost Risk",               category: "abiotic" },
  bitterPit:        { title: "Bitter Pit",               category: "abiotic" },
  sunscald:         { title: "Sunscald",                 category: "abiotic" },
  frostRing:        { title: "Frost Ring",               category: "abiotic" },
  waterCore:        { title: "Water Core",               category: "abiotic" },
  sunburn:          { title: "Sunburn",                  category: "abiotic" },
  // Lepidoptera
  codlingMoth:      { title: "Codling Moth",             category: "pest" },
  orientalFruitMoth: { title: "Oriental Fruit Moth",     category: "pest" },
  leafroller:       { title: "Leafroller (OBLR)",        category: "pest" },
  tentiformLeafminer: { title: "Tentiform Leafminer",   category: "pest" },
  lesserAppleworm:  { title: "Lesser Appleworm",         category: "pest" },
  eyespottedBudMoth: { title: "Eyespotted Bud Moth",    category: "pest" },
  winterMoth:       { title: "Winter Moth",              category: "pest" },
  clearwingMoth:    { title: "Clearwing Moth",           category: "pest" },
  dogwoodBorer:     { title: "Dogwood Borer",            category: "pest" },
  // Hemiptera / Coleoptera
  plumCurculio:     { title: "Plum Curculio",            category: "pest" },
  appleMaggot:      { title: "Apple Maggot",             category: "pest" },
  europeanRedMite:  { title: "European Red Mite",        category: "pest" },
  rosyAppleAphid:   { title: "Rosy Apple Aphid",         category: "pest" },
  greenAppleAphid:  { title: "Green Apple Aphid",        category: "pest" },
  woollyAppleAphid: { title: "Woolly Apple Aphid",       category: "pest" },
  tarnishedPlantBug: { title: "Tarnished Plant Bug",     category: "pest" },
  appleBrownBug:    { title: "Apple Brown Bug",          category: "pest" },
  mulleinBug:       { title: "Mullein Bug",              category: "pest" },
  sanJoseScale:     { title: "San Jose Scale",           category: "pest" },
  europeanFruitScale: { title: "European Fruit Scale",   category: "pest" },
  appleFleaWeevil:  { title: "Apple Flea Weevil",        category: "pest" },
  japaneseBeetle:   { title: "Japanese Beetle",          category: "pest" },
  // Mites / Flies / Other
  twoSpottedSpiderMite: { title: "Two-Spotted Spider Mite", category: "pest" },
  appleRustMite:    { title: "Apple Rust Mite",          category: "pest" },
  appleLeafMidge:   { title: "Apple Leaf Midge",         category: "pest" },
  europeanAppleSawfly: { title: "European Apple Sawfly", category: "pest" },
  pearPsylla:       { title: "Pear Psylla",              category: "pest" },
  bmsb:             { title: "Brown Marmorated Stink Bug", category: "pest" },
  swd:              { title: "Spotted Wing Drosophila",  category: "pest" },
  voles:            { title: "Voles",                    category: "pest" },
  deer:             { title: "Deer Damage",              category: "pest" },
  daggerNematode:   { title: "Dagger Nematode",          category: "pest" },
}

// ---------------------------------------------------------------------------
// Season detection
// ---------------------------------------------------------------------------

export function getCurrentSeason(bloomStage: string): Season {
  const month = new Date().getMonth() + 1
  switch (bloomStage) {
    case "dormant":
      return "dormant"
    case "silver-tip":
    case "green-tip":
    case "tight-cluster":
      return "pre-bloom"
    case "pink":
    case "bloom":
      return "bloom"
    case "petal-fall":
      return "post-bloom"
    case "fruit-set":
      if (month >= 10) return "post-harvest"
      if (month >= 9) return "pre-harvest"
      return "summer"
    default:
      // Fallback based on calendar month
      if (month <= 2 || month >= 11) return "dormant"
      if (month <= 4) return "pre-bloom"
      if (month === 5) return "bloom"
      if (month === 6) return "post-bloom"
      if (month <= 8) return "summer"
      if (month === 9) return "pre-harvest"
      return "post-harvest"
  }
}

// ---------------------------------------------------------------------------
// Card extraction — normalizes all model results into a common shape
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Create a plain-English one-liner for the dashboard.
 * Technical details belong on detail pages, not the risk grid.
 */
function dashboardSummary(key: string, level: string, score: number, rawDetails: string): string {
  const lo = level.toLowerCase()

  // Extract useful numbers from raw details
  const dhMatch = rawDetails.match(/([\d.]+)\s*DH/)
  const ddMatch = rawDetails.match(/([\d.]+)\s*DD|Cumulative DD[^:]*:\s*([\d.]+)/)
  const dd = ddMatch ? (ddMatch[1] ?? ddMatch[2]) : null

  // Model-specific summaries
  switch (key) {
    case "fireBlight": {
      const dh = dhMatch ? dhMatch[1] : "0"
      if (lo === "low" || lo === "none") return `Low bacterial growth — ${dh} degree hours accumulated.`
      if (lo === "moderate" || lo === "caution") return `Moderate fire blight conditions — ${dh} degree hours. Monitor blossoms.`
      return `High fire blight risk — ${dh} degree hours. Spray recommended.`
    }
    case "appleScab":
      if (rawDetails.includes("No green tissue")) return "Scab season has not started — no green tissue exposed."
      if (lo === "low" || lo === "none") return "No active scab infection events detected."
      if (lo === "severe" || lo === "high") return "Active scab infection — check spray coverage urgently."
      return "Moderate scab pressure — monitor wet periods closely."
    case "frostRisk":
      if (lo === "low" || lo === "none") return "No frost expected in the next 48 hours."
      if (lo === "critical" || lo === "high") return "Frost risk in forecast — protect sensitive tissue."
      return "Cool temperatures ahead — watch overnight lows."
    case "powderyMildew":
      if (lo === "low" || lo === "none") return "Mildew pressure low — conditions unfavorable."
      return "Favorable mildew conditions — warm, humid, dry weather."
    case "cedarRust":
      if (lo === "low" || lo === "none") return "Rust risk low — no recent spore-release events."
      return "Rust spore release likely — wetting event at suitable temps."
    case "sootyBlotch":
      if (lo === "low" || lo === "none") return "Leaf wetness hours below treatment threshold."
      return "Leaf wetness accumulating — approaching spray threshold."
    case "codlingMoth":
      if (dd) return `${dd} degree days accumulated — ${lo === "low" ? "moths not yet active" : "monitor traps"}.`
      return lo === "low" ? "Moths not yet active this season." : "Codling moth flight underway — check traps."
    case "plumCurculio":
      if (lo === "low" || lo === "none") return "Curculio not yet active — needs warm nights after petal fall."
      return "Warm nights expected — curculio adults may be active."
    case "appleMaggot":
      if (lo === "low" || lo === "none") return "Apple maggot flies not yet emerged."
      return "Apple maggot flight detected — monitor traps."
    case "europeanRedMite":
      if (lo === "low" || lo === "none") return "Mite pressure low — natural predators active."
      return "Mite populations building — scout for eggs and motiles."
    case "leafroller":
      if (dd) return `${dd} degree days — ${lo === "low" ? "between leafroller flights" : "leafroller activity expected"}.`
      return lo === "low" ? "Between leafroller flight periods." : "Leafroller flight period active."
    case "orientalFruitMoth":
      if (dd) return `${dd} degree days accumulated for oriental fruit moth.`
      return lo === "low" ? "Oriental fruit moth not yet active." : "OFM flight period — monitor shoots for flagging."
    case "tentiformLeafminer":
      if (dd) return `${dd} degree days — tracking leafminer generations.`
      return "Leafminer activity being tracked by degree days."
    case "bitterPit":
      if (lo === "low" || lo === "none") return "Bitter pit risk low — maintain calcium program."
      return "Bitter pit risk elevated — calcium sprays recommended."
    case "sunburn":
      if (lo === "low" || lo === "none") return "Sunburn risk low — no extreme heat expected."
      return "High temperature risk — consider evaporative cooling."
    case "sunscald":
      if (lo === "low" || lo === "none") return "Sunscald risk low for the season."
      return "Sunscald risk — protect trunks with white paint or guards."
    case "waterCore":
      if (lo === "low" || lo === "none") return "Water core risk low — cool nights expected."
      return "Warm days with cool nights — watch for water core in susceptible varieties."
    case "blackRot":
      if (lo === "low" || lo === "none") return "Black rot pressure low — keep cankers pruned."
      return "Warm, wet conditions favorable for black rot."
    case "bitterRot":
      if (lo === "low" || lo === "none") return "Bitter rot risk low — hot weather not sustained."
      return "Hot, humid conditions favor bitter rot — protect fruit."
    case "whiteRot":
      if (lo === "low" || lo === "none") return "White rot pressure low."
      return "Warm, wet weather favoring white rot development."
    case "japaneseBeetle":
      if (lo === "low" || lo === "none") return "Japanese beetles not yet active."
      return "Japanese beetle flight period — scout for feeding damage."
    case "bmsb":
      if (lo === "low" || lo === "none") return "Stink bugs not yet moving into orchards."
      return "BMSB migration into orchards — monitor borders."
    case "voles":
      if (lo === "low" || lo === "none") return "Low vole pressure — maintain bait stations."
      return "Active vole season — check trunk guards and bait stations."
    case "deer":
      // Handled by fixed model details below
      return rawDetails
  }

  // Generic fallback
  if (lo === "low" || lo === "none") return `${MODEL_META[key]?.title ?? key} risk is low — no action needed.`
  if (lo === "moderate" || lo === "caution") return `Moderate ${(MODEL_META[key]?.title ?? key).toLowerCase()} risk — monitor conditions.`
  return `Elevated ${(MODEL_META[key]?.title ?? key).toLowerCase()} risk — see details.`
}

export function extractModelCards(results: Record<string, any>): ModelCardData[] {
  const cards: ModelCardData[] = []
  for (const [key, meta] of Object.entries(MODEL_META)) {
    const result = results[key]
    if (!result) continue

    // Handle inconsistent field names across models
    const riskLevel = result.riskLevel ?? result.combinedRisk ?? "low"
    const recommendation =
      result.recommendation
      ?? (typeof result.sprayRecommendation === "string"
        ? result.sprayRecommendation
        : result.sprayRecommendation?.message)
      ?? result.sprayWindow
      ?? undefined
    const rawDetails = result.details ?? ""

    cards.push({
      key,
      title: meta.title,
      category: meta.category,
      riskLevel: String(riskLevel),
      riskScore: typeof result.riskScore === "number" ? result.riskScore : 0,
      details: dashboardSummary(key, String(riskLevel), result.riskScore ?? 0, rawDetails),
      recommendation: recommendation ? String(recommendation) : undefined,
    })
  }
  return cards
}

// ---------------------------------------------------------------------------
// Seasonal filtering — split cards into primary (shown) and secondary (hidden)
// ---------------------------------------------------------------------------

const HIGH_RISK = new Set(["high", "extreme", "critical", "severe"])

export function getSeasonalCards(
  allCards: ModelCardData[],
  season: Season,
  maxDefault: number = 8,
): { primary: ModelCardData[]; secondary: ModelCardData[] } {
  const seasonKeys = new Set(SEASON_MODELS[season] ?? [])

  const primary: ModelCardData[] = []
  const secondary: ModelCardData[] = []

  for (const card of allCards) {
    // Show if model is in the season's list OR has elevated risk
    if (seasonKeys.has(card.key) || HIGH_RISK.has(card.riskLevel.toLowerCase())) {
      primary.push(card)
    } else {
      secondary.push(card)
    }
  }

  // Sort both by risk score descending
  primary.sort((a, b) => b.riskScore - a.riskScore)
  secondary.sort((a, b) => b.riskScore - a.riskScore)

  // If primary has too many, overflow the lowest-risk ones
  if (primary.length > maxDefault) {
    const overflow = primary.splice(maxDefault)
    secondary.unshift(...overflow)
  }

  return { primary, secondary }
}
