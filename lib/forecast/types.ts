// ---------------------------------------------------------------------------
// Forecast Types — shared types for all forecast/prediction modules
// ---------------------------------------------------------------------------

export type ForecastRiskLevel = "low" | "moderate" | "high" | "critical"

export interface ForecastDayRisk {
  model: string
  modelTitle: string
  riskLevel: ForecastRiskLevel
  summary: string
  action: string | null
}

export interface ForecastDaySummary {
  date: string
  dayName: string
  isToday: boolean
  highTemp: number
  lowTemp: number
  precipMm: number
  windKph: number
  avgHumidity: number
  weatherIcon: "sunny" | "cloudy" | "rainy" | "stormy"
  risks: ForecastDayRisk[]
  worstRisk: ForecastRiskLevel
}

export interface SprayDay {
  date: string
  dayName: string
  rating: "best" | "good" | "avoid"
  reason: string
  highTemp: number
  lowTemp: number
  precipMm: number
  windKph: number
}

export interface SprayCoverageStatus {
  target: string
  status: "protected" | "expiring" | "unprotected" | "inactive"
  lastProduct: string | null
  lastDate: string | null
  daysSinceSpray: number | null
  message: string
  nextAction: string | null
}

export interface ProductRecommendation {
  name: string
  activeIngredient: string
  fracIracGroup: string | null
  ratePerHectare: string | null
  rateUnit: string | null
  phiDays: number | null
  reiHours: number | null
  kickbackHours: number | null
  rainfastHours: number | null
  costPerHectare: number | null
  resistanceRisk: string
  organicApproved: boolean
  tier: "best" | "good" | "budget"
  note: string | null
}

export interface ActionCard {
  model: string
  modelTitle: string
  type: "active-infection" | "pre-infection" | "preparation"
  riskLevel: ForecastRiskLevel
  whatHappened: string | null
  kickbackWindow: string | null
  forecast: string | null
  products: ProductRecommendation[]
  bestSprayDay: string | null
  preparationChecklist: string[]
  lookingAhead: string | null
}

export interface FireBlightBloomForecast {
  days: Array<{
    date: string
    dayName: string
    projectedDH: number
    riskLevel: ForecastRiskLevel
    barFraction: number // 0-1 for visual bar
    note: string
  }>
  criticalWindow: string | null
  recommendedAction: string | null
  maryBlytProjection: {
    blossomOpen: boolean
    dhMet: boolean
    wettingLikely: boolean
    tempMet: boolean
    conditionsMet: number
  } | null
}

export interface WeekAheadData {
  days: ForecastDaySummary[]
  sprayDays: SprayDay[]
  actionCards: ActionCard[]
  fireBlightBloom: FireBlightBloomForecast | null
  sprayCoverage: SprayCoverageStatus[]
  preparationAlerts: ActionCard[]
}
