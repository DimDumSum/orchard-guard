// ---------------------------------------------------------------------------
// Shared layout for disease/pest detail pages.
//
// Provides: page header with icon + risk badge, risk score bar,
// recommendation callout, and "About" card shell.
// ---------------------------------------------------------------------------

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ── Badge & progress colours ───────────────────────────────────────────────
const riskBadgeColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  none: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  caution: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  severe: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  extreme: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const riskIndicatorColors: Record<string, string> = {
  low: "[&_[data-slot=progress-indicator]]:bg-green-500",
  none: "[&_[data-slot=progress-indicator]]:bg-gray-400",
  moderate: "[&_[data-slot=progress-indicator]]:bg-yellow-500",
  caution: "[&_[data-slot=progress-indicator]]:bg-yellow-500",
  high: "[&_[data-slot=progress-indicator]]:bg-orange-500",
  severe: "[&_[data-slot=progress-indicator]]:bg-red-500",
  extreme: "[&_[data-slot=progress-indicator]]:bg-red-500",
  critical: "[&_[data-slot=progress-indicator]]:bg-red-500",
}

export { riskBadgeColors, riskIndicatorColors }

// ── Page header ────────────────────────────────────────────────────────────
export function DetailHeader({
  icon,
  title,
  riskLevel,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  riskLevel: string
  subtitle: string
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {icon}
        <h1 className="text-page-title">{title}</h1>
        <Badge
          className={cn(
            "capitalize text-sm px-3 py-1",
            riskBadgeColors[riskLevel] ?? riskBadgeColors.low,
          )}
        >
          {riskLevel}
        </Badge>
      </div>
      <p className="mt-1 text-body text-muted-foreground">{subtitle}</p>
    </div>
  )
}

// ── Risk score card ────────────────────────────────────────────────────────
export function RiskScoreCard({
  score,
  riskLevel,
  recommendation,
  accentColor = "amber",
}: {
  score: number
  riskLevel: string
  recommendation: string
  accentColor?: "amber" | "blue" | "red" | "green"
}) {
  const borderC = {
    amber: "border-amber-200 dark:border-amber-900",
    blue: "border-blue-200 dark:border-blue-900",
    red: "border-red-200 dark:border-red-900",
    green: "border-green-200 dark:border-green-900",
  }[accentColor]
  const bgC = {
    amber: "bg-amber-50 dark:bg-amber-950/30",
    blue: "bg-blue-50 dark:bg-blue-950/30",
    red: "bg-red-50 dark:bg-red-950/30",
    green: "bg-green-50 dark:bg-green-950/30",
  }[accentColor]
  const textHd = {
    amber: "text-amber-800 dark:text-amber-200",
    blue: "text-blue-800 dark:text-blue-200",
    red: "text-red-800 dark:text-red-200",
    green: "text-green-800 dark:text-green-200",
  }[accentColor]
  const textBody = {
    amber: "text-amber-700 dark:text-amber-300",
    blue: "text-blue-700 dark:text-blue-300",
    red: "text-red-700 dark:text-red-300",
    green: "text-green-700 dark:text-green-300",
  }[accentColor]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-section-title">Risk Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold font-data tabular-nums">
            {score}
          </span>
          <span className="text-caption">/ 100</span>
          <Progress
            value={score}
            className={cn(
              "flex-1",
              riskIndicatorColors[riskLevel] ?? riskIndicatorColors.low,
            )}
          />
        </div>
        <Separator />
        <div className={cn("rounded-lg border p-4", borderC, bgC)}>
          <p className={cn("font-medium", textHd)}>Recommendation</p>
          <p className={cn("mt-1 text-sm", textBody)}>{recommendation}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ── About card ─────────────────────────────────────────────────────────────
export function AboutCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-section-title">About {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-[14px] leading-[1.7] text-bark-600">
        {children}
      </CardContent>
    </Card>
  )
}

// ── Stat box (3-across) ────────────────────────────────────────────────────
export function StatBox({
  label,
  value,
  sub,
}: {
  label: string
  value: React.ReactNode
  sub?: string
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="text-caption font-medium uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold font-data tabular-nums">{value}</p>
      {sub && <p className="text-caption">{sub}</p>}
    </div>
  )
}

// ── Section card (generic wrapper) ─────────────────────────────────────────
export function SectionCard({
  title,
  icon,
  badge,
  children,
}: {
  title: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-section-title">
            {icon}
            {title}
          </CardTitle>
          {badge}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ── Product list ───────────────────────────────────────────────────────────
export function ProductList({ products }: { products: string[] }) {
  if (products.length === 0) return null
  return (
    <div className="mt-4">
      <p className="text-sm font-medium mb-2">Recommended Products</p>
      <div className="flex flex-wrap gap-2">
        {products.map((p) => (
          <span
            key={p}
            className="rounded-full bg-grove-100 dark:bg-grove-900/30 px-3 py-1 text-xs font-medium text-grove-700 dark:text-grove-300"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Condition dot (met / unmet) ────────────────────────────────────────────
export function ConditionDot({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span className={cn("text-sm", met ? "font-medium text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  )
}
