// ---------------------------------------------------------------------------
// Variety Risk Comparison Card — Server Component
//
// Compares per-variety risk profiles for diseases/conditions that have
// variety-specific susceptibility: bitter pit, powdery mildew, and cedar rust.
// ---------------------------------------------------------------------------

import { evaluateBitterPit } from "@/lib/models/bitter-pit"
import {
  evaluatePowderyMildew,
  type VarietySusceptibility,
} from "@/lib/models/powdery-mildew"

// ---------------------------------------------------------------------------
// Variety susceptibility lookups
// ---------------------------------------------------------------------------

/** Powdery mildew variety susceptibility mapping. */
const MILDEW_SUSCEPTIBILITY: Record<string, VarietySusceptibility> = {
  // Highly susceptible
  jonathan: "highly_susceptible",
  idared: "highly_susceptible",
  cortland: "highly_susceptible",
  ginger_gold: "highly_susceptible",

  // Susceptible
  gala: "susceptible",
  "granny smith": "susceptible",
  braeburn: "susceptible",
  jonagold: "susceptible",
  mcintosh: "susceptible",
  rome: "susceptible",

  // Moderate
  honeycrisp: "moderate",
  fuji: "moderate",
  empire: "moderate",

  // Resistant
  "red delicious": "resistant",
  liberty: "resistant",
  enterprise: "resistant",
}

/**
 * Cedar apple rust susceptibility (qualitative).
 * Some varieties show markedly different susceptibility to cedar-quince
 * and cedar-apple rust. Rated 1 (low) to 4 (very high).
 */
const CEDAR_RUST_SUSCEPTIBILITY: Record<string, number> = {
  jonathan: 4,
  rome: 4,
  "granny smith": 4,
  gala: 3,
  cortland: 3,
  jonagold: 3,
  honeycrisp: 2,
  empire: 2,
  mcintosh: 2,
  "red delicious": 1,
  liberty: 1,
  enterprise: 1,
}

const CEDAR_RUST_LABEL: Record<number, string> = {
  4: "Very High",
  3: "High",
  2: "Moderate",
  1: "Low",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RiskBand = "low" | "moderate" | "high" | "extreme"

function riskBand(score: number): RiskBand {
  if (score >= 75) return "extreme"
  if (score >= 45) return "high"
  if (score >= 20) return "moderate"
  return "low"
}

function riskColorHex(band: RiskBand): string {
  switch (band) {
    case "extreme":
      return "#DC2626"
    case "high":
      return "#EF4444"
    case "moderate":
      return "#EAB308"
    case "low":
      return "#22C55E"
  }
}

function riskTextClass(band: RiskBand): string {
  switch (band) {
    case "extreme":
      return "text-risk-extreme"
    case "high":
      return "text-risk-high"
    case "moderate":
      return "text-risk-moderate"
    case "low":
      return "text-risk-low"
  }
}

function cedarRustBand(level: number): RiskBand {
  if (level >= 4) return "extreme"
  if (level >= 3) return "high"
  if (level >= 2) return "moderate"
  return "low"
}

function mildewBand(susceptibility: VarietySusceptibility): RiskBand {
  switch (susceptibility) {
    case "highly_susceptible":
      return "extreme"
    case "susceptible":
      return "high"
    case "moderate":
      return "moderate"
    case "resistant":
      return "low"
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VarietyRiskCardProps {
  varieties: string[]
  hourlyData: Array<{
    timestamp: string
    temp_c: number
    humidity_pct: number
    precip_mm: number
  }>
  bloomStage: string
  calciumSpraysCompleted?: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VarietyRiskCard({
  varieties,
  hourlyData,
  bloomStage,
  calciumSpraysCompleted,
}: VarietyRiskCardProps) {
  // Evaluate models per variety
  const rows = varieties.map((variety) => {
    const normalized = variety.toLowerCase().trim()

    // Bitter pit
    const bitterPitResult = evaluateBitterPit(
      hourlyData,
      normalized,
      undefined,
      calciumSpraysCompleted,
    )

    // Powdery mildew
    const mildewSusceptibility: VarietySusceptibility =
      MILDEW_SUSCEPTIBILITY[normalized] ?? "moderate"
    const mildewResult = evaluatePowderyMildew(
      hourlyData,
      bloomStage,
      mildewSusceptibility,
    )

    // Cedar rust (static susceptibility — not weather-driven per variety)
    const cedarLevel = CEDAR_RUST_SUSCEPTIBILITY[normalized] ?? 2
    const cedarLabel = CEDAR_RUST_LABEL[cedarLevel] ?? "Moderate"

    return {
      variety: capitalize(normalized),
      bitterPitScore: bitterPitResult.riskScore,
      bitterPitBand: riskBand(bitterPitResult.riskScore),
      bitterPitLevel: bitterPitResult.riskLevel,
      mildewScore: mildewResult.riskScore,
      mildewBand: riskBand(mildewResult.riskScore),
      mildewSusceptibility: mildewSusceptibility,
      mildewSusceptibilityBand: mildewBand(mildewSusceptibility),
      cedarLevel,
      cedarLabel,
      cedarBand: cedarRustBand(cedarLevel),
    }
  })

  return (
    <div className="rounded-xl border border-border bg-card card-shadow p-6">
      {/* Title */}
      <h2 className="text-[16px] font-bold text-bark-900 mb-4">
        Variety Risk Comparison
      </h2>

      {/* Table */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-bark-400">
              <th className="pb-2 pl-2 pr-4 font-semibold">Variety</th>
              <th className="pb-2 px-4 font-semibold">Bitter Pit</th>
              <th className="pb-2 px-4 font-semibold">Powdery Mildew</th>
              <th className="pb-2 px-4 font-semibold">Cedar Rust</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variety} className="border-b border-border/50 last:border-0">
                {/* Variety name */}
                <td className="py-3 pl-2 pr-4 font-medium text-bark-900">
                  {row.variety}
                </td>

                {/* Bitter Pit — score with inline bar */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(row.bitterPitScore, 100)}%`,
                          backgroundColor: riskColorHex(row.bitterPitBand),
                        }}
                      />
                    </div>
                    <span
                      className={`font-data text-[12px] font-medium ${riskTextClass(row.bitterPitBand)}`}
                    >
                      {row.bitterPitScore}
                    </span>
                  </div>
                </td>

                {/* Powdery Mildew — score with inline bar */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(row.mildewScore, 100)}%`,
                          backgroundColor: riskColorHex(row.mildewBand),
                        }}
                      />
                    </div>
                    <span
                      className={`font-data text-[12px] font-medium ${riskTextClass(row.mildewBand)}`}
                    >
                      {row.mildewScore}
                    </span>
                  </div>
                </td>

                {/* Cedar Rust — susceptibility badge */}
                <td className="py-3 px-4">
                  <span
                    className="inline-block text-[11px] uppercase font-bold tracking-wide px-2.5 py-0.5 rounded-[20px]"
                    style={{
                      backgroundColor: `${riskColorHex(row.cedarBand)}18`,
                      color: riskColorHex(row.cedarBand),
                    }}
                  >
                    {row.cedarLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="mt-4 text-[11px] text-bark-300 leading-[1.5]">
        Bitter Pit and Powdery Mildew scores reflect current weather conditions
        adjusted for each variety&apos;s susceptibility. Cedar Rust susceptibility
        is a fixed varietal trait.
      </p>
    </div>
  )
}
