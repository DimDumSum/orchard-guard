import { NextRequest, NextResponse } from "next/server";
import {
  getOrchardBlocks,
  getOrchardBlock,
  insertOrchardBlock,
  updateOrchardBlock,
  deleteOrchardBlock,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const orchardId = Number(
      request.nextUrl.searchParams.get("orchardId") ?? 1
    );
    const blocks = getOrchardBlocks(orchardId);
    return NextResponse.json({ orchardId, blocks });
  } catch (err) {
    console.error("[orchard/blocks] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orchard blocks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orchardId = 1,
      blockName,
      totalAreaHa,
      yearEstablished,
      soilType,
      irrigationSystem,
      notes,
    } = body;

    if (!blockName) {
      return NextResponse.json(
        { error: "blockName is required" },
        { status: 400 }
      );
    }

    const id = insertOrchardBlock({
      orchard_id: orchardId,
      block_name: blockName,
      total_area_ha: totalAreaHa ?? null,
      year_established: yearEstablished ?? null,
      soil_type: soilType || null,
      irrigation_system: irrigationSystem || null,
      notes: notes || null,
    });

    const block = getOrchardBlock(id, orchardId);
    return NextResponse.json({ success: true, block }, { status: 201 });
  } catch (err) {
    console.error("[orchard/blocks] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to create orchard block" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      orchardId = 1,
      blockName,
      totalAreaHa,
      yearEstablished,
      soilType,
      irrigationSystem,
      notes,
    } = body;

    if (!id || !blockName) {
      return NextResponse.json(
        { error: "id and blockName are required" },
        { status: 400 }
      );
    }

    const existing = getOrchardBlock(id, orchardId);
    if (!existing) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    updateOrchardBlock({
      ...existing,
      block_name: blockName,
      total_area_ha: totalAreaHa ?? null,
      year_established: yearEstablished ?? null,
      soil_type: soilType || null,
      irrigation_system: irrigationSystem || null,
      notes: notes || null,
    });

    const block = getOrchardBlock(id, orchardId);
    return NextResponse.json({ success: true, block });
  } catch (err) {
    console.error("[orchard/blocks] PUT Error:", err);
    return NextResponse.json(
      { error: "Failed to update orchard block" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, orchardId = 1 } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const deleted = deleteOrchardBlock(id, orchardId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[orchard/blocks] DELETE Error:", err);
    return NextResponse.json(
      { error: "Failed to delete orchard block" },
      { status: 500 }
    );
  }
}
