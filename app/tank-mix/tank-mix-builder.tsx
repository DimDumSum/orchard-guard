"use client"

import { useState, useMemo } from "react"
import { toImperial } from "@/lib/units"
import { DualUnitInput } from "@/components/ui/dual-unit-input"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Printer,
  Beaker,
  ListOrdered,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { SprayProductRow, TankMixTemplateRow } from "@/lib/db"

// ---------------------------------------------------------------------------
// Compatibility checking
// ---------------------------------------------------------------------------

interface CompatibilityIssue {
  level: "incompatible" | "warning"
  productA: string
  productB: string
  message: string
}

function checkCompatibility(products: SprayProductRow[]): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = []

  const hasCaptan = products.some((p) =>
    p.active_ingredient.toLowerCase().includes("captan")
  )
  const hasOil = products.some(
    (p) =>
      p.active_ingredient.toLowerCase().includes("oil") ||
      p.active_ingredient.toLowerCase().includes("mineral oil")
  )
  const hasBlossomProtect = products.some(
    (p) =>
      p.product_name.toLowerCase().includes("blossom protect") ||
      p.active_ingredient.toLowerCase().includes("aureobasidium")
  )
  const hasCopper = products.some(
    (p) =>
      p.active_ingredient.toLowerCase().includes("copper") ||
      p.frac_irac_group === "M1"
  )
  const hasSulfur = products.some(
    (p) =>
      p.active_ingredient.toLowerCase().includes("sulfur") ||
      p.frac_irac_group === "M2"
  )

  if (hasCaptan && hasOil) {
    const captanName =
      products.find((p) => p.active_ingredient.toLowerCase().includes("captan"))
        ?.product_name ?? "Captan"
    const oilName =
      products.find(
        (p) =>
          p.active_ingredient.toLowerCase().includes("oil") ||
          p.active_ingredient.toLowerCase().includes("mineral oil")
      )?.product_name ?? "Oil"
    issues.push({
      level: "incompatible",
      productA: captanName,
      productB: oilName,
      message: "Phytotoxicity risk \u2014 do not combine",
    })
  }

  if (hasBlossomProtect && hasCopper) {
    const bpName =
      products.find(
        (p) =>
          p.product_name.toLowerCase().includes("blossom protect") ||
          p.active_ingredient.toLowerCase().includes("aureobasidium")
      )?.product_name ?? "Blossom Protect"
    const cuName =
      products.find(
        (p) =>
          p.active_ingredient.toLowerCase().includes("copper") ||
          p.frac_irac_group === "M1"
      )?.product_name ?? "Copper"
    issues.push({
      level: "incompatible",
      productA: bpName,
      productB: cuName,
      message: "Reduced efficacy of biological",
    })
  }

  if (hasSulfur && hasOil) {
    const sulfurName =
      products.find(
        (p) =>
          p.active_ingredient.toLowerCase().includes("sulfur") ||
          p.frac_irac_group === "M2"
      )?.product_name ?? "Sulfur"
    const oilName =
      products.find(
        (p) =>
          p.active_ingredient.toLowerCase().includes("oil") ||
          p.active_ingredient.toLowerCase().includes("mineral oil")
      )?.product_name ?? "Oil"
    issues.push({
      level: "warning",
      productA: sulfurName,
      productB: oilName,
      message: "Phytotoxicity \u2014 wait 14 days between",
    })
  }

  return issues
}

// ---------------------------------------------------------------------------
// Mixing order classification
// ---------------------------------------------------------------------------

const MIXING_ORDER_STEPS = [
  { step: 1, label: "Fill tank 50% with water" },
  { step: 2, label: "Wettable powders (WP / WDG)" },
  { step: 3, label: "Flowables (SC / F)" },
  { step: 4, label: "Emulsifiable concentrates (EC)" },
  { step: 5, label: "Top up with remaining water" },
]

function classifyFormulation(product: SprayProductRow): string {
  const name = product.product_name.toLowerCase()
  const ai = product.active_ingredient.toLowerCase()

  if (name.includes("wdg") || name.includes("wp") || name.includes("wettable")) {
    return "WP/WDG"
  }
  if (name.includes("sc") || name.includes("flowable") || ai.includes("clay")) {
    return "Flowable"
  }
  if (name.includes("ec") || ai.includes("oil")) {
    return "EC"
  }
  if (name.includes("2l") || name.includes("4l")) {
    return "Flowable"
  }
  // Default to flowable for products that don't clearly fit elsewhere
  return "Flowable"
}

