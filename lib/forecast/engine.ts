// ---------------------------------------------------------------------------
// Forecast Engine — Projects disease/pest models forward using 7-day forecast
//
// This is the core predictive engine. It takes forecast weather data and runs
// each disease/pest model's logic against future conditions to predict risk
// events before they happen.
// ---------------------------------------------------------------------------

import { calcDegreeDaysSine } from "@/lib/degree-days"
import type {
  ForecastDaySummary,
  ForecastDayRisk,
  ForecastRiskLevel,
  SprayDay,
  ActionCard,
  ProductRecommendation,
  SprayCoverageStatus,
  FireBlightBloomForecast,
  WeekAheadData,
} from "./types"
import type { SprayProductRow, SprayLogRow, WeatherDailyRow } from "@/lib/db"

// ---------------------------------------------------------------------------
// Types for model results passed in from the dashboard
// ---------------------------------------------------------------------------

interface OrchardConfig {
  bloom_stage: string
  fire_blight_history: string
  petal_fall_date: string | null
  codling_moth_biofix_date: string | null
}

interface HourlyRecord {
  timestamp: string
  temp_c: number
  humidity_pct: number
  precip_mm: number
  wind_kph?: number
  dew_point_c?: number
}

// ---------------------------------------------------------------------------
// Mills Table thresholds (inline — matches apple-scab.ts)
// ---------------------------------------------------------------------------

const MILLS_TABLE = [
  { minTemp: 1,  maxTemp: 5,  light: 48, moderate: 41, severe: 35 },
  { minTemp: 6,  maxTemp: 8,  light: 30, moderate: 25, severe: 20 },
  { minTemp: 9,  maxTemp: 11, light: 20, moderate: 17, severe: 14 },
  { minTemp: 12, maxTemp: 15, light: 15, moderate: 12, severe: 9 },
  { minTemp: 16, maxTemp: 19, light: 12, moderate: 9,  severe: 7 },
  { minTemp: 20, maxTemp: 24, light: 11, moderate: 8,  severe: 6 },
  { minTemp: 25, maxTemp: 26, light: 15, moderate: 12, severe: 9 },
]

function getMillsHours(temp: number): { light: number; moderate: number; severe: number } | null {
  for (const row of MILLS_TABLE) {
    if (temp >= row.minTemp && temp <= row.maxTemp) {
      // Interpolate within the band
      const frac = (temp - row.minTemp) / Math.max(row.maxTemp - row.minTemp, 1)
      // For simplicity, return the band values directly
      return { light: row.light, moderate: row.moderate, severe: row.severe }
    }
  }
  // Below 1°C or above 26°C — no infection
  return null
}

// ---------------------------------------------------------------------------
// Frost thresholds (from frost-risk.ts)
// ---------------------------------------------------------------------------

const FROST_THRESHOLDS: Record<string, { kill10: number; kill90: number }> = {
  dormant: { kill10: -17, kill90: -25 },
  "silver-tip": { kill10: -12, kill90: -17 },
  "green-tip": { kill10: -8, kill90: -12 },
  "tight-cluster": { kill10: -5, kill90: -8 },
  pink: { kill10: -3, kill90: -5 },
  bloom: { kill10: -2, kill90: -3 },
  "petal-fall": { kill10: -1, kill90: -2 },
  "fruit-set": { kill10: -1, kill90: -2 },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function estimateWetHours(precipMm: number): number {
  if (precipMm <= 0.5) return 0
  if (precipMm <= 5) return 7  // light rain
  if (precipMm <= 15) return 11 // moderate rain
  return 18 // heavy rain
}

function pickWeatherIcon(precip: number, wind: number): "sunny" | "cloudy" | "rainy" | "stormy" {
  if (precip > 15 && wind > 30) return "stormy"
  if (precip > 0.5) return "rainy"
  if (precip > 0) return "cloudy"
  return "sunny"
}

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

function formatDayLong(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr === today
}

function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return dateStr === tomorrow.toISOString().slice(0, 10)
}

function worstRisk(levels: ForecastRiskLevel[]): ForecastRiskLevel {
  const order: ForecastRiskLevel[] = ["low", "moderate", "high", "critical"]
  let worst = 0
  for (const l of levels) {
    const idx = order.indexOf(l)
    if (idx > worst) worst = idx
  }
  return order[worst]
}

function daysUntil(fromDate: string, toDate: string): number {
  const from = new Date(fromDate + "T00:00:00")
  const to = new Date(toDate + "T00:00:00")
  return Math.round((to.getTime() - from.getTime()) / (86400000))
}

const PRE_GREENTIP = new Set(["dormant", "silver-tip"])
const BLOOM_STAGES = new Set(["bloom", "petal-fall"])

// ---------------------------------------------------------------------------
// Scab Forecast — project scab risk for each forecast day
// ---------------------------------------------------------------------------

