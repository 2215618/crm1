import { getSheetData } from "@/lib/sheets/client";
import { mapRowsToAppointments } from "@/lib/sheets/map";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHEET_NAME = "Appointments";

export async function GET() {
  try {
    const rows = await getSheetData(SHEET_NAME, "A:Z");
    const data = mapRowsToAppointments(rows.slice(1));
    return Response.json(data, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/appointments failed:", err?.message || err);
    return Response.json([], { status: 200 });
  }
}
