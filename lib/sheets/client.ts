import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// --- ENV VAR NORMALIZATION ---
export function getSheetId(): string | undefined {
  return process.env.SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.SPREADSHEET_ID;
}

function getServiceEmail(): string | undefined {
  return process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
}

function getPrivateKey(): string | undefined {
  const key = process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  // CRITICAL: Handle newline characters correctly for Vercel/Node envs
  return key ? key.replace(/\\n/g, '\n') : undefined;
}

/**
 * Returns an authenticated Google Sheets client.
 */
export async function getSheetsClient() {
  const email = getServiceEmail();
  const privateKey = getPrivateKey();

  if (!email || !privateKey) {
    console.warn("⚠️ Sheets Client: Missing Credentials (EMAIL or PRIVATE_KEY).");
    return null;
  }

  try {
    const auth = new google.auth.JWT(
      email,
      undefined,
      privateKey,
      SCOPES
    );
    
    await auth.authorize();
    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error("Authentication Error:", error);
    return null;
  }
}

/**
 * Reads values and converts them to an Array of Objects based on the Header row.
 * Returns [] on ANY error to prevent 500s.
 */
export async function getSheetData(sheetName: string): Promise<Record<string, string>[]> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = getSheetId();

    if (!sheets || !spreadsheetId) {
      console.warn(`getSheetData: Missing configuration for ${sheetName}`);
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`, 
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    // Headers: lowercase, trimmed, underscores
    const headers = rows[0].map(h => h.toLowerCase().trim().replace(/\s+/g, '_'));
    const dataRows = rows.slice(1);

    return dataRows.map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

  } catch (error) {
    console.error(`Error reading sheet "${sheetName}":`, error);
    // Never throw, always return array
    return [];
  }
}

/**
 * Appends a row by mapping an Object to the Sheet's existing headers.
 */
export async function appendSheetRow(sheetName: string, data: Record<string, any>) {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = getSheetId();

    if (!sheets || !spreadsheetId) throw new Error("Missing Sheets configuration");

    // 1. Fetch headers
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
      throw new Error(`Sheet "${sheetName}" has no headers.`);
    }

    const headers = headerResponse.data.values[0].map((h: string) => h.toLowerCase().trim().replace(/\s+/g, '_'));

    // 2. Map data
    const rowValues = headers.map(header => {
      const val = data[header];
      if (val === true) return "TRUE";
      if (val === false) return "FALSE";
      if (Array.isArray(val)) return val.join(',');
      return val !== undefined && val !== null ? String(val) : "";
    });

    // 3. Append
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowValues] },
    });
    
    // 4. Touch META
    await touchMetaInternal(sheets, spreadsheetId);

  } catch (error) {
    console.error(`Error appending to "${sheetName}":`, error);
    throw error; 
  }
}

/**
 * Reads raw range values (for META)
 */
export async function getRangeValues(sheetName: string, range: string): Promise<string[][]> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = getSheetId();
    if (!sheets || !spreadsheetId) return [];

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });
    return (response.data.values as string[][]) || [];
  } catch (e) {
    console.error(`Error reading range ${sheetName}!${range}`, e);
    return [];
  }
}

export async function updateSheetRow(sheetName: string, range: string, values: any[]) {
    try {
        const sheets = await getSheetsClient();
        const spreadsheetId = getSheetId();
        if (!sheets || !spreadsheetId) return;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!${range}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [values] },
        });
    } catch (error) {
        console.error(`Error updating "${sheetName}":`, error);
    }
}

async function touchMetaInternal(sheets: any, spreadsheetId: string) {
    try {
        const now = new Date().toISOString();
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'META!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[now]] },
        });
    } catch (e) {
        // ignore meta errors
    }
}