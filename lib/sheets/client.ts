import { google } from "googleapis";

/**
 * Env vars requeridas:
 * - SHEET_ID
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_PRIVATE_KEY  (con \n, se normaliza)
 *
 * Opcional (compat):
 * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 */
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function requireSheetId(): string {
  return requireEnv("SHEET_ID");
}

export function requireServiceAccountEmail(): string {
  return requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
}

export function requirePrivateKey(): string {
  const raw =
    process.env.GOOGLE_PRIVATE_KEY ??
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ??
    "";
  if (!raw || !raw.trim()) {
    throw new Error(
      "Missing env var: GOOGLE_PRIVATE_KEY (or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)"
    );
  }
  // Vercel suele guardar el key con \n literales
  return raw.replace(/\\n/g, "\n");
}

let cachedAuth: any | null = null;
export function getGoogleAuth() {
  if (cachedAuth) return cachedAuth;

  cachedAuth = new google.auth.JWT({
    email: requireServiceAccountEmail(),
    key: requirePrivateKey(),
    scopes: SCOPES,
  });

  return cachedAuth;
}

let cachedSheets: any | null = null;
export function getSheets() {
  if (cachedSheets) return cachedSheets;

  cachedSheets = google.sheets({
    version: "v4",
    auth: getGoogleAuth(),
  });

  return cachedSheets;
}

/**
 * Devuelve los valores como matriz (rows).
 * Acepta:
 * - getSheetData("Properties")  -> usa "A:Z"
 * - getSheetData("Properties", "A1:Z999")
 * - getSheetData("Properties!A1:Z999") (si ya viene con "!")
 */
export async function getSheetData(
  sheetNameOrRange: string,
  a1Range: string = "A:Z"
): Promise<string[][]> {
  const sheets = getSheets();
  const spreadsheetId = requireSheetId();

  const range = sheetNameOrRange.includes("!")
    ? sheetNameOrRange
    : `${sheetNameOrRange}!${a1Range}`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return (res?.data?.values as string[][]) ?? [];
}

/**
 * Agrega una fila al final.
 */
export async function appendSheetRow(
  sheetName: string,
  values: any[],
  valueInputOption: "RAW" | "USER_ENTERED" = "USER_ENTERED"
) {
  const sheets = getSheets();
  const spreadsheetId = requireSheetId();

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption,
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });

  return res?.data;
}

function colToA1(n: number): string {
  let s = "";
  let x = n;
  while (x > 0) {
    const mod = (x - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

/**
 * Actualiza una fila específica (rowNumber es 1-based, ej: fila 2).
 * Por defecto actualiza desde columna A hasta el largo de values.
 */
export async function updateSheetRow(
  sheetName: string,
  rowNumber: number,
  values: any[],
  startColumn: string = "A",
  valueInputOption: "RAW" | "USER_ENTERED" = "USER_ENTERED"
) {
  if (!Number.isFinite(rowNumber) || rowNumber < 1) {
    throw new Error(`updateSheetRow: invalid rowNumber: ${rowNumber}`);
  }

  const sheets = getSheets();
  const spreadsheetId = requireSheetId();

  // Si empiezas en A, el final es length. Si cambias startColumn, mantenemos simple.
  // (Lo normal en este proyecto es A)
  const endColumn = colToA1(values.length || 1);

  const range = `${sheetName}!${startColumn}${rowNumber}:${endColumn}${rowNumber}`;

  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption,
    requestBody: { values: [values] },
  });

  return res?.data;
}
