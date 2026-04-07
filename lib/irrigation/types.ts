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

export type IrrigationType = "drip" | "micro-sprinkler" | "overhead" | "travelling-gun" | "none"

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
  irrigation_system_specs: string | null
  water_cost_per_m3: number
  block_area_ha: number
  notes: string | null
}

// ---------------------------------------------------------------------------
// Hardware-specific specs stored as JSON in irrigation_system_specs
// ---------------------------------------------------------------------------

export interface DripSpecs {
  emitter_flow_rate_lph: number
  emitter_spacing_cm: number
  drip_lines_per_row: number
  row_length_m: number
  num_rows: number
  row_spacing_m: number
}

export interface MicroSprinklerSpecs {
  sprinkler_flow_rate_lph: number
  trees_per_sprinkler: number
  wetted_diameter_m: number
  tree_spacing_m: number
  row_spacing_m: number
  num_trees: number
}

export interface OverheadSpecs {
  sprinkler_model: string
  flow_rate_per_head_lpm: number
  head_spacing_m: number
  lateral_spacing_m: number
  operating_pressure_kpa: number
  frost_protection: boolean
}

export interface TravellingGunSpecs {
  flow_rate_lpm: number
  lane_spacing_m: number
  travel_speed_m_per_hr: number
  wetted_width_m: number
}

export type IrrigationSystemSpecs =
  | DripSpecs
  | MicroSprinklerSpecs
  | OverheadSpecs
  | TravellingGunSpecs

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
