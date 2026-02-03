import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets/client';
import { mapRowsToProperties } from '@/lib/sheets/map';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Assuming row 1 is headers, data starts at A2
    const rows = await getSheetData('Properties!A2:Q');
    const properties = mapRowsToProperties(rows);
    return NextResponse.json(properties);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}