function forecastScabDay(
  day: WeatherDailyRow,
  ascosporeMaturity: number,
  bloomStage: string,
): ForecastDayRisk | null {
  // Gate: no scab before green-tip
  if (PRE_GREENTIP.has(bloomStage)) return null
  if (ascosporeMaturity <= 0) return null

  const meanTemp = ((day.max_temp ?? 0) + (day.min_temp ?? 0)) / 2
  const precip = day.total_precip ?? 0

  if (precip < 0.5 || meanTemp < 1 || meanTemp > 26) return null

  const wetHours = estimateWetHours(precip)
  const mills = getMillsHours(meanTemp)
  if (!mills) return null

  // Determine infection likelihood
  let riskLevel: ForecastRiskLevel = "low"
  let summary = ""
  let action: string | null = null

  if (wetHours >= mills.severe) {
    riskLevel = "critical"
    summary = `Rain (${precip.toFixed(0)}mm) + ${meanTemp.toFixed(0)}°C = severe infection conditions likely. ~${wetHours}h estimated wetness exceeds ${mills.severe}h severe threshold.`
    action = "Spray protectant BEFORE this rain or have curative fungicide ready for kickback application after."
  } else if (wetHours >= mills.light) {
    riskLevel = "high"
    summary = `Rain (${precip.toFixed(0)}mm) + ${meanTemp.toFixed(0)}°C = likely infection conditions. ~${wetHours}h estimated wetness meets ${mills.light}h light infection threshold.`
    action = "Spray protectant BEFORE this rain to prevent infection."
  } else if (wetHours >= mills.light * 0.7) {
    riskLevel = "moderate"
    summary = `Rain (${precip.toFixed(0)}mm) + ${meanTemp.toFixed(0)}°C = possible infection conditions if rain persists longer than forecast.`
    action = "Consider protectant spray if conditions are borderline."
  } else {
    return null
  }

  // Adjust message for ascospore maturity
  if (ascosporeMaturity < 5) {
    summary += ` At ${ascosporeMaturity.toFixed(1)}% ascospore maturity, spore load is very low — severity would be limited.`
  }

  return {
    model: "appleScab",
    modelTitle: "Apple Scab",
    riskLevel,
    summary,
    action,
  }
}

// ---------------------------------------------------------------------------
// Fire Blight Forecast — project bacterial growth using forecast temps
// ---------------------------------------------------------------------------

function forecastFireBlightDay(
  day: WeatherDailyRow,
  cumulativeDH: number,
  bloomStage: string,
  fireBlightHistory: string,
): { risk: ForecastDayRisk | null; dayDH: number } {
  const maxT = day.max_temp ?? 0
  const minT = day.min_temp ?? 0
  const precip = day.total_precip ?? 0
  const meanT = (maxT + minT) / 2

  // Estimate degree hours for the day (simplified: ~hours above 15.5°C)
  let dayDH = 0
  if (meanT > 15.5) {
    // Rough approximation: each degree above 15.5 × ~16 effective hours
    dayDH = Math.max(0, (meanT - 15.5)) * 16
    // Peak adjustment at 31°C
    if (meanT > 31) {
      dayDH = Math.max(0, (31 - 15.5) - (meanT - 31) * 0.5) * 16
    }
  }

  const newCumDH = cumulativeDH + dayDH

  // Determine thresholds based on history
  const factor = fireBlightHistory === "in_orchard" ? 0.7
    : fireBlightHistory === "nearby" ? 0.85 : 1.0
  const cautionTh = 110 * factor
  const highTh = 220 * factor
  const extremeTh = 400 * factor

  // Only relevant during bloom/petal-fall
  const isBloom = BLOOM_STAGES.has(bloomStage)
  if (!isBloom && bloomStage !== "pink") {
    return { risk: null, dayDH }
  }

  let riskLevel: ForecastRiskLevel = "low"
  if (newCumDH >= extremeTh) riskLevel = "critical"
  else if (newCumDH >= highTh) riskLevel = "high"
  else if (newCumDH >= cautionTh) riskLevel = "moderate"

  if (riskLevel === "low") {
    if (dayDH > 0) {
      return {
        risk: {
          model: "fireBlight",
          modelTitle: "Fire Blight",
          riskLevel: "low",
          summary: `Bacterial growth building — ${Math.round(newCumDH)} DH accumulated.`,
          action: null,
        },
        dayDH,
      }
    }
    return { risk: null, dayDH }
  }

  // Cap at caution without wetting event
  const hasWetting = precip > 0.25
  if (!hasWetting) {
    if (riskLevel === "high" || riskLevel === "critical") riskLevel = "moderate"
  }

  let summary = `${Math.round(newCumDH)} DH accumulated`
  const tempNote = meanT >= 18 ? "warm" : meanT >= 15 ? "mild" : "cool"
  summary += ` — ${tempNote} (${meanT.toFixed(0)}°C)`
  if (hasWetting) summary += ` + rain (${precip.toFixed(0)}mm)`

  let action: string | null = null
  if (riskLevel === "critical") {
    action = "Apply streptomycin before rain event. Critical fire blight conditions."
  } else if (riskLevel === "high") {
    action = "Have streptomycin ready. Spray before any rain or heavy dew."
  } else if (riskLevel === "moderate") {
    action = "Monitor conditions. Consider Blossom Protect if biological program."
  }

  return {
    risk: {
      model: "fireBlight",
      modelTitle: "Fire Blight",
      riskLevel,
      summary,
      action,
    },
    dayDH,
  }
}

// ---------------------------------------------------------------------------
// Frost Forecast
// ---------------------------------------------------------------------------

