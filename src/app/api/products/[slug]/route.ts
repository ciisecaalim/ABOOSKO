import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, ne, sql } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensure-seed";
import { PRODUCTS } from "@/lib/data";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  try {
    await ensureSeeded();
    const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    const product = rows[0];
    if (!product) {
      const fb = PRODUCTS.find((p) => p.slug === slug);
      if (!fb) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const related = PRODUCTS.filter((p) => p.slug !== slug && (p.category === fb.category || p.brand === fb.brand)).slice(0, 4);
      const fill = related.length >= 4 ? related : [...related, ...PRODUCTS.filter((p) => p.slug !== slug && !related.includes(p)).slice(0, 4 - related.length)];
      return NextResponse.json({
        product: { ...fb, compareAt: fb.compareAt ?? null, badge: fb.badge ?? null, gallery: JSON.stringify(fb.gallery), sizes: JSON.stringify(fb.sizes) },
        related: fill.map((p) => ({ slug: p.slug, name: p.name, brand: p.brand, price: p.price, compareAt: p.compareAt ?? null, rating: p.rating, reviewCount: p.reviewCount, image: p.image, badge: p.badge ?? null })),
      });
    }
    const related = await db
      .select()
      .from(products)
      .where(sql`${products.id} != ${product.id} AND (${products.category} = ${product.category} OR ${products.brand} = ${product.brand})`)
      .limit(4);
    let fill = related;
    if (fill.length < 4) {
      const more = await db.select().from(products).where(ne(products.id, product.id)).limit(4 - fill.length);
      const seen = new Set(fill.map((r) => r.id));
      fill = [...fill, ...more.filter((m) => !seen.has(m.id))];
    }
    return NextResponse.json({ product, related: fill });
  } catch (e) {
    console.error(e);
    const fb = PRODUCTS.find((p) => p.slug === slug);
    if (fb) {
      return NextResponse.json({
        product: { ...fb, compareAt: fb.compareAt ?? null, badge: fb.badge ?? null, gallery: JSON.stringify(fb.gallery), sizes: JSON.stringify(fb.sizes) },
        related: PRODUCTS.filter((p) => p.slug !== slug).slice(0, 4).map((p) => ({ slug: p.slug, name: p.name, brand: p.brand, price: p.price, compareAt: p.compareAt ?? null, rating: p.rating, reviewCount: p.reviewCount, image: p.image, badge: p.badge ?? null })),
      });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
