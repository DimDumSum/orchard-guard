// ---------------------------------------------------------------------------
// OrchardGuard Tank Mix Builder — Server Component
//
// Loads spray products and saved templates from the database and renders
// the interactive tank mix builder client component.
// ---------------------------------------------------------------------------

import { getSprayProducts, getTankMixTemplates } from "@/lib/db"
import type { SprayProductRow, TankMixTemplateRow } from "@/lib/db"
import { TankMixBuilder } from "./tank-mix-builder"

export default async function TankMixPage() {
  const products: SprayProductRow[] = getSprayProducts()
  const templates: TankMixTemplateRow[] = getTankMixTemplates(1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">Tank Mix Builder</h1>
        <p className="text-body text-muted-foreground">
          Combine multiple products into a single spray application.
          The system checks product compatibility and calculates exact
          amounts for your tank size.
        </p>
        <p className="mt-2 text-[13px] leading-[1.6] text-bark-400">
          Always read product labels before mixing. This tool checks known
          incompatibilities but cannot account for all formulation interactions.
          When in doubt, do a jar test first.
        </p>
      </div>

      <TankMixBuilder products={products} savedTemplates={templates} />
    </div>
  )
}