function forecastFrostDay(
  day: WeatherDailyRow,
  bloomStage: string,
): ForecastDayRisk | null {
  const thresholds = FROST_THRESHOLDS[bloomStage] ?? FROST_THRESHOLDS.dormant
  const low = day.min_temp ?? 0

  if (low > thresholds.kill10 + 5) return null // well above

  let riskLevel: ForecastRiskLevel = "low"
  let summary = ""
  let action: string | null = null

  if (low <= thresholds.kill90) {
    riskLevel = "critical"
    summary = `Forecast low ${low.toFixed(0)}°C is at or below 90% kill threshold (${thresholds.kill90}°C) for ${bloomStage}.`
    action = "Deploy all frost protection immediately — wind machines, heaters, overhead irrigation."
  } else if (low <= thresholds.kill10) {
    riskLevel = "high"
    summary = `Forecast low ${low.toFixed(0)}°C is at or below 10% kill threshold (${thresholds.kill10}°C) for ${bloomStage}.`
    action = "Protect with overhead irrigation or wind machines if available."
  } else if (low <= thresholds.kill10 + 2) {
    riskLevel = "moderate"
    summary = `Forecast low ${low.toFixed(0)}°C is within ${(low - thresholds.kill10).toFixed(0)}°C of damage threshold for ${bloomStage}.`
    action = "Monitor overnight temperatures. Have protection ready."
  } else {
    summary = `Cool overnight (${low.toFixed(0)}°C) but safe — ${(low - thresholds.kill10).toFixed(0)}°C above damage threshold.`
    return null
  }

  return {
    model: "frostRisk",
    modelTitle: "Frost Risk",
    riskLevel,
    summary,
    action,
  }
}

// ---------------------------------------------------------------------------
// Codling Moth Forecast — project DD accumulation forward
// ---------------------------------------------------------------------------

function forecastCodlingMothDay(
  day: WeatherDailyRow,
  currentDD: number,
  biofix: string | null,
): { risk: ForecastDayRisk | null; dd: number } {
  if (!biofix) return { risk: null, dd: 0 }

  const maxT = day.max_temp ?? 0
  const minT = day.min_temp ?? 0
  const dayDD = calcDegreeDaysSine(maxT, minT, 10)
  const newDD = currentDD + dayDD

  const thresholds = [
    { dd: 100, label: "1st generation egg hatch begins" },
    { dd: 250, label: "1st generation peak egg hatch — critical spray window" },
    { dd: 550, label: "1st generation complete" },
    { dd: 1050, label: "2nd generation egg hatch begins" },
    { dd: 1200, label: "2nd generation peak egg hatch" },
  ]

  for (const th of thresholds) {
    if (currentDD < th.dd && newDD >= th.dd) {
      return {
        risk: {
          model: "codlingMoth",
          modelTitle: "Codling Moth",
          riskLevel: th.dd === 250 || th.dd === 1200 ? "high" : "moderate",
          summary: `Projected ${Math.round(newDD)} DD — ${th.label}.`,
          action: th.dd <= 250
            ? "Apply first cover spray (Altacor or Assail)."
            : "Continue cover spray program.",
        },
        dd: dayDD,
      }
    }
    // Approaching threshold
    if (currentDD < th.dd && newDD >= th.dd - 30) {
      return {
        risk: {
          model: "codlingMoth",
          modelTitle: "Codling Moth",
          riskLevel: "moderate",
          summary: `Projected ${Math.round(newDD)} DD — approaching ${th.label} (~${Math.round(th.dd - newDD)} DD away).`,
          action: `Prepare spray materials. ${th.dd <= 250 ? "Have Altacor or Assail ready." : "Plan next cover spray."}`,
        },
        dd: dayDD,
      }
    }
  }

  return { risk: null, dd: dayDD }
}

// ---------------------------------------------------------------------------
// Spray Day Optimizer
// ---------------------------------------------------------------------------

function evaluateSprayDays(forecastDays: WeatherDailyRow[]): SprayDay[] {
  const days: SprayDay[] = []

  for (const day of forecastDays) {
    const date = day.date
    const precip = day.total_precip ?? 0
    const high = day.max_temp ?? 0
    const low = day.min_temp ?? 0
    const wind = 10 // Default estimate since daily view doesn't have wind
    const humidity = day.avg_humidity ?? 50

    let rating: "best" | "good" | "avoid" = "good"
    let reason = ""

    // Avoid days
    if (precip > 2) {
      rating = "avoid"
      reason = `Rain expected (${precip.toFixed(0)}mm). Product will wash off before drying.`
    } else if (high < 2) {
      rating = "avoid"
      reason = `Too cold (${high.toFixed(0)}°C). Risk of freezing in tank and poor coverage.`
    } else if (wind > 20) {
      rating = "avoid"
      reason = `Wind too high (${wind} km/h). Drift risk too high for safe application.`
    } else {
      // Check if it's a good spray day
      const nextDayIdx = forecastDays.indexOf(day) + 1
      const nextDayPrecip = nextDayIdx < forecastDays.length
        ? (forecastDays[nextDayIdx].total_precip ?? 0) : 0

      if (precip <= 0.5 && wind <= 10 && high >= 5 && high <= 25 && humidity < 90) {
        // Check if there's rain coming that we should spray before
        if (nextDayPrecip > 2) {
          rating = "best"
          reason = `Dry, ${high.toFixed(0)}°C, good conditions. Apply protectant today before tomorrow's rain.`
        } else {
          rating = "best"
          reason = `Dry, ${high.toFixed(0)}°C. Good drying conditions for spray application.`
        }
      } else if (precip <= 1 && high >= 2) {
        rating = "good"
        const notes: string[] = []
        if (wind > 10) notes.push("slightly windy — use low-drift nozzles")
        if (high < 5) notes.push("cool — ensure adequate drying time")
        if (humidity >= 90) notes.push("high humidity — slower drying")
        reason = `Workable conditions (${high.toFixed(0)}°C).${notes.length > 0 ? " " + notes.join("; ") + "." : ""}`
      }
    }

    days.push({
      date,
      dayName: isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : formatDayLong(date),
      rating,
      reason,
      highTemp: high,
      lowTemp: low,
      precipMm: precip,
      windKph: wind,
    })
  }

  return days
}

