"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/70 backdrop-blur-2xl px-4">
      <Link
        href="/"
        className="text-[14px] font-semibold tracking-[2px] text-foreground uppercase"
      >
        OrchardGuard
      </Link>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 font-mono text-[11px] text-primary font-medium">
          <div className="size-1.5 rounded-full bg-primary animate-glow-pulse" />
        </div>
      </div>
    </header>
  )
}
