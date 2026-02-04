// lib/sheets/client.ts
import { google } from "googleapis";

let cachedSheets: ReturnType<typeof google.sheets> | null = null;

function normalizePrivateKey(key: string) {
  // Soporta keys pegadas como JSON con \\n
  return key.replace(/\\n/g, "\n");
}

function getSpreadsheetId() {
  const id = process.env.SHEET_ID;
  if (!id) throw new Error("Missing env SHEET_ID");
  return id;
}

function getServiceAccountCredentials() {
  // Opción A: JSON completo (si lo usas)
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email/private_key");
    }
    return {
      client_email: String(parsed.client_email),
      private_key: normalizePrivateKey(String(parsed.private_key)),
    };
  }

  // Opción B: variables separadas (lo más común en Vercel)
  const email =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    process.env.GOOGLE_CLIENT_EMAIL;

  const privateKeyRaw =
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    process.env.GOOGLE_PRIVATE_KEY ||
    process.env.GOOGLE_PRIVATE_KEY_ID; // (por si alguien lo puso mal, igual lo intentamos)

  if (!email) throw new Error("Missing env GOOGLE_SERVICE_ACCOUNT_EMAIL (or GOOGLE_CLIENT_EMAIL)");
  if (!privateKeyRaw) throw new Error("Missing env GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (or GOOGLE_PRIVATE_KEY)");

  return {
    client_email: email,
    private_key: normalizePrivateKey(privateKeyRaw),
  };
}

export function getSheetsClient() {
  if (cachedSheets) return cachedSheets;

  const { client_email, private_key } = getServiceAccountCredentials();

  const auth = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedSheets = google.sheets({ version: "v4", auth });
  return cachedSheets;
}

// Útil si en algún lado lo usas directamente
export function getSheetId() {
  return getSpreadsheetId();
}

/**
 * Lee datos de Google Sheets.
 * range ejemplo: "Properties!A2:Q"  o  "Appointments!A2:H"
 */
export async function getSheetData(range: string) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return res.data.values ?? [];
}

/**
 * Actualiza un rango específico.
 * range ejemplo: "Properties!A10:Q10"
 */
export async function updateSheetRow(range: string, values: any[][]) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  return { ok: true };
}

/**
 * Inserta una nueva fila al final.
 * range ejemplo: "Properties!A:Q"
 */
export async function appendSheetRow(range: string, values: any[][]) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });

  return res.data;
}
