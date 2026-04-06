"use client";

import Link from "next/link";
import {
  FlaskConical,
  Package,
  DollarSign,
  Sprout,
  Calendar,
  Users,
  Bell,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import type { LucideIcon } from "lucide-react";

const secondaryNavLinks: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/tank-mix", label: "Tank Mix", icon: FlaskConical },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/costs", label: "Costs", icon: DollarSign },
  { href: "/nutrition", label: "Nutrition", icon: Sprout },
  { href: "/history", label: "History", icon: Calendar },
  { href: "/workers", label: "Workers", icon: Users },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function SecondaryNav() {
  return (
    <TooltipProvider>
      {secondaryNavLinks.map(({ href, label, icon: Icon }) => (
        <Tooltip key={href}>
          <TooltipTrigger
            render={
              <Link
                href={href}
                className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              />
            }
          >
            <Icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  );
}

export { secondaryNavLinks };
