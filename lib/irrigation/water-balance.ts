// ---------------------------------------------------------------------------
// Water Balance Engine
//
// Maintains a daily soil water balance that tracks rainfall, irrigation,
// evapotranspiration, and deep drainage to determine soil moisture status
// and generate irrigation recommendations.
// ---------------------------------------------------------------------------

import type {
  MoistureStatus,
  IrrigationConfig,
  IrrigationForecastDay,
  IrrigationRecommendation,
  IrrigationDashboardData,
  WaterBalanceRow,
} from "./types"
import { SYSTEM_EFFICIENCY, CROP_COEFFICIENTS } from "./soil-defaults"
import { calcET0Hargreaves, getDayOfYear } from "./et"

// ---------------------------------------------------------------------------
// Effective rainfall calculation
// ---------------------------------------------------------------------------

/**
 * Calculate effective rainfall — how much actually enters the root zone.
 * Small events are mostly intercepted by canopy; large events cause runoff.
 */
export function calcEffectiveRainfall(actualMm: number): number {
  if (actualMm <= 0) return 0
  if (actualMm < 5) return actualMm * 0.25
  if (actualMm <= 25) return actualMm * 0.75
  if (actualMm <= 75) return actualMm * 0.90
  return Math.min(actualMm * 0.90, 75)
}

// ---------------------------------------------------------------------------
// Moisture status classification
// ---------------------------------------------------------------------------

/**
 * Determine moisture status from percentage of available water remaining.
 */
export function getMoistureStatus(availablePct: number): MoistureStatus {
  if (availablePct > 100) return "saturated"
  if (availablePct >= 60) return "optimal"
  if (availablePct >= 50) return "watch"
  if (availablePct >= 30) return "irrigate"
  return "stress"
}

// ---------------------------------------------------------------------------
// Irrigation recommendation
// ---------------------------------------------------------------------------

export function calcIrrigationRecommendation(
  config: IrrigationConfig,
  currentDepletionMm: number,
  currentAvailablePct: number,
  forecastRainMm: number,
): IrrigationRecommendation {
  const triggerPct = config.management_allowable_depletion * 100
  const needed = currentAvailablePct <= triggerPct

  if (!needed || config.irrigation_type === "none") {
    return {
      needed: false,
      amountMm: 0,
      grossAmountMm: 0,
      runTimeHours: 0,
      volumeM3PerHa: 0,
      costPerHa: 0,
      daysUntilTrigger: -1,
      message: config.irrigation_type === "none"
        ? "No irrigation system configured."
        : `Soil moisture at ${Math.round(currentAvailablePct)}% — no irrigation needed.`,
    }
  }

  const efficiency = SYSTEM_EFFICIENCY[config.irrigation_type]
  const netNeeded = Math.max(currentDepletionMm - calcEffectiveRainfall(forecastRainMm), 0)
  const grossNeeded = netNeeded / efficiency
  const runTime =
    config.irrigation_rate_mm_per_hour > 0
      ? grossNeeded / config.irrigation_rate_mm_per_hour
      : 0
  const volumeM3 = grossNeeded * 10 // 1mm over 1ha = 10 m³
  const cost = volumeM3 * config.water_cost_per_m3

  return {
    needed: true,
    amountMm: Math.round(netNeeded * 10) / 10,
    grossAmountMm: Math.round(grossNeeded * 10) / 10,
    runTimeHours: Math.round(runTime * 10) / 10,
    volumeM3PerHa: Math.round(volumeM3),
    costPerHa: Math.round(cost * 100) / 100,
    daysUntilTrigger: 0,
    message: `Soil moisture at ${Math.round(currentAvailablePct)}%. Apply ${Math.round(grossNeeded)}mm to refill.`,
  }
}

// ---------------------------------------------------------------------------
// 7-day forecast projection
// ---------------------------------------------------------------------------

export function projectWaterBalance(
  config: IrrigationConfig,
  currentSoilWaterMm: number,
  forecastDays: Array<{
    date: string
    maxTemp: number
    minTemp: number
    precipMm: number
  }>,
  latitude: number,
  bloomStage: string,
): IrrigationForecastDay[] {
  const kc = CROP_COEFFICIENTS[bloomStage] ?? 0.65
  let soilWater = currentSoilWaterMm
  const results: IrrigationForecastDay[] = []

  for (const day of forecastDays) {
    const doy = getDayOfYear(day.date)
    const et0 = calcET0Hargreaves(day.maxTemp, day.minTemp, latitude, doy)
    const etCrop = et0 * kc
    const effectiveRain = calcEffectiveRainfall(day.precipMm)

    // Apply balance
    soilWater = soilWater + effectiveRain - etCrop

    // Cap at field capacity (deep drainage)
    if (soilWater > config.available_water_mm) {
      soilWater = config.available_water_mm
    }

    // Floor at 0
    if (soilWater < 0) soilWater = 0

    const depletionPct = Math.round(
      ((config.available_water_mm - soilWater) / config.available_water_mm) * 100,
    )
    const availablePct = 100 - depletionPct

    const dayName = new Date(day.date + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "short",
    })

    results.push({
      date: day.date,
      dayName,
      rainMm: Math.round(day.precipMm * 10) / 10,
      effectiveRainMm: Math.round(effectiveRain * 10) / 10,
      etMm: Math.round(etCrop * 10) / 10,
      irrigationMm: 0,
      soilWaterMm: Math.round(soilWater * 10) / 10,
      depletionPct,
      status: getMoistureStatus(availablePct),
    })
  }

  return results
}

