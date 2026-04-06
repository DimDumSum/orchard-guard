"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

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
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Bell,
  Mail,
  Phone,
  Clock,
  Users,
  SendHorizonal,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"

import type { AlertChannel } from "@/lib/alerts/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build time options for quiet-hours selects (0-23 as readable labels). */
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => {
  const suffix = h >= 12 ? "PM" : "AM"
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return { value: String(h), label: `${display}:00 ${suffix}` }
})

const CHANNEL_OPTIONS: { value: AlertChannel; label: string }[] = [
  { value: "email", label: "Email only" },
  { value: "sms", label: "SMS only" },
  { value: "both", label: "Both email & SMS" },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AlertPreferencesPage() {
  // Contact info
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Channel
  const [channel, setChannel] = useState<AlertChannel>("email")

  // Alert levels
  const [urgentEnabled, setUrgentEnabled] = useState(true)
  const [warningEnabled, setWarningEnabled] = useState(true)
  const [preparationEnabled, setPreparationEnabled] = useState(true)

  // Quiet hours
  const [quietStart, setQuietStart] = useState(22)
  const [quietEnd, setQuietEnd] = useState(5)

  // Service status
  const [emailConfigured, setEmailConfigured] = useState(false)
  const [smsConfigured, setSmsConfigured] = useState(false)

  // Loading / saving state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Test alert state
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingSms, setTestingSms] = useState(false)
  const [testFeedback, setTestFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // ── Load preferences on mount ──
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/alerts/config?orchardId=1")
        if (!res.ok) throw new Error("Failed to load alert preferences")
        const data = await res.json()

        const prefs = data.prefs
        setEmail(prefs.email ?? "")
        setPhone(prefs.phone ?? "")
        setChannel(prefs.channel ?? "email")
        setUrgentEnabled(prefs.urgent_enabled === 1 || prefs.urgent_enabled === true)
        setWarningEnabled(prefs.warning_enabled === 1 || prefs.warning_enabled === true)
        setPreparationEnabled(prefs.preparation_enabled === 1 || prefs.preparation_enabled === true)
        setQuietStart(prefs.quiet_start ?? 22)
        setQuietEnd(prefs.quiet_end ?? 5)

        setEmailConfigured(data.services?.emailConfigured ?? false)
        setSmsConfigured(data.services?.smsConfigured ?? false)
      } catch {
        setFeedback({ type: "error", message: "Could not load alert preferences." })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Save preferences ──
  async function handleSave() {
    setSaving(true)
    setFeedback(null)

    try {
      const res = await fetch("/api/alerts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId: 1,
          email: email || null,
          phone: phone || null,
          channel,
          urgentEnabled,
          warningEnabled,
          preparationEnabled,
          quietStart,
          quietEnd,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save preferences")
      }

      setFeedback({ type: "success", message: "Alert preferences saved." })
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "An unexpected error occurred.",
      })
    } finally {
      setSaving(false)
    }
  }

  // ── Send test alert ──
  async function handleTest(testChannel: "email" | "sms") {
    const isEmail = testChannel === "email"
    if (isEmail) setTestingEmail(true)
    else setTestingSms(true)
    setTestFeedback(null)

    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: testChannel,
          email: email || null,
          phone: phone || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `Test ${testChannel} failed`)
      }

      setTestFeedback({ type: "success", message: `Test ${testChannel} sent successfully.` })
    } catch (err) {
      setTestFeedback({
        type: "error",
        message: err instanceof Error ? err.message : `Test ${testChannel} failed.`,
      })
    } finally {
      if (isEmail) setTestingEmail(false)
      else setTestingSms(false)
    }
  }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1
            className="text-[24px] font-bold text-bark-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            Alert Preferences
          </h1>
          <p className="text-[14px] text-bark-400 mt-1">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-[13px] text-bark-400 hover:text-bark-600 transition-colors mb-3"
        >
          <ArrowLeft className="size-3.5" />
          Back to Settings
        </Link>
        <h1
          className="text-[24px] font-bold text-bark-900"
          style={{ letterSpacing: "-0.02em" }}
        >
          Alert Preferences
        </h1>
        <p className="text-[14px] text-bark-400 mt-1">
          Configure how OrchardGuard notifies you about disease, pest, and weather events.
        </p>
      </div>

      {/* ── Contact Information ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Contact Information</h2>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="alert-email">Email</Label>
              <Input
                id="alert-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-phone">Phone (SMS)</Label>
              <Input
                id="alert-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-123-4567"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Alert Channels ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Alert Channels</h2>
        </div>

        <div className="space-y-1.5">
          <Label>Delivery Method</Label>
          <Select
            value={channel}
            onValueChange={(val) => val && setChannel(val as AlertChannel)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNEL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Alert Levels ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Alert Levels</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-body font-medium">Urgent Alerts</p>
              <p className="text-caption text-muted-foreground">
                Active infections, frost kill risk. Always recommended on.
              </p>
            </div>
            <Switch
              checked={urgentEnabled}
              onCheckedChange={(val) => setUrgentEnabled(val as boolean)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-body font-medium">Warning Alerts</p>
              <p className="text-caption text-muted-foreground">
                Upcoming risks, spray coverage expiring.
              </p>
            </div>
            <Switch
              checked={warningEnabled}
              onCheckedChange={(val) => setWarningEnabled(val as boolean)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-body font-medium">Preparation Alerts</p>
              <p className="text-caption text-muted-foreground">
                Seasonal tasks, upcoming milestones.
              </p>
            </div>
            <Switch
              checked={preparationEnabled}
              onCheckedChange={(val) => setPreparationEnabled(val as boolean)}
            />
          </div>
        </div>
      </div>

      {/* ── Quiet Hours ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Quiet Hours</h2>
        </div>

        <div className="space-y-4">
          <p className="text-body text-bark-600">
            Don&apos;t send non-urgent alerts between:
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Select
                value={String(quietStart)}
                onValueChange={(val) => val && setQuietStart(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>End</Label>
              <Select
                value={String(quietEnd)}
                onValueChange={(val) => val && setQuietEnd(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-caption text-muted-foreground italic">
            Urgent alerts always come through regardless of quiet hours.
          </p>
        </div>
      </div>

      {/* ── Worker Notifications ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Worker Notifications</h2>
        </div>

        <p className="text-body text-bark-600">
          To add worker phone numbers for REI notifications, go to the{" "}
          <Link
            href="/workers"
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            Workers page
          </Link>
          .
        </p>
      </div>

      {/* ── Test Alerts ── */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <SendHorizonal className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Test Alerts</h2>
        </div>

        <div className="space-y-4">
          {/* Service status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-body text-bark-600">
              <span
                className={`inline-block size-2 rounded-full ${
                  emailConfigured ? "bg-grove-600" : "bg-bark-400"
                }`}
              />
              Resend: {emailConfigured ? "configured" : "not configured"}
            </div>
            <div className="flex items-center gap-2 text-body text-bark-600">
              <span
                className={`inline-block size-2 rounded-full ${
                  smsConfigured ? "bg-grove-600" : "bg-bark-400"
                }`}
              />
              Twilio: {smsConfigured ? "configured" : "not configured"}
            </div>
          </div>

          {/* Test buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => handleTest("email")}
              disabled={testingEmail || !email}
            >
              {testingEmail ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 size-4" />
                  Send test email
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleTest("sms")}
              disabled={testingSms || !phone}
            >
              {testingSms ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Phone className="mr-2 size-4" />
                  Send test SMS
                </>
              )}
            </Button>
          </div>

          {/* Test feedback */}
          {testFeedback && (
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-body ${
                testFeedback.type === "success"
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {testFeedback.type === "success" ? (
                <Check className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              {testFeedback.message}
            </div>
          )}
        </div>
      </div>

      {/* ── Save Feedback ── */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-body ${
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

      {/* ── Save Button ── */}
      <div className="sticky bottom-4 z-10 sm:static sm:bottom-auto">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-grove-600 text-white hover:bg-grove-600/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  )
}
