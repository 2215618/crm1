import { NextResponse } from 'next/server';
import { getRangeValues, getSheetId } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const hasEnv = !!getSheetId() && !!serviceEmail;
  
  let sheetConnection = false;
  let errorDetail = '';

  if (hasEnv) {
    try {
      // Try to read one cell from META to verify permission
      await getRangeValues('META', 'A1');
      sheetConnection = true;
    } catch (e: any) {
      errorDetail = e.message;
    }
  }

  return NextResponse.json({
    status: sheetConnection ? 'healthy' : (hasEnv ? 'degraded' : 'mock-mode'),
    env_configured: hasEnv,
    sheet_connected: sheetConnection,
    error: errorDetail
  });
}