// ---------------------------------------------------------------------------
// Build dashboard data from database records + forecast
// ---------------------------------------------------------------------------

export function buildDashboardData(
  config: IrrigationConfig | null,
  balanceRows: WaterBalanceRow[],
  forecastDays: Array<{
    date: string
    maxTemp: number
    minTemp: number
    precipMm: number
  }>,
  latitude: number,
  bloomStage: string,
  rain24hMm: number,
): IrrigationDashboardData {
  if (!config || !config.enabled) {
    return {
      enabled: false,
      status: "optimal",
      availablePct: 100,
      soilWaterMm: 0,
      availableWaterMm: 0,
      todayEtMm: 0,
      rain24hMm: 0,
      daysToIrrigation: -1,
      seasonRainMm: 0,
      seasonIrrigationMm: 0,
      seasonEtMm: 0,
      recommendation: null,
      forecast: [],
    }
  }

  // Get latest balance or default to field capacity
  const latest = balanceRows.length > 0
    ? balanceRows[balanceRows.length - 1]
    : null

  const soilWaterMm = latest?.soil_water_mm ?? config.available_water_mm
  const depletionMm = config.available_water_mm - soilWaterMm
  const availablePct = Math.round((soilWaterMm / config.available_water_mm) * 100)
  const status = getMoistureStatus(availablePct)

  // Today's ET
  const today = new Date()
  const doy = getDayOfYear(today.toISOString().slice(0, 10))
  const kc = CROP_COEFFICIENTS[bloomStage] ?? 0.65
  const todayMaxTemp = forecastDays[0]?.maxTemp ?? 15
  const todayMinTemp = forecastDays[0]?.minTemp ?? 5
  const todayEtMm = Math.round(
    calcET0Hargreaves(todayMaxTemp, todayMinTemp, latitude, doy) * kc * 10,
  ) / 10

  // Season totals
  const seasonRainMm = Math.round(
    balanceRows.reduce((sum, r) => sum + r.rainfall_mm, 0) * 10,
  ) / 10
  const seasonIrrigationMm = Math.round(
    balanceRows.reduce((sum, r) => sum + r.irrigation_mm, 0) * 10,
  ) / 10
  const seasonEtMm = Math.round(
    balanceRows.reduce((sum, r) => sum + r.et_crop_mm, 0) * 10,
  ) / 10

  // Forecast projection
  const forecast = projectWaterBalance(
    config,
    soilWaterMm,
    forecastDays,
    latitude,
    bloomStage,
  )

  // Days until trigger
  const triggerPct = (1 - config.management_allowable_depletion) * 100
  let daysToIrrigation = -1
  for (let i = 0; i < forecast.length; i++) {
    const dayAvailable = 100 - forecast[i].depletionPct
    if (dayAvailable <= triggerPct) {
      daysToIrrigation = i
      break
    }
  }

  // Forecast rain in next 48h for recommendation
  const rain48h = forecast.slice(0, 2).reduce((s, d) => s + d.rainMm, 0)

  const recommendation = calcIrrigationRecommendation(
    config,
    depletionMm,
    availablePct,
    rain48h,
  )
  if (!recommendation.needed && daysToIrrigation >= 0) {
    recommendation.daysUntilTrigger = daysToIrrigation
    recommendation.message = `Soil moisture declining. Irrigation needed in ~${daysToIrrigation} day${daysToIrrigation !== 1 ? "s" : ""}.`
  }

  return {
    enabled: true,
    status,
    availablePct,
    soilWaterMm: Math.round(soilWaterMm * 10) / 10,
    availableWaterMm: config.available_water_mm,
    todayEtMm,
    rain24hMm: Math.round(rain24hMm * 10) / 10,
    daysToIrrigation,
    seasonRainMm,
    seasonIrrigationMm,
    seasonEtMm,
    recommendation,
    forecast,
  }
}
