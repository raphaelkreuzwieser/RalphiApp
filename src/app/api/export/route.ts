import { NextResponse } from "next/server";
import { assertAdminAction } from "@/lib/admin";

/**
 * CSV-Export des offiziellen Rankings (Semikolon-getrennt), nur für Admins.
 * Spalten: Platz;Username;Land;Zeit;Status
 */
export async function GET() {
  const g = await assertAdminAction();
  if (!g.ok) {
    return NextResponse.json({ error: g.error }, { status: 403 });
  }

  const { data } = await g.adminClient
    .from("ranking")
    .select("username, country_id, time_seconds")
    .order("time_seconds", { ascending: true });

  const rows: string[] = ["Platz;Username;Land;Zeit;Status"];
  (data ?? []).forEach((r: any, i: number) => {
    const zeit = Number(r.time_seconds).toFixed(2).replace(".", ",");
    rows.push(`${i + 1};${r.username};${r.country_id};${zeit};approved`);
  });

  const csv = "﻿" + rows.join("\r\n"); // BOM für Excel-Umlaute
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="shotrace-ranking.csv"',
    },
  });
}
