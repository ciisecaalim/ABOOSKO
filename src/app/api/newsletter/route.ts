import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    try {
      await db.insert(subscribers).values({ email: email.toLowerCase().trim() });
    } catch {
      // already subscribed — treat as success
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
