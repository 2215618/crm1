import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getSpreadsheetId() {
  const id =
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
    process.env.SHEET_ID ||
    process.env.SPREADSHEET_ID;

  if (!id) {
    throw new Error(
      "Missing GOOGLE_SHEETS_SPREADSHEET_ID (o SHEET_ID / SPREADSHEET_ID)."
    );
  }
  return id;
}

function getServiceAccountFromEnv() {
  const jsonRaw =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT;

  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw);
      // private_key viene con \n en env variables, lo normalizamos
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return parsed;
    } catch (e) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON existe pero NO es JSON válido. Pégalo en 1 sola variable correctamente."
      );
    }
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing credentials. Usa GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY."
    );
  }

  return { client_email: clientEmail, private_key: privateKey };
}

function getAuthClient() {
  const spreadsheetId = getSpreadsheetId();
  const sa = getServiceAccountFromEnv();

  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: SCOPES,
  });

  return { auth, spreadsheetId };
}

export async function getSheetData(range: string) {
  const { auth, spreadsheetId } = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return res.data.values ?? [];
}

export async function appendSheetRow(range: string, values: any[]) {
  const { auth, spreadsheetId } = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });

  return res.data;
}

export async function updateSheetRow(range: string, values: any[]) {
  const { auth, spreadsheetId } = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });

  return res.data;
}
