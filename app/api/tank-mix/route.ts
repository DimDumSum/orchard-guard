import { NextRequest, NextResponse } from "next/server";
import { getTankMixTemplates, saveTankMixTemplate } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orchardId = parseInt(searchParams.get("orchardId") ?? "1", 10);

    const templates = getTankMixTemplates(orchardId);

    return NextResponse.json({ templates });
  } catch (err) {
    console.error("[tank-mix] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tank mix templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      orchardId = 1,
      name,
      products,
      tank_size_l = null,
      area_ha = null,
      notes = null,
    } = body;

    if (!name || !products) {
      return NextResponse.json(
        { error: "name and products are required" },
        { status: 400 }
      );
    }

    const rowId = saveTankMixTemplate({
      id,
      orchard_id: orchardId,
      name,
      products: typeof products === "string" ? products : JSON.stringify(products),
      tank_size_l,
      area_ha,
      notes,
    });

    return NextResponse.json(
      { success: true, id: rowId },
      { status: id ? 200 : 201 }
    );
  } catch (err) {
    console.error("[tank-mix] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to save tank mix template" },
      { status: 500 }
    );
  }
}