function getMixingStepIndex(formulation: string): number {
  switch (formulation) {
    case "WP/WDG":
      return 1
    case "Flowable":
      return 2
    case "EC":
      return 3
    default:
      return 2
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TankMixBuilderProps {
  products: SprayProductRow[]
  savedTemplates: TankMixTemplateRow[]
}

export function TankMixBuilder({ products, savedTemplates }: TankMixBuilderProps) {
  const router = useRouter()

  // Product selection
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [filterGroup, setFilterGroup] = useState<string>("all")

  // Tank volume calculator
  const [tankSize, setTankSize] = useState("")
  const [areaToCover, setAreaToCover] = useState("")
  const [waterVolumeRate, setWaterVolumeRate] = useState("1000")

  // Template saving
  const [templateName, setTemplateName] = useState("")
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Selected products data
  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.includes(p.id)),
    [products, selectedIds]
  )

  // Compatibility check
  const compatibilityIssues = useMemo(
    () => checkCompatibility(selectedProducts),
    [selectedProducts]
  )

  const hasIncompatible = compatibilityIssues.some(
    (i) => i.level === "incompatible"
  )
  const hasWarning = compatibilityIssues.some((i) => i.level === "warning")

  // Volume calculations
  const tankSizeL = parseFloat(tankSize) || 0
  const areaHa = parseFloat(areaToCover) || 0
  const waterRate = parseFloat(waterVolumeRate) || 1000
  const tanksNeeded = areaHa > 0 && tankSizeL > 0 ? (areaHa * waterRate) / tankSizeL : 0

  // Filtered product list for picker
  const filteredProducts = useMemo(() => {
    if (filterGroup === "all") return products
    return products.filter((p) => p.product_group === filterGroup)
  }, [products, filterGroup])

  function addProduct(id: number) {
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id])
    }
  }

  function removeProduct(id: number) {
    setSelectedIds(selectedIds.filter((sid) => sid !== id))
  }

  function loadTemplate(template: TankMixTemplateRow) {
    try {
      const prodIds = JSON.parse(template.products) as number[]
      setSelectedIds(prodIds)
      setTemplateName(template.name)
      if (template.tank_size_l) setTankSize(String(template.tank_size_l))
      if (template.area_ha) setAreaToCover(String(template.area_ha))
    } catch {
      // ignore parse errors
    }
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      setFeedback({ type: "error", message: "Please enter a template name." })
      return
    }
    if (selectedIds.length === 0) {
      setFeedback({ type: "error", message: "Add at least one product to save." })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      const res = await fetch("/api/tank-mix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          products: selectedIds,
          tank_size_l: tankSizeL || null,
          area_ha: areaHa || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save template")
      }

      setFeedback({ type: "success", message: "Template saved successfully." })
      router.refresh()
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      })
    } finally {
      setSaving(false)
    }
  }

  // Determine mixing order for selected products
  const mixingOrderProducts = useMemo(() => {
    return selectedProducts.map((p) => {
      const formulation = classifyFormulation(p)
      const stepIndex = getMixingStepIndex(formulation)
      return { product: p, formulation, stepIndex }
    }).sort((a, b) => a.stepIndex - b.stepIndex)
  }, [selectedProducts])

  function calculateProductAmount(product: SprayProductRow): string {
    if (!product.rate_per_hectare || areaHa <= 0) return "\u2014"
    const rate = parseFloat(product.rate_per_hectare)
    if (isNaN(rate)) return product.rate_per_hectare
    const total = rate * areaHa
    return `${total.toFixed(2)} ${product.rate_unit ?? ""}`
  }

  function calculateProductPerTank(product: SprayProductRow): string {
    if (!product.rate_per_hectare || tankSizeL <= 0 || waterRate <= 0) return "\u2014"
    const rate = parseFloat(product.rate_per_hectare)
    if (isNaN(rate)) return "\u2014"
    const haPerTank = tankSizeL / waterRate
    const perTank = rate * haPerTank
    return `${perTank.toFixed(2)} ${product.rate_unit ?? ""}`
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Saved templates */}
      {savedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListOrdered className="size-4" />
              Saved Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedTemplates.map((t) => (
                <Button
                  key={t.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadTemplate(t)}
                >
                  {t.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product picker */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4" />
            Add Products to Tank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm font-medium">Filter:</Label>
            {["all", "fungicide", "insecticide", "miticide", "growth_regulator", "nutrient"].map(
              (g) => (
                <Button
                  key={g}
                  variant={filterGroup === g ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterGroup(g)}
                >
                  {g === "all"
                    ? "All"
                    : g === "growth_regulator"
                    ? "Growth Reg."
                    : g.charAt(0).toUpperCase() + g.slice(1)}
                </Button>
              )
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProductPicker(!showProductPicker)}
            className="flex items-center gap-1"
          >
            {showProductPicker ? "Hide" : "Show"} Product List
            <ChevronDown
              className={`size-4 transition-transform ${showProductPicker ? "rotate-180" : ""}`}
            />
          </Button>

          {showProductPicker && (
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden sm:table-cell">Active Ingredient</TableHead>
                    <TableHead className="hidden sm:table-cell">Group</TableHead>
                    <TableHead className="hidden md:table-cell">FRAC/IRAC</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => {
                    const isSelected = selectedIds.includes(p.id)
                    return (
                      <TableRow key={p.id} className={isSelected ? "bg-muted/50" : ""}>
                        <TableCell className="font-medium">{p.product_name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {p.active_ingredient}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">
                            {p.product_group === "growth_regulator"
                              ? "Growth Reg."
                              : p.product_group}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {p.frac_irac_group ?? "\u2014"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={isSelected ? "secondary" : "default"}
                            onClick={() =>
                              isSelected ? removeProduct(p.id) : addProduct(p.id)
                            }
                          >
                            {isSelected ? "Remove" : "Add"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected products */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Beaker className="size-4" />
              Tank Mix ({selectedProducts.length}{" "}
              {selectedProducts.length === 1 ? "product" : "products"})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Compatibility status */}
            <div className="flex items-center gap-2">
              {compatibilityIssues.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="size-4" />
                  All products compatible
                </div>
              ) : (
                <div className="space-y-1">
                  {compatibilityIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 text-sm rounded-lg border px-3 py-2 ${
                        issue.level === "incompatible"
                          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                          : "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
                      }`}
                    >
                      {issue.level === "incompatible" ? (
                        <XCircle className="size-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      )}
                      <span>
                        <strong>{issue.productA}</strong> + <strong>{issue.productB}</strong>:{" "}
                        {issue.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden sm:table-cell">Active Ingredient</TableHead>
                    <TableHead>Rate/ha</TableHead>
                    <TableHead className="hidden sm:table-cell">FRAC/IRAC</TableHead>
                    <TableHead className="hidden md:table-cell">PHI</TableHead>
                    <TableHead className="hidden md:table-cell">REI</TableHead>
                    {areaHa > 0 && <TableHead>Total Needed</TableHead>}
                    {tankSizeL > 0 && <TableHead>Per Tank</TableHead>}
                    <TableHead className="w-12 print:hidden"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.product_name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {p.active_ingredient}
                      </TableCell>
                      <TableCell>
                        {p.rate_per_hectare ?? "\u2014"}{" "}
                        {p.rate_unit ?? ""}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{p.frac_irac_group ?? "\u2014"}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.phi_days != null ? `${p.phi_days}d` : "\u2014"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.rei_hours != null ? `${p.rei_hours}h` : "\u2014"}
                      </TableCell>
                      {areaHa > 0 && (
                        <TableCell className="font-medium">
                          {calculateProductAmount(p)}
                        </TableCell>
                      )}
                      {tankSizeL > 0 && (
                        <TableCell className="font-medium">
                          {calculateProductPerTank(p)}
                        </TableCell>
                      )}
                      <TableCell className="print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(p.id)}
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tank volume calculator */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-base">Tank Volume Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="tank-size">Tank Size</Label>
              <DualUnitInput
                id="tank-size"
                value={tankSize}
                unitType="volume"
                onChange={setTankSize}
                placeholder="e.g. 2000 L or 528 gal"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">Area to Cover</Label>
              <DualUnitInput
                id="area"
                value={areaToCover}
                unitType="area"
                onChange={setAreaToCover}
                placeholder="e.g. 5 ha or 12.4 ac"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="water-rate">Water Volume Rate</Label>
              <DualUnitInput
                id="water-rate"
                value={waterVolumeRate}
                unitType="sprayRateVolume"
                onChange={setWaterVolumeRate}
                placeholder="e.g. 1000 L/ha or 107 gal/ac"
              />
            </div>
          </div>

          {tankSizeL > 0 && areaHa > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
              <p>
                <strong>Total water needed:</strong>{" "}
                {(areaHa * waterRate).toLocaleString()}&nbsp;L ({toImperial(areaHa * waterRate, "volume").toFixed(0)}&nbsp;gal)
              </p>
              <p>
                <strong>Tanks needed:</strong> {tanksNeeded.toFixed(1)} loads
              </p>
              <p>
                <strong>Area per tank:</strong>{" "}
                {(tankSizeL / waterRate).toFixed(2)}&nbsp;ha ({toImperial(tankSizeL / waterRate, "area").toFixed(2)}&nbsp;ac)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mixing order */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListOrdered className="size-4" />
              Mixing Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {MIXING_ORDER_STEPS.map((step) => {
                const productsInStep = mixingOrderProducts.filter(
                  (p) => p.stepIndex === step.step - 1
                )
                const isWaterStep = step.step === 1 || step.step === 5

                return (
                  <li
                    key={step.step}
                    className="flex items-start gap-3"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {step.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{step.label}</p>
                      {!isWaterStep && productsInStep.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {productsInStep.map((p) => (
                            <Badge key={p.product.id} variant="secondary">
                              {p.product.product_name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Save template / actions */}
      {selectedProducts.length > 0 && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-base">Save &amp; Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Petal Fall Fungicide + Insecticide"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={saveTemplate} disabled={saving}>
                  <Save className="size-4 mr-1" />
                  {saving ? "Saving..." : "Save Template"}
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="size-4 mr-1" />
                  Print
                </Button>
              </div>
            </div>

            {feedback && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                }`}
              >
                {feedback.message}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
