// ---------------------------------------------------------------------------
// Irrigation Management — TypeScript Interfaces
// ---------------------------------------------------------------------------

export type SoilType =
  | "sand"
  | "loamy-sand"
  | "sandy-loam"
  | "loam"
  | "clay-loam"
  | "clay"

export type IrrigationType = "drip" | "micro-sprinkler" | "overhead" | "none"

export type MoistureStatus =
  | "saturated"
  | "optimal"
  | "watch"
  | "irrigate"
  | "stress"

export interface SoilProperties {
  fieldCapacityMmPerM: number
  wiltingPointMmPerM: number
  availableWaterMmPerM: number
}

export interface IrrigationConfig {
  id: number
  orchard_id: number
  enabled: number
  soil_type: SoilType
  root_depth_cm: number
  field_capacity_mm: number
  wilting_point_mm: number
  available_water_mm: number
  management_allowable_depletion: number
  irrigation_type: IrrigationType
  irrigation_rate_mm_per_hour: number
  water_cost_per_m3: number
  block_area_ha: number
  notes: string | null
}

export interface WaterBalanceRow {
  id: number
  orchard_id: number
  date: string
  rainfall_mm: number
  effective_rainfall_mm: number
  irrigation_mm: number
  et_reference_mm: number
  crop_coefficient: number
  et_crop_mm: number
  soil_water_mm: number
  depletion_mm: number
  depletion_pct: number
  deep_drainage_mm: number
  status: MoistureStatus
  created_at: string
}

export interface IrrigationLogEntry {
  id: number
  orchard_id: number
  date: string
  start_time: string | null
  end_time: string | null
  duration_hours: number
  amount_mm: number
  source: string
  water_volume_m3: number
  cost: number
  notes: string | null
  created_at: string
}

export interface IrrigationForecastDay {
  date: string
  dayName: string
  rainMm: number
  effectiveRainMm: number
  etMm: number
  irrigationMm: number
  soilWaterMm: number
  depletionPct: number
  status: MoistureStatus
}

export interface IrrigationRecommendation {
  needed: boolean
  amountMm: number
  grossAmountMm: number
  runTimeHours: number
  volumeM3PerHa: number
  costPerHa: number
  daysUntilTrigger: number
  message: string
}

export interface IrrigationDashboardData {
  enabled: boolean
  status: MoistureStatus
  availablePct: number
  soilWaterMm: number
  availableWaterMm: number
  todayEtMm: number
  rain24hMm: number
  daysToIrrigation: number
  seasonRainMm: number
  seasonIrrigationMm: number
  seasonEtMm: number
  recommendation: IrrigationRecommendation | null
  forecast: IrrigationForecastDay[]
}
