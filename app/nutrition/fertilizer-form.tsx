"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FlaskConical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const METHOD_OPTIONS = [
  { value: "broadcast", label: "Broadcast" },
  { value: "foliar", label: "Foliar" },
  { value: "fertigation", label: "Fertigation" },
  { value: "banded", label: "Banded" },
] as const

const TARGET_NUTRIENT_OPTIONS = [
  { value: "nitrogen", label: "Nitrogen (N)" },
  { value: "phosphorus", label: "Phosphorus (P)" },
  { value: "potassium", label: "Potassium (K)" },
  { value: "calcium", label: "Calcium (Ca)" },
  { value: "magnesium", label: "Magnesium (Mg)" },
  { value: "boron", label: "Boron (B)" },
  { value: "zinc", label: "Zinc (Zn)" },
  { value: "manganese", label: "Manganese (Mn)" },
  { value: "iron", label: "Iron (Fe)" },
  { value: "sulfur", label: "Sulfur (S)" },
  { value: "multi", label: "Multi-nutrient" },
  { value: "lime", label: "Lime / pH adjustment" },
  { value: "other", label: "Other" },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FertilizerForm() {
  const router = useRouter()

  const [date, setDate] = useState(todayStr())
  const [productName, setProductName] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [rate, setRate] = useState("")
  const [rateUnit, setRateUnit] = useState("")
  const [method, setMethod] = useState("")
  const [targetNutrient, setTargetNutrient] = useState("")
  const [cost, setCost] = useState("")
  const [notes, setNotes] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    try {
      if (!date || !productName) {
        throw new Error("Date and product name are required.")
      }

      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          product_name: productName,
          analysis: analysis || null,
          rate: rate ? parseFloat(rate) : null,
          rate_unit: rateUnit || null,
          method: method || "broadcast",
          target_nutrient: targetNutrient || null,
          cost: cost ? parseFloat(cost) : null,
          notes: notes || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to add fertilizer entry")
      }

      // Reset form
      setProductName("")
      setAnalysis("")
      setRate("")
      setRateUnit("")
      setMethod("")
      setTargetNutrient("")
      setCost("")
      setNotes("")
      setDate(todayStr())

      setFeedback({
        type: "success",
        message: "Fertilizer application logged.",
      })
      router.refresh()
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="size-4" />
          Log Fertilizer Application
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="fert-date">Date</Label>
              <Input
                id="fert-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fert-product">Product Name</Label>
              <Input
                id="fert-product"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Calcium Chloride, Solubor"
                required
              />
            </div>

            {/* Analysis */}
            <div className="space-y-1.5">
              <Label htmlFor="fert-analysis">Analysis</Label>
              <Input
                id="fert-analysis"
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                placeholder="e.g. 20-10-10, 0-0-0-20Ca"
              />
            </div>

            {/* Rate */}
            <div className="space-y-1.5">
              <Label htmlFor="fert-rate">Rate</Label>
              <Input
                id="fert-rate"
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>

            {/* Rate Unit */}
            <div className="space-y-1.5">
              <Label htmlFor="fert-rate-unit">Rate Unit</Label>
              <Input
                id="fert-rate-unit"
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value)}
                placeholder="e.g. kg/ha, L/ha, g/L"
              />
            </div>

            {/* Method */}
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select
                value={method}
                onValueChange={(val) => val && setMethod(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Nutrient */}
            <div className="space-y-1.5">
              <Label>Target Nutrient</Label>
              <Select
                value={targetNutrient}
                onValueChange={(val) => val && setTargetNutrient(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select nutrient" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_NUTRIENT_OPTIONS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cost */}
            <div className="space-y-1.5">
              <Label htmlFor="fert-cost">Cost ($)</Label>
              <Input
                id="fert-cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 85.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="fert-notes">Notes</Label>
            <Textarea
              id="fert-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Weather conditions, application observations, etc."
            />
          </div>

          {/* Feedback */}
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

          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Log Fertilizer Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
