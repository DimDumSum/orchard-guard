// ---------------------------------------------------------------------------
// OrchardGuard Spray Log Page — Server Component
//
// Loads spray log entries from the database and renders the spray form
// and spray table client components.
// ---------------------------------------------------------------------------

import { getDb } from "@/lib/db"
import type { SprayLogRow } from "@/lib/db"
import { SprayForm } from "./spray-form"
import { SprayTable } from "./spray-table"
import { TermTooltip } from "@/components/term-tooltip"
import { Beaker } from "lucide-react"

export default async function SprayLogPage() {
  const db = getDb()

  const entries = db
    .prepare(
      `SELECT * FROM spray_log
       WHERE orchard_id = 1
       ORDER BY date DESC, created_at DESC`,
    )
    .all() as SprayLogRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: '-0.02em' }}>Spray Log</h1>
        <p className="text-[14px] text-bark-400">
          Record and track spray applications. The system tracks{" "}
          <TermTooltip term="PHI">PHI</TermTooltip> countdowns,{" "}
          <TermTooltip term="REI">REI</TermTooltip> status, and{" "}
          <TermTooltip term="FRAC Group">FRAC</TermTooltip>/<TermTooltip term="IRAC Group">IRAC</TermTooltip> resistance
          group rotation.
        </p>
      </div>

      {/* Add spray form */}
      <SprayForm />

      {/* Spray log table */}
      {entries.length > 0 ? (
        <SprayTable entries={entries} />
      ) : (
        <div className="rounded-xl border border-border bg-card card-shadow p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
            <Beaker className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-card-title text-foreground text-center">No sprays recorded yet this season.</p>
          <div className="mt-4 max-w-lg mx-auto text-[14px] leading-[1.7] text-bark-600">
            <p className="font-semibold text-bark-900 mb-2">Dormant Season Spray Checklist:</p>
            <ul className="space-y-2 text-[14px]">
              <li className="flex items-start gap-2">
                <span className="text-bark-400 mt-0.5">&square;</span>
                <span><strong>Dormant oil</strong> (before green tip) &mdash; targets overwintering mite eggs and scale insects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bark-400 mt-0.5">&square;</span>
                <span><strong>Copper spray</strong> (silver tip to &frac14;&quot; green) &mdash; reduces fire blight inoculum and early scab</span>
              </li>
            </ul>
            <p className="mt-4 text-[13px] text-bark-400">
              Use &ldquo;Log Spray&rdquo; above to record applications. The system will track
              product intervals, resistance group rotation, pre-harvest intervals, and re-entry
              times for worker safety.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
