import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { reviews, products } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "";
  try {
    if (!slug) {
      const all = await getDb().select().from(reviews).orderBy(desc(reviews.createdAt)).limit(20);
      return NextResponse.json({ reviews: all });
    }
    const prow = await getDb().select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!prow[0]) return NextResponse.json({ reviews: [] });
    const rows = await getDb().select().from(reviews).where(eq(reviews.productId, prow[0].id)).orderBy(desc(reviews.createdAt)).limit(20);
    return NextResponse.json({ reviews: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, author, rating, title, body } = await req.json();
    if (!slug || !author || !rating || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const prow = await getDb().select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!prow[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [created] = await getDb().insert(reviews).values({ productId: prow[0].id, author, rating: Number(rating), title: title || "", body, verified: true }).returning();
    await getDb().update(products).set({ reviewCount: sql`${products.reviewCount} + 1` }).where(eq(products.id, prow[0].id));
    return NextResponse.json({ review: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
