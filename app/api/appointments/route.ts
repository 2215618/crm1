import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets/client';
import { mapRowsToAppointments } from '@/lib/sheets/map';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // CORRECTED TAB NAME: 'Appointment' (Singular) as per user requirements
    const rawData = await getSheetData('Appointment');
    const appointments = mapRowsToAppointments(rawData);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("API Appointments Error:", error);
    // Always return 200 [] to prevent frontend crash
    return NextResponse.json([], { status: 200 });
  }
}