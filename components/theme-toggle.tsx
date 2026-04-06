"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycle() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label =
    theme === "light"
      ? "Light mode"
      : theme === "dark"
        ? "Dark mode"
        : "System theme";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycle}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" />
    </Button>
  );
}
