"use client"

import { useState } from "react"
import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ScoutingObservationButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [block, setBlock] = useState("")
  const [severity, setSeverity] = useState("trace")
  const [notes, setNotes] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch("/api/scouting/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_slug: slug,
          date,
          block: block || null,
          severity,
          notes: notes || null,
        }),
      })
      setSaved(true)
      setTimeout(() => {
        setOpen(false)
        setSaved(false)
        setNotes("")
        setBlock("")
        setSeverity("trace")
      }, 1200)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Log Scouting Observation
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Scouting Observation</DialogTitle>
          <DialogDescription>
            Record what you found in the field for {slug.replace(/-/g, " ")}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="obs-date">Date</Label>
              <Input id="obs-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="obs-block">Block</Label>
              <Input id="obs-block" placeholder="e.g. Block A" value={block} onChange={(e) => setBlock(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="obs-severity">Severity</Label>
            <div className="flex gap-2 mt-1">
              {(["trace", "light", "moderate", "severe"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    severity === s
                      ? "bg-grove-600 text-white border-grove-600"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="obs-notes">Notes</Label>
            <Textarea
              id="obs-notes"
              placeholder="What did you see? Count, location, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving}>
              {saved ? "Saved!" : saving ? "Saving..." : "Save Observation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
