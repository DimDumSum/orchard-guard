// ---------------------------------------------------------------------------
// Instrumentation — Next.js server lifecycle hooks
//
// register() runs once when the Next.js server starts. We use it to kick off
// an hourly alert-check loop so /api/alerts/cron fires automatically without
// depending on an external cron service (Vercel Cron, Railway, etc.).
// ---------------------------------------------------------------------------

export async function register() {
  // Only schedule on the Node.js server runtime — not edge, not client build
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const INTERVAL_MS = 60 * 60 * 1000 // 1 hour
    const INITIAL_DELAY_MS = 15 * 1000  // 15s — let the server finish starting

    const runCron = async () => {
      try {
        const port = process.env.PORT || 3000
        const headers: Record<string, string> = {}
        const secret = process.env.CRON_SECRET
        if (secret) {
          headers["Authorization"] = `Bearer ${secret}`
        }

        const res = await fetch(`http://localhost:${port}/api/alerts/cron`, {
          headers,
          signal: AbortSignal.timeout(30_000),
        })

        if (!res.ok) {
          console.error(`[cron] Alert check returned ${res.status}`)
          return
        }

        const data = await res.json()
        const alertsSent = data.results?.alerts?.sent ?? 0
        const briefingSent = data.results?.briefing?.sent ? " + briefing" : ""
        console.log(
          `[cron] Alert check complete — ${alertsSent} alert(s) sent${briefingSent}`,
        )
      } catch (err) {
        console.error(
          "[cron] Alert check failed:",
          err instanceof Error ? err.message : err,
        )
      }
    }

    // First run shortly after server boots
    setTimeout(runCron, INITIAL_DELAY_MS)
    // Then every hour
    setInterval(runCron, INTERVAL_MS)

    console.log("[cron] Alert scheduler started — checking every hour")
  }
}
