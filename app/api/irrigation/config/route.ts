import { NextRequest, NextResponse } from "next/server"
import {
  getIrrigationConfig,
  upsertIrrigationConfig,
  getOrchard,
} from "@/lib/db"
import { calcSoilWaterParams } from "@/lib/irrigation/soil-defaults"
import type { SoilType, IrrigationType } from "@/lib/irrigation/types"

const VALID_SOIL_TYPES: SoilType[] = [
  "sand", "loamy-sand", "sandy-loam", "loam", "clay-loam", "clay",
]
const VALID_IRRIGATION_TYPES: IrrigationType[] = [
  "drip", "micro-sprinkler", "overhead", "none",
]

export async function GET() {
  const orchard = getOrchard()
  if (!orchard) {
    return NextResponse.json({ error: "No orchard configured" }, { status: 404 })
  }

  const config = getIrrigationConfig(orchard.id)
  return NextResponse.json({ config })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const orchard = getOrchard()
  if (!orchard) {
    return NextResponse.json({ error: "No orchard configured" }, { status: 404 })
  }

  const {
    enabled,
    soil_type,
    root_depth_cm,
    management_allowable_depletion,
    irrigation_type,
    irrigation_rate_mm_per_hour,
    water_cost_per_m3,
    block_area_ha,
    notes,
  } = body

  // Validate
  if (soil_type && !VALID_SOIL_TYPES.includes(soil_type)) {
    return NextResponse.json({ error: "Invalid soil_type" }, { status: 400 })
  }
  if (irrigation_type && !VALID_IRRIGATION_TYPES.includes(irrigation_type)) {
    return NextResponse.json({ error: "Invalid irrigation_type" }, { status: 400 })
  }

  // Calculate soil water params from soil type + root depth
  const soilType = (soil_type ?? "loam") as SoilType
  const rootDepth = root_depth_cm ?? 60
  const { fieldCapacityMm, wiltingPointMm, availableWaterMm } =
    calcSoilWaterParams(soilType, rootDepth)

  upsertIrrigationConfig({
    orchard_id: orchard.id,
    enabled: enabled ? 1 : 0,
    soil_type: soilType,
    root_depth_cm: rootDepth,
    field_capacity_mm: fieldCapacityMm,
    wilting_point_mm: wiltingPointMm,
    available_water_mm: availableWaterMm,
    management_allowable_depletion: management_allowable_depletion ?? 0.5,
    irrigation_type: (irrigation_type ?? "none") as IrrigationType,
    irrigation_rate_mm_per_hour: irrigation_rate_mm_per_hour ?? 4,
    water_cost_per_m3: water_cost_per_m3 ?? 0.06,
    block_area_ha: block_area_ha ?? 1.0,
    notes: notes ?? null,
  })

  const config = getIrrigationConfig(orchard.id)
  return NextResponse.json({ success: true, config })
}
