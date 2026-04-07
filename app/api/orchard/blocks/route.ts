import { NextRequest, NextResponse } from "next/server";
import {
  getPlantedBlocks,
  getPlantedBlock,
  insertPlantedBlock,
  updatePlantedBlock,
  deletePlantedBlock,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const orchardId = Number(
      request.nextUrl.searchParams.get("orchardId") ?? 1
    );
    const blocks = getPlantedBlocks(orchardId);
    return NextResponse.json({ orchardId, blocks });
  } catch (err) {
    console.error("[orchard/blocks] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch planted blocks" },
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
      variety,
      rootstock,
      plantedYear,
      treeCount,
      spacingInRowM,
      spacingBetweenRowsM,
      areaHa,
      notes,
    } = body;

    if (!blockName || !variety) {
      return NextResponse.json(
        { error: "blockName and variety are required" },
        { status: 400 }
      );
    }

    const id = insertPlantedBlock({
      orchard_id: orchardId,
      block_name: blockName,
      variety,
      rootstock: rootstock || null,
      planted_year: plantedYear ?? null,
      tree_count: treeCount ?? null,
      spacing_in_row_m: spacingInRowM ?? null,
      spacing_between_rows_m: spacingBetweenRowsM ?? null,
      area_ha: areaHa ?? null,
      notes: notes || null,
    });

    const block = getPlantedBlock(id, orchardId);
    return NextResponse.json({ success: true, block }, { status: 201 });
  } catch (err) {
    console.error("[orchard/blocks] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to create planted block" },
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
      variety,
      rootstock,
      plantedYear,
      treeCount,
      spacingInRowM,
      spacingBetweenRowsM,
      areaHa,
      notes,
    } = body;

    if (!id || !blockName || !variety) {
      return NextResponse.json(
        { error: "id, blockName, and variety are required" },
        { status: 400 }
      );
    }

    const existing = getPlantedBlock(id, orchardId);
    if (!existing) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    const updated = updatePlantedBlock({
      ...existing,
      block_name: blockName,
      variety,
      rootstock: rootstock || null,
      planted_year: plantedYear ?? null,
      tree_count: treeCount ?? null,
      spacing_in_row_m: spacingInRowM ?? null,
      spacing_between_rows_m: spacingBetweenRowsM ?? null,
      area_ha: areaHa ?? null,
      notes: notes || null,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    const block = getPlantedBlock(id, orchardId);
    return NextResponse.json({ success: true, block });
  } catch (err) {
    console.error("[orchard/blocks] PUT Error:", err);
    return NextResponse.json(
      { error: "Failed to update planted block" },
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

    const deleted = deletePlantedBlock(id, orchardId);
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
      { error: "Failed to delete planted block" },
      { status: 500 }
    );
  }
}
