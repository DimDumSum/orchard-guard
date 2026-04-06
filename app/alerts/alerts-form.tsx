"use client"

import { useState } from "react"
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
  Mail,
  Phone,
  Bell,
  BellOff,
  Moon,
  Send,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  History,
  Trash2,
  Plus,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AlertPrefsRow {
  orchard_id: number
  email: string | null
  phone: string | null
  urgent_enabled: number
  warning_enabled: number
  preparation_enabled: number
  quiet_start: number
  quiet_end: number
  channel: string
}

interface Props {
  initialPrefs: AlertPrefsRow
  services: { emailConfigured: boolean; smsConfigured: boolean }
  orchardName: string
}

interface AlertHistoryEntry {
  id: number
  model: string
  risk_level: string
  message: string
  sent_at: string
  channel: string
  level: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AlertsForm({ initialPrefs, services, orchardName }: Props) {
  // Form state
  const [email, setEmail] = useState(initialPrefs.email ?? "")
  const [phone, setPhone] = useState(initialPrefs.phone ?? "")
  const [channel, setChannel] = useState(initialPrefs.channel ?? "email")
  const [urgentEnabled, setUrgentEnabled] = useState(
    initialPrefs.urgent_enabled === 1,
  )
  const [warningEnabled, setWarningEnabled] = useState(
    initialPrefs.warning_enabled === 1,
  )
  const [preparationEnabled, setPreparationEnabled] = useState(
    initialPrefs.preparation_enabled === 1,
  )
  const [quietStart, setQuietStart] = useState(initialPrefs.quiet_start)
  const [quietEnd, setQuietEnd] = useState(initialPrefs.quiet_end)

  // Worker phones for REI notifications
  const [workerPhones, setWorkerPhones] = useState<string[]>([])
  const [newWorkerPhone, setNewWorkerPhone] = useState("")

  // UI state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")

  const [testingEmail, setTestingEmail] = useState(false)
  const [testingSms, setTestingSms] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [history, setHistory] = useState<AlertHistoryEntry[] | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // ---------------------------------------------------------------------------
  // Save preferences
  // ---------------------------------------------------------------------------
  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setSaveError("")
    try {
      const res = await fetch("/api/alerts/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId: initialPrefs.orchard_id,
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
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setSaveError(data.error || "Failed to save")
      }
    } catch {
      setSaveError("Network error — could not save")
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Test alert
  // ---------------------------------------------------------------------------
  async function handleTest(testChannel: "email" | "sms") {
    const isSms = testChannel === "sms"
    if (isSms) setTestingSms(true)
    else setTestingEmail(true)
    setTestResult(null)

    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: testChannel,
          email: email || undefined,
          phone: phone || undefined,
        }),
      })
      const data = await res.json()
      setTestResult({
        success: data.success,
        message: data.success
          ? `Test ${testChannel} sent successfully!`
          : data.error || "Test failed",
      })
    } catch {
      setTestResult({ success: false, message: "Network error" })
    } finally {
      if (isSms) setTestingSms(false)
      else setTestingEmail(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Load history
  // ---------------------------------------------------------------------------
  async function loadHistory() {
    setLoadingHistory(true)
    try {
      const res = await fetch(
        `/api/alerts/history?orchardId=${initialPrefs.orchard_id}&limit=20`,
      )
      const data = await res.json()
      setHistory(data.alerts ?? [])
    } catch {
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Worker phone helpers
  // ---------------------------------------------------------------------------
  function addWorkerPhone() {
    const trimmed = newWorkerPhone.trim()
    if (trimmed && !workerPhones.includes(trimmed)) {
      setWorkerPhones([...workerPhones, trimmed])
      setNewWorkerPhone("")
    }
  }

  function removeWorkerPhone(idx: number) {
    setWorkerPhones(workerPhones.filter((_, i) => i !== idx))
  }

  // ---------------------------------------------------------------------------
  // Hour options for quiet hours
  // ---------------------------------------------------------------------------
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label:
      i === 0
        ? "12 AM"
        : i < 12
          ? `${i} AM`
          : i === 12
            ? "12 PM"
            : `${i - 12} PM`,
  }))

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">
            Contact Information
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="alert-email">Email Address</Label>
            <div className="relative">
              <Input
                id="alert-email"
                type="email"
                placeholder="grower@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
              {services.emailConfigured && (
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-grove-500" />
              )}
            </div>
            <p className="text-xs text-bark-400">
              {services.emailConfigured
                ? "Resend API key configured — email delivery active"
                : "Add RESEND_API_KEY to .env.local to enable email"}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alert-phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="alert-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
              />
              {services.smsConfigured && (
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-grove-500" />
              )}
            </div>
            <p className="text-xs text-bark-400">
              {services.smsConfigured
                ? "Twilio credentials configured — SMS delivery active"
                : "Add Twilio credentials to .env.local to enable SMS"}
            </p>
          </div>
        </div>

        {/* Delivery channel */}
        <div className="mt-4 space-y-2">
          <Label>Delivery Channel</Label>
          <Select value={channel} onValueChange={(v) => v && setChannel(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email only</SelectItem>
              <SelectItem value="sms">SMS only</SelectItem>
              <SelectItem value="both">Email + SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          {services.emailConfigured && email && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTest("email")}
              disabled={testingEmail}
            >
              {testingEmail ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Test Email
            </Button>
          )}
          {services.smsConfigured && phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTest("sms")}
              disabled={testingSms}
            >
              {testingSms ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Phone className="size-4" />
              )}
              Test SMS
            </Button>
          )}
        </div>

        {testResult && (
          <div
            className={`mt-3 flex items-center gap-2 text-sm ${
              testResult.success ? "text-grove-600" : "text-red-600"
            }`}
          >
            {testResult.success ? (
              <Check className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            {testResult.message}
          </div>
        )}
      </div>

      {/* Alert Levels */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Alert Levels</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: "#dc2626" }}
              />
              <div>
                <p className="text-sm font-medium">Urgent</p>
                <p className="text-xs text-bark-400">
                  Active infections, frost kill, fire blight extreme
                </p>
              </div>
            </div>
            <Switch
              checked={urgentEnabled}
              onCheckedChange={setUrgentEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <div>
                <p className="text-sm font-medium">Warning</p>
                <p className="text-xs text-bark-400">
                  48h infection risk, pest emergence, spray expiring
                </p>
              </div>
            </div>
            <Switch
              checked={warningEnabled}
              onCheckedChange={setWarningEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: "#3b82f6" }}
              />
              <div>
                <p className="text-sm font-medium">Preparation</p>
                <p className="text-xs text-bark-400">
                  3-day forecasts, equipment prep, inventory check
                </p>
              </div>
            </div>
            <Switch
              checked={preparationEnabled}
              onCheckedChange={setPreparationEnabled}
            />
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-2">
          <Moon className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Quiet Hours</h2>
        </div>
        <p className="text-xs text-bark-400 mb-4">
          No alerts during these hours except <strong>Urgent</strong>, which
          always come through immediately.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="space-y-1">
            <Label className="text-xs">Start</Label>
            <Select
              value={String(quietStart)}
              onValueChange={(v) => v != null && setQuietStart(Number(v))}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hourOptions.map((h) => (
                  <SelectItem key={h.value} value={h.value}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-bark-400 mt-5">to</span>
          <div className="space-y-1">
            <Label className="text-xs">End</Label>
            <Select
              value={String(quietEnd)}
              onValueChange={(v) => v != null && setQuietEnd(Number(v))}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hourOptions.map((h) => (
                  <SelectItem key={h.value} value={h.value}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Worker Phone Numbers for REI */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">
            Worker REI Notifications
          </h2>
        </div>
        <p className="text-xs text-bark-400 mb-4">
          Add phone numbers for workers who need Re-Entry Interval alerts when
          sprays are logged. Requires Twilio SMS to be configured.
        </p>

        <div className="space-y-3">
          {workerPhones.map((wp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={wp}
                readOnly
                className="w-[200px] bg-earth-50 dark:bg-earth-900"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeWorkerPhone(idx)}
              >
                <Trash2 className="size-4 text-red-500" />
              </Button>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Input
              placeholder="+1 (555) 123-4567"
              value={newWorkerPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewWorkerPhone(e.target.value)
              }
              className="w-[200px]"
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addWorkerPhone()
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addWorkerPhone}
              disabled={!newWorkerPhone.trim()}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>

          {!services.smsConfigured && (
            <p className="text-xs text-amber-600">
              SMS is not configured. Add Twilio credentials to .env.local to
              enable worker REI notifications.
            </p>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <Check className="size-4" />
          ) : (
            <Bell className="size-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
        </Button>

        {saveError && (
          <span className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="size-4" />
            {saveError}
          </span>
        )}
      </div>

      {/* Alert History */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <h2 className="text-card-title font-semibold">
              Recent Alert History
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadHistory}
            disabled={loadingHistory}
          >
            {loadingHistory ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Clock className="size-4" />
            )}
            Load History
          </Button>
        </div>

        {history !== null && (
          <div>
            {history.length === 0 ? (
              <p className="text-sm text-bark-400">
                No alerts sent yet. Alerts will appear here once triggered.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg border border-earth-100 p-3 text-sm"
                  >
                    <span
                      className="mt-1 size-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          entry.level === "urgent"
                            ? "#dc2626"
                            : entry.level === "warning"
                              ? "#f59e0b"
                              : "#3b82f6",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-bark-700 capitalize">
                          {entry.level}
                        </span>
                        <span className="text-bark-400">&middot;</span>
                        <span className="text-bark-400 text-xs">
                          {entry.model}
                        </span>
                        <span className="text-bark-400">&middot;</span>
                        <span className="text-bark-400 text-xs">
                          {new Date(entry.sent_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-bark-600 mt-0.5 truncate">
                        {entry.message}
                      </p>
                    </div>
                    <span className="text-xs text-bark-400 uppercase shrink-0">
                      {entry.channel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
