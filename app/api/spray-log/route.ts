import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orchardId = parseInt(searchParams.get("orchardId") ?? "1", 10);

    const db = getDb();

    const entries = db
      .prepare(
        `SELECT * FROM spray_log
         WHERE orchard_id = ?
         ORDER BY date DESC, created_at DESC`
      )
      .all(orchardId);

    return NextResponse.json({ orchardId, entries });
  } catch (err) {
    console.error("[spray-log] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch spray log entries" },
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
      product,
      rate = null,
      target,
      phiDays = null,
      reiHours = null,
      notes = null,
    } = body;

    if (!date || !product || !target) {
      return NextResponse.json(
        { error: "date, product, and target are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = db
      .prepare(
        `INSERT INTO spray_log (orchard_id, date, product, rate, target, phi_days, rei_hours, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(orchardId, date, product, rate, target, phiDays, reiHours, notes);

    const entry = db
      .prepare("SELECT * FROM spray_log WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(
      { success: true, entry },
      { status: 201 }
    );
  } catch (err) {
    console.error("[spray-log] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to add spray log entry" },
      { status: 500 }
    );
  }
}
