import { google } from 'googleapis';

/**
 * Env vars supported:
 * - Spreadsheet ID:
 *   - GOOGLE_SHEETS_SPREADSHEET_ID (recommended)
 *   - SHEET_ID (legacy)
 *   - SPREADSHEET_ID (legacy)
 *
 * - Service Account:
 *   - GOOGLE_SERVICE_ACCOUNT_JSON (recommended; full JSON as one line)
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY (legacy)
 */

let cachedSheets: ReturnType<typeof google.sheets> | null = null;

function getSpreadsheetId(): string {
  const id =
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
    process.env.SHEET_ID ||
    process.env.SPREADSHEET_ID;

  if (!id) {
    throw new Error(
      'Missing spreadsheet id env. Set GOOGLE_SHEETS_SPREADSHEET_ID (or SHEET_ID).'
    );
  }
  return id;
}

function getServiceAccount(): { clientEmail: string; privateKey: string } {
  const rawJson =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT;

  if (rawJson) {
    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON.');
    }

    const clientEmail = parsed?.client_email;
    const privateKey = parsed?.private_key;

    if (!clientEmail || !privateKey) {
      throw new Error(
        'Invalid service account JSON. Missing client_email and/or private_key.'
      );
    }

    return { clientEmail, privateKey };
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Missing service account env. Set GOOGLE_SERVICE_ACCOUNT_JSON (recommended) or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.'
    );
  }

  return { clientEmail, privateKey };
}

export function getSheetsClient() {
  if (cachedSheets) return cachedSheets;

  const { clientEmail, privateKey } = getServiceAccount();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  cachedSheets = google.sheets({ version: 'v4', auth });
  return cachedSheets;
}

export function getSheetId() {
  return getSpreadsheetId();
}
