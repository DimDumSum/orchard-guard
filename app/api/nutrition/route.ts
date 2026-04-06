import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orchardId = parseInt(searchParams.get("orchardId") ?? "1", 10);

    const db = getDb();

    const soilTests = db
      .prepare(
        "SELECT * FROM soil_tests WHERE orchard_id = ? ORDER BY date DESC"
      )
      .all(orchardId);

    const leafTests = db
      .prepare(
        "SELECT * FROM leaf_tests WHERE orchard_id = ? ORDER BY date DESC"
      )
      .all(orchardId);

    const fertilizerLog = db
      .prepare(
        "SELECT * FROM fertilizer_log WHERE orchard_id = ? ORDER BY date DESC"
      )
      .all(orchardId);

    return NextResponse.json({ soilTests, leafTests, fertilizerLog });
  } catch (err) {
    console.error("[nutrition] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch nutrition data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orchardId = 1,
      date,
      product_name,
      analysis = null,
      rate = null,
      rate_unit = null,
      method = "broadcast",
      target_nutrient = null,
      cost = null,
      notes = null,
    } = body;

    if (!date || !product_name) {
      return NextResponse.json(
        { error: "date and product_name are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = db
      .prepare(
        `INSERT INTO fertilizer_log (
          orchard_id, date, product_name, analysis, rate, rate_unit,
          method, target_nutrient, cost, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        orchardId,
        date,
        product_name,
        analysis,
        rate,
        rate_unit,
        method,
        target_nutrient,
        cost,
        notes
      );

    const entry = db
      .prepare("SELECT * FROM fertilizer_log WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(
      { success: true, entry },
      { status: 201 }
    );
  } catch (err) {
    console.error("[nutrition] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to add fertilizer log entry" },
      { status: 500 }
    );
  }
}
