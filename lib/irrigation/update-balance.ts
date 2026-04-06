// ---------------------------------------------------------------------------
// Daily water balance updater
//
// Call this after weather data refreshes to update the water_balance table
// with today's calculated ET, rainfall, and soil water status.
// ---------------------------------------------------------------------------

import {
  getOrchard,
  getIrrigationConfig,
  getWaterBalance,
  upsertWaterBalance,
  getDailyWeather,
  getIrrigationLog,
} from "@/lib/db"
import { calcET0Hargreaves, getDayOfYear } from "./et"
import { calcEffectiveRainfall, getMoistureStatus } from "./water-balance"
import { CROP_COEFFICIENTS } from "./soil-defaults"

/**
 * Update the water balance for a given date (defaults to today).
 * Reads weather data, calculates ET, and updates soil moisture.
 */
export function updateDailyWaterBalance(
  orchardId: number = 1,
  dateStr?: string,
): void {
  const orchard = getOrchard(orchardId)
  if (!orchard) return

  const config = getIrrigationConfig(orchardId)
  if (!config || !config.enabled) return

  const today = dateStr ?? new Date().toISOString().slice(0, 10)

  // Get today's weather
  const daily = getDailyWeather("default", today, today)
  if (daily.length === 0) return

  const dayData = daily[0]
  const maxTemp = dayData.max_temp ?? 15
  const minTemp = dayData.min_temp ?? 5
  const rainfall = dayData.total_precip ?? 0

  // Calculate ET
  const doy = getDayOfYear(today)
  const et0 = calcET0Hargreaves(maxTemp, minTemp, orchard.latitude, doy)
  const kc = CROP_COEFFICIENTS[orchard.bloom_stage] ?? 0.65
  const etCrop = et0 * kc

  // Get yesterday's soil water
  const yesterday = new Date(today + "T12:00:00")
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const prevRows = getWaterBalance(orchardId, yesterdayStr, yesterdayStr)
  const prevSoilWater =
    prevRows.length > 0 ? prevRows[0].soil_water_mm : config.available_water_mm

  // Get any irrigation applied today
  const todayIrrigation = getIrrigationLog(orchardId, today, today)
  const irrigMm = todayIrrigation.reduce((sum, r) => sum + r.amount_mm, 0)

  // Calculate effective rainfall
  const effectiveRain = calcEffectiveRainfall(rainfall)

  // Water balance
  let soilWater = prevSoilWater + effectiveRain + irrigMm - etCrop
  let deepDrainage = 0

  if (soilWater > config.available_water_mm) {
    deepDrainage = soilWater - config.available_water_mm
    soilWater = config.available_water_mm
  }
  if (soilWater < 0) soilWater = 0

  const depletionMm = config.available_water_mm - soilWater
  const depletionPct = (depletionMm / config.available_water_mm) * 100
  const availablePct = 100 - depletionPct
  const status = getMoistureStatus(availablePct)

  upsertWaterBalance({
    orchard_id: orchardId,
    date: today,
    rainfall_mm: Math.round(rainfall * 10) / 10,
    effective_rainfall_mm: Math.round(effectiveRain * 10) / 10,
    irrigation_mm: Math.round(irrigMm * 10) / 10,
    et_reference_mm: Math.round(et0 * 10) / 10,
    crop_coefficient: kc,
    et_crop_mm: Math.round(etCrop * 10) / 10,
    soil_water_mm: Math.round(soilWater * 10) / 10,
    depletion_mm: Math.round(depletionMm * 10) / 10,
    depletion_pct: Math.round(depletionPct * 10) / 10,
    deep_drainage_mm: Math.round(deepDrainage * 10) / 10,
    status,
  })
}
