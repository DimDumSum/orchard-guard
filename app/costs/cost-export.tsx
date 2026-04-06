"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface SprayEntry {
  date: string;
  product: string;
  target: string;
  rate: string | null;
  cost: number | null;
}

export function CostExport({ sprays }: { sprays: SprayEntry[] }) {
  function handleExport() {
    const header = "Date,Product,Target,Rate,Cost";
    const rows = sprays.map((s) => {
      const date = s.date;
      const product = `"${(s.product ?? "").replace(/"/g, '""')}"`;
      const target = `"${(s.target ?? "").replace(/"/g, '""')}"`;
      const rate = s.rate ? `"${s.rate.replace(/"/g, '""')}"` : "";
      const cost = s.cost != null ? s.cost.toFixed(2) : "";
      return `${date},${product},${target},${rate},${cost}`;
    });

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `orchard-guard-costs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="size-4" data-icon="inline-start" />
      Export CSV
    </Button>
  );
}
