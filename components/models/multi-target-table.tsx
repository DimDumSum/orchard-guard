import { Layers } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MULTI_TARGET_PRODUCTS } from "@/data/multi-target-products"

export function MultiTargetTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-section-title">
          <Layers className="h-5 w-5 text-muted-foreground" />
          Multi-Target Products &mdash; Spray Smarter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          These products cover multiple targets in one application, reducing total sprays and cost.
        </p>
        <div className="space-y-4">
          {MULTI_TARGET_PRODUCTS.map((product) => (
            <div key={product.name} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-bark-900">{product.name}</span>
                <Badge variant="outline" className="text-xs font-mono">{product.group}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {product.covers.map((slug) => (
                  <span key={slug} className="rounded-full bg-grove-100 dark:bg-grove-900/30 px-2.5 py-0.5 text-xs font-medium text-grove-700 dark:text-grove-300 capitalize">
                    {slug.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{product.note}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
