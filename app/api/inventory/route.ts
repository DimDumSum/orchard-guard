import { NextRequest, NextResponse } from "next/server";
import { getDb, upsertInventory } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const rows = db
      .prepare(
        `SELECT
           i.*,
           sp.product_name,
           sp.active_ingredient,
           sp.product_group,
           sp.frac_irac_group,
           sp.rate_per_hectare,
           sp.rate_unit,
           sp.phi_days AS product_phi_days,
           sp.rei_hours AS product_rei_hours,
           sp.max_applications_per_season,
           sp.resistance_risk,
           sp.organic_approved
         FROM inventory i
         JOIN spray_products sp ON sp.id = i.product_id
         ORDER BY sp.product_name`
      )
      .all();

    return NextResponse.json({ inventory: rows });
  } catch (err) {
    console.error("[inventory] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      product_id,
      quantity_on_hand,
      unit_measure = null,
      lot_number = null,
      expiry_date = null,
      purchase_date = null,
      purchase_price = null,
      supplier = null,
      storage_location = null,
      notes = null,
    } = body;

    if (!product_id || quantity_on_hand === undefined) {
      return NextResponse.json(
        { error: "product_id and quantity_on_hand are required" },
        { status: 400 }
      );
    }

    const rowId = upsertInventory({
      id,
      product_id,
      quantity_on_hand,
      unit_measure,
      lot_number,
      expiry_date,
      purchase_date,
      purchase_price,
      supplier,
      storage_location,
      notes,
    });

    return NextResponse.json(
      { success: true, id: rowId },
      { status: id ? 200 : 201 }
    );
  } catch (err) {
    console.error("[inventory] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to save inventory item" },
      { status: 500 }
    );
  }
}
