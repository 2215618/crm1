import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets/client';
import { mapRowsToLeads } from '@/lib/sheets/map';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await getSheetData('GoldLeads!A2:H');
    const leads = mapRowsToLeads(rows);
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}