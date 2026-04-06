import { Link2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { COINCIDENCE_RULES } from "@/data/coincidence-alerts"

export function CoincidenceAlerts({
  slug,
  riskLevel,
}: {
  slug: string
  riskLevel: string
}) {
  // Find rules where this slug is one of the triggers
  const levelRank: Record<string, number> = { low: 0, moderate: 1, high: 2, severe: 3, extreme: 3, critical: 3 }
  const currentRank = levelRank[riskLevel] ?? 0

  const relevantRules = COINCIDENCE_RULES.filter((rule) =>
    rule.triggers.some(
      (t) => t.slug === slug && currentRank >= (levelRank[t.minLevel] ?? 1)
    )
  )

  if (relevantRules.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-section-title">
          <Link2 className="h-5 w-5 text-muted-foreground" />
          Connected Risks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relevantRules.map((rule, i) => (
          <div key={i} className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{rule.title}</p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">{rule.body}</p>
            <div className="mt-3 rounded bg-blue-100 dark:bg-blue-900/40 p-3">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wide mb-1">Smart Spray</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">{rule.smartSpray}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
