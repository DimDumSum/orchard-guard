import { NextRequest, NextResponse } from "next/server";
import {
  insertBlockPlanting,
  getBlockPlanting,
  updateBlockPlanting,
  deleteBlockPlanting,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      blockId,
      variety,
      rootstock,
      treeCount,
      spacingInRowM,
      spacingBetweenRowsM,
      rowsDescription,
      plantedYear,
      subNotes,
    } = body;

    if (!blockId || !variety) {
      return NextResponse.json(
        { error: "blockId and variety are required" },
        { status: 400 }
      );
    }

    const id = insertBlockPlanting({
      block_id: blockId,
      variety,
      rootstock: rootstock || null,
      tree_count: treeCount ?? null,
      spacing_in_row_m: spacingInRowM ?? null,
      spacing_between_rows_m: spacingBetweenRowsM ?? null,
      rows_description: rowsDescription || null,
      planted_year: plantedYear ?? null,
      sub_notes: subNotes || null,
    });

    const planting = getBlockPlanting(id);
    return NextResponse.json({ success: true, planting }, { status: 201 });
  } catch (err) {
    console.error("[orchard/plantings] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to create planting" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      blockId,
      variety,
      rootstock,
      treeCount,
      spacingInRowM,
      spacingBetweenRowsM,
      rowsDescription,
      plantedYear,
      subNotes,
    } = body;

    if (!id || !variety) {
      return NextResponse.json(
        { error: "id and variety are required" },
        { status: 400 }
      );
    }

    const existing = getBlockPlanting(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Planting not found" },
        { status: 404 }
      );
    }

    updateBlockPlanting({
      ...existing,
      block_id: blockId ?? existing.block_id,
      variety,
      rootstock: rootstock || null,
      tree_count: treeCount ?? null,
      spacing_in_row_m: spacingInRowM ?? null,
      spacing_between_rows_m: spacingBetweenRowsM ?? null,
      rows_description: rowsDescription || null,
      planted_year: plantedYear ?? null,
      sub_notes: subNotes || null,
    });

    const planting = getBlockPlanting(id);
    return NextResponse.json({ success: true, planting });
  } catch (err) {
    console.error("[orchard/plantings] PUT Error:", err);
    return NextResponse.json(
      { error: "Failed to update planting" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const deleted = deleteBlockPlanting(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Planting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[orchard/plantings] DELETE Error:", err);
    return NextResponse.json(
      { error: "Failed to delete planting" },
      { status: 500 }
    );
  }
}
