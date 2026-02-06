export type SheetSpec = {
  /** Internal key */
  key: string;
  /** Candidate tab names in Google Sheets (case-sensitive) */
  tabCandidates: string[];
  /** Header row index (1-based). Typically 1. */
  headerRow: number;
};

/**
 * IMPORTANT:
 * These candidates MUST match your Google Sheets tab names.
 * User confirmed tabs: Properties, Appointment, GoldLeads, META
 */
export const SHEETS: Record<"properties"|"appointments"|"leads"|"meta", SheetSpec> = {
  properties: {
    key: "properties",
    tabCandidates: [
      "Properties",
      "Propiedades",
      "PROPERTIES",
      "properties",
      "Inventory",
      "Inventario",
    ],
    headerRow: 1,
  },
  appointments: {
    key: "appointments",
    tabCandidates: [
      "Appointment",
      "Appointments",
      "Citas",
      "appointments",
      "appointment",
    ],
    headerRow: 1,
  },
  leads: {
    key: "leads",
    tabCandidates: [
      "GoldLeads",
      "Gold Leads",
      "Lista Dorada",
      "Leads",
      "leads",
      "goldleads",
    ],
    headerRow: 1,
  },
  meta: {
    key: "meta",
    tabCandidates: ["META", "Meta", "meta"],
    headerRow: 1,
  },
};
