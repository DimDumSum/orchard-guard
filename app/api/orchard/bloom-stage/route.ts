import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orchardId = 1, bloomStage } = body;

    if (!bloomStage) {
      return NextResponse.json(
        { error: "bloomStage is required" },
        { status: 400 }
      );
    }

    const validStages = [
      "dormant",
      "silver-tip",
      "green-tip",
      "tight-cluster",
      "pink",
      "bloom",
      "petal-fall",
      "fruit-set",
    ];

    if (!validStages.includes(bloomStage)) {
      return NextResponse.json(
        { error: `Invalid bloomStage. Must be one of: ${validStages.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = db
      .prepare(
        `UPDATE orchards
         SET bloom_stage = ?, last_updated = datetime('now')
         WHERE id = ?`
      )
      .run(bloomStage, orchardId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Orchard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      orchardId,
      bloomStage,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[orchard/bloom-stage] Error:", err);
    return NextResponse.json(
      { error: "Failed to update bloom stage" },
      { status: 500 }
    );
  }
}
