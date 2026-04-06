// ---------------------------------------------------------------------------
// OrchardGuard Worker Safety & REI Tracking Page — Server Component
//
// Shows active REIs, PHI countdowns, and a worker roster with an add form.
// ---------------------------------------------------------------------------

import { getDb } from "@/lib/db";
import type { SprayLogRow, WorkerRow } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Users,
  ShieldAlert,
  Clock,
  CalendarCheck,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { AddWorkerForm } from "./add-worker-form";

// Assumed harvest date for PHI countdown
const HARVEST_DATE = new Date(new Date().getFullYear(), 9, 15); // Oct 15

export default async function WorkersPage() {
  const db = getDb();
  const now = new Date();

  // --- Active REIs -------------------------------------------------------
  // Spray entries that have REI hours set, where now - spray time < REI hours
  const allSprays = db
    .prepare(
      `SELECT * FROM spray_log
       WHERE orchard_id = 1 AND rei_hours IS NOT NULL AND rei_hours > 0
       ORDER BY date DESC, created_at DESC`,
    )
    .all() as SprayLogRow[];

  interface ActiveREI {
    id: number;
    blockName: string;
    product: string;
    appliedTime: Date;
    reiHours: number;
    expiryTime: Date;
    hoursRemaining: number;
    percentRemaining: number;
  }

  const activeREIs: ActiveREI[] = [];

  for (const spray of allSprays) {
    if (!spray.rei_hours) continue;
    // Use spray date + created_at time for precision; fall back to date noon
    const appliedTime = spray.created_at
      ? new Date(spray.created_at)
      : new Date(spray.date + "T12:00:00");
    const expiryTime = new Date(
      appliedTime.getTime() + spray.rei_hours * 60 * 60 * 1000,
    );
    const hoursRemaining =
      (expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining > 0) {
      activeREIs.push({
        id: spray.id,
        blockName: spray.block_name ?? "All blocks",
        product: spray.product,
        appliedTime,
        reiHours: spray.rei_hours,
        expiryTime,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        percentRemaining: (hoursRemaining / spray.rei_hours) * 100,
      });
    }
  }

  // --- PHI countdowns ----------------------------------------------------
  const phiSprays = db
    .prepare(
      `SELECT * FROM spray_log
       WHERE orchard_id = 1 AND phi_days IS NOT NULL AND phi_days > 0
       ORDER BY date DESC`,
    )
    .all() as SprayLogRow[];

  interface PHICountdown {
    id: number;
    product: string;
    applicationDate: string;
    phiDays: number;
    clearanceDate: Date;
    daysRemaining: number;
    daysUntilHarvest: number;
    isClear: boolean;
  }

  const phiCountdowns: PHICountdown[] = [];

  for (const spray of phiSprays) {
    if (!spray.phi_days) continue;
    const appDate = new Date(spray.date + "T00:00:00");
    const clearanceDate = new Date(
      appDate.getTime() + spray.phi_days * 24 * 60 * 60 * 1000,
    );
    const daysRemaining = Math.ceil(
      (clearanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysUntilHarvest = Math.ceil(
      (HARVEST_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Only show sprays from the current season that haven't cleared or are close
    const yearStart = new Date(now.getFullYear(), 0, 1);
    if (appDate >= yearStart) {
      phiCountdowns.push({
        id: spray.id,
        product: spray.product,
        applicationDate: spray.date,
        phiDays: spray.phi_days,
        clearanceDate,
        daysRemaining: Math.max(daysRemaining, 0),
        daysUntilHarvest: Math.max(daysUntilHarvest, 0),
        isClear: daysRemaining <= 0,
      });
    }
  }

  // --- Workers roster ----------------------------------------------------
  let workers: WorkerRow[] = [];
  try {
    workers = db
      .prepare(
        `SELECT * FROM workers
         WHERE orchard_id = 1
         ORDER BY name ASC`,
      )
      .all() as WorkerRow[];
  } catch {
    // Table may not exist yet
  }

  // Helpers
  function reiColorClass(percentRemaining: number): string {
    if (percentRemaining > 50) {
      return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30";
    }
    if (percentRemaining > 25) {
      return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30";
    }
    return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30";
  }

  function reiStatusBadge(percentRemaining: number) {
    if (percentRemaining > 50) {
      return <Badge variant="destructive">Active - Do Not Enter</Badge>;
    }
    if (percentRemaining > 25) {
      return (
        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
          Caution
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-600 text-white hover:bg-green-700">
        Clearing Soon
      </Badge>
    );
  }

  function fmtDateTime(d: Date): string {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function fmtDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function notifIcon(pref: string) {
    switch (pref) {
      case "sms":
        return <MessageSquare className="size-3.5" />;
      case "email":
        return <Mail className="size-3.5" />;
      case "both":
        return (
          <span className="flex items-center gap-0.5">
            <Mail className="size-3.5" />
            <MessageSquare className="size-3.5" />
          </span>
        );
      default:
        return <Mail className="size-3.5" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-page-title flex items-center gap-2">
          <Users className="size-6 text-indigo-600" />
          Worker Safety &amp; REI Tracking
        </h1>
        <p className="text-body text-muted-foreground">
          Monitor re-entry intervals, pre-harvest intervals, and manage your
          worker roster.
        </p>
      </div>

      {/* Active REIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <ShieldAlert className="size-5 text-red-500" />
            Active Re-Entry Intervals (REI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeREIs.length > 0 ? (
            <div className="space-y-3">
              {activeREIs.map((rei) => (
                <div
                  key={`rei-${rei.id}`}
                  className={`rounded-lg border p-4 ${reiColorClass(rei.percentRemaining)}`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rei.product}</p>
                        {reiStatusBadge(rei.percentRemaining)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Block: {rei.blockName}
                      </p>
                    </div>
                    <div className="text-sm space-y-0.5 sm:text-right">
                      <p>
                        <Clock className="inline size-3.5 mr-1" />
                        Applied: {fmtDateTime(rei.appliedTime)}
                      </p>
                      <p>
                        Expires: {fmtDateTime(rei.expiryTime)}
                      </p>
                      <p className="font-semibold">
                        {rei.hoursRemaining.toFixed(1)}h remaining of{" "}
                        {rei.reiHours}h REI
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <ShieldAlert className="size-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                No active re-entry intervals
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All blocks are safe for worker entry.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PHI countdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <CalendarCheck className="size-5 text-amber-600" />
            Pre-Harvest Interval (PHI) Countdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {phiCountdowns.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>PHI (days)</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead>Clearance Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phiCountdowns.map((phi) => (
                    <TableRow key={`phi-${phi.id}`}>
                      <TableCell className="font-medium">
                        {phi.product}
                      </TableCell>
                      <TableCell>{fmtDate(phi.applicationDate)}</TableCell>
                      <TableCell>{phi.phiDays}</TableCell>
                      <TableCell>
                        {phi.isClear ? (
                          <span className="text-green-600 font-medium">
                            Cleared
                          </span>
                        ) : (
                          <span className="font-medium">
                            {phi.daysRemaining}d
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {phi.clearanceDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {phi.isClear ? (
                          <Badge className="bg-green-600 text-white hover:bg-green-700">
                            Safe
                          </Badge>
                        ) : phi.daysRemaining <= phi.daysUntilHarvest ? (
                          <Badge className="bg-green-600 text-white hover:bg-green-700">
                            Clears Before Harvest
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Extends Past Harvest
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-3">
                Harvest date assumed: Oct 15, {now.getFullYear()}. Adjust in
                Settings if needed.
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <CalendarCheck className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No products with PHI recorded this season.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PHI tracking begins when sprays with pre-harvest intervals are
                logged.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Worker roster */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-section-title">
            <Users className="size-5 text-indigo-500" />
            Worker Roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Notifications</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell>
                      {w.role ? (
                        <Badge variant="outline" className="capitalize">
                          {w.role}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {w.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3.5 text-muted-foreground" />
                          {w.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {w.email ? (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3.5 text-muted-foreground" />
                          {w.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        {notifIcon(w.notification_preference)}
                        <span className="capitalize text-xs">
                          {w.notification_preference}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      {w.active ? (
                        <Badge className="bg-green-600 text-white hover:bg-green-700">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <Users className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No workers added yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use the form below to add your first worker.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add worker form */}
      <AddWorkerForm />
    </div>
  );
}