// ---------------------------------------------------------------------------
// Spray Coverage Tracker
// ---------------------------------------------------------------------------

function evaluateSprayCoverage(
  sprayLog: SprayLogRow[],
  products: SprayProductRow[],
  bloomStage: string,
): SprayCoverageStatus[] {
  const today = new Date().toISOString().slice(0, 10)
  const coverage: SprayCoverageStatus[] = []

  // Map product names to their DB rows for lookup
  const productMap = new Map<string, SprayProductRow>()
  for (const p of products) {
    productMap.set(p.product_name.toLowerCase(), p)
  }

  // Define targets to track
  const targets = [
    { target: "Apple Scab", keywords: ["scab", "fungicide"], bloomGate: "green-tip" },
    { target: "Fire Blight", keywords: ["fire blight", "streptomycin", "kasumin", "blossom protect", "copper"], bloomGate: "pink" },
    { target: "Codling Moth", keywords: ["codling moth", "insecticide"], bloomGate: "petal-fall" },
    { target: "Powdery Mildew", keywords: ["mildew", "fungicide"], bloomGate: "green-tip" },
  ]

  const stageOrder = ["dormant", "silver-tip", "green-tip", "tight-cluster", "pink", "bloom", "petal-fall", "fruit-set"]
  const currentIdx = stageOrder.indexOf(bloomStage)

  for (const t of targets) {
    const gateIdx = stageOrder.indexOf(t.bloomGate)
    if (currentIdx < gateIdx) {
      // Not yet in the window for this target
      coverage.push({
        target: t.target,
        status: "inactive",
        lastProduct: null,
        lastDate: null,
        daysSinceSpray: null,
        message: `Monitoring starts at ${t.bloomGate}. Not yet active.`,
        nextAction: null,
      })
      continue
    }

    // Find last spray targeting this
    const relevantSprays = sprayLog.filter((s) => {
      const targetMatch = s.target?.toLowerCase().includes(t.target.toLowerCase())
      const productMatch = t.keywords.some((k) =>
        s.product?.toLowerCase().includes(k)
      )
      return targetMatch || productMatch
    }).sort((a, b) => b.date.localeCompare(a.date))

    const lastSpray = relevantSprays[0]

    if (!lastSpray) {
      coverage.push({
        target: t.target,
        status: "unprotected",
        lastProduct: null,
        lastDate: null,
        daysSinceSpray: null,
        message: `No ${t.target.toLowerCase()} sprays logged this season.`,
        nextAction: `Apply first ${t.target === "Apple Scab" ? "protectant fungicide" : t.target === "Fire Blight" ? "copper or streptomycin" : "cover spray"} as soon as conditions warrant.`,
      })
      continue
    }

    const daysSince = daysUntil(lastSpray.date, today)
    const product = productMap.get(lastSpray.product?.toLowerCase() ?? "")
    const isProtectant = !product?.kickback_hours || product.kickback_hours === 0
    const protectionWindow = isProtectant ? 12 : 14 // protectants ~10-14 days

    if (daysSince <= protectionWindow) {
      coverage.push({
        target: t.target,
        status: daysSince > protectionWindow - 3 ? "expiring" : "protected",
        lastProduct: lastSpray.product,
        lastDate: lastSpray.date,
        daysSinceSpray: daysSince,
        message: `${lastSpray.product} applied ${daysSince} day${daysSince !== 1 ? "s" : ""} ago.${daysSince > protectionWindow - 3 ? " Protection expiring soon." : ""}`,
        nextAction: daysSince > protectionWindow - 3
          ? `Re-apply within ${protectionWindow - daysSince} days or sooner if heavy rain.`
          : null,
      })
    } else {
      coverage.push({
        target: t.target,
        status: "unprotected",
        lastProduct: lastSpray.product,
        lastDate: lastSpray.date,
        daysSinceSpray: daysSince,
        message: `Last spray (${lastSpray.product}) was ${daysSince} days ago — protection has expired.`,
        nextAction: `Re-apply ${t.target === "Apple Scab" ? "protectant or curative fungicide" : "as conditions warrant"}.`,
      })
    }
  }

  return coverage
}

// ---------------------------------------------------------------------------
// Product Recommendation Builder
// ---------------------------------------------------------------------------

