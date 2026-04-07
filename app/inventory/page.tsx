// ---------------------------------------------------------------------------
// OrchardGuard Inventory Tracking Page — Server Component
//
// Loads all inventory items with associated product details from the database
// and renders the inventory table and add-stock form client components.
// ---------------------------------------------------------------------------

import { getDb, getSprayProducts } from "@/lib/db"
import type { SprayProductRow } from "@/lib/db"

export const dynamic = "force-dynamic"
import { InventoryTable } from "./inventory-table"
import { AddStockForm } from "./add-stock-form"

export interface InventoryWithProduct {
  id: number
  product_id: number
  quantity_on_hand: number
  unit_measure: string | null
  lot_number: string | null
  expiry_date: string | null
  purchase_date: string | null
  purchase_price: number | null
  supplier: string | null
  storage_location: string | null
  notes: string | null
  product_name: string
  active_ingredient: string
  product_group: string
  frac_irac_group: string | null
  rate_per_hectare: string | null
  rate_unit: string | null
  resistance_risk: string
  organic_approved: number
}

export default async function InventoryPage() {
  const db = getDb()

  const inventory = db
    .prepare(
      `SELECT
         i.*,
         sp.product_name,
         sp.active_ingredient,
         sp.product_group,
         sp.frac_irac_group,
         sp.rate_per_hectare,
         sp.rate_unit,
         sp.resistance_risk,
         sp.organic_approved
       FROM inventory i
       JOIN spray_products sp ON sp.id = i.product_id
       ORDER BY sp.product_name`
    )
    .all() as InventoryWithProduct[]

  const products: SprayProductRow[] = getSprayProducts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title">Inventory</h1>
        <p className="text-body text-muted-foreground">
          Track spray product stock levels, expiry dates, and low-stock
          alerts.
        </p>
      </div>

      {/* Add stock form */}
      <AddStockForm products={products} />

      {/* Inventory table */}
      {inventory.length > 0 ? (
        <InventoryTable inventory={inventory} />
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No inventory items yet. Use the form above to add your first stock
          entry.
        </p>
      )}
    </div>
  )
}
