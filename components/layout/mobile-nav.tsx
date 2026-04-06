"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ClipboardList,
  CloudSun,
  Droplets,
  Menu,
  FlaskConical,
  Package,
  DollarSign,
  Settings,
  Leaf,
  Bug,
  BookOpen,
  Sprout,
  Calendar,
  Users,
  Bell,
  CheckSquare,
  X,
} from "lucide-react"
import { useState } from "react"

const primaryTabs = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/spray-log", label: "Spray Log", icon: ClipboardList },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/irrigation", label: "Irrigation", icon: Droplets },
]

const moreItems = [
  { href: "/tank-mix", label: "Tank Mix", icon: FlaskConical },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/checklist", label: "Checklist", icon: CheckSquare },
  { href: "/costs", label: "Costs", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/diseases", label: "Diseases", icon: Leaf },
  { href: "/pests", label: "Pests", icon: Bug },
  { href: "/spray-log/guide", label: "Spray Guide", icon: BookOpen },
  { href: "/nutrition", label: "Nutrition", icon: Sprout },
  { href: "/history", label: "History", icon: Calendar },
  { href: "/workers", label: "Workers", icon: Users },
  { href: "/alerts", label: "Alerts", icon: Bell },
]

export function MobileNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      {/* More panel overlay */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-border bg-background/90 backdrop-blur-2xl p-4 pb-8 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-[2px] text-bark-600">More</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-md hover:bg-secondary transition-colors"
              >
                <X className="size-5 text-bark-400" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {moreItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl py-3 px-1 text-[11px] font-medium transition-colors",
                    pathname === href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="size-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/70 backdrop-blur-2xl">
        <div className="flex items-stretch">
          {primaryTabs.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors min-h-[52px] justify-center",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors min-h-[52px] justify-center cursor-pointer",
              moreOpen ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Menu className="size-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
