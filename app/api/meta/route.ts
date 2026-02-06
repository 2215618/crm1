import { NextResponse } from "next/server";
import { getMeta, touchMeta } from "@/lib/sheets/client";

export const dynamic = "force-dynamic";

/**
 * Used by the client hook `useCloudRefresh` to detect changes.
 * Always returns 200 to avoid crashing the UI.
 */
export async function GET() {
  try {
    const meta = await getMeta();
    return NextResponse.json(
      {
        last_change_ts: meta.last_change_ts || "",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/meta error:", error);
    return NextResponse.json({ last_change_ts: "" }, { status: 200 });
  }
}

/**
 * Optional: allows the app to "touch" the META tab to notify clients to refresh.
 */
export async function POST() {
  try {
    const meta = await touchMeta();
    return NextResponse.json(meta, { status: 200 });
  } catch (error) {
    console.error("POST /api/meta error:", error);
    return NextResponse.json({ last_change_ts: new Date().toISOString() }, { status: 200 });
  }
}
