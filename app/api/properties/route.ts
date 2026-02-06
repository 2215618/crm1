import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/sheets/client";
import { SHEETS } from "@/lib/sheets/meta";
import { mapRowsToProperties } from "@/lib/sheets/map";

export const dynamic = "force-dynamic";

/**
 * Returns a UI-friendly shape to avoid client crashes.
 * Always returns 200 with an array (possibly empty).
 */
export async function GET() {
  try {
    const raw = await getSheetData(SHEETS.properties);
    const mapped = mapRowsToProperties(raw, { headerRow: SHEETS.properties.headerRow });

    const view = mapped.map((p) => ({
      id: p.id,
      title: p.category ? `${p.category} | ${p.propertyType}` : p.propertyType,
      type: p.propertyType,
      district: p.district,

      // Both keys to support different UIs
      status: p.status, // normalized: available/reserved/unavailable
      estado:
        p.status === "available"
          ? "Disponible"
          : p.status === "reserved"
          ? "Reservada"
          : "No disponible",

      price: p.priceSoles,
      address: p.address,
      ownerName: p.ownerName,
      features: p.features,
      front: p.front,
      depth: p.depth,
      area: p.area,
      deposit: p.depositSoles,
      category: p.category,
    }));

    return NextResponse.json(view, { status: 200 });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
