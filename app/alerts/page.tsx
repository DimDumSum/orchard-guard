// ---------------------------------------------------------------------------
// OrchardGuard Alert Preferences Page — Server Component
//
// Loads current alert prefs + service status, renders the client-side form.
// ---------------------------------------------------------------------------

import { getAlertPrefs, getOrchard } from "@/lib/db"
import { isEmailConfigured } from "@/lib/alerts/email"
import { isSmsConfigured } from "@/lib/alerts/sms"
import { AlertsForm } from "./alerts-form"
import { Bell, Info } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AlertsPage() {
  const orchardId = 1
  const prefs = getAlertPrefs(orchardId)
  const orchard = getOrchard(orchardId)

  const initialPrefs = prefs ?? {
    orchard_id: orchardId,
    email: null,
    phone: null,
    urgent_enabled: 1,
    warning_enabled: 1,
    preparation_enabled: 1,
    quiet_start: 22,
    quiet_end: 5,
    channel: "email" as const,
  }

  const services = {
    emailConfigured: isEmailConfigured(),
    smsConfigured: isSmsConfigured(),
  }

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-[24px] font-bold text-bark-900"
          style={{ letterSpacing: "-0.02em" }}
        >
          Alert Preferences
        </h1>
        <p className="text-[14px] text-bark-400 mt-1">
          Configure how and when OrchardGuard sends you disease, pest, and
          weather alerts.
        </p>
      </div>

      {/* Service status banner */}
      {!services.emailConfigured && !services.smsConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              No alert services configured
            </p>
            <p className="text-amber-700 dark:text-amber-300 mt-1">
              Add your Resend API key (email) or Twilio credentials (SMS) to{" "}
              <code className="bg-amber-100 dark:bg-amber-900 px-1.5 py-0.5 rounded text-xs font-mono">
                .env.local
              </code>{" "}
              to enable alert delivery. See the comments in that file for signup
              links.
            </p>
          </div>
        </div>
      )}

      <AlertsForm
        initialPrefs={initialPrefs}
        services={services}
        orchardName={orchard?.name ?? "OrchardGuard"}
      />

      {/* Alert level reference */}
      <div className="rounded-xl border border-border bg-card card-shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="size-5 text-primary" />
          <h2 className="text-card-title font-semibold">Alert Levels</h2>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <span
              className="mt-1 size-3 rounded-full shrink-0"
              style={{ backgroundColor: "#dc2626" }}
            />
            <div>
              <p className="font-semibold text-bark-800">
                Urgent &mdash; Immediate
              </p>
              <p className="text-bark-500">
                Active infection events, frost kill during bloom, fire blight
                extreme risk. Sent immediately, even during quiet hours.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1 size-3 rounded-full shrink-0"
              style={{ backgroundColor: "#f59e0b" }}
            />
            <div>
              <p className="font-semibold text-bark-800">
                Warning &mdash; Morning Digest
              </p>
              <p className="text-bark-500">
                Upcoming infection risk in 48h, pest emergence approaching, spray
                coverage expiring. Batched into a 6 AM summary.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1 size-3 rounded-full shrink-0"
              style={{ backgroundColor: "#3b82f6" }}
            />
            <div>
              <p className="font-semibold text-bark-800">
                Preparation &mdash; 3 Days Ahead
              </p>
              <p className="text-bark-500">
                Rain + warm temps coming, get spray equipment ready, check
                inventory. Gives you lead time to prepare.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
