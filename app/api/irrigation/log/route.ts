import { NextRequest, NextResponse } from "next/server"
import {
  getOrchard,
  getIrrigationConfig,
  getIrrigationLog,
  insertIrrigationLog,
} from "@/lib/db"
import { SYSTEM_EFFICIENCY } from "@/lib/irrigation/soil-defaults"
import type { IrrigationType } from "@/lib/irrigation/types"

export async function GET() {
  const orchard = getOrchard()
  if (!orchard) {
    return NextResponse.json({ error: "No orchard configured" }, { status: 404 })
  }

  const log = getIrrigationLog(orchard.id)
  return NextResponse.json({ log })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const orchard = getOrchard()
    if (!orchard) {
      return NextResponse.json({ error: "No orchard configured" }, { status: 404 })
    }

    const config = getIrrigationConfig(orchard.id)
    const {
      date,
      duration_hours,
      amount_mm,
      notes,
    } = body

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 })
    }

    // Auto-calculate amount from duration if not provided
    const rate = config?.irrigation_rate_mm_per_hour ?? 4
    const calculatedAmount = amount_mm ?? (duration_hours ? duration_hours * rate : 0)
    const calculatedDuration = duration_hours ?? (amount_mm ? amount_mm / rate : 0)

    // Auto-calculate volume and cost
    const volumeM3 = calculatedAmount * 10 * (config?.block_area_ha ?? 1)
    const cost = volumeM3 * (config?.water_cost_per_m3 ?? 0.06)

    const id = insertIrrigationLog({
      orchard_id: orchard.id,
      date,
      start_time: body.start_time ?? null,
      end_time: body.end_time ?? null,
      duration_hours: Math.round(calculatedDuration * 10) / 10,
      amount_mm: Math.round(calculatedAmount * 10) / 10,
      source: config?.irrigation_type ?? "drip",
      water_volume_m3: Math.round(volumeM3 * 10) / 10,
      cost: Math.round(cost * 100) / 100,
      notes: notes ?? null,
    })

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error("[irrigation/log] POST Error:", err)
    return NextResponse.json(
      { error: "Failed to log irrigation event" },
      { status: 500 },
    )
  }
}
