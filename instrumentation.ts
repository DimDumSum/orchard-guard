// ---------------------------------------------------------------------------
// Instrumentation — Next.js server lifecycle hooks
//
// register() runs once when the Next.js server starts. We use it to kick off
// an hourly loop that:
//   1. Refreshes weather data from Open-Meteo
//   2. Runs the alert/briefing cron
//
// This ensures weather stays fresh even if no one visits the dashboard, and
// doesn't depend on an external cron service (though Railway cron is set up
// as a backup via railway.toml).
// ---------------------------------------------------------------------------

export async function register() {
  // Only schedule on the Node.js server runtime — not edge, not client build
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const INTERVAL_MS = 60 * 60 * 1000 // 1 hour
    const INITIAL_DELAY_MS = 15 * 1000  // 15s — let the server finish starting

    const baseUrl = () => {
      const port = process.env.PORT || 3000
      return `http://localhost:${port}`
    }

    const authHeaders = (): Record<string, string> => {
      const headers: Record<string, string> = {}
      const secret = process.env.CRON_SECRET
      if (secret) {
        headers["Authorization"] = `Bearer ${secret}`
      }
      return headers
    }

    const refreshWeather = async () => {
      try {
        const res = await fetch(`${baseUrl()}/api/weather/refresh`, {
          headers: authHeaders(),
          signal: AbortSignal.timeout(60_000),
        })

        if (!res.ok) {
          console.error(`[cron] Weather refresh returned ${res.status}`)
          return
        }

        const data = await res.json()
        console.log(
          `[cron] Weather refreshed — ${data.hourlyCount ?? 0} hourly, ${data.dailyCount ?? 0} daily records`,
        )
      } catch (err) {
        console.error(
          "[cron] Weather refresh failed:",
          err instanceof Error ? err.message : err,
        )
      }
    }

    const runAlerts = async () => {
      try {
        const res = await fetch(`${baseUrl()}/api/alerts/cron`, {
          headers: authHeaders(),
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

    let lastBackupDate = ""

    const runDailyBackup = async () => {
      const today = new Date().toISOString().slice(0, 10)
      if (today === lastBackupDate) return // already backed up today
      try {
        const { runBackup } = await import("@/lib/backup")
        const success = runBackup()
        if (success) {
          lastBackupDate = today
          console.log("[cron] Daily backup completed")
        }
      } catch (err) {
        console.error("[cron] Backup failed:", err instanceof Error ? err.message : err)
      }
    }

    const runCron = async () => {
      await refreshWeather()
      await runAlerts()
      await runDailyBackup()
    }

    // First run shortly after server boots
    setTimeout(runCron, INITIAL_DELAY_MS)
    // Then every hour
    setInterval(runCron, INTERVAL_MS)

    console.log("[cron] Scheduler started — weather refresh + alerts every hour + daily backup")
  }
}
