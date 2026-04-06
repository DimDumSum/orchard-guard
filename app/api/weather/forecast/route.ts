import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();

    const now = new Date();
    const nowISO = now.toISOString().slice(0, 19).replace("T", " ");

    // Next 7 days of hourly data from the current timestamp
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endISO = endDate.toISOString().slice(0, 19).replace("T", " ");

    const hourly = db
      .prepare(
        `SELECT * FROM weather_hourly
         WHERE timestamp >= ?
           AND timestamp <= ?
         ORDER BY timestamp`
      )
      .all(nowISO, endISO);

    // Daily aggregations for the same window
    const startDate = now.toISOString().slice(0, 10);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const daily = db
      .prepare(
        `SELECT * FROM weather_daily
         WHERE date >= ?
           AND date <= ?
         ORDER BY date`
      )
      .all(startDate, endDateStr);

    return NextResponse.json({ hourly, daily });
  } catch (err) {
    console.error("[weather/forecast] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch weather forecast" },
      { status: 500 }
    );
  }
}
