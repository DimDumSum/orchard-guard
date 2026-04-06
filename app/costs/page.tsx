import { getDb, getOrchard } from "@/lib/db";
import type { SprayLogRow, SprayProductRow } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { CostExport } from "./cost-export";

interface SprayWithProduct extends SprayLogRow {
  product_group: string | null;
  product_name: string | null;
}

export default async function CostsPage() {
  const db = getDb();
  const orchard = getOrchard();

  // All sprays with product details
  const sprays = db
    .prepare(
      `SELECT sl.*, sp.product_group, sp.product_name
       FROM spray_log sl
       LEFT JOIN spray_products sp ON sl.product_id = sp.id
       WHERE sl.orchard_id = 1
       ORDER BY sl.date DESC, sl.created_at DESC`
    )
    .all() as SprayWithProduct[];

  // Summary stats (only entries with cost)
  const spraysWithCost = sprays.filter((s) => s.cost != null);
  const totalCost = spraysWithCost.reduce((sum, s) => sum + (s.cost ?? 0), 0);
  const sprayCount = spraysWithCost.length;
  const avgCostPerSpray = sprayCount > 0 ? totalCost / sprayCount : 0;

  // Breakdown by category
  const categoryMap = new Map<string, number>();
  for (const s of spraysWithCost) {
    const cat = s.product_group ?? "unknown";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + (s.cost ?? 0));
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, cost]) => ({ category, cost }))
    .sort((a, b) => b.cost - a.cost);
  const maxCategoryCost = Math.max(...categoryBreakdown.map((c) => c.cost), 1);

  // Breakdown by target
  const targetMap = new Map<string, number>();
  for (const s of spraysWithCost) {
    targetMap.set(s.target, (targetMap.get(s.target) ?? 0) + (s.cost ?? 0));
  }
  const targetBreakdown = Array.from(targetMap.entries())
    .map(([target, cost]) => ({ target, cost }))
    .sort((a, b) => b.cost - a.cost);
  const maxTargetCost = Math.max(...targetBreakdown.map((t) => t.cost), 1);

  const categoryColors: Record<string, string> = {
    fungicide: "bg-blue-500 dark:bg-blue-400",
    insecticide: "bg-red-500 dark:bg-red-400",
    miticide: "bg-orange-500 dark:bg-orange-400",
    growth_regulator: "bg-green-500 dark:bg-green-400",
    nutrient: "bg-yellow-500 dark:bg-yellow-400",
    unknown: "bg-muted-foreground",
  };

  const categoryLabels: Record<string, string> = {
    fungicide: "Fungicide",
    insecticide: "Insecticide",
    miticide: "Miticide",
    growth_regulator: "Growth Regulator",
    nutrient: "Nutrient",
    unknown: "Unknown",
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Season Cost Report</h1>
          <p className="text-body text-muted-foreground">
            Track spray costs and spending breakdowns for the current season.
          </p>
        </div>
        {sprays.length > 0 && (
          <CostExport
            sprays={sprays.map((s) => ({
              date: s.date,
              product: s.product,
              target: s.target,
              rate: s.rate,
              cost: s.cost,
            }))}
          />
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spray Cost
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-data">{fmt(totalCost)}</div>
            {orchard && (
              <p className="text-xs text-muted-foreground">
                {orchard.name}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Number of Sprays
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-data">{sprayCount}</div>
            <p className="text-xs text-muted-foreground">
              with cost recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Cost per Spray
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-data">{fmt(avgCostPerSpray)}</div>
            <p className="text-xs text-muted-foreground">
              per application
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* By category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {categoryBreakdown.map(({ category, cost }) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {categoryLabels[category] ?? category}
                      </span>
                      <span className="text-muted-foreground">{fmt(cost)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${categoryColors[category] ?? categoryColors.unknown}`}
                        style={{
                          width: `${(cost / maxCategoryCost) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No cost data available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* By target */}
        <Card>
          <CardHeader>
            <CardTitle className="text-section-title">Breakdown by Target</CardTitle>
          </CardHeader>
          <CardContent>
            {targetBreakdown.length > 0 ? (
              <div className="space-y-3">
                {targetBreakdown.map(({ target, cost }) => (
                  <div key={target} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{target}</span>
                      <span className="text-muted-foreground">{fmt(cost)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(cost / maxTargetCost) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No cost data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spray cost table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-section-title">Spray Cost Details</CardTitle>
        </CardHeader>
        <CardContent>
          {sprays.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sprays.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap">
                        {s.date}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {s.product}
                          {s.product_group && (
                            <Badge variant="secondary" className="text-xs">
                              {categoryLabels[s.product_group] ??
                                s.product_group}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{s.target}</TableCell>
                      <TableCell>{s.rate ?? "-"}</TableCell>
                      <TableCell>{s.block_name ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        {s.cost != null ? fmt(s.cost) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {fmt(totalCost)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No spray entries found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Helpful note */}
      <p className="text-sm text-muted-foreground">
        Costs are calculated from spray log entries with prices. Add product
        prices in Inventory to enable automatic cost tracking.
      </p>
    </div>
  );
}
