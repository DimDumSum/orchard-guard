// ---------------------------------------------------------------------------
// OrchardGuard Nutrition & Fertilizer Timing Page — Server Component
//
// Displays Ontario apple nutrition timing recommendations, fertilizer log,
// soil/leaf test summaries, and a form for adding fertilizer entries.
// ---------------------------------------------------------------------------

import {
  Leaf,
  TestTubes,
  FlaskConical,
  CalendarDays,
  Plus,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getDb, getOrchard } from "@/lib/db"

export const dynamic = "force-dynamic"
import type {
  FertilizerLogRow,
  SoilTestRow,
  LeafTestRow,
} from "@/lib/db"
import { FertilizerForm } from "./fertilizer-form"

// ---------------------------------------------------------------------------
// Ontario apple nutrition timing recommendations
// ---------------------------------------------------------------------------

interface TimingRow {
  window: string
  monthRange: string
  application: string
  purpose: string
  why: string
  /** Bloom stages that map to this window */
  stages: string[]
}

const TIMING_RECOMMENDATIONS: TimingRow[] = [
  {
    window: "Dormant",
    monthRange: "Mar\u2013Apr",
    application: "Boron (Solubor) foliar",
    purpose: "Bud health, fruit set",
    why: "Boron supports bud development and fruit set. Best absorbed through bark before leaves open.",
    stages: ["dormant", "silver-tip"],
  },
  {
    window: "Green tip",
    monthRange: "Apr",
    application: "Nitrogen (CAN/Urea) ground",
    purpose: "Early growth flush",
    why: "Trees need nitrogen for the first flush of leaf and shoot growth. Ground-applied N is taken up by roots as soil warms.",
    stages: ["green-tip"],
  },
  {
    window: "Pink \u2013 Bloom",
    monthRange: "May",
    application: "Calcium chloride foliar",
    purpose: "Bitter pit prevention (start)",
    why: "Calcium prevents bitter pit in fruit. Must start early because calcium doesn\u2019t move into fruit later in the season.",
    stages: ["pink", "bloom"],
  },
  {
    window: "Petal fall",
    monthRange: "May\u2013Jun",
    application: "Foliar Zn + Mn + Mg",
    purpose: "Correct deficiencies",
    why: "Micronutrient sprays are most effective on young expanding leaves. Corrects deficiencies identified in leaf tests.",
    stages: ["petal-fall"],
  },
  {
    window: "2\u20133 weeks post bloom",
    monthRange: "Jun",
    application: "Nitrogen adjustment",
    purpose: "Match N to fruit demand",
    why: "Adjust N based on crop load \u2014 heavy crops need more N, light crops less. Over-fertilizing promotes fire blight.",
    stages: ["fruit-set"],
  },
  {
    window: "June (every 10\u201314 days)",
    monthRange: "Jun\u2013Aug",
    application: "Calcium foliar sprays",
    purpose: "Continue through August",
    why: "Repeated calcium sprays build up fruit calcium levels throughout the growing season. Most critical for Honeycrisp.",
    stages: [],
  },
  {
    window: "July",
    monthRange: "Jul",
    application: "Potassium if deficient",
    purpose: "Fruit color, size",
    why: "Potassium improves fruit color, size, and storage quality. Only apply if soil/leaf tests show deficiency.",
    stages: [],
  },
  {
    window: "Post-harvest",
    monthRange: "Sep\u2013Oct",
    application: "Foliar urea (5%)",
    purpose: "N cycling, scab inoculum reduction",
    why: "Urea speeds leaf decomposition, reducing overwintering apple scab spores. Also recycles N back into the tree.",
    stages: [],
  },
  {
    window: "Fall",
    monthRange: "Oct\u2013Nov",
    application: "Lime if pH < 6.0",
    purpose: "pH adjustment",
    why: "Soil pH below 6.0 locks out nutrients. Lime takes months to work, so fall application is ready for spring.",
    stages: [],
  },
]

