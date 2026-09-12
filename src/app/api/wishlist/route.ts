import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { wishlistItems, products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensure-seed";

async function itemsFor(sessionId: string) {
  const rows = await getDb()
    .select({
      productId: wishlistItems.productId,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      image: products.image,
      price: products.price,
      rating: products.rating,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.sessionId, sessionId));
  return rows.map((r) => ({
    productId: r.productId,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    image: r.image,
    price: r.price,
    rating: r.rating ? Number(r.rating) : 4.5,
  }));
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "guest";
  try {
    const items = await itemsFor(sessionId);
    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const { sessionId, slug } = await req.json();
    if (!sessionId || !slug) return NextResponse.json({ error: "Missing" }, { status: 400 });
    const prow = await getDb().select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!prow[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const existing = await getDb()
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.sessionId, sessionId), eq(wishlistItems.productId, prow[0].id)))
      .limit(1);
    let wished = true;
    if (existing[0]) {
      await getDb().delete(wishlistItems).where(and(eq(wishlistItems.sessionId, sessionId), eq(wishlistItems.productId, prow[0].id)));
      wished = false;
    } else {
      await getDb().insert(wishlistItems).values({ sessionId, productId: prow[0].id });
    }
    const items = await itemsFor(sessionId);
    return NextResponse.json({ items, wished });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
