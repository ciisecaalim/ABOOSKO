import { db } from "@/db";
import { products } from "@/db/schema";
import { PRODUCTS } from "@/lib/data";
import { sql } from "drizzle-orm";

let seeding: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (seeding) return seeding;
  seeding = (async () => {
    try {
      const count = await db.select({ c: sql<number>`count(*)` }).from(products);
      const n = Number(count[0]?.c || 0);
      if (n > 0) return;
      for (const p of PRODUCTS) {
        await db
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
          .onConflictDoNothing({ target: products.slug });
      }
    } catch {
      /* ignore — static fallback will be used */
    }
  })();
  return seeding;
}
