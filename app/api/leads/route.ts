import { getSheetData } from "@/lib/sheets/client";
import { mapRowsToGoldLeads } from "@/lib/sheets/map";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHEET_NAME = "GoldLeads";

export async function GET() {
  try {
    const rows = await getSheetData(SHEET_NAME, "A:Z");
    const data = mapRowsToGoldLeads(rows.slice(1));
    return Response.json(data, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/leads failed:", err?.message || err);
    return Response.json([], { status: 200 });
  }
}
