"use client"

import type { SprayLogRow, SprayProductRow } from "@/lib/db"
import { AlertTriangle } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RotationWarning {
  product1: string
  product2: string
  date1: string
  date2: string
  fracGroup: string
  target: string
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

function findProductMatch(
  productName: string,
  products: SprayProductRow[],
): SprayProductRow | undefined {
  const lower = productName.toLowerCase()
  return products.find(
    (p) =>
      p.product_name.toLowerCase() === lower ||
      lower.includes(p.product_name.toLowerCase()) ||
      p.product_name.toLowerCase().includes(lower),
  )
}

function analyzeRotation(
  entries: SprayLogRow[],
  products: SprayProductRow[],
): RotationWarning[] {
  const warnings: RotationWarning[] = []

  // Sort by date ascending
  const sorted = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date),
  )

  // Group consecutive sprays by target
  const byTarget = new Map<string, Array<{ entry: SprayLogRow; product: SprayProductRow | undefined }>>()
  for (const entry of sorted) {
    const match = findProductMatch(entry.product, products)
    const existing = byTarget.get(entry.target) ?? []
    existing.push({ entry, product: match })
    byTarget.set(entry.target, existing)
  }

  // For each target, check consecutive applications for same FRAC/IRAC group
  for (const [target, sprays] of byTarget) {
    for (let i = 1; i < sprays.length; i++) {
      const prev = sprays[i - 1]
      const curr = sprays[i]

      if (!prev.product || !curr.product) continue
      if (!prev.product.frac_irac_group || !curr.product.frac_irac_group) continue

      // Skip biological, oil, barrier, and copper (M1/M2/M3/M4) — these are low resistance risk
      const skipGroups = new Set(["biological", "oil", "barrier", "M1", "M2", "M3", "M4"])
      if (skipGroups.has(prev.product.frac_irac_group)) continue
      if (skipGroups.has(curr.product.frac_irac_group)) continue

      // Check if the FRAC/IRAC groups overlap
      const prevGroups = prev.product.frac_irac_group.split("+").map((g) => g.trim())
      const currGroups = curr.product.frac_irac_group.split("+").map((g) => g.trim())
      const overlap = prevGroups.filter((g) => currGroups.includes(g))

      if (overlap.length > 0) {
        warnings.push({
          product1: prev.entry.product,
          product2: curr.entry.product,
          date1: prev.entry.date,
          date2: curr.entry.date,
          fracGroup: overlap.join("+"),
          target,
        })
      }
    }
  }

  return warnings
}

// ---------------------------------------------------------------------------
// Target labels
// ---------------------------------------------------------------------------

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
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResistanceRotationWarnings({
  entries,
  products,
}: {
  entries: SprayLogRow[]
  products: SprayProductRow[]
}) {
  const warnings = analyzeRotation(entries, products)

  if (warnings.length === 0) return null

  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30 p-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">
          Resistance Group Rotation Warnings
        </h3>
      </div>
      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
        Consecutive applications of the same FRAC/IRAC resistance group to the same
        target increases resistance development risk. Rotate to a different mode of action.
      </p>
      <div className="space-y-2">
        {warnings.map((w, i) => (
          <div
            key={i}
            className="rounded-lg bg-yellow-100 dark:bg-yellow-950/50 p-3 text-sm"
          >
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              Group {w.fracGroup} used back-to-back for{" "}
              {TARGET_LABELS[w.target] ?? w.target}
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 mt-0.5">
              {w.product1} ({w.date1}) → {w.product2} ({w.date2})
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
