import "server-only";
import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";

let cachedClient: sheets_v4.Sheets | null = null;

function normalizePrivateKey(key?: string) {
  if (!key) return "";
  // Vercel a veces guarda saltos como \n literales
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

export function getSheetId(): string {
  return process.env.SHEET_ID ?? "";
}

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (cachedClient) return cachedClient;

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail) throw new Error("Missing env: GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!privateKeyRaw) throw new Error("Missing env: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: normalizePrivateKey(privateKeyRaw),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

function colLetter(n: number) {
  // 1 -> A, 26 -> Z, 27 -> AA ...
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s || "A";
}

/**
 * Export compatible con lo que tus rutas y meta.ts están importando.
 * Uso típico:
 *   const values = await getSheetData("Properties");
 *   const values = await getSheetData("Properties", "A:ZZ");
 *   const values = await getSheetData("Properties", "Properties!A:ZZ");
 */
export async function getSheetData(...args: any[]): Promise<any[][]> {
  const sheetName = String(args?.[0] ?? "");
  if (!sheetName) throw new Error("getSheetData: missing sheetName");

  const spreadsheetId = getSheetId();
  if (!spreadsheetId) throw new Error("Missing env: SHEET_ID");

  const sheets = await getSheetsClient();

  let range = args?.[1] ? String(args[1]) : `${sheetName}!A:ZZ`;
  // Si te pasan "A:ZZ" lo convertimos a "Sheet!A:ZZ"
  if (!range.includes("!")) range = `${sheetName}!${range}`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  return (res.data.values as any[][]) ?? [];
}

/**
 * Export compatible con lo que meta.ts está importando.
 *
 * Soporta 3 modos comunes:
 * 1) updateSheetRow("META", 2, ["a","b","c"])
 * 2) updateSheetRow("META", 2, { col1:"x", col2:"y" })   // mapea por headers (fila 1)
 * 3) updateSheetRow("META!A2:Z2", [["a","b"]])
 */
export async function updateSheetRow(...args: any[]): Promise<void> {
  const spreadsheetId = getSheetId();
  if (!spreadsheetId) throw new Error("Missing env: SHEET_ID");

  const sheets = await getSheetsClient();

  let range = "";
  let values: any[][] = [];

  // Modo 3: (rangeA1, values)
  if (typeof args?.[0] === "string" && args[0].includes("!") && args.length >= 2) {
    range = String(args[0]);
    const v = args[1];
    values = Array.isArray(v?.[0]) ? v : [v];
  } else {
    // Modo 1/2: (sheetName, rowNumber, rowValues|object)
    const sheetName = String(args?.[0] ?? "");
    const rowNumber = Number(args?.[1]);
    const rowData = args?.[2];

    if (!sheetName) throw new Error("updateSheetRow: missing sheetName");
    if (!Number.isFinite(rowNumber) || rowNumber <= 0) {
      throw new Error("updateSheetRow: invalid rowNumber");
    }

    // Si es array: update directo desde A{row}
    if (Array.isArray(rowData)) {
      values = [rowData];
      range = `${sheetName}!A${rowNumber}`;
    } else if (rowData && typeof rowData === "object") {
      // Si es objeto: mapeo por headers en la fila 1
      const headerRows = await getSheetData(sheetName, `${sheetName}!1:1`);
      const headers = (headerRows?.[0] ?? []).map((h: any) => String(h).trim());

      if (!headers.length) throw new Error(`updateSheetRow: no headers found in ${sheetName} row 1`);

      const rowValues = new Array(headers.length).fill("");

      for (const [k, v] of Object.entries(rowData)) {
        const idx = headers.findIndex((h) => h === k);
        if (idx >= 0) rowValues[idx] = v as any;
      }

      const endCol = colLetter(headers.length);
      range = `${sheetName}!A${rowNumber}:${endCol}${rowNumber}`;
      values = [rowValues];
    } else {
      throw new Error("updateSheetRow: rowData must be array or object");
    }
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