function getScabProducts(
  scenario: "kickback" | "protectant",
  products: SprayProductRow[],
  sprayLog: SprayLogRow[],
): ProductRecommendation[] {
  const scabProducts = products.filter((p) => {
    const targets: string[] = JSON.parse(p.target_pests || "[]")
    return targets.some((t) => t.toLowerCase().includes("scab")) ||
      p.product_name.toLowerCase().includes("captan") ||
      p.product_name.toLowerCase().includes("dithane") ||
      p.product_name.toLowerCase().includes("mancozeb")
  })

  // Count FRAC group usage this season
  const fracUsage = new Map<string, number>()
  for (const s of sprayLog) {
    const prod = products.find((p) => p.product_name.toLowerCase() === s.product?.toLowerCase())
    if (prod?.frac_irac_group) {
      fracUsage.set(prod.frac_irac_group, (fracUsage.get(prod.frac_irac_group) ?? 0) + 1)
    }
  }

  const recs: ProductRecommendation[] = []

  if (scenario === "kickback") {
    // Sort by kickback hours descending
    const kickbackProducts = scabProducts
      .filter((p) => (p.kickback_hours ?? 0) > 0)
      .sort((a, b) => (b.kickback_hours ?? 0) - (a.kickback_hours ?? 0))

    for (let i = 0; i < Math.min(kickbackProducts.length, 3); i++) {
      const p = kickbackProducts[i]
      const fracUses = p.frac_irac_group ? (fracUsage.get(p.frac_irac_group) ?? 0) : 0
      const maxApps = p.max_applications_per_season ?? 4
      let note: string | null = null
      if (fracUses > 0 && p.frac_irac_group) {
        const remaining = maxApps - fracUses
        note = `FRAC ${p.frac_irac_group} — used ${fracUses}× this season. ${remaining > 0 ? `${remaining} remaining.` : "At limit — choose alternative."}`
      }

      const costPerHa = p.cost_per_unit && p.unit_size && p.rate_per_hectare
        ? estimateCostPerHa(p) : null

      recs.push({
        name: p.product_name,
        activeIngredient: p.active_ingredient,
        fracIracGroup: p.frac_irac_group,
        ratePerHectare: p.rate_per_hectare,
        rateUnit: p.rate_unit,
        phiDays: p.phi_days,
        reiHours: p.rei_hours,
        kickbackHours: p.kickback_hours,
        rainfastHours: p.rainfast_hours,
        costPerHectare: costPerHa,
        resistanceRisk: p.resistance_risk,
        organicApproved: p.organic_approved === 1,
        tier: i === 0 ? "best" : i === 1 ? "good" : "budget",
        note,
      })
    }
  } else {
    // Protectant — sort by cost ascending, prefer multi-site modes
    const protectants = scabProducts
      .filter((p) => (p.kickback_hours ?? 0) === 0 || p.frac_irac_group?.startsWith("M"))
      .sort((a, b) => (estimateCostPerHa(a) ?? 999) - (estimateCostPerHa(b) ?? 999))

    for (let i = 0; i < Math.min(protectants.length, 2); i++) {
      const p = protectants[i]
      let note: string | null = null
      if (p.phi_days && p.phi_days > 30) {
        note = `Long PHI (${p.phi_days} days) — not suitable close to harvest.`
      }
      if (p.frac_irac_group?.startsWith("M")) {
        note = (note ? note + " " : "") + "Multi-site — no resistance risk."
      }

      recs.push({
        name: p.product_name,
        activeIngredient: p.active_ingredient,
        fracIracGroup: p.frac_irac_group,
        ratePerHectare: p.rate_per_hectare,
        rateUnit: p.rate_unit,
        phiDays: p.phi_days,
        reiHours: p.rei_hours,
        kickbackHours: p.kickback_hours,
        rainfastHours: p.rainfast_hours,
        costPerHectare: estimateCostPerHa(p),
        resistanceRisk: p.resistance_risk,
        organicApproved: p.organic_approved === 1,
        tier: i === 0 ? "best" : "good",
        note,
      })
    }
  }

  return recs
}

function getFireBlightProducts(products: SprayProductRow[]): ProductRecommendation[] {
  const fbProducts = products.filter((p) => {
    const targets: string[] = JSON.parse(p.target_pests || "[]")
    return targets.some((t) => t.toLowerCase().includes("fire blight")) ||
      p.product_name.toLowerCase().includes("streptomycin") ||
      p.product_name.toLowerCase().includes("kasumin") ||
      p.product_name.toLowerCase().includes("blossom protect")
  })

  return fbProducts.slice(0, 3).map((p, i) => ({
    name: p.product_name,
    activeIngredient: p.active_ingredient,
    fracIracGroup: p.frac_irac_group,
    ratePerHectare: p.rate_per_hectare,
    rateUnit: p.rate_unit,
    phiDays: p.phi_days,
    reiHours: p.rei_hours,
    kickbackHours: p.kickback_hours,
    rainfastHours: p.rainfast_hours,
    costPerHectare: estimateCostPerHa(p),
    resistanceRisk: p.resistance_risk,
    organicApproved: p.organic_approved === 1,
    tier: (i === 0 ? "best" : i === 1 ? "good" : "budget") as "best" | "good" | "budget",
    note: p.product_name.toLowerCase().includes("blossom")
      ? "Biological — apply 2-3 days before infection event for colonization."
      : null,
  }))
}

