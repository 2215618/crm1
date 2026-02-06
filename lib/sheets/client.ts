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


// -----------------------------
// META helpers (for cloud refresh)
// -----------------------------

function isIsoDate(s: string) {
  return typeof s === "string" && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s);
}

async function resolveMetaTitle() {
  // Local import to avoid circular deps
  const { SHEETS } = await import("./meta");
  return resolveSheetTitle(SHEETS.meta.tabCandidates);
}

/**
 * Reads the META tab and returns a last_change_ts value if present.
 * Supports either:
 * - A1 = ISO timestamp
 * - A1 = "last_change_ts" and B1 = ISO timestamp
 * - A column with "last_change_ts" in col A and value in col B
 */
export async function getMeta(): Promise<{ last_change_ts: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) return { last_change_ts: "" };

    const title = await resolveMetaTitle();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${title}!A1:B20`,
    });

    const values = (res.data.values || []) as string[][];

    if (values.length === 0) return { last_change_ts: "" };

    const a1 = (values[0]?.[0] || "").trim();
    const b1 = (values[0]?.[1] || "").trim();

    if (isIsoDate(a1)) return { last_change_ts: a1 };
    if (a1.toLowerCase() === "last_change_ts" && isIsoDate(b1)) return { last_change_ts: b1 };

    // search down column A
    for (const row of values) {
      const k = (row?.[0] || "").toLowerCase().trim();
      const v = (row?.[1] || "").trim();
      if (k === "last_change_ts" && isIsoDate(v)) return { last_change_ts: v };
    }

    return { last_change_ts: "" };
  } catch (e) {
    console.error("getMeta error:", e);
    return { last_change_ts: "" };
  }
}

/**
 * Updates META with a new timestamp and returns it.
 * Prefers writing:
 * - If A1 == "last_change_ts" => set B1
 * - Else set A1 to timestamp
 */
export async function touchMeta(): Promise<{ last_change_ts: string }> {
  const ts = new Date().toISOString();

  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) return { last_change_ts: ts };

    const title = await resolveMetaTitle();

    // read first cell(s) to decide layout
    const head = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${title}!A1:B1`,
    });
    const row = (head.data.values?.[0] || []) as string[];
    const a1 = (row?.[0] || "").toLowerCase().trim();

    const targetRange = a1 === "last_change_ts" ? `${title}!B1` : `${title}!A1`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: targetRange,
      valueInputOption: "RAW",
      requestBody: { values: [[ts]] },
    });

    return { last_change_ts: ts };
  } catch (e) {
    console.error("touchMeta error:", e);
    return { last_change_ts: ts };
  }
}
