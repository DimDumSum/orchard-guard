"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import type { SprayProductRow } from "@/lib/db"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AddStockFormProps {
  products: SprayProductRow[]
}

export function AddStockForm({ products }: AddStockFormProps) {
  const router = useRouter()

  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitMeasure, setUnitMeasure] = useState("")
  const [lotNumber, setLotNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(todayStr())
  const [purchasePrice, setPurchasePrice] = useState("")
  const [supplier, setSupplier] = useState("")
  const [storageLocation, setStorageLocation] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    try {
      if (!productId || !quantity) {
        throw new Error("Product and quantity are required.")
      }

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: parseInt(productId, 10),
          quantity_on_hand: parseFloat(quantity),
          unit_measure: unitMeasure || null,
          lot_number: lotNumber || null,
          expiry_date: expiryDate || null,
          purchase_date: purchaseDate || null,
          purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
          supplier: supplier || null,
          storage_location: storageLocation || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to add inventory item")
      }

      // Reset form
      setProductId("")
      setQuantity("")
      setUnitMeasure("")
      setLotNumber("")
      setExpiryDate("")
      setPurchaseDate(todayStr())
      setPurchasePrice("")
      setSupplier("")
      setStorageLocation("")

      setFeedback({ type: "success", message: "Inventory item added." })
      router.refresh()
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="size-4" />
          Add Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Product */}
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select
                value={productId}
                onValueChange={(val) => val && setProductId(val)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-quantity">Quantity</Label>
              <Input
                id="inv-quantity"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
                required
              />
            </div>

            {/* Unit */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-unit">Unit</Label>
              <Input
                id="inv-unit"
                value={unitMeasure}
                onChange={(e) => setUnitMeasure(e.target.value)}
                placeholder="e.g. kg, L, bags"
              />
            </div>

            {/* Lot # */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-lot">Lot Number</Label>
              <Input
                id="inv-lot"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="e.g. LOT-2026-001"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-expiry">Expiry Date</Label>
              <Input
                id="inv-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-purchase-date">Purchase Date</Label>
              <Input
                id="inv-purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            {/* Purchase Price */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-price">Purchase Price ($)</Label>
              <Input
                id="inv-price"
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="e.g. 125.00"
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-supplier">Supplier</Label>
              <Input
                id="inv-supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Crop Supply Co."
              />
            </div>

            {/* Storage Location */}
            <div className="space-y-1.5">
              <Label htmlFor="inv-storage">Storage Location</Label>
              <Input
                id="inv-storage"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g. Chemical shed, Bay 3"
              />
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                  : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Inventory Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
