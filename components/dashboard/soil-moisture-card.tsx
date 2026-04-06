"use client"

import { Droplets } from "lucide-react"
import type { MoistureStatus } from "@/lib/irrigation/types"

interface SoilMoistureCardProps {
  enabled: boolean
  status: MoistureStatus
  availablePct: number
  todayEtMm: number
  rain24hMm: number
  daysToIrrigation: number
  seasonRainMm: number
  seasonIrrigationMm: number
  seasonEtMm: number
}

const STATUS_CONFIG: Record<
  MoistureStatus,
  { label: string; hex: string }
> = {
  saturated: { label: "SATURATED", hex: "#3B82F6" },
  optimal: { label: "OPTIMAL", hex: "#22C55E" },
  watch: { label: "WATCH", hex: "#EAB308" },
  irrigate: { label: "IRRIGATE", hex: "#EF4444" },
  stress: { label: "STRESS", hex: "#DC2626" },
}

export function SoilMoistureCard({
  enabled,
  status,
  availablePct,
  todayEtMm,
  rain24hMm,
  daysToIrrigation,
  seasonRainMm,
  seasonIrrigationMm,
  seasonEtMm,
}: SoilMoistureCardProps) {
  if (!enabled) return null

  const config = STATUS_CONFIG[status]
  const barWidth = Math.min(Math.max(availablePct, 2), 100)

  return (
    <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
      <div className="px-7 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="size-5 text-blue-400" />
          <h2 className="text-section-title text-bark-600">Soil Moisture</h2>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: config.hex + "18",
            color: config.hex,
          }}
        >
          {config.label}
        </span>
      </div>

      <div className="px-7 pb-5 space-y-4">
        {/* Progress bar */}
        <div>
          <div className="h-3 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${barWidth}%`,
                backgroundColor: config.hex,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-data text-[22px] font-light" style={{ color: config.hex }}>
              {availablePct}%
            </span>
            <span className="text-[11px] text-bark-300 self-end">available</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div>
            <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400">
              Today&apos;s ET
            </p>
            <p className="font-data text-[14px] text-bark-600">
              {todayEtMm} mm
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400">
              Rain 24h
            </p>
            <p className="font-data text-[14px] text-bark-600">
              {rain24hMm} mm
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-[1.5px] text-bark-400">
              Next irrigation
            </p>
            <p className="font-data text-[14px] text-bark-600">
              {daysToIrrigation < 0
                ? "Not needed this week"
                : daysToIrrigation === 0
                  ? "Today"
                  : `~${daysToIrrigation} day${daysToIrrigation !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Season summary */}
        <div className="border-t border-border pt-3">
          <p className="text-[11px] text-bark-300 leading-[1.6]">
            Season: {seasonRainMm}mm rain + {seasonIrrigationMm}mm irrigated
            vs {seasonEtMm}mm crop demand
          </p>
        </div>
      </div>
    </div>
  )
}
