// ---------------------------------------------------------------------------
// Alert History API — Retrieve sent alert log
// ---------------------------------------------------------------------------

import { getAlertLog } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orchardId = Number(searchParams.get("orchardId") ?? 1)
  const limit = Number(searchParams.get("limit") ?? 50)

  const log = getAlertLog(orchardId, limit)
  return Response.json({ alerts: log })
}
