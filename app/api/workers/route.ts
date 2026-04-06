import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { WorkerRow } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orchardId = parseInt(searchParams.get("orchardId") ?? "1", 10);

    const db = getDb();

    const workers = db
      .prepare(
        `SELECT * FROM workers
         WHERE orchard_id = ?
         ORDER BY name ASC`,
      )
      .all(orchardId) as WorkerRow[];

    return NextResponse.json({ orchardId, workers });
  } catch (err) {
    console.error("[workers] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch workers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orchardId = 1,
      name,
      phone = null,
      email = null,
      role = null,
      notificationPreference = "email",
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Worker name is required" },
        { status: 400 },
      );
    }

    const validPreferences = ["sms", "email", "both"];
    if (!validPreferences.includes(notificationPreference)) {
      return NextResponse.json(
        {
          error: `Invalid notification preference. Must be one of: ${validPreferences.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const db = getDb();

    const result = db
      .prepare(
        `INSERT INTO workers (orchard_id, name, phone, email, role, notification_preference)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        orchardId,
        name.trim(),
        phone || null,
        email || null,
        role || null,
        notificationPreference,
      );

    const worker = db
      .prepare("SELECT * FROM workers WHERE id = ?")
      .get(result.lastInsertRowid) as WorkerRow;

    return NextResponse.json({ success: true, worker }, { status: 201 });
  } catch (err) {
    console.error("[workers] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to add worker" },
      { status: 500 },
    );
  }
}
