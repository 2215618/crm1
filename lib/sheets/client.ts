import { google, sheets_v4 } from "googleapis";

export type SheetSpec = {
  tab?: string;                // nombre exacto de la pestaña (tab) en Google Sheets
  tabCandidates?: string[];     // candidatos (si no sabes el nombre exacto)
  range?: string;              // rango sin el tab, ej "A1:ZZ"
};

type CachedClient = {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __LG_SHEETS_CACHE__: CachedClient | undefined;
}

function requireEnv(name: string, value?: string) {
  const v = value?.trim();
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getSpreadsheetId() {
  return (
    process.env.GOOGLE_SHEET_ID ||
    process.env.GOOGLE_SPREADSHEET_ID ||
    process.env.SPREADSHEET_ID ||
    process.env.SHEET_ID ||
    ""
  ).trim();
}

function getClientEmail() {
  return (
    process.env.GOOGLE_CLIENT_EMAIL ||
    process.env.GCP_CLIENT_EMAIL ||
    process.env.CLIENT_EMAIL ||
    ""
  ).trim();
}

function getPrivateKey() {
  const raw =
    process.env.GOOGLE_PRIVATE_KEY ||
    process.env.GCP_PRIVATE_KEY ||
    process.env.PRIVATE_KEY ||
    "";
  return raw.replace(/\\n/g, "\n").trim();
}

function normalizeTitle(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function quoteSheetTitle(title: string) {
  const safe = title.replace(/'/g, "''");
  return `'${safe}'`;
}

export function getSheetsClient(): CachedClient {
  if (globalThis.__LG_SHEETS_CACHE__) return globalThis.__LG_SHEETS_CACHE__;

  const spreadsheetId = requireEnv(
    "GOOGLE_SHEET_ID (o GOOGLE_SPREADSHEET_ID/SPREADSHEET_ID/SHEET_ID)",
    getSpreadsheetId() || undefined
  );

  const clientEmail = requireEnv("GOOGLE_CLIENT_EMAIL", getClientEmail() || undefined);
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY", getPrivateKey() || undefined);

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  globalThis.__LG_SHEETS_CACHE__ = { sheets, spreadsheetId };
  return globalThis.__LG_SHEETS_CACHE__;
}

export async function listSheetTitles(): Promise<string[]> {
  const { sheets, spreadsheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(title))",
  });

  return (
    res.data.sheets
      ?.map((s) => s.properties?.title)
      .filter((t): t is string => !!t) ?? []
  );
}

export async function resolveSheetTitle(spec: SheetSpec): Promise<string> {
  if (spec.tab?.trim()) return spec.tab.trim();

  const titles = await listSheetTitles();
  if (!titles.length) throw new Error("Spreadsheet has no sheets/tabs");

  const candidates = (spec.tabCandidates ?? []).map((c) => c.trim()).filter(Boolean);
  if (!candidates.length) return titles[0];

  const byNorm = new Map(titles.map((t) => [normalizeTitle(t), t]));
  for (const c of candidates) {
    const hit = byNorm.get(normalizeTitle(c));
    if (hit) return hit;
  }

  // parcial
  for (const t of titles) {
    const nt = normalizeTitle(t);
    if (candidates.some((c) => nt.includes(normalizeTitle(c)))) return t;
  }

  return titles[0];
}

export async function getSheetData(spec: SheetSpec): Promise<string[][]> {
  const { sheets, spreadsheetId } = getSheetsClient();
  const title = await resolveSheetTitle(spec);
  const range = spec.range?.trim() || "A1:ZZ";

  const a1 = `${quoteSheetTitle(title)}!${range}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: a1,
    majorDimension: "ROWS",
  });

  const values = res.data.values ?? [];
  return values.map((row) => row.map((cell) => (cell ?? "").toString()));
}

function colToA1(colIndex: number) {
  let n = colIndex + 1;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export async function appendSheetRow(
  spec: SheetSpec,
  row: (string | number | boolean | null)[]
) {
  const { sheets, spreadsheetId } = getSheetsClient();
  const title = await resolveSheetTitle(spec);
  const range = `${quoteSheetTitle(title)}!A:ZZ`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

export async function updateSheetRow(
  spec: SheetSpec,
  rowIndex1Based: number,
  row: (string | number | boolean | null)[]
) {
  const { sheets, spreadsheetId } = getSheetsClient();
  const title = await resolveSheetTitle(spec);

  const lastCol = colToA1(Math.max(0, row.length - 1));
  const range = `${quoteSheetTitle(title)}!A${rowIndex1Based}:${lastCol}${rowIndex1Based}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export async function getSpreadsheetMeta() {
  const { sheets, spreadsheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "spreadsheetId,properties(title),sheets(properties(sheetId,title,index))",
  });
  return res.data;
}
