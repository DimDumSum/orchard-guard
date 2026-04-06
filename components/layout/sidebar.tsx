"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const mainLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/weather", label: "Weather" },
  { href: "/spray-log", label: "Spray Log" },
  { href: "/irrigation", label: "Irrigation" },
  { href: "/diseases", label: "Models" },
  { href: "/settings", label: "Settings" },
]

const moreLinks = [
  { href: "/tank-mix", label: "Tank Mix" },
  { href: "/inventory", label: "Inventory" },
  { href: "/checklist", label: "Checklist" },
  { href: "/costs", label: "Costs" },
  { href: "/pests", label: "Pests" },
  { href: "/spray-log/guide", label: "Spray Guide" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/history", label: "History" },
  { href: "/workers", label: "Workers" },
  { href: "/alerts", label: "Alerts" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    if (moreOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [moreOpen])

  // Close on navigation
  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  return (
    <nav className="hidden lg:flex fixed top-0 left-0 right-0 h-14 items-center px-10 z-50 border-b border-border bg-background/70 backdrop-blur-2xl">
      {/* Brand */}
      <Link
        href="/"
        className="text-[14px] font-semibold tracking-[2px] text-foreground uppercase shrink-0"
      >
        OrchardGuard
      </Link>

      {/* Center nav links */}
      <div className="flex gap-8 mx-auto items-center">
        {mainLinks.map(({ href, label }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-[12px] tracking-[1.2px] uppercase py-1 transition-colors",
                active
                  ? "text-foreground border-b border-primary pb-0.5"
                  : "text-muted-foreground hover:text-bark-600",
              )}
            >
              {label}
            </Link>
          )
        })}

        {/* More dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "text-[12px] tracking-[1.2px] uppercase py-1 transition-colors cursor-pointer",
              moreOpen
                ? "text-foreground"
                : "text-muted-foreground hover:text-bark-600",
            )}
          >
            More
          </button>
          {moreOpen && (
            <div className="absolute top-full mt-3 right-0 w-48 rounded-xl border border-border bg-background/80 backdrop-blur-2xl py-2 z-50"
              style={{ boxShadow: 'var(--glass-shadow-hover)' }}
            >
              {moreLinks.map(({ href, label }) => {
                const active =
                  pathname === href ||
                  (href !== "/" && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "block px-4 py-2 text-[12px] tracking-[0.5px] transition-colors",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-card-hover",
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right side: theme toggle + status */}
      <div className="flex items-center gap-4 shrink-0">
        <ThemeToggle />
        <div className="flex items-center gap-2 font-mono text-[11px] text-primary font-medium">
          <div className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
          Nominal
        </div>
      </div>
    </nav>
  )
}
