// ---------------------------------------------------------------------------
// Soil property defaults and irrigation system efficiency constants
// ---------------------------------------------------------------------------

import type { SoilType, SoilProperties, IrrigationType } from "./types"

/**
 * Soil water-holding properties by texture class (mm per metre of depth).
 * Source: FAO Irrigation & Drainage Paper 56, Table 19.
 */
export const SOIL_DEFAULTS: Record<SoilType, SoilProperties> = {
  sand: { fieldCapacityMmPerM: 120, wiltingPointMmPerM: 40, availableWaterMmPerM: 80 },
  "loamy-sand": { fieldCapacityMmPerM: 160, wiltingPointMmPerM: 60, availableWaterMmPerM: 100 },
  "sandy-loam": { fieldCapacityMmPerM: 230, wiltingPointMmPerM: 90, availableWaterMmPerM: 140 },
  loam: { fieldCapacityMmPerM: 310, wiltingPointMmPerM: 120, availableWaterMmPerM: 190 },
  "clay-loam": { fieldCapacityMmPerM: 360, wiltingPointMmPerM: 170, availableWaterMmPerM: 190 },
  clay: { fieldCapacityMmPerM: 400, wiltingPointMmPerM: 210, availableWaterMmPerM: 190 },
}

/**
 * Application efficiency by irrigation system type.
 * Accounts for evaporation, wind drift, runoff, and non-uniformity.
 */
export const SYSTEM_EFFICIENCY: Record<IrrigationType, number> = {
  drip: 0.90,
  "micro-sprinkler": 0.80,
  overhead: 0.70,
  "travelling-gun": 0.65,
  none: 1.0,
}

/**
 * Crop coefficient (Kc) for apple trees by growth stage.
 * Source: FAO-56 adapted for apple orchards.
 */
export const CROP_COEFFICIENTS: Record<string, number> = {
  dormant: 0.30,
  "silver-tip": 0.35,
  "green-tip": 0.35,
  "tight-cluster": 0.50,
  pink: 0.50,
  bloom: 0.65,
  "petal-fall": 0.85,
  "fruit-set": 1.05,
}

/**
 * Calculate soil water parameters for a given soil type and root depth.
 */
export function calcSoilWaterParams(soilType: SoilType, rootDepthCm: number) {
  const props = SOIL_DEFAULTS[soilType]
  const depthM = rootDepthCm / 100

  const fieldCapacityMm = Math.round(props.fieldCapacityMmPerM * depthM * 10) / 10
  const wiltingPointMm = Math.round(props.wiltingPointMmPerM * depthM * 10) / 10
  const availableWaterMm = Math.round(props.availableWaterMmPerM * depthM * 10) / 10

  return { fieldCapacityMm, wiltingPointMm, availableWaterMm }
}

/**
 * Soil type display labels.
 */
export const SOIL_TYPE_LABELS: Record<SoilType, string> = {
  sand: "Sand",
  "loamy-sand": "Loamy Sand",
  "sandy-loam": "Sandy Loam",
  loam: "Loam",
  "clay-loam": "Clay Loam",
  clay: "Clay",
}

/**
 * Irrigation type display labels.
 */
export const IRRIGATION_TYPE_LABELS: Record<IrrigationType, string> = {
  drip: "Drip",
  "micro-sprinkler": "Micro-sprinkler",
  overhead: "Overhead Sprinkler",
  "travelling-gun": "Travelling Gun",
  none: "None (rain-fed)",
}
