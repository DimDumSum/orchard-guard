import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orchardId = 1, biofixDate } = body;

    if (!biofixDate) {
      return NextResponse.json(
        { error: "biofixDate is required" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(biofixDate)) {
      return NextResponse.json(
        { error: "biofixDate must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = db
      .prepare(
        `UPDATE orchards
         SET codling_moth_biofix_date = ?, last_updated = datetime('now')
         WHERE id = ?`
      )
      .run(biofixDate, orchardId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Orchard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      orchardId,
      biofixDate,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[orchard/biofix] Error:", err);
    return NextResponse.json(
      { error: "Failed to update biofix date" },
      { status: 500 }
    );
  }
}
