import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envCheck = {
    hasSheetId: !!process.env.SHEET_ID,
    hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
  };

  if (!envCheck.hasSheetId || !envCheck.hasEmail || !envCheck.hasKey) {
    return NextResponse.json({ 
      ok: false, 
      status: 'Missing environment variables',
      details: envCheck 
    }, { status: 500 });
  }

  try {
    // Attempt to read META headers and value
    const data = await getSheetData('META!A1:A2');
    return NextResponse.json({ 
      ok: true, 
      status: 'Connected to Google Sheets',
      dataPreview: data 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      status: 'Connection failed',
      error: error.message 
    }, { status: 500 });
  }
}