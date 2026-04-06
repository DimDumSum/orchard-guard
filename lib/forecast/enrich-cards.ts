// ---------------------------------------------------------------------------
// Enrich Risk Cards — adds forecast-driven context to existing risk cards
//
// For elevated risk cards: adds "what's coming next" forecast note
// For low risk cards: adds "when it could change" watch note
// ---------------------------------------------------------------------------

import type { ModelCardData } from "@/lib/seasonal-filter"
import type { ForecastDaySummary } from "./types"
import type { WeatherDailyRow } from "@/lib/db"

const HIGH_RISK = new Set(["high", "extreme", "critical", "severe"])
const MODERATE_RISK = new Set(["moderate", "caution"])

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export function enrichCardsWithForecast(
  cards: ModelCardData[],
  forecastDays: ForecastDaySummary[],
  dailyForecast: WeatherDailyRow[],
  bloomStage: string,
): ModelCardData[] {
  // Find notable forecast days
  const rainDays = dailyForecast.filter((d) => (d.total_precip ?? 0) > 0.5)
  const warmDays = dailyForecast.filter((d) => (d.max_temp ?? 0) > 15)
  const coldDays = dailyForecast.filter((d) => (d.min_temp ?? 0) < 0)
  const nextRain = rainDays[0]
  const nextWarm = warmDays[0]
  const nextCold = coldDays[0]

  return cards.map((card) => {
    const level = card.riskLevel.toLowerCase()
    const isHigh = HIGH_RISK.has(level)
    const isMod = MODERATE_RISK.has(level)
    const isLow = !isHigh && !isMod

    let forecastNote: string | undefined
    let watchNote: string | undefined

    // --- Forecast notes for elevated cards ---
    if (isHigh || isMod) {
      switch (card.key) {
        case "appleScab":
          if (nextRain) {
            forecastNote = `Rain (${(nextRain.total_precip ?? 0).toFixed(0)}mm) forecast ${formatDay(nextRain.date)}. Apply protectant before rain to prevent next infection.`
          }
          break
        case "fireBlight":
          if (nextWarm && nextRain) {
            forecastNote = `Warm temps continuing. Rain expected ${formatDay(nextRain.date)} — have streptomycin ready.`
          } else if (nextWarm) {
            forecastNote = "Warm temps building bacterial populations. Watch for any rain or heavy dew."
          }
          break
        case "frostRisk":
          if (nextCold) {
            forecastNote = `Cold nights continue through ${formatDay(nextCold.date)} (low ${(nextCold.min_temp ?? 0).toFixed(0)}°C). Monitor overnight temps.`
          }
          break
        case "codlingMoth":
          forecastNote = "Degree days accumulating. Check traps and plan next cover spray."
          break
        case "powderyMildew":
          if (warmDays.length > 0 && rainDays.length === 0) {
            forecastNote = "Warm, dry conditions continuing — favorable for mildew. Apply sulfur or systemic fungicide."
          }
          break
        default:
          // Generic for other elevated models
          if (nextRain && (card.category === "disease")) {
            forecastNote = `Rain forecast ${formatDay(nextRain.date)} — could increase disease pressure.`
          }
      }
    }

    // --- Watch notes for low-risk cards ---
    if (isLow) {
      switch (card.key) {
        case "appleScab":
          if (nextRain) {
            watchNote = `Next risk event: rain (${(nextRain.total_precip ?? 0).toFixed(0)}mm) forecast ${formatDay(nextRain.date)}. Watch if temps are above 6°C.`
          } else {
            watchNote = "No rain in the 7-day forecast. Scab risk stays low while dry."
          }
          break
        case "fireBlight":
          if (bloomStage === "bloom" || bloomStage === "petal-fall") {
            watchNote = nextWarm
              ? `Warming trend from ${formatDay(nextWarm.date)}. Monitor degree hour accumulation.`
              : "Cool temps keeping bacterial growth low. Risk rises above 15.5°C."
          } else {
            watchNote = "Risk is stage-dependent — increases at pink through petal fall."
          }
          break
        case "frostRisk":
          if (nextCold) {
            watchNote = `Watch ${formatDay(nextCold.date)} — forecast low ${(nextCold.min_temp ?? 0).toFixed(0)}°C.`
          } else {
            watchNote = "No frost in the 7-day forecast."
          }
          break
        case "codlingMoth":
          watchNote = "Degree days accumulating — emergence depends on biofix date and temperature."
          break
        case "powderyMildew":
          watchNote = "Risk increases with warm (10-25°C), humid, dry weather at susceptible stages."
          break
        case "plumCurculio":
          watchNote = "Active after petal fall when warm nights (>16°C) begin."
          break
        default:
          // Generic watch notes
          if (card.category === "disease") {
            watchNote = nextRain
              ? `Monitor when rain returns (${formatDay(nextRain.date)}).`
              : "Low risk while dry conditions persist."
          } else if (card.category === "pest") {
            watchNote = "Scout regularly. Risk increases with warming temperatures."
          }
      }
    }

    return { ...card, forecastNote, watchNote }
  })
}
