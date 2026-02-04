import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/sheets/client";
import { SHEETS } from "@/lib/sheets/meta";

export const dynamic = "force-dynamic";

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function buildHeaderIndex(headers: string[]) {
  const m = new Map<string, number>();
  headers.forEach((h, i) => {
    const k = norm(h);
    if (k && !m.has(k)) m.set(k, i);
  });
  return m;
}

function pick(row: string[], idx: Map<string, number>, keys: string[], fallback = "") {
  for (const k of keys) {
    const i = idx.get(norm(k));
    if (i !== undefined && row[i] !== undefined && row[i] !== "") return row[i];
  }
  return fallback;
}

function rowsToProperties(rows: string[][]) {
  if (!rows.length) return [];
  const headers = rows[0] ?? [];
  const idx = buildHeaderIndex(headers);

  const out: any[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    if (!row.some((c) => (c ?? "").toString().trim() !== "")) continue;

    const id = pick(row, idx, ["id", "codigo"], "") || `P-${r}`;
    const titulo = pick(row, idx, ["titulo", "title", "nombre"], "");
    const tipo = pick(row, idx, ["tipo", "type"], "");
    const precio = pick(row, idx, ["precio", "price"], "");
    const distrito = pick(row, idx, ["distrito", "zona"], "");
    const direccion = pick(row, idx, ["direccion", "address"], "");
    const estado = pick(row, idx, ["estado", "status"], "Disponible");
    const imagen = pick(row, idx, ["imagen", "image", "foto"], "");

    out.push({ id, titulo, tipo, precio, distrito, direccion, estado, imagen });
  }
  return out;
}

export async function GET() {
  try {
    const rows = await getSheetData(SHEETS.properties);
    const data = rowsToProperties(rows);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("API /properties failed:", err?.message || err);
    return NextResponse.json([], { status: 200 });
  }
}
