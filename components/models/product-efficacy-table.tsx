import { FlaskConical } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PRODUCT_EFFICACY } from "@/data/product-efficacy"

function Stars({ count }: { count: number }) {
  return (
    <span className="text-amber-500 tracking-tight" title={`${count}/5`}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  )
}

export function ProductEfficacyTable({ slug }: { slug: string }) {
  const data = PRODUCT_EFFICACY[slug]
  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-section-title">
          <FlaskConical className="h-5 w-5 text-muted-foreground" />
          Product Efficacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.categories.map((cat, ci) => (
          <div key={ci}>
            <h4 className="text-sm font-semibold text-bark-900 mb-2">{cat.label}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Efficacy</TableHead>
                  <TableHead>Kickback</TableHead>
                  <TableHead className="hidden sm:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cat.products.map((prod, pi) => (
                  <TableRow key={pi}>
                    <TableCell className="font-medium">{prod.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {prod.frac_irac}
                      </Badge>
                    </TableCell>
                    <TableCell><Stars count={prod.efficacy} /></TableCell>
                    <TableCell className="text-muted-foreground">{prod.kickback || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] whitespace-normal">{prod.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}

        {data.resistanceNotes.length > 0 && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">Resistance Management</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700 dark:text-amber-300">
              {data.resistanceNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
