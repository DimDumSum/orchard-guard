import { NextResponse } from "next/server";
import { getDb, getOrchard } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const orchard = getOrchard();

    // Total cost from spray_log where cost IS NOT NULL
    const totalRow = db
      .prepare(
        `SELECT COALESCE(SUM(cost), 0) AS total_cost, COUNT(*) AS spray_count
         FROM spray_log
         WHERE orchard_id = 1 AND cost IS NOT NULL`
      )
      .get() as { total_cost: number; spray_count: number };

    const totalCost = totalRow.total_cost;
    const sprayCount = totalRow.spray_count;
    const costPerSpray = sprayCount > 0 ? totalCost / sprayCount : 0;

    // Breakdown by target (group spray_log by target, sum costs)
    const byTarget = db
      .prepare(
        `SELECT target, COALESCE(SUM(cost), 0) AS total_cost, COUNT(*) AS count
         FROM spray_log
         WHERE orchard_id = 1 AND cost IS NOT NULL
         GROUP BY target
         ORDER BY total_cost DESC`
      )
      .all() as Array<{ target: string; total_cost: number; count: number }>;

    // Breakdown by category (join with spray_products for product_group)
    const byCategory = db
      .prepare(
        `SELECT
           COALESCE(sp.product_group, 'unknown') AS category,
           COALESCE(SUM(sl.cost), 0) AS total_cost,
           COUNT(*) AS count
         FROM spray_log sl
         LEFT JOIN spray_products sp ON sl.product_id = sp.id
         WHERE sl.orchard_id = 1 AND sl.cost IS NOT NULL
         GROUP BY category
         ORDER BY total_cost DESC`
      )
      .all() as Array<{ category: string; total_cost: number; count: number }>;

    return NextResponse.json({
      totalCost,
      sprayCount,
      costPerSpray: Math.round(costPerSpray * 100) / 100,
      byCategoryBreakdown: byCategory,
      byTargetBreakdown: byTarget,
      orchardName: orchard?.name ?? null,
    });
  } catch (err) {
    console.error("[costs] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch cost summary" },
      { status: 500 }
    );
  }
}
