// ---------------------------------------------------------------------------
// Alert Preferences API — GET / POST alert configuration
// ---------------------------------------------------------------------------

import { getAlertPrefs, upsertAlertPrefs, getOrchard } from "@/lib/db"
import { isEmailConfigured } from "@/lib/alerts/email"
import { isSmsConfigured } from "@/lib/alerts/sms"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orchardId = Number(searchParams.get("orchardId") ?? 1)

  const prefs = getAlertPrefs(orchardId)
  const orchard = getOrchard(orchardId)

  return Response.json({
    prefs: prefs ?? {
      orchard_id: orchardId,
      email: null,
      phone: null,
      urgent_enabled: 1,
      warning_enabled: 1,
      preparation_enabled: 1,
      quiet_start: 22,
      quiet_end: 5,
      channel: "email",
    },
    services: {
      emailConfigured: isEmailConfigured(),
      smsConfigured: isSmsConfigured(),
    },
    orchardName: orchard?.name ?? "OrchardGuard",
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orchardId = body.orchardId ?? 1

    // Validate channel
    const validChannels = ["email", "sms", "both"]
    const channel = validChannels.includes(body.channel) ? body.channel : "email"

    upsertAlertPrefs({
      orchard_id: orchardId,
      email: body.email || null,
      phone: body.phone || null,
      urgent_enabled: body.urgentEnabled ? 1 : 0,
      warning_enabled: body.warningEnabled ? 1 : 0,
      preparation_enabled: body.preparationEnabled ? 1 : 0,
      quiet_start: typeof body.quietStart === "number" ? body.quietStart : 22,
      quiet_end: typeof body.quietEnd === "number" ? body.quietEnd : 5,
      channel,
    })

    return Response.json({ success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to save preferences" },
      { status: 500 },
    )
  }
}