function estimateCostPerHa(p: SprayProductRow): number | null {
  if (!p.cost_per_unit || !p.unit_size || !p.rate_per_hectare) return null
  const rateNum = parseFloat(p.rate_per_hectare)
  if (isNaN(rateNum)) return null
  const costPerUnit = p.cost_per_unit / p.unit_size
  return Math.round(costPerUnit * rateNum * 100) / 100
}

// ---------------------------------------------------------------------------
// Fire Blight Bloom Forecast Panel
// ---------------------------------------------------------------------------

function buildFireBlightBloomForecast(
  forecastDays: WeatherDailyRow[],
  bloomStage: string,
  fireBlightHistory: string,
  currentDH: number,
): FireBlightBloomForecast | null {
  if (!BLOOM_STAGES.has(bloomStage) && bloomStage !== "pink") return null

  const factor = fireBlightHistory === "in_orchard" ? 0.7
    : fireBlightHistory === "nearby" ? 0.85 : 1.0
  const highTh = 220 * factor
  const extremeTh = 400 * factor

  let cumDH = currentDH
  const days: FireBlightBloomForecast["days"] = []
  let criticalStart: string | null = null
  let criticalEnd: string | null = null

  for (const day of forecastDays) {
    const meanT = ((day.max_temp ?? 0) + (day.min_temp ?? 0)) / 2
    let dayDH = 0
    if (meanT > 15.5) {
      dayDH = Math.max(0, (meanT - 15.5)) * 16
      if (meanT > 31) dayDH = Math.max(0, (31 - 15.5) - (meanT - 31) * 0.5) * 16
    }
    cumDH += dayDH

    let riskLevel: ForecastRiskLevel = "low"
    if (cumDH >= extremeTh) riskLevel = "critical"
    else if (cumDH >= highTh) riskLevel = "high"
    else if (cumDH >= 110 * factor) riskLevel = "moderate"

    const precip = day.total_precip ?? 0
    let note = meanT >= 18 ? "warm" : meanT >= 15 ? "mild" : "cool"
    if (precip > 0.25) note += " + rain"
    if (precip > 0 && meanT < 15) note += " — too cold for bacteria"

    const maxDH = extremeTh * 1.5
    const barFraction = Math.min(cumDH / maxDH, 1)

    if ((riskLevel === "high" || riskLevel === "critical") && !criticalStart) {
      criticalStart = formatDayName(day.date)
    }
    if (riskLevel === "high" || riskLevel === "critical") {
      criticalEnd = formatDayName(day.date)
    }

    days.push({
      date: day.date,
      dayName: isToday(day.date) ? "Today" : isTomorrow(day.date) ? "Tomorrow" : formatDayName(day.date),
      projectedDH: Math.round(cumDH),
      riskLevel,
      barFraction,
      note,
    })
  }

  const criticalWindow = criticalStart
    ? criticalStart === criticalEnd
      ? `Critical: ${criticalStart}`
      : `Critical window: ${criticalStart}–${criticalEnd}`
    : null

  let recommendedAction: string | null = null
  if (criticalWindow) {
    const rainDay = forecastDays.find((d) => (d.total_precip ?? 0) > 0.25 &&
      days.find((fd) => fd.date === d.date && (fd.riskLevel === "high" || fd.riskLevel === "critical")))
    if (rainDay) {
      const dayBefore = new Date(rainDay.date + "T12:00:00")
      dayBefore.setDate(dayBefore.getDate() - 1)
      recommendedAction = `Apply streptomycin ${formatDayName(dayBefore.toISOString().slice(0, 10))} evening or ${formatDayName(rainDay.date)} morning BEFORE rain. If using Blossom Protect, apply 2-3 days earlier.`
    } else {
      recommendedAction = "Have streptomycin ready. Apply before any rain or heavy dew during the critical window."
    }
  }

  return {
    days,
    criticalWindow,
    recommendedAction,
    maryBlytProjection: BLOOM_STAGES.has(bloomStage) ? {
      blossomOpen: bloomStage === "bloom",
      dhMet: cumDH >= 198,
      wettingLikely: forecastDays.some((d) => (d.total_precip ?? 0) > 0.25),
      tempMet: forecastDays.some((d) => ((d.max_temp ?? 0) + (d.min_temp ?? 0)) / 2 >= 15.6),
      conditionsMet: [
        bloomStage === "bloom",
        cumDH >= 198,
        forecastDays.some((d) => (d.total_precip ?? 0) > 0.25),
        forecastDays.some((d) => ((d.max_temp ?? 0) + (d.min_temp ?? 0)) / 2 >= 15.6),
      ].filter(Boolean).length,
    } : null,
  }
}

// ---------------------------------------------------------------------------
// Action Card Builder — creates expanded cards for active/predicted infections
// ---------------------------------------------------------------------------

