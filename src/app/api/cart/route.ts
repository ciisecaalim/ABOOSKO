import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensure-seed";

async function linesFor(sessionId: string) {
  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      size: cartItems.size,
      qty: cartItems.qty,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      image: products.image,
      price: products.price,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.sessionId, sessionId));
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    image: r.image,
    price: r.price,
    size: r.size || "50 ml",
    qty: r.qty || 1,
  }));
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "guest";
  try {
    const lines = await linesFor(sessionId);
    return NextResponse.json({ lines });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ lines: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const { sessionId, slug, size = "50 ml", qty = 1 } = await req.json();
    if (!sessionId || !slug) return NextResponse.json({ error: "Missing" }, { status: 400 });
    const prow = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!prow[0]) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, prow[0].id), eq(cartItems.size, size)))
      .limit(1);
    if (existing[0]) {
      await db.update(cartItems).set({ qty: Math.min(9, (existing[0].qty || 1) + qty) }).where(eq(cartItems.id, existing[0].id));
    } else {
      await db.insert(cartItems).values({ sessionId, productId: prow[0].id, size, qty });
    }
    const lines = await linesFor(sessionId);
    return NextResponse.json({ lines });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, id, qty } = await req.json();
    if (!sessionId || !id) return NextResponse.json({ error: "Missing" }, { status: 400 });
    if (qty <= 0) {
      await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)));
    } else {
      await db.update(cartItems).set({ qty: Math.min(9, qty) }).where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)));
    }
    const lines = await linesFor(sessionId);
    return NextResponse.json({ lines });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "";
  const id = req.nextUrl.searchParams.get("id") || "";
  const clear = req.nextUrl.searchParams.get("clear") || "";
  try {
    if (clear && sessionId) {
      await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    } else if (id && sessionId) {
      await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.sessionId, sessionId)));
    }
    const lines = sessionId ? await linesFor(sessionId) : [];
    return NextResponse.json({ lines });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
