import { getSheetData } from "@/lib/sheets/client";
import { mapRowsToProperties } from "@/lib/sheets/map";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHEET_NAME = "Properties";

export async function GET() {
  try {
    const rows = await getSheetData(SHEET_NAME, "A:Z");
    const data = mapRowsToProperties(rows.slice(1)); // saltar encabezado
    return Response.json(data, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/properties failed:", err?.message || err);
    // IMPORTANTE: devolvemos [] para que el front no se caiga con .map/.filter
    return Response.json([], { status: 200 });
  }
}
