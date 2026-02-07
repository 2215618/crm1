import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets/client';
import { mapRowsToLeads } from '@/lib/sheets/map';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Tab Name: 'GoldLeads'
    const rawData = await getSheetData('GoldLeads');
    const leads = mapRowsToLeads(rawData);
    return NextResponse.json(leads);
  } catch (error) {
    console.error("API Leads Error:", error);
    return NextResponse.json([], { status: 200 });
  }
}