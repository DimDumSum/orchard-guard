// ---------------------------------------------------------------------------
// Alert Sender — Orchestrates delivery via email and SMS with cooldown,
// quiet hours, and preference checks.
// ---------------------------------------------------------------------------

import { sendEmail } from "./email"
import { sendSms } from "./sms"
import type {
  AlertPreferences,
  PendingAlert,
  AlertEvaluation,
  AlertLevel,
  SendResult,
} from "./types"
import { getDb } from "@/lib/db"

// ---------------------------------------------------------------------------
// Quiet hours check
// ---------------------------------------------------------------------------

function isQuietHours(prefs: AlertPreferences): boolean {
  const hour = new Date().getHours()
  const { quietStart, quietEnd } = prefs
  if (quietStart === quietEnd) return false // disabled
  if (quietStart > quietEnd) {
    // Wraps midnight, e.g. 22-5
    return hour >= quietStart || hour < quietEnd
  }
  return hour >= quietStart && hour < quietEnd
}

// ---------------------------------------------------------------------------
// Cooldown check — prevent duplicate alerts within window
// ---------------------------------------------------------------------------

function wasRecentlySent(
  orchardId: number,
  model: string,
  level: AlertLevel,
  cooldownHours: number,
): boolean {
  try {
    const db = getDb()
    const cutoff = new Date(Date.now() - cooldownHours * 3600000).toISOString()
    const row = db.prepare(
      `SELECT id FROM alert_log
       WHERE orchard_id = ? AND model = ? AND risk_level = ?
         AND sent_at > ?
       LIMIT 1`,
    ).get(orchardId, model, level, cutoff) as { id: number } | undefined
    return !!row
  } catch {
    return false
  }
}

function logAlert(
  orchardId: number,
  model: string,
  riskLevel: string,
  message: string,
  channel: string,
): void {
  try {
    const db = getDb()
    db.prepare(
      `INSERT INTO alert_log (orchard_id, model, risk_level, message, channel)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(orchardId, model, riskLevel, message, channel)
  } catch (err) {
    console.error("[alerts] Failed to log alert:", err)
  }
}

// ---------------------------------------------------------------------------
// Main send function
// ---------------------------------------------------------------------------

export async function sendAlerts(
  evaluation: AlertEvaluation,
  prefs: AlertPreferences,
  orchardName: string,
): Promise<SendResult[]> {
  const results: SendResult[] = []
  const quiet = isQuietHours(prefs)

  // Collect alerts to send based on preferences
  const toSend: PendingAlert[] = []

  // URGENT — always send (even during quiet hours)
  if (prefs.urgentEnabled) {
    for (const alert of evaluation.urgent) {
      if (!wasRecentlySent(prefs.orchardId, alert.model, "urgent", 4)) {
        toSend.push(alert)
      }
    }
  }

  // WARNING — respect quiet hours, 12h cooldown
  if (prefs.warningEnabled && !quiet) {
    for (const alert of evaluation.warning) {
      if (!wasRecentlySent(prefs.orchardId, alert.model, "warning", 12)) {
        toSend.push(alert)
      }
    }
  }

  // PREPARATION — respect quiet hours, 24h cooldown
  if (prefs.preparationEnabled && !quiet) {
    for (const alert of evaluation.preparation) {
      if (!wasRecentlySent(prefs.orchardId, alert.model, "preparation", 24)) {
        toSend.push(alert)
      }
    }
  }

  if (toSend.length === 0) {
    return [{ success: true, channel: "dashboard" }]
  }

  // Send via configured channels
  const useEmail = (prefs.channel === "email" || prefs.channel === "both") && prefs.email
  const useSms = (prefs.channel === "sms" || prefs.channel === "both") && prefs.phone

  if (useEmail) {
    const result = await sendEmail(prefs.email!, toSend, orchardName)
    results.push({ success: result.success, channel: "email", error: result.error })
  }

  if (useSms) {
    // For SMS, only send urgent alerts immediately; batch others
    const urgentAlerts = toSend.filter((a) => a.level === "urgent")
    const otherAlerts = toSend.filter((a) => a.level !== "urgent")

    if (urgentAlerts.length > 0) {
      const result = await sendSms(prefs.phone!, urgentAlerts)
      results.push({ success: result.success, channel: "sms", error: result.error })
    }

    // Non-urgent: only send if there are no urgent alerts (avoid double-texting)
    if (urgentAlerts.length === 0 && otherAlerts.length > 0) {
      const result = await sendSms(prefs.phone!, otherAlerts)
      results.push({ success: result.success, channel: "sms", error: result.error })
    }
  }

  // Log all sent alerts
  for (const alert of toSend) {
    const channel = useEmail && useSms ? "both" : useEmail ? "email" : useSms ? "sms" : "dashboard"
    logAlert(prefs.orchardId, alert.model, alert.level, alert.message, channel)
  }

  return results
}

// ---------------------------------------------------------------------------
// Send REI notification to workers
// ---------------------------------------------------------------------------

export async function sendWorkerReiAlert(
  phone: string | null,
  email: string | null,
  workerName: string,
  product: string,
  reiHours: number,
  orchardName: string,
): Promise<SendResult[]> {
  const results: SendResult[] = []
  const alert: PendingAlert = {
    level: "urgent",
    model: "rei",
    title: "REI Restriction Lifted",
    message: `The ${reiHours}-hour re-entry interval for ${product} has expired. ${workerName}, you can safely re-enter the treated area in ${orchardName}.`,
    action: "Re-entry is now permitted. Follow all label requirements.",
    detectedAt: new Date().toISOString(),
  }

  if (email) {
    const result = await sendEmail(email, [alert], orchardName)
    results.push({ success: result.success, channel: "email", error: result.error })
  }

  if (phone) {
    const result = await sendSms(phone, [alert])
    results.push({ success: result.success, channel: "sms", error: result.error })
  }

  return results
}
