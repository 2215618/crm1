import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// --- CONFIG ---
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Helper to determine if we are in Mock Mode
const isMockMode = !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY;

// Cache seed data in memory for mock mode
let seedData: any = null;
if (isMockMode) {
  try {
    // process.cwd() is required for Next.js API routes to find files
    // Casting process to any to avoid TypeScript error 'Property cwd does not exist on type Process'
    const seedPath = path.join((process as any).cwd(), 'data', 'seed.json');
    if (fs.existsSync(seedPath)) {
        seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
        console.warn("⚠️ CRM RUNNING IN MOCK MODE (No Credentials Found). Using local seed data.");
    }
  } catch (e) {
    console.error("Failed to load seed data", e);
  }
}

/**
 * Returns an authenticated Google Sheets client.
 * Throws error if credentials are missing and strictly required.
 */
export async function getSheets() {
  if (isMockMode) return null;

  const jwt = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    SCOPES
  );

  await jwt.authorize();
  return google.sheets({ version: 'v4', auth: jwt });
}

/**
 * Reads values from a specific range.
 * Abstraction that handles both Real and Mock modes.
 */
export async function getSheetData(rangeName: string) {
  if (isMockMode) {
    if (!seedData) return [];
    
    // Simple mock logic parsing range names like 'Properties!A2:Q'
    const tableName = rangeName.split('!')[0].toLowerCase();
    
    if (tableName.includes('meta')) {
        // Return headers and the last change timestamp
        return [['last_change_ts'], [seedData.meta.last_change_ts]];
    }
    
    // Simulate table structure for other sheets
    const data = seedData[tableName];
    if (!data || data.length === 0) return [];
    
    // Convert array of objects back to array of arrays (rows)
    // We assume the first object defines the schema/order
    const headers = Object.keys(data[0]);
    const rows = data.map((item: any) => headers.map(h => item[h]));
    return rows;
  }

  const sheets = await getSheets();
  if (!sheets) throw new Error("Failed to initialize Google Sheets client");

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: rangeName,
  });
  
  return response.data.values || [];
}

/**
 * Updates a specific range.
 * Handles META updates separately in mock mode.
 */
export async function updateSheetRow(range: string, values: any[]) {
  if (isMockMode) {
    if (range.includes('META')) {
        if (seedData && seedData.meta) {
            seedData.meta.last_change_ts = values[0]; // Assuming values is [timestamp]
        }
    }
    return; 
  }

  const sheets = await getSheets();
  if (!sheets) throw new Error("Failed to initialize Google Sheets client");

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

/**
 * Appends a row to a sheet.
 */
export async function appendSheetRow(range: string, values: any[]) {
  if (isMockMode) return;

  const sheets = await getSheets();
  if (!sheets) throw new Error("Failed to initialize Google Sheets client");

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });

  // Always touch meta after an append in real mode
  // Note: Circular dependency if we import touchMeta here, so we rely on the caller or direct update
  const now = new Date().toISOString();
  await updateSheetRow('META!A2', [now]);
}