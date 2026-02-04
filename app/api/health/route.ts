import { NextResponse } from "next/server";
import { getSpreadsheetMeta, listSheetTitles } from "@/lib/sheets/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const titles = await listSheetTitles();
    const meta = await getSpreadsheetMeta();
    return NextResponse.json({
      ok: true,
      spreadsheetId: meta.spreadsheetId,
      title: meta.properties?.title,
      sheetTitles: titles,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err),
    });
  }
}
