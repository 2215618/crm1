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
    return NextResponse.json({ error: 'Failed to fetch meta' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const newTs = await touchMeta();
    return NextResponse.json({ ok: true, last_change_ts: newTs });
  } catch (error) {
    console.error("Meta POST Error:", error);
    return NextResponse.json({ error: 'Failed to update meta' }, { status: 500 });
  }
}