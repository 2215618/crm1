import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/sheets/client";
import { SHEETS } from "@/lib/sheets/meta";
import { mapRowsToLeads } from "@/lib/sheets/map";

export const dynamic = "force-dynamic";

/**
 * Always returns 200 with an array (possibly empty).
 */
export async function GET() {
  try {
    const raw = await getSheetData(SHEETS.leads);
    const leads = mapRowsToLeads(raw, { headerRow: SHEETS.leads.headerRow });
    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
