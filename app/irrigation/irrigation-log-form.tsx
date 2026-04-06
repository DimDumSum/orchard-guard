"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Droplets, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface IrrigationLogFormProps {
  irrigationType: string
  rateMmPerHour: number
  blockAreaHa: number
  waterCostPerM3: number
}

export function IrrigationLogForm({
  irrigationType,
  rateMmPerHour,
  blockAreaHa,
  waterCostPerM3,
}: IrrigationLogFormProps) {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [durationHours, setDurationHours] = useState("")
  const [amountMm, setAmountMm] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Auto-calculate from duration
  const calculatedAmount = durationHours
    ? (parseFloat(durationHours) * rateMmPerHour).toFixed(1)
    : ""
  const displayAmount = amountMm || calculatedAmount
  const volumeM3 = displayAmount
    ? (parseFloat(displayAmount) * 10 * blockAreaHa).toFixed(0)
    : "—"
  const cost = displayAmount
    ? (parseFloat(displayAmount) * 10 * blockAreaHa * waterCostPerM3).toFixed(2)
    : "—"

  async function handleSubmit() {
    setSaving(true)
    setFeedback(null)

    try {
      const res = await fetch("/api/irrigation/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          duration_hours: durationHours ? parseFloat(durationHours) : undefined,
          amount_mm: amountMm ? parseFloat(amountMm) : undefined,
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to log irrigation")
      }

      setFeedback({ type: "success", message: "Irrigation logged." })
      setDurationHours("")
      setAmountMm("")
      setNotes("")
      router.refresh()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "An error occurred.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
      <div className="px-7 pt-5 pb-3">
        <h2 className="text-section-title text-bark-600">Log Irrigation</h2>
      </div>
      <div className="px-7 pb-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="irrig-date">Date</Label>
          <Input
            id="irrig-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="irrig-duration">Duration (hours)</Label>
            <Input
              id="irrig-duration"
              type="number"
              step="0.5"
              placeholder="e.g. 8"
              value={durationHours}
              onChange={(e) => {
                setDurationHours(e.target.value)
                setAmountMm("")
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="irrig-amount">Or amount (mm)</Label>
            <Input
              id="irrig-amount"
              type="number"
              step="0.1"
              placeholder="auto-calc"
              value={amountMm || calculatedAmount}
              onChange={(e) => {
                setAmountMm(e.target.value)
                setDurationHours("")
              }}
            />
          </div>
        </div>

        {/* Auto-calculated summary */}
        {displayAmount && (
          <div className="rounded-lg bg-secondary/50 px-4 py-2.5">
            <p className="text-[12px] text-bark-400">
              <span className="font-medium text-bark-600">{displayAmount} mm</span> applied via{" "}
              {irrigationType} &middot; {volumeM3} m&sup3; &middot; ~${cost}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="irrig-notes">Notes</Label>
          <Input
            id="irrig-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
          />
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${
              feedback.type === "success"
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.type === "success" ? (
              <Check className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            {feedback.message}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={saving || (!durationHours && !amountMm)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Droplets className="mr-2 size-4" />
              Log Irrigation
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
