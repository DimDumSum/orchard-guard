import { NextRequest, NextResponse } from "next/server";
import { getDb, getOrchard } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const orchard = getOrchard();

    if (!orchard) {
      return NextResponse.json(
        { error: "No orchard configured" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...orchard,
      primary_varieties: JSON.parse(orchard.primary_varieties),
    });
  } catch (err) {
    console.error("[orchard/config] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orchard config" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orchardId = 1,
      name,
      lat,
      lon,
      elevation,
      varieties,
      rootstock,
      fire_blight_history,
      bloom_stage,
      petal_fall_date,
      codling_moth_biofix_date,
    } = body;

    const db = getDb();

    // Build the SET clause dynamically based on provided fields
    const updates: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (lat !== undefined) {
      updates.push("latitude = ?");
      values.push(lat);
    }
    if (lon !== undefined) {
      updates.push("longitude = ?");
      values.push(lon);
    }
    if (elevation !== undefined) {
      updates.push("elevation_m = ?");
      values.push(elevation);
    }
    if (varieties !== undefined) {
      updates.push("primary_varieties = ?");
      values.push(JSON.stringify(varieties));
    }
    if (rootstock !== undefined) {
      updates.push("rootstock = ?");
      values.push(rootstock);
    }
    if (fire_blight_history !== undefined) {
      const validHistories = ["none", "nearby", "in_orchard"];
      if (!validHistories.includes(fire_blight_history)) {
        return NextResponse.json(
          { error: `Invalid fire_blight_history. Must be one of: ${validHistories.join(", ")}` },
          { status: 400 }
        );
      }
      updates.push("fire_blight_history = ?");
      values.push(fire_blight_history);
    }
    if (bloom_stage !== undefined) {
      const validStages = [
        "dormant", "silver-tip", "green-tip", "tight-cluster",
        "pink", "bloom", "petal-fall", "fruit-set",
      ];
      if (!validStages.includes(bloom_stage)) {
        return NextResponse.json(
          { error: `Invalid bloom_stage. Must be one of: ${validStages.join(", ")}` },
          { status: 400 }
        );
      }
      updates.push("bloom_stage = ?");
      values.push(bloom_stage);
    }
    if (petal_fall_date !== undefined) {
      updates.push("petal_fall_date = ?");
      values.push(petal_fall_date);
    }
    if (codling_moth_biofix_date !== undefined) {
      updates.push("codling_moth_biofix_date = ?");
      values.push(codling_moth_biofix_date);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    updates.push("last_updated = datetime('now')");
    values.push(orchardId);

    const sql = `UPDATE orchards SET ${updates.join(", ")} WHERE id = ?`;
    const result = db.prepare(sql).run(...values);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Orchard not found" },
        { status: 404 }
      );
    }

    // Return the updated orchard
    const updated = getOrchard(orchardId);

    return NextResponse.json({
      success: true,
      orchard: updated
        ? { ...updated, primary_varieties: JSON.parse(updated.primary_varieties) }
        : null,
    });
  } catch (err) {
    console.error("[orchard/config] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to update orchard config" },
      { status: 500 }
    );
  }
}
