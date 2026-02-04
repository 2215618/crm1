import type { SheetSpec } from "./client";

const env = (k: string) => process.env[k]?.trim();
const DEFAULT_RANGE = "A1:ZZ";

export const SHEETS = {
  properties: {
    tab: env("SHEET_TAB_PROPERTIES"),
    tabCandidates: ["Propiedades", "properties", "Inventario", "Inventory", "Hoja1", "Sheet1"],
    range: env("SHEET_RANGE_PROPERTIES") || DEFAULT_RANGE,
  } satisfies SheetSpec,

  leads: {
    tab: env("SHEET_TAB_LEADS"),
    tabCandidates: ["Leads", "Clientes", "Prospectos", "Hoja2", "Sheet2"],
    range: env("SHEET_RANGE_LEADS") || DEFAULT_RANGE,
  } satisfies SheetSpec,

  appointments: {
    tab: env("SHEET_TAB_APPOINTMENTS"),
    tabCandidates: ["Citas", "Agenda", "Appointments", "Hoja3", "Sheet3"],
    range: env("SHEET_RANGE_APPOINTMENTS") || DEFAULT_RANGE,
  } satisfies SheetSpec,
} as const;
