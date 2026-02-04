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

function rowsToAppointments(rows: string[][]) {
  if (!rows.length) return [];
  const headers = rows[0] ?? [];
  const idx = buildHeaderIndex(headers);

  const out: any[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    if (!row.some((c) => (c ?? "").toString().trim() !== "")) continue;

    const id = pick(row, idx, ["id", "codigo"], "") || `A-${r}`;
    const fecha = pick(row, idx, ["fecha", "date"], "");
    const hora = pick(row, idx, ["hora", "time"], "");
    const cliente = pick(row, idx, ["cliente", "nombre", "name"], "");
    const telefono = pick(row, idx, ["telefono", "celular", "phone", "whatsapp"], "");
    const propiedad = pick(row, idx, ["propiedad", "inmueble", "titulo"], "");
    const estado = pick(row, idx, ["estado", "status"], "Programada");
    const notas = pick(row, idx, ["notas", "comentarios"], "");

    out.push({ id, fecha, hora, cliente, telefono, propiedad, estado, notas });
  }
  return out;
}

export async function GET() {
  try {
    const rows = await getSheetData(SHEETS.appointments);
    const data = rowsToAppointments(rows);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("API /appointments failed:", err?.message || err);
    return NextResponse.json([], { status: 200 });
  }
}
