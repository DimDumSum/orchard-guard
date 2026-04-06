import { Search } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SCOUTING_GUIDES } from "@/data/scouting-guides"

export function ScoutingGuideSection({ slug }: { slug: string }) {
  const guide = SCOUTING_GUIDES[slug]
  if (!guide) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-section-title">
          <Search className="h-5 w-5 text-muted-foreground" />
          How to Scout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        {/* WHEN */}
        <div>
          <p className="font-semibold text-bark-900 uppercase text-xs tracking-wide mb-1">When</p>
          <p className="text-bark-600 leading-relaxed">{guide.when}</p>
        </div>

        {/* WHERE */}
        <div>
          <p className="font-semibold text-bark-900 uppercase text-xs tracking-wide mb-1">Where</p>
          <p className="text-bark-600 leading-relaxed">{guide.where}</p>
        </div>

        {/* HOW */}
        <div>
          <p className="font-semibold text-bark-900 uppercase text-xs tracking-wide mb-1">How</p>
          <ol className="list-decimal pl-5 space-y-1 text-bark-600">
            {guide.how.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {/* WHAT TO LOOK FOR */}
        <div>
          <p className="font-semibold text-bark-900 uppercase text-xs tracking-wide mb-2">What to Look For</p>
          <div className="space-y-3">
            {guide.whatToLookFor.map((cat, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-3">
                <p className="font-medium text-bark-900 mb-1">{cat.category}</p>
                <ul className="list-disc pl-5 space-y-0.5 text-bark-600">
                  {cat.signs.map((sign, j) => (
                    <li key={j}>{sign}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* LOOK-ALIKES */}
        {guide.lookAlikes && guide.lookAlikes.length > 0 && (
          <div>
            <p className="font-semibold text-bark-900 uppercase text-xs tracking-wide mb-2">Look-Alikes</p>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
              <ul className="space-y-1 text-bark-600">
                {guide.lookAlikes.map((la, i) => (
                  <li key={i}>
                    <span className="font-medium text-bark-900">{la.name}</span>
                    {" — "}{la.distinction}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* THRESHOLD */}
        <div>
          <p className="font-semibold text-bark-900 uppercase text-xs tracking-wide mb-1">Action Threshold</p>
          <ul className="list-disc pl-5 space-y-0.5 text-bark-600">
            {guide.threshold.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        {/* RECORD */}
        <div>
          <p className="font-semibold text-bark-900 uppercase text-xs tracking-wide mb-1">What to Record</p>
          <p className="text-bark-600">{guide.record}</p>
        </div>
      </CardContent>
    </Card>
  )
}
