import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "";
  if (!sessionId) return NextResponse.json({ account: null });
  try {
    const rows = await getDb().select().from(accounts).where(eq(accounts.sessionId, sessionId)).limit(1);
    return NextResponse.json({ account: rows[0] || null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ account: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, name, email, phone, address, city, country } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "Missing session" }, { status: 400 });
    const existing = await getDb().select().from(accounts).where(eq(accounts.sessionId, sessionId)).limit(1);
    if (existing[0]) {
      await getDb().update(accounts).set({ name, email, phone, address, city, country }).where(eq(accounts.sessionId, sessionId));
    } else {
      await getDb().insert(accounts).values({ sessionId, name, email, phone, address, city, country });
    }
    const rows = await getDb().select().from(accounts).where(eq(accounts.sessionId, sessionId)).limit(1);
    return NextResponse.json({ account: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
