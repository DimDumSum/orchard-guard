"use client"

import { useState } from "react"
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

function PhiHarvestWarning({ entries }: { entries: SprayLogRow[] }) {
  const harvestDate = getHarvestDate()
  const now = new Date()
  if (now >= harvestDate) return null

  const violations = entries.filter((e) => {
    if (e.phi_days == null) return false
    const spray = new Date(e.date + "T00:00:00")
    const safeDate = new Date(spray)
    safeDate.setDate(safeDate.getDate() + e.phi_days)
    return safeDate > harvestDate
  })

  if (violations.length === 0) return null

  const harvestStr = harvestDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30 mb-4">
      <p className="font-semibold text-red-800 dark:text-red-200 text-sm">
        PHI Harvest Conflict
      </p>
      <p className="mt-1 text-sm text-red-700 dark:text-red-300">
        {violations.length} spray{violations.length > 1 ? "s" : ""} will not
        clear PHI before the estimated harvest date ({harvestStr}):{" "}
        {violations.map((v) => `${v.product} (${v.date})`).join(", ")}.
      </p>
    </div>
  )
}

export function SprayTable({ entries }: { entries: SprayLogRow[] }) {
  const [blockFilter, setBlockFilter] = useState<string>("")

  // Get unique block names from entries
  const blockNames = Array.from(
    new Set(entries.map((e) => e.block_name).filter((b): b is string => b != null)),
  ).sort()

  const filteredEntries = blockFilter
    ? entries.filter((e) => e.block_name === blockFilter)
    : entries

  return (
    <div className="rounded-xl border border-border bg-card card-shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-card-title">Spray History</h2>
        {blockNames.length > 0 && (
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="text-sm rounded-md border border-border bg-background px-3 py-1.5 text-foreground"
          >
            <option value="">All blocks</option>
            {blockNames.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}
      </div>
      <PhiHarvestWarning entries={filteredEntries} />
      <div className="overflow-x-auto -mx-6 px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Target</TableHead>
              {blockNames.length > 0 && <TableHead>Block</TableHead>}
              <TableHead>PHI Countdown</TableHead>
              <TableHead>REI Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => {
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
                  {blockNames.length > 0 && (
                    <TableCell className="text-sm">
                      {entry.block_name ?? <span className="text-muted-foreground">All</span>}
                    </TableCell>
                  )}
                  <TableCell>
                    {phi ? (
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-data ${statusBadgeClasses(phi.color)}`}
                        >
                          {phi.label}
                        </span>
                        {entry.phi_days != null && phi.color !== "green" && (
                          <span className="text-[10px] text-muted-foreground font-data">
                            Safe: {new Date(
                              new Date(entry.date + "T00:00:00").getTime() + entry.phi_days * 86400000,
                            ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
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
