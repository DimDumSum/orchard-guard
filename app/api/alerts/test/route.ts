// ---------------------------------------------------------------------------
// Alert Test API — Send a test email or SMS to verify configuration
// ---------------------------------------------------------------------------

import { sendTestEmail } from "@/lib/alerts/email"
import { sendTestSms } from "@/lib/alerts/sms"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { channel, email, phone } = body

    if (channel === "email") {
      if (!email) {
        return Response.json({ success: false, error: "Email address required" }, { status: 400 })
      }
      const result = await sendTestEmail(email)
      return Response.json(result)
    }

    if (channel === "sms") {
      if (!phone) {
        return Response.json({ success: false, error: "Phone number required" }, { status: 400 })
      }
      const result = await sendTestSms(phone)
      return Response.json(result)
    }

    return Response.json({ success: false, error: "Invalid channel. Use 'email' or 'sms'." }, { status: 400 })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Test failed" },
      { status: 500 },
    )
  }
}
