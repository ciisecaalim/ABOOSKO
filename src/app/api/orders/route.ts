import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, cartItems, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const CODES: Record<string, number> = { ABOOSTO15: 15, WELCOME10: 10, LUXE20: 20 };

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || "";
  const email = req.nextUrl.searchParams.get("email") || "";
  try {
    if (email) {
      const rows = await db.select().from(orders).where(eq(orders.email, email)).orderBy(desc(orders.createdAt)).limit(20);
      return NextResponse.json({ orders: rows });
    }
    if (sessionId) {
      const rows = await db.select().from(orders).where(eq(orders.sessionId, sessionId)).orderBy(desc(orders.createdAt)).limit(20);
      const withItems = await Promise.all(
        rows.map(async (o) => {
          const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
          return { ...o, items };
        })
      );
      return NextResponse.json({ orders: withItems });
    }
    return NextResponse.json({ orders: [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, email, firstName, lastName, address, city, zip, country, phone, shippingMethod, paymentMethod, discountCode } = body;
    if (!sessionId || !email) return NextResponse.json({ error: "Email and session required" }, { status: 400 });

    const cart = await db
      .select({ qty: cartItems.qty, size: cartItems.size, price: products.price, name: products.name, image: products.image, productId: products.id })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));
    if (!cart.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const subtotal = cart.reduce((s, l) => s + (l.qty || 1) * l.price, 0);
    const shipBase = shippingMethod === "express" ? 18 : shippingMethod === "gift" ? 14 : subtotal >= 50 ? 0 : 10;
    let discount = 0;
    const code = (discountCode || "").toUpperCase().trim();
    if (code && CODES[code]) discount = Math.round((subtotal * CODES[code]) / 100);
    const total = Math.max(0, subtotal + shipBase - discount);

    const [order] = await db
      .insert(orders)
      .values({
        sessionId,
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        address: address || "",
        city: city || "",
        zip: zip || "",
        country: country || "",
        phone: phone || "",
        shippingMethod: shippingMethod || "standard",
        paymentMethod: paymentMethod || "card",
        subtotal,
        shipping: shipBase,
        discount,
        total,
        discountCode: code || null,
        status: "confirmed",
      })
      .returning();

    for (const l of cart) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: l.productId,
        name: l.name,
        size: l.size || "50 ml",
        qty: l.qty || 1,
        price: l.price,
        image: l.image,
      });
    }
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    return NextResponse.json({ order });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
