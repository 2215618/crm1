import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets/client';
import { mapRowsToAppointments } from '@/lib/sheets/map';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await getSheetData('Appointments!A2:J');
    const appointments = mapRowsToAppointments(rows);
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}