/** Determine which timing window is current based on bloom stage. */
function currentWindowIndices(bloomStage: string): number[] {
  const indices: number[] = []
  TIMING_RECOMMENDATIONS.forEach((row, i) => {
    if (row.stages.includes(bloomStage)) {
      indices.push(i)
    }
  })

  // Also highlight based on month if no bloom stage match
  if (indices.length === 0) {
    const month = new Date().getMonth() // 0-indexed
    // June-Aug: calcium sprays
    if (month >= 5 && month <= 7) indices.push(5)
    // July: potassium
    if (month === 6) indices.push(6)
    // Sep-Oct: post-harvest
    if (month >= 8 && month <= 9) indices.push(7)
    // Oct-Nov: fall lime
    if (month >= 9 && month <= 10) indices.push(8)
  }

  return indices
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function NutritionPage() {
  const orchard = getOrchard()
  const bloomStage = orchard?.bloom_stage ?? "dormant"

  const db = getDb()

  const fertilizerLog = db
    .prepare(
      "SELECT * FROM fertilizer_log WHERE orchard_id = 1 ORDER BY date DESC"
    )
    .all() as FertilizerLogRow[]

  const soilTests = db
    .prepare(
      "SELECT * FROM soil_tests WHERE orchard_id = 1 ORDER BY date DESC LIMIT 1"
    )
    .all() as SoilTestRow[]

  const leafTests = db
    .prepare(
      "SELECT * FROM leaf_tests WHERE orchard_id = 1 ORDER BY date DESC LIMIT 1"
    )
    .all() as LeafTestRow[]

  const latestSoil = soilTests.length > 0 ? soilTests[0] : null
  const latestLeaf = leafTests.length > 0 ? leafTests[0] : null

  const activeWindows = currentWindowIndices(bloomStage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-bark-900" style={{ letterSpacing: '-0.02em' }}>Nutrition &amp; Fertilizer</h1>
        <p className="text-[14px] text-bark-400">
          Ontario apple nutrition timing recommendations, fertilizer tracking, and
          soil/leaf test summaries. The timing table below highlights which nutrients
          to apply at each growth stage and why.
        </p>
      </div>

      {/* Timing recommendation table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <CalendarDays className="size-4" />
            Nutrition Timing Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Current bloom stage:{" "}
            <Badge variant="secondary">
              {bloomStage.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Window</TableHead>
                  <TableHead className="hidden sm:table-cell">Timing</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead className="hidden md:table-cell">Why</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TIMING_RECOMMENDATIONS.map((row, idx) => {
                  const isActive = activeWindows.includes(idx)
                  return (
                    <TableRow
                      key={idx}
                      className={
                        isActive
                          ? "bg-grove-100 dark:bg-grove-600/10"
                          : "hover:bg-earth-50"
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.window}</span>
                          {isActive && (
                            <Badge variant="default">
                              Current
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {row.monthRange}
                      </TableCell>
                      <TableCell>{row.application}</TableCell>
                      <TableCell className="hidden md:table-cell text-[13px] leading-[1.6] text-muted-foreground max-w-xs">
                        {row.why}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Fertilizer form */}
      <FertilizerForm />

      {/* Fertilizer log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <FlaskConical className="size-4" />
            Fertilizer Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fertilizerLog.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden sm:table-cell">Analysis</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead className="hidden sm:table-cell">Method</TableHead>
                    <TableHead className="hidden md:table-cell">Target</TableHead>
                    <TableHead className="hidden md:table-cell">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fertilizerLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="font-medium">
                        {entry.product_name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {entry.analysis ?? "\u2014"}
                      </TableCell>
                      <TableCell>
                        {entry.rate != null
                          ? `${entry.rate} ${entry.rate_unit ?? ""}`
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">
                          {entry.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {entry.target_nutrient ?? "\u2014"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {entry.cost != null ? `$${entry.cost.toFixed(2)}` : "\u2014"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No fertilizer entries yet. Use the form above to log your first
              application.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Soil & Leaf test summaries */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Soil test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-section-title">
              <TestTubes className="size-4" />
              Soil Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestSoil ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Most recent: {latestSoil.date}
                  {latestSoil.lab_name && ` (${latestSoil.lab_name})`}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {latestSoil.pH != null && (
                    <div>
                      <span className="text-muted-foreground">pH:</span>{" "}
                      <span className="font-medium">{latestSoil.pH}</span>
                    </div>
                  )}
                  {latestSoil.organic_matter_pct != null && (
                    <div>
                      <span className="text-muted-foreground">OM:</span>{" "}
                      <span className="font-medium">
                        {latestSoil.organic_matter_pct}%
                      </span>
                    </div>
                  )}
                  {latestSoil.n_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">N:</span>{" "}
                      <span className="font-medium">{latestSoil.n_ppm} ppm</span>
                    </div>
                  )}
                  {latestSoil.p_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">P:</span>{" "}
                      <span className="font-medium">{latestSoil.p_ppm} ppm</span>
                    </div>
                  )}
                  {latestSoil.k_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">K:</span>{" "}
                      <span className="font-medium">{latestSoil.k_ppm} ppm</span>
                    </div>
                  )}
                  {latestSoil.ca_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">Ca:</span>{" "}
                      <span className="font-medium">{latestSoil.ca_ppm} ppm</span>
                    </div>
                  )}
                  {latestSoil.mg_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">Mg:</span>{" "}
                      <span className="font-medium">{latestSoil.mg_ppm} ppm</span>
                    </div>
                  )}
                  {latestSoil.b_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">B:</span>{" "}
                      <span className="font-medium">{latestSoil.b_ppm} ppm</span>
                    </div>
                  )}
                  {latestSoil.cec != null && (
                    <div>
                      <span className="text-muted-foreground">CEC:</span>{" "}
                      <span className="font-medium">{latestSoil.cec}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-sm text-muted-foreground">No data yet</p>
                <Button variant="outline" size="sm" disabled>
                  <Plus className="size-4 mr-1" />
                  Add Test Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaf test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-section-title">
              <Leaf className="size-4" />
              Leaf Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestLeaf ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Most recent: {latestLeaf.date}
                  {latestLeaf.lab_name && ` (${latestLeaf.lab_name})`}
                  {" \u2014 "}
                  <Badge variant="outline">{latestLeaf.sample_type}</Badge>
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {latestLeaf.n_pct != null && (
                    <div>
                      <span className="text-muted-foreground">N:</span>{" "}
                      <span className="font-medium">{latestLeaf.n_pct}%</span>
                    </div>
                  )}
                  {latestLeaf.p_pct != null && (
                    <div>
                      <span className="text-muted-foreground">P:</span>{" "}
                      <span className="font-medium">{latestLeaf.p_pct}%</span>
                    </div>
                  )}
                  {latestLeaf.k_pct != null && (
                    <div>
                      <span className="text-muted-foreground">K:</span>{" "}
                      <span className="font-medium">{latestLeaf.k_pct}%</span>
                    </div>
                  )}
                  {latestLeaf.ca_pct != null && (
                    <div>
                      <span className="text-muted-foreground">Ca:</span>{" "}
                      <span className="font-medium">{latestLeaf.ca_pct}%</span>
                    </div>
                  )}
                  {latestLeaf.mg_pct != null && (
                    <div>
                      <span className="text-muted-foreground">Mg:</span>{" "}
                      <span className="font-medium">{latestLeaf.mg_pct}%</span>
                    </div>
                  )}
                  {latestLeaf.b_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">B:</span>{" "}
                      <span className="font-medium">{latestLeaf.b_ppm} ppm</span>
                    </div>
                  )}
                  {latestLeaf.zn_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">Zn:</span>{" "}
                      <span className="font-medium">{latestLeaf.zn_ppm} ppm</span>
                    </div>
                  )}
                  {latestLeaf.mn_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">Mn:</span>{" "}
                      <span className="font-medium">{latestLeaf.mn_ppm} ppm</span>
                    </div>
                  )}
                  {latestLeaf.fe_ppm != null && (
                    <div>
                      <span className="text-muted-foreground">Fe:</span>{" "}
                      <span className="font-medium">{latestLeaf.fe_ppm} ppm</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-sm text-muted-foreground">No data yet</p>
                <Button variant="outline" size="sm" disabled>
                  <Plus className="size-4 mr-1" />
                  Add Test Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
