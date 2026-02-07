import { NextResponse } from 'next/server';
import { getMeta, touchMeta } from '@/lib/sheets/meta';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ts = await getMeta();
    const last_change_ts = ts || new Date().toISOString();
    return NextResponse.json({ last_change_ts });
  } catch (error) {
    console.error("Meta GET Error:", error);
    // Fallback to current time, prevent crash
    return NextResponse.json({ last_change_ts: new Date().toISOString() }, { status: 200 });
  }
}

export async function POST() {
  try {
    const newTs = await touchMeta();
    return NextResponse.json({ ok: true, last_change_ts: newTs });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}