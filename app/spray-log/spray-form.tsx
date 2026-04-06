"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TARGET_OPTIONS = [
  { value: "fire_blight", label: "Fire Blight" },
  { value: "apple_scab", label: "Apple Scab" },
  { value: "codling_moth", label: "Codling Moth" },
  { value: "powdery_mildew", label: "Powdery Mildew" },
  { value: "cedar_rust", label: "Cedar Apple Rust" },
  { value: "sooty_blotch", label: "Sooty Blotch / Flyspeck" },
  { value: "black_rot", label: "Black Rot" },
  { value: "plum_curculio", label: "Plum Curculio" },
  { value: "apple_maggot", label: "Apple Maggot" },
  { value: "oriental_fruit_moth", label: "Oriental Fruit Moth" },
  { value: "leafroller", label: "Leafroller" },
  { value: "european_red_mite", label: "European Red Mite" },
  { value: "general_fungicide", label: "General Fungicide" },
  { value: "general_insecticide", label: "General Insecticide" },
  { value: "other", label: "Other" },
] as const

/** Return today's date as YYYY-MM-DD in local time. */
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

export function SprayForm() {
  const router = useRouter()

  const [date, setDate] = useState(todayStr())
  const [product, setProduct] = useState("")
  const [rate, setRate] = useState("")
  const [target, setTarget] = useState("")
  const [phiDays, setPhiDays] = useState("")
  const [reiHours, setReiHours] = useState("")
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
      if (!date || !product || !target) {
        throw new Error("Date, product, and target are required.")
      }

      const res = await fetch("/api/spray-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId: 1,
          date,
          product,
          rate: rate || null,
          target,
          phiDays: phiDays ? parseInt(phiDays, 10) : null,
          reiHours: reiHours ? parseInt(reiHours, 10) : null,
          notes: notes || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to add spray entry")
      }

      // Reset form
      setProduct("")
      setRate("")
      setTarget("")
      setPhiDays("")
      setReiHours("")
      setNotes("")
      setDate(todayStr())

      setFeedback({ type: "success", message: "Spray entry added." })
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
    <div className="rounded-xl border border-border bg-card card-shadow p-6">
      <h2 className="text-card-title mb-4">Add Spray</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="spray-date">Date</Label>
            <Input
              id="spray-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Product */}
          <div className="space-y-1.5">
            <Label htmlFor="spray-product">Product</Label>
            <Input
              id="spray-product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Streptomycin, Captan"
              required
            />
          </div>

          {/* Rate */}
          <div className="space-y-1.5">
            <Label htmlFor="spray-rate">Rate</Label>
            <Input
              id="spray-rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 2 L/ha"
            />
          </div>

          {/* Target */}
          <div className="space-y-1.5">
            <Label>Target</Label>
            <Select value={target} onValueChange={(val) => val && setTarget(val)} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PHI Days */}
          <div className="space-y-1.5">
            <Label htmlFor="spray-phi">PHI (days)</Label>
            <Input
              id="spray-phi"
              type="number"
              min="0"
              value={phiDays}
              onChange={(e) => setPhiDays(e.target.value)}
              placeholder="Pre-harvest interval"
            />
          </div>

          {/* REI Hours */}
          <div className="space-y-1.5">
            <Label htmlFor="spray-rei">REI (hours)</Label>
            <Input
              id="spray-rei"
              type="number"
              min="0"
              value={reiHours}
              onChange={(e) => setReiHours(e.target.value)}
              placeholder="Re-entry interval"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="spray-notes">Notes</Label>
          <Textarea
            id="spray-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Weather conditions, coverage observations, etc."
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "bg-risk-low/10 text-risk-low"
                : "bg-risk-high/10 text-risk-high"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Spray Entry"}
        </Button>
      </form>
    </div>
  )
}
