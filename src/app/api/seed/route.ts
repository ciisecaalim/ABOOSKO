import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { PRODUCTS } from "@/lib/data";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    const existing = await db.select({ slug: products.slug }).from(products);
    const have = new Set(existing.map((e) => e.slug));
    let inserted = 0;
    for (const p of PRODUCTS) {
      if (have.has(p.slug)) continue;
      const [row] = await db
        .insert(products)
        .values({
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          tagline: p.tagline,
          description: p.description,
          category: p.category,
          scentType: p.scentType,
          gender: p.gender,
          price: p.price,
          compareAt: p.compareAt ?? null,
          rating: String(p.rating),
          reviewCount: p.reviewCount,
          image: p.image,
          gallery: JSON.stringify(p.gallery),
          sizes: JSON.stringify(p.sizes),
          stock: p.stock,
          badge: p.badge ?? null,
          isBestSeller: !!p.isBestSeller,
          isNewArrival: !!p.isNewArrival,
          isFeatured: !!p.isFeatured,
          notesTop: p.notesTop,
          notesHeart: p.notesHeart,
          notesBase: p.notesBase,
          ingredients: p.ingredients,
          howToUse: p.howToUse,
        })
        .returning();
      inserted++;
      // seed 2 reviews for featured products
      if (p.isBestSeller || p.isFeatured) {
        await db.insert(reviews).values([
          {
            productId: row.id,
            author: "Amira Hassan",
            rating: 5,
            title: "Absolutely divine",
            body: `I wear ${p.name} almost daily — elegant sillage, beautiful dry-down and the bottle looks stunning on my vanity. ABOOSTO delivery was fast and gift-wrapped.`,
            verified: true,
          },
          {
            productId: row.id,
            author: "Noura Mohamed",
            rating: 5,
            title: "100% authentic & long-lasting",
            body: "Original, sealed and long-lasting. I get compliments every time. The sample gifts from ABOOSTO were such a lovely touch.",
            verified: true,
          },
        ]);
      }
    }
    return NextResponse.json({ ok: true, inserted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
