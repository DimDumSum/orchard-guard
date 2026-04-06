"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshWeatherButtonProps {
  lat: number;
  lon: number;
}

export function RefreshWeatherButton({ lat, lon }: RefreshWeatherButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleRefresh() {
    setMessage(null);

    try {
      const res = await fetch(
        `/api/weather/current?lat=${lat}&lon=${lon}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Failed to refresh weather data.");
        return;
      }

      const data = await res.json();
      setMessage(
        `Fetched ${data.hourlyCount ?? 0} hourly records from Open-Meteo.`
      );

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleRefresh}
        disabled={isPending}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Refreshing..." : "Refresh Weather"}
      </Button>
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
