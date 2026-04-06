"use client"

import { useMemo } from "react"
import { AlertTriangle, Package, ShieldAlert } from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { InventoryWithProduct } from "./page"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diff = expiry.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function expiryBadge(expiryDate: string | null) {
  const days = daysUntilExpiry(expiryDate)

  if (days === null) {
    return (
      <span className="text-muted-foreground">{"\u2014"}</span>
    )
  }

  if (days < 0) {
    return (
      <Badge variant="destructive">
        Expired
      </Badge>
    )
  }

  if (days < 30) {
    return (
      <Badge variant="destructive">
        {days}d left
      </Badge>
    )
  }

  if (days < 90) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
        {days}d left
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400">
      {days}d left
    </span>
  )
}

function remainingApplications(
  quantity: number,
  ratePerHectare: string | null
): number | null {
  if (!ratePerHectare) return null
  const rate = parseFloat(ratePerHectare)
  if (isNaN(rate) || rate <= 0) return null
  return Math.floor(quantity / rate)
}

function lowStockBadge(
  quantity: number,
  ratePerHectare: string | null
) {
  const apps = remainingApplications(quantity, ratePerHectare)

  if (apps === null) return null

  if (apps < 2) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <ShieldAlert className="size-3.5" />
        {apps === 0 ? "No applications left" : `${apps} application left`}
      </div>
    )
  }

  return (
    <div className="text-xs text-muted-foreground">
      ~{apps} applications
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface InventoryTableProps {
  inventory: InventoryWithProduct[]
}

export function InventoryTable({ inventory }: InventoryTableProps) {
  const lowStockCount = useMemo(() => {
    return inventory.filter((item) => {
      const apps = remainingApplications(
        item.quantity_on_hand,
        item.rate_per_hectare
      )
      return apps !== null && apps < 2
    }).length
  }, [inventory])

  const expiringCount = useMemo(() => {
    return inventory.filter((item) => {
      const days = daysUntilExpiry(item.expiry_date)
      return days !== null && days < 30
    }).length
  }, [inventory])

  return (
    <div className="space-y-4">
      {/* Alerts summary */}
      {(lowStockCount > 0 || expiringCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              <AlertTriangle className="size-4" />
              {lowStockCount} item{lowStockCount !== 1 && "s"} low on stock
            </div>
          )}
          {expiringCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
              <AlertTriangle className="size-4" />
              {expiringCount} item{expiringCount !== 1 && "s"} expiring soon
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-4" />
            Inventory ({inventory.length} item{inventory.length !== 1 && "s"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty on Hand</TableHead>
                  <TableHead className="hidden sm:table-cell">Unit</TableHead>
                  <TableHead className="hidden md:table-cell">Lot #</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="hidden lg:table-cell">Purchase Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Supplier</TableHead>
                  <TableHead className="hidden xl:table-cell">Storage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.active_ingredient}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {item.quantity_on_hand}
                        </div>
                        {lowStockBadge(
                          item.quantity_on_hand,
                          item.rate_per_hectare
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.unit_measure ?? "\u2014"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {item.lot_number ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {item.expiry_date ?? "\u2014"}
                        </div>
                        {expiryBadge(item.expiry_date)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {item.purchase_date ?? "\u2014"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {item.supplier ?? "\u2014"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {item.storage_location ?? "\u2014"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
