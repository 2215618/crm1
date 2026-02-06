import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/sheets/client";
import { SHEETS } from "@/lib/sheets/meta";
import { mapRowsToAppointments } from "@/lib/sheets/map";

export const dynamic = "force-dynamic";

/**
 * Always returns 200 with an array (possibly empty).
 */
export async function GET() {
  try {
    const raw = await getSheetData(SHEETS.appointments);
    const appts = mapRowsToAppointments(raw, { headerRow: SHEETS.appointments.headerRow });
    return NextResponse.json(appts, { status: 200 });
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
