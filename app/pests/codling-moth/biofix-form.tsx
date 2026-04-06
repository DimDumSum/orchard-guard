"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BiofixFormProps {
  currentBiofix: string | null;
  orchardId: number;
}

export function BiofixForm({ currentBiofix, orchardId }: BiofixFormProps) {
  const [date, setDate] = useState(currentBiofix ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch("/api/orchard/biofix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchardId,
          biofixDate: date || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Failed to update biofix date.");
        return;
      }

      setMessage("Biofix date updated successfully.");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="biofix-date">
          Biofix Date (first sustained moth catch)
        </Label>
        <div className="flex gap-3">
          <Input
            id="biofix-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Set Biofix"}
          </Button>
        </div>
      </div>

      {currentBiofix && (
        <p className="text-sm text-muted-foreground">
          Current biofix:{" "}
          <span className="font-medium">
            {new Date(currentBiofix + "T00:00:00").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </p>
      )}

      {!currentBiofix && (
        <p className="text-sm text-muted-foreground">
          No biofix date set. Set the date of first sustained codling moth catch
          in pheromone traps to begin degree-day tracking.
        </p>
      )}

      {message && (
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
          {message}
        </p>
      )}
    </form>
  );
}
