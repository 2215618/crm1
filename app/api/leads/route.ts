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

function rowsToLeads(rows: string[][]) {
  if (!rows.length) return [];
  const headers = rows[0] ?? [];
  const idx = buildHeaderIndex(headers);

  const out: any[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    if (!row.some((c) => (c ?? "").toString().trim() !== "")) continue;

    const id =
      pick(row, idx, ["id", "codigo", "code"], "") || `L-${r}`;

    const nombre = pick(row, idx, ["nombre", "cliente", "fullname", "name"], "");
    const telefono = pick(row, idx, ["telefono", "celular", "phone", "whatsapp"], "");
    const estado = pick(row, idx, ["estado", "status"], "Nuevo");
    const prioridad = pick(row, idx, ["prioridad", "priority"], "Media");
    const fuente = pick(row, idx, ["fuente", "source"], "Sheets");
    const fecha = pick(row, idx, ["fecha", "createdat", "creado", "registro"], "");
    const notas = pick(row, idx, ["notas", "nota", "comentarios", "comments"], "");

    // Compatibilidad (si tu UI usa "celular" o "telefono")
    out.push({
      id,
      nombre,
      telefono,
      celular: telefono,
      estado,
      prioridad,
      fuente,
      fecha,
      notas,
    });
  }
  return out;
}

export async function GET() {
  try {
    const rows = await getSheetData(SHEETS.leads);
    const leads = rowsToLeads(rows);
    return NextResponse.json(leads, { status: 200 });
  } catch (err: any) {
    console.error("API /leads failed:", err?.message || err);
    // IMPORTANTE: no devolvemos 500 para que el frontend no crashee
    return NextResponse.json([], { status: 200 });
  }
}
