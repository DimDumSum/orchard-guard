// ---------------------------------------------------------------------------
// SMS Delivery — Twilio integration
//
// Twilio pay-as-you-go: ~$0.01/SMS (US/Canada)
// Signup: https://www.twilio.com/try-twilio
// Console: https://console.twilio.com
//
// After signup:
//   1. Get Account SID and Auth Token from console dashboard
//   2. Buy a phone number (~$1.15/month) or use trial number
//   3. Add all three values to .env.local
// ---------------------------------------------------------------------------

import type { PendingAlert, AlertLevel } from "./types"

// Lazy-load Twilio client to avoid import errors when not installed
let _twilioClient: any = null

function getTwilioClient(): any | null {
  if (_twilioClient) return _twilioClient
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return null
  try {
    // Dynamic import to avoid hard dependency
    const twilio = require("twilio")
    _twilioClient = twilio(sid, token)
    return _twilioClient
  } catch {
    return null
  }
}

export function isSmsConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  )
}

const LEVEL_PREFIX: Record<AlertLevel, string> = {
  urgent: "\u{1F6A8} URGENT",
  warning: "\u{26A0}\u{FE0F} WARNING",
  preparation: "\u{1F4CB} HEADS UP",
}

function buildSmsBody(alerts: PendingAlert[]): string {
  // SMS has 1600 char limit for long SMS; keep it concise
  if (alerts.length === 1) {
    const a = alerts[0]
    let body = `${LEVEL_PREFIX[a.level]}: ${a.title}\n${a.message}`
    if (a.action) body += `\n${a.action}`
    // Truncate if too long
    if (body.length > 1500) body = body.slice(0, 1497) + "..."
    return body
  }

  // Multiple alerts — summarize
  let body = `OrchardGuard: ${alerts.length} alerts\n\n`
  for (const a of alerts.slice(0, 3)) {
    body += `${LEVEL_PREFIX[a.level]}: ${a.title}\n`
    // Shorter message for multi-alert SMS
    const shortMsg = a.message.length > 100 ? a.message.slice(0, 97) + "..." : a.message
    body += `${shortMsg}\n\n`
  }
  if (alerts.length > 3) {
    body += `+${alerts.length - 3} more. Check OrchardGuard dashboard.`
  }

  if (body.length > 1500) body = body.slice(0, 1497) + "..."
  return body
}

export async function sendSms(
  to: string,
  alerts: PendingAlert[],
): Promise<{ success: boolean; error?: string }> {
  const client = getTwilioClient()
  if (!client) {
    return { success: false, error: "Twilio not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to .env.local" }
  }

  const from = process.env.TWILIO_FROM_NUMBER
  if (!from) {
    return { success: false, error: "TWILIO_FROM_NUMBER not set in .env.local" }
  }

  if (alerts.length === 0) {
    return { success: true }
  }

  try {
    await client.messages.create({
      body: buildSmsBody(alerts),
      from,
      to,
    })
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown SMS error",
    }
  }
}

export async function sendTestSms(
  to: string,
): Promise<{ success: boolean; error?: string }> {
  return sendSms(to, [{
    level: "warning",
    model: "test",
    title: "Test Alert",
    message: "This is a test from OrchardGuard. If you received this, your SMS alerts are working.",
    action: null,
    detectedAt: new Date().toISOString(),
  }])
}
