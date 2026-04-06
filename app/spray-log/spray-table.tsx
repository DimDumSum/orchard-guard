"use client"

import type { SprayLogRow } from "@/lib/db"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Assumed harvest date for PHI countdown (October 15 of the current year). */
function getHarvestDate(): Date {
  return new Date(new Date().getFullYear(), 9, 15) // month is 0-indexed
}

/** Human-readable target names. */
const TARGET_LABELS: Record<string, string> = {
  fire_blight: "Fire Blight",
  apple_scab: "Apple Scab",
  codling_moth: "Codling Moth",
  powdery_mildew: "Powdery Mildew",
  cedar_rust: "Cedar Apple Rust",
  sooty_blotch: "Sooty Blotch / Flyspeck",
  black_rot: "Black Rot",
  plum_curculio: "Plum Curculio",
  apple_maggot: "Apple Maggot",
  oriental_fruit_moth: "Oriental Fruit Moth",
  leafroller: "Leafroller",
  european_red_mite: "European Red Mite",
  general_fungicide: "General Fungicide",
  general_insecticide: "General Insecticide",
  other: "Other",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface PhiStatus {
  label: string
  color: "green" | "yellow" | "red"
}

function computePhiStatus(
  sprayDate: string,
  phiDays: number | null,
): PhiStatus | null {
  if (phiDays == null) return null

  const spray = new Date(sprayDate + "T00:00:00")
  const now = new Date()
  const harvestDate = getHarvestDate()

  // Days since spray
  const daysSinceSpray = Math.floor(
    (now.getTime() - spray.getTime()) / (1000 * 60 * 60 * 24),
  )
  const daysRemaining = phiDays - daysSinceSpray

  // The earliest safe harvest date
  const safeDate = new Date(spray)
  safeDate.setDate(safeDate.getDate() + phiDays)

  if (daysRemaining <= 0 || safeDate <= now) {
    return { label: "Cleared", color: "green" }
  }

  // Check if safe date is before harvest
  if (safeDate <= harvestDate) {
    if (daysRemaining <= 7) {
      return { label: `${daysRemaining}d remaining`, color: "yellow" }
    }
    return { label: `${daysRemaining}d remaining`, color: "red" }
  }

  // Safe date is after harvest — problem
  return { label: `${daysRemaining}d (past harvest)`, color: "red" }
}

interface ReiStatus {
  label: string
  color: "green" | "yellow" | "red"
}

function computeReiStatus(
  sprayDate: string,
  reiHours: number | null,
): ReiStatus | null {
  if (reiHours == null) return null

  const spray = new Date(sprayDate + "T00:00:00")
  const now = new Date()

  const hoursSinceSpray =
    (now.getTime() - spray.getTime()) / (1000 * 60 * 60)
  const hoursRemaining = Math.ceil(reiHours - hoursSinceSpray)

  if (hoursRemaining <= 0) {
    return { label: "Expired", color: "green" }
  }

  if (hoursRemaining <= 4) {
    return { label: `${hoursRemaining}h remaining`, color: "yellow" }
  }

  return { label: `${hoursRemaining}h remaining`, color: "red" }
}

function statusBadgeClasses(color: "green" | "yellow" | "red"): string {
  switch (color) {
    case "green":
      return "bg-risk-low/10 text-risk-low"
    case "yellow":
      return "bg-risk-caution/10 text-risk-caution"
    case "red":
      return "bg-risk-high/10 text-risk-high"
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SprayTable({ entries }: { entries: SprayLogRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card card-shadow p-6">
      <h2 className="text-card-title mb-4">Spray History</h2>
      <div className="overflow-x-auto -mx-6 px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>PHI Countdown</TableHead>
              <TableHead>REI Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const phi = computePhiStatus(entry.date, entry.phi_days)
              const rei = computeReiStatus(entry.date, entry.rei_hours)

              return (
                <TableRow key={entry.id}>
                  <TableCell className="font-data font-medium">
                    {entry.date}
                  </TableCell>
                  <TableCell>{entry.product}</TableCell>
                  <TableCell className="font-data">
                    {entry.rate ?? "-"}
                  </TableCell>
                  <TableCell>
                    {TARGET_LABELS[entry.target] ?? entry.target}
                  </TableCell>
                  <TableCell>
                    {phi ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-data ${statusBadgeClasses(phi.color)}`}
                      >
                        {phi.label}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {rei ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-data ${statusBadgeClasses(rei.color)}`}
                      >
                        {rei.label}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {entry.notes ?? "-"}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
