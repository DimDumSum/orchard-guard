// ---------------------------------------------------------------------------
// Email Delivery — Resend integration
//
// Resend free tier: 100 emails/day, 1 sending domain
// Signup: https://resend.com/signup
// API key: https://resend.com/api-keys
// ---------------------------------------------------------------------------

import { Resend } from "resend"
import type { PendingAlert, AlertLevel } from "./types"

let _resend: Resend | null = null

function getResend(): Resend | null {
  if (_resend) return _resend
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  _resend = new Resend(key)
  return _resend
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

const LEVEL_EMOJI: Record<AlertLevel, string> = {
  urgent: "\u{1F6A8}",
  warning: "\u{26A0}\u{FE0F}",
  preparation: "\u{1F4CB}",
}

const LEVEL_SUBJECT: Record<AlertLevel, string> = {
  urgent: "URGENT",
  warning: "Warning",
  preparation: "Heads Up",
}

function buildHtml(alerts: PendingAlert[], orchardName: string): string {
  const sections = alerts.map((a) => {
    const emoji = LEVEL_EMOJI[a.level]
    return `
      <div style="border-left: 4px solid ${a.level === "urgent" ? "#D62828" : a.level === "warning" ? "#E9A820" : "#2D6A4F"}; padding: 12px 16px; margin-bottom: 12px; background: #FAFAF7; border-radius: 4px;">
        <p style="margin: 0 0 4px; font-weight: 600; font-size: 15px; color: #1B1B18;">
          ${emoji} ${a.title}
        </p>
        <p style="margin: 0 0 8px; font-size: 14px; color: #5A4A3A; line-height: 1.6;">
          ${a.message}
        </p>
        ${a.action ? `<p style="margin: 0; font-size: 13px; font-weight: 500; color: ${a.level === "urgent" ? "#D62828" : "#2D6A4F"};">${a.action}</p>` : ""}
      </div>
    `
  })

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; padding: 20px; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #2D6A4F; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px; color: #2D6A4F;">OrchardGuard</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #8B7355;">${orchardName}</p>
      </div>
      ${sections.join("")}
      <p style="margin-top: 20px; font-size: 12px; color: #8B7355; border-top: 1px solid #E8E5DE; padding-top: 12px;">
        Sent by OrchardGuard. <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/alerts" style="color: #2D6A4F;">Manage alert preferences</a>
      </p>
    </body>
    </html>
  `
}

function buildText(alerts: PendingAlert[]): string {
  return alerts.map((a) => {
    const prefix = LEVEL_EMOJI[a.level]
    let text = `${prefix} ${a.title}\n${a.message}`
    if (a.action) text += `\n>> ${a.action}`
    return text
  }).join("\n\n---\n\n")
}

export async function sendEmail(
  to: string,
  alerts: PendingAlert[],
  orchardName: string,
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    return { success: false, error: "Resend API key not configured. Add RESEND_API_KEY to .env.local" }
  }

  if (alerts.length === 0) {
    return { success: true }
  }

  // Determine subject from highest-priority alert
  const levels: AlertLevel[] = ["urgent", "warning", "preparation"]
  const highest = levels.find((l) => alerts.some((a) => a.level === l)) ?? "warning"
  const subjects = alerts.map((a) => a.title)
  const subjectLine = `[OrchardGuard ${LEVEL_SUBJECT[highest]}] ${subjects.slice(0, 2).join(", ")}${subjects.length > 2 ? ` +${subjects.length - 2} more` : ""}`

  // Use onboarding@resend.dev as from address (works without domain verification)
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "OrchardGuard <onboarding@resend.dev>"

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject: subjectLine,
      html: buildHtml(alerts, orchardName),
      text: buildText(alerts),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    }
  }
}

export async function sendTestEmail(
  to: string,
): Promise<{ success: boolean; error?: string }> {
  return sendEmail(to, [{
    level: "warning",
    model: "test",
    title: "Test Alert",
    message: "This is a test alert from OrchardGuard. If you received this, your email alerts are working correctly.",
    action: "No action needed — this is just a test.",
    detectedAt: new Date().toISOString(),
  }], "Test Orchard")
}