function buildActionCards(
  forecastDays: WeatherDailyRow[],
  modelResults: Record<string, any>,
  products: SprayProductRow[],
  sprayLog: SprayLogRow[],
  bloomStage: string,
): ActionCard[] {
  const cards: ActionCard[] = []
  const today = new Date().toISOString().slice(0, 10)

  // Active scab infection card
  const scab = modelResults.appleScab
  if (scab && (scab.riskLevel === "moderate" || scab.riskLevel === "severe" || scab.riskLevel === "light")) {
    if (scab.recentInfections?.length > 0 || scab.currentWetPeriod?.infectionOccurred) {
      const infection = scab.currentWetPeriod?.infectionOccurred
        ? scab.currentWetPeriod
        : scab.recentInfections?.[0]

      if (infection) {
        const hoursSince = infection.startTime
          ? Math.round((Date.now() - new Date(infection.startTime).getTime()) / 3600000)
          : 0

        cards.push({
          model: "appleScab",
          modelTitle: "Apple Scab",
          type: "active-infection",
          riskLevel: scab.riskLevel === "severe" ? "critical" : scab.riskLevel === "moderate" ? "high" : "moderate",
          whatHappened: `A scab infection event ${infection.severity !== "none" ? `(${infection.severity})` : ""} occurred ~${hoursSince} hours ago. The wet period lasted approximately ${infection.durationHours} hours at a mean temperature of ${infection.meanTemp?.toFixed(1)}°C.`,
          kickbackWindow: hoursSince < 96
            ? `You have approximately ${Math.max(0, 96 - hoursSince)} hours remaining for curative (kickback) fungicide application.`
            : "The kickback window has closed. Apply a protectant to prevent the next infection.",
          forecast: null,
          products: hoursSince < 96
            ? getScabProducts("kickback", products, sprayLog)
            : getScabProducts("protectant", products, sprayLog),
          bestSprayDay: null,
          preparationChecklist: [],
          lookingAhead: null,
        })
      }
    }
  }

  // Pre-infection scab cards — rain + warm in forecast
  for (const day of forecastDays) {
    if (day.date <= today) continue
    const precip = day.total_precip ?? 0
    const meanT = ((day.max_temp ?? 0) + (day.min_temp ?? 0)) / 2

    if (precip > 0.5 && meanT > 6 && !PRE_GREENTIP.has(bloomStage)) {
      const daysAway = daysUntil(today, day.date)
      if (daysAway >= 2 && daysAway <= 5) {
        // Find best spray day before this rain
        const sprayBefore = forecastDays.find((d) =>
          d.date < day.date && d.date >= today && (d.total_precip ?? 0) < 1
        )

        cards.push({
          model: "appleScab",
          modelTitle: "Apple Scab",
          type: "pre-infection",
          riskLevel: precip > 5 && meanT > 10 ? "high" : "moderate",
          whatHappened: null,
          kickbackWindow: null,
          forecast: `Rain (${precip.toFixed(0)}mm) expected ${formatDayLong(day.date)} with temps reaching ${((day.max_temp ?? 0)).toFixed(0)}°C. ${scab?.ascosporeMaturity != null ? `At ${scab.ascosporeMaturity.toFixed(1)}% ascospore maturity, this would be a ${precip > 10 ? "moderate-to-heavy" : "light-to-moderate"} infection event if unprotected.` : ""}`,
          products: getScabProducts("protectant", products, sprayLog),
          bestSprayDay: sprayBefore ? formatDayLong(sprayBefore.date) : null,
          preparationChecklist: [
            `Check fungicide inventory`,
            "Test sprayer — ensure calibrated",
            sprayBefore ? `Plan spray for ${formatDayLong(sprayBefore.date)}` : "Apply protectant before rain begins",
            "Check weather morning-of to confirm timing",
          ],
          lookingAhead: null,
        })
        break // Only one pre-infection card
      }
    }
  }

  // Active fire blight card
  const fb = modelResults.fireBlight
  if (fb && BLOOM_STAGES.has(bloomStage)) {
    const cbRisk = fb.cougarBlight?.adjustedRisk ?? fb.combinedRisk
    if (cbRisk === "high" || cbRisk === "extreme") {
      cards.push({
        model: "fireBlight",
        modelTitle: "Fire Blight",
        type: "active-infection",
        riskLevel: cbRisk === "extreme" ? "critical" : "high",
        whatHappened: `Fire blight conditions are ${cbRisk}. ${fb.cougarBlight?.degreeHours4Day ? `${Math.round(fb.cougarBlight.degreeHours4Day)} degree hours accumulated over 4 days.` : ""} ${fb.maryBlyt?.eip > 200 ? `Bacterial population is high (EIP: ${Math.round(fb.maryBlyt.eip)}).` : ""}`,
        kickbackWindow: "Streptomycin must be applied BEFORE bacteria enter blossoms — there is no kickback for fire blight.",
        forecast: null,
        products: getFireBlightProducts(products),
        bestSprayDay: null,
        preparationChecklist: [],
        lookingAhead: null,
      })
    }
  }

  // Preparation alerts — 2-3 days ahead
  for (const day of forecastDays) {
    const daysAway = daysUntil(today, day.date)
    if (daysAway < 2 || daysAway > 5) continue

    const precip = day.total_precip ?? 0
    const meanT = ((day.max_temp ?? 0) + (day.min_temp ?? 0)) / 2

    // Fire blight prep during bloom
    if (BLOOM_STAGES.has(bloomStage) && meanT >= 18 && precip > 0.25) {
      const alreadyHasCard = cards.some((c) => c.model === "fireBlight")
      if (!alreadyHasCard) {
        cards.push({
          model: "fireBlight",
          modelTitle: "Fire Blight",
          type: "preparation",
          riskLevel: "moderate",
          whatHappened: null,
          kickbackWindow: null,
          forecast: `Warm temps (${meanT.toFixed(0)}°C) with rain (${precip.toFixed(0)}mm) forecast ${formatDayLong(day.date)}. Bacterial populations will build on open blossoms.`,
          products: getFireBlightProducts(products),
          bestSprayDay: null,
          preparationChecklist: [
            "Confirm streptomycin inventory",
            "Check if Blossom Protect was applied this week",
            `Plan spray for ${formatDayLong(day.date)} or the day before`,
            "If biologicals needed, apply 2-3 days before (needs lead time)",
          ],
          lookingAhead: null,
        })
      }
    }
  }

  return cards
}

