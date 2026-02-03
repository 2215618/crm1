import { getSheetData, updateSheetRow } from './client';

/**
 * Reads the last_change_ts from META!A2.
 * Returns null if empty or error.
 */
export async function getMeta(): Promise<string | null> {
  try {
    const rows = await getSheetData('META!A2:A2');
    if (rows && rows.length > 0 && rows[0].length > 0) {
      return rows[0][0];
    }
    return null;
  } catch (error) {
    console.error("Error reading META:", error);
    return null;
  }
}

/**
 * Writes the current ISO timestamp to META!A2.
 * Returns the new timestamp.
 */
export async function touchMeta(): Promise<string> {
  const now = new Date().toISOString();
  try {
    await updateSheetRow('META!A2', [now]);
    return now;
  } catch (error) {
    console.error("Error touching META:", error);
    throw error;
  }
}