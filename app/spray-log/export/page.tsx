// ---------------------------------------------------------------------------
// Spray Log Export — Print-friendly page for Ontario OMAFRA compliance
//
// This page renders a clean, printer-ready spray log that includes all the
// fields required by Ontario's Pesticide Education Program and OMAFRA
// record-keeping guidelines:
//   - Applicator info & orchard details
//   - Date, product, rate, target pest/disease
//   - PHI and REI for each application
//   - Block information (if per-block tracking is used)
//   - Season totals and FRAC/IRAC group usage
//
// Users access this via "Export / Print" button on the spray log page.
// The browser's native Print dialog (Ctrl+P / Cmd+P) generates the PDF.
// ---------------------------------------------------------------------------

import { getDb, getOrchard, getSprayProducts } from "@/lib/db"
import type { SprayLogRow, SprayProductRow } from "@/lib/db"
import { PrintButton } from "./print-button"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Spray Log Export | OrchardGuard",
}

function findProduct(
  name: string,
  products: SprayProductRow[],
): SprayProductRow | undefined {
  const lower = name.toLowerCase()
  return products.find(
    (p) =>
      p.product_name.toLowerCase() === lower ||
      lower.includes(p.product_name.toLowerCase()),
  )
}

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

export default function SprayLogExportPage() {
  const orchard = getOrchard()
  if (!orchard) {
    return <p className="p-8 text-center">No orchard configured.</p>
  }

  const db = getDb()
  const currentYear = new Date().getFullYear()
  const entries = db
    .prepare(
      `SELECT * FROM spray_log
       WHERE orchard_id = ? AND date >= ?
       ORDER BY date ASC, created_at ASC`,
    )
    .all(orchard.id, `${currentYear}-01-01`) as SprayLogRow[]

  const products = getSprayProducts()

  // Calculate season summary
  const fracUsage = new Map<string, number>()
  const productCounts = new Map<string, number>()

  for (const entry of entries) {
    productCounts.set(entry.product, (productCounts.get(entry.product) ?? 0) + 1)
    const match = findProduct(entry.product, products)
    if (match?.frac_irac_group) {
      fracUsage.set(
        match.frac_irac_group,
        (fracUsage.get(match.frac_irac_group) ?? 0) + 1,
      )
    }
  }

  let varieties: string[] = []
  try {
    varieties = JSON.parse(orchard.primary_varieties || "[]")
  } catch { /* empty */ }

  const now = new Date()
  const reportDate = now.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      {/* Print styles — hide nav, make it clean for PDF */}
      <style>{`
        @media print {
          nav, header, .no-print, footer { display: none !important; }
          body { background: white !important; font-size: 11px !important; }
          .print-page { padding: 0 !important; max-width: 100% !important; }
          table { font-size: 10px !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      <div className="print-page max-w-4xl mx-auto p-6 space-y-6">
        {/* Print button — hidden in print */}
        <div className="no-print flex items-center justify-between">
          <a
            href="/spray-log"
            className="text-sm text-primary hover:underline"
          >
            &larr; Back to Spray Log
          </a>
          <PrintButton />
        </div>

        {/* Header */}
        <div className="border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">
            Pesticide Application Record — {currentYear} Season
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ontario OMAFRA Compliance Record &mdash; Generated {reportDate}
          </p>
        </div>

        {/* Orchard Details */}
        <div className="grid grid-cols-2 gap-4 text-sm border border-border rounded-lg p-4">
          <div>
            <p className="font-semibold">Orchard Name</p>
            <p>{orchard.name}</p>
          </div>
          <div>
            <p className="font-semibold">Location</p>
            <p>
              {orchard.latitude.toFixed(4)}&deg;N, {Math.abs(orchard.longitude).toFixed(4)}&deg;W
            </p>
          </div>
          <div>
            <p className="font-semibold">Varieties</p>
            <p className="capitalize">
              {varieties.length > 0 ? varieties.join(", ") : "Not specified"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Fire Blight History</p>
            <p className="capitalize">{orchard.fire_blight_history.replace("_", " ")}</p>
          </div>
          <div>
            <p className="font-semibold">Report Period</p>
            <p>January 1 &mdash; December 31, {currentYear}</p>
          </div>
          <div>
            <p className="font-semibold">Total Applications</p>
            <p>{entries.length}</p>
          </div>
        </div>

        {/* Application Log Table */}
        <div>
          <h2 className="text-lg font-bold mb-2">Application Log</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No spray applications recorded for the {currentYear} season.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-1.5 pr-2">#</th>
                  <th className="text-left py-1.5 pr-2">Date</th>
                  <th className="text-left py-1.5 pr-2">Product</th>
                  <th className="text-left py-1.5 pr-2">Rate</th>
                  <th className="text-left py-1.5 pr-2">Target</th>
                  <th className="text-left py-1.5 pr-2">Block</th>
                  <th className="text-right py-1.5 pr-2">PHI (d)</th>
                  <th className="text-right py-1.5 pr-2">REI (h)</th>
                  <th className="text-left py-1.5 pr-2">FRAC/IRAC</th>
                  <th className="text-left py-1.5">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => {
                  const match = findProduct(entry.product, products)
                  return (
                    <tr key={entry.id} className="border-b border-gray-200">
                      <td className="py-1.5 pr-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-1.5 pr-2 font-mono">{entry.date}</td>
                      <td className="py-1.5 pr-2 font-medium">{entry.product}</td>
                      <td className="py-1.5 pr-2">{entry.rate ?? "-"}</td>
                      <td className="py-1.5 pr-2">{TARGET_LABELS[entry.target] ?? entry.target}</td>
                      <td className="py-1.5 pr-2">{entry.block_name ?? "All"}</td>
                      <td className="py-1.5 pr-2 text-right font-mono">{entry.phi_days ?? "-"}</td>
                      <td className="py-1.5 pr-2 text-right font-mono">{entry.rei_hours ?? "-"}</td>
                      <td className="py-1.5 pr-2">{match?.frac_irac_group ?? "-"}</td>
                      <td className="py-1.5 max-w-[150px] truncate">{entry.notes ?? ""}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Season Summary */}
        {entries.length > 0 && (
          <div className="page-break">
            <h2 className="text-lg font-bold mb-2">Season Summary</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Product usage */}
              <div>
                <h3 className="font-semibold text-sm mb-1">Product Usage</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="text-left py-1">Product</th>
                      <th className="text-right py-1">Applications</th>
                      <th className="text-right py-1">Max/Season</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(productCounts.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([product, count]) => {
                        const match = findProduct(product, products)
                        const maxApps = match?.max_applications_per_season
                        const overLimit = maxApps != null && count > maxApps
                        return (
                          <tr key={product} className="border-b border-gray-200">
                            <td className="py-1">{product}</td>
                            <td className={`py-1 text-right font-mono ${overLimit ? "text-red-600 font-bold" : ""}`}>
                              {count}
                            </td>
                            <td className="py-1 text-right font-mono">
                              {maxApps ?? "-"}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              {/* FRAC/IRAC group usage */}
              <div>
                <h3 className="font-semibold text-sm mb-1">Resistance Group Usage</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="text-left py-1">FRAC/IRAC Group</th>
                      <th className="text-right py-1">Applications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(fracUsage.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([group, count]) => (
                        <tr key={group} className="border-b border-gray-200">
                          <td className="py-1">Group {group}</td>
                          <td className="py-1 text-right font-mono">{count}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Signature block */}
        <div className="border-t-2 border-black pt-4 mt-8 grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold mb-8">Applicator Signature</p>
            <div className="border-b border-black" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-8">Date</p>
            <div className="border-b border-black" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Generated by OrchardGuard &mdash; Integrated Pest Management System for Ontario Apple Orchards
        </p>
      </div>
    </>
  )
}
