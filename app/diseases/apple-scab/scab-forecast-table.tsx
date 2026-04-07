"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { toImperial } from "@/lib/units"

interface ForecastRow {
  date: string
  dayName: string
  meanTemp: number
  precip: number
  estWetHrs: number
  risk: "low" | "moderate" | "high"
  action: string
}

const riskColors: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: "bg-green-50 dark:bg-green-950/20", text: "text-green-700 dark:text-green-400", dot: "bg-green-500" },
  moderate: { bg: "bg-yellow-50 dark:bg-yellow-950/20", text: "text-yellow-700 dark:text-yellow-400", dot: "bg-yellow-500" },
  high: { bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
}

export function ScabForecastTable({ rows }: { rows: ForecastRow[] }) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead className="text-right">Temp</TableHead>
            <TableHead className="text-right">Rain</TableHead>
            <TableHead className="text-right">Wet hrs*</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const colors = riskColors[row.risk] ?? riskColors.low
            const isToday = row.date === today
            return (
              <TableRow key={row.date} className={cn(isToday && "font-medium")}>
                <TableCell className="text-[13px]">
                  {isToday ? "Today" : row.dayName}
                </TableCell>
                <TableCell className="text-right font-data text-[13px]">
                  {row.meanTemp}°C <span className="text-muted-foreground">({toImperial(row.meanTemp, "temperature").toFixed(0)}°F)</span>
                </TableCell>
                <TableCell className="text-right font-data text-[13px]">
                  {row.precip > 0 ? <>{row.precip}mm <span className="text-muted-foreground">({toImperial(row.precip, "rainfall").toFixed(2)}in)</span></> : "0mm"}
                </TableCell>
                <TableCell className="text-right font-data text-[13px]">
                  {row.estWetHrs > 0 ? `~${row.estWetHrs}h` : "0"}
                </TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase", colors.text)}>
                    <span className={cn("inline-block h-2 w-2 rounded-full", colors.dot)} />
                    {row.risk === "low" ? "Low" : row.risk === "moderate" ? "MOD" : "HIGH"}
                  </span>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">
                  {row.action}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <p className="mt-1 text-[11px] text-muted-foreground">
        *Estimated wet hours based on precipitation forecast
      </p>
    </div>
  )
}