// ---------------------------------------------------------------------------
// Main Forecast Engine — orchestrates everything
// ---------------------------------------------------------------------------

export function generateWeekAhead(
  forecastDailyData: WeatherDailyRow[],
  forecastHourly: HourlyRecord[],
  modelResults: Record<string, any>,
  orchard: OrchardConfig,
  products: SprayProductRow[],
  sprayLog: SprayLogRow[],
): WeekAheadData {
  const today = new Date().toISOString().slice(0, 10)
  const forecast7 = forecastDailyData.filter((d) => d.date >= today).slice(0, 7)

  // --- Build day-by-day risk timeline ---
  const scabResult = modelResults.appleScab
  const ascosporeMaturity = scabResult?.ascosporeMaturity ?? 0
  const fbResult = modelResults.fireBlight
  let fbCumulativeDH = fbResult?.cougarBlight?.degreeHours4Day ?? 0
  let cmDD = modelResults.codlingMoth?.cumulativeDD ?? 0

  const days: ForecastDaySummary[] = []

  for (const day of forecast7) {
    const risks: ForecastDayRisk[] = []

    // Apple scab
    const scabRisk = forecastScabDay(day, ascosporeMaturity, orchard.bloom_stage)
    if (scabRisk) risks.push(scabRisk)

    // Fire blight
    const { risk: fbRisk, dayDH } = forecastFireBlightDay(
      day, fbCumulativeDH, orchard.bloom_stage, orchard.fire_blight_history,
    )
    fbCumulativeDH += dayDH
    if (fbRisk) risks.push(fbRisk)

    // Frost
    const frostRisk = forecastFrostDay(day, orchard.bloom_stage)
    if (frostRisk) risks.push(frostRisk)

    // Codling moth
    const { risk: cmRisk, dd: cmDayDD } = forecastCodlingMothDay(
      day, cmDD, orchard.codling_moth_biofix_date,
    )
    cmDD += cmDayDD
    if (cmRisk) risks.push(cmRisk)

    // General weather assessment for days with no specific model risks
    if (risks.length === 0) {
      const precip = day.total_precip ?? 0
      const meanT = ((day.max_temp ?? 0) + (day.min_temp ?? 0)) / 2
      if (precip <= 0.5 && meanT > 2 && meanT < 25) {
        risks.push({
          model: "general",
          modelTitle: "Conditions",
          riskLevel: "low",
          summary: precip <= 0 && meanT >= 5
            ? "Dry and mild. Low disease pressure. Good day for fieldwork."
            : meanT <= 5
              ? "Cold and dry. No disease activity expected."
              : "Low disease pressure overall.",
          action: null,
        })
      }
    }

    const precipMm = day.total_precip ?? 0
    const highT = day.max_temp ?? 0
    const lowT = day.min_temp ?? 0

    days.push({
      date: day.date,
      dayName: isToday(day.date) ? "TODAY" : isTomorrow(day.date) ? "TOMORROW" : formatDayLong(day.date),
      isToday: isToday(day.date),
      highTemp: Math.round(highT * 10) / 10,
      lowTemp: Math.round(lowT * 10) / 10,
      precipMm: Math.round(precipMm * 10) / 10,
      windKph: 10, // daily view doesn't include wind; use default
      avgHumidity: day.avg_humidity ?? 50,
      weatherIcon: pickWeatherIcon(precipMm, 10),
      risks,
      worstRisk: risks.length > 0 ? worstRisk(risks.map((r) => r.riskLevel)) : "low",
    })
  }

  // --- Spray day optimizer ---
  const sprayDays = evaluateSprayDays(forecast7)

  // --- Action cards ---
  const actionCards = buildActionCards(forecast7, modelResults, products, sprayLog, orchard.bloom_stage)

  // --- Fire blight bloom panel ---
  const fireBlightBloom = buildFireBlightBloomForecast(
    forecast7, orchard.bloom_stage, orchard.fire_blight_history, fbResult?.cougarBlight?.degreeHours4Day ?? 0,
  )

  // --- Spray coverage ---
  const sprayCoverage = evaluateSprayCoverage(sprayLog, products, orchard.bloom_stage)

  // --- Preparation alerts (subset of action cards) ---
  const preparationAlerts = actionCards.filter((c) => c.type === "preparation")

  return {
    days,
    sprayDays,
    actionCards,
    fireBlightBloom,
    sprayCoverage,
    preparationAlerts,
  }
}
