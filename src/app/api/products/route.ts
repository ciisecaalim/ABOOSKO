import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, asc, desc, gte, lte, sql, ilike, or } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensure-seed";
import { PRODUCTS } from "@/lib/data";

function staticFallback(sp: URLSearchParams) {
  const q = (sp.get("q") || "").toLowerCase();
  const category = sp.get("category") || "";
  const brand = sp.get("brand") || "";
  const scent = sp.get("scent") || sp.get("scentType") || "";
  const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : 1000;
  const sort = sp.get("sort") || "popular";
  const flag = sp.get("flag") || "";
  const page = Math.max(1, Number(sp.get("page") || "1"));
  const perPage = Math.min(24, Math.max(1, Number(sp.get("perPage") || "12")));
  let items = [...PRODUCTS];
  if (q) items = items.filter((p) => (p.name + p.brand + p.category).toLowerCase().includes(q));
  if (category) items = items.filter((p) => p.category === category);
  if (brand) { const bs = brand.split(","); items = items.filter((p) => bs.includes(p.brand)); }
  if (scent) { const ss = scent.split(","); items = items.filter((p) => ss.includes(p.scentType)); }
  items = items.filter((p) => p.price <= maxPrice);
  if (flag === "best") items = items.filter((p) => p.isBestSeller);
  if (flag === "new") items = items.filter((p) => p.isNewArrival);
  if (flag === "featured") items = items.filter((p) => p.isFeatured);
  if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
  else if (sort === "rating") items.sort((a, b) => b.rating - a.rating);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const slice = items.slice((safePage - 1) * perPage, safePage * perPage).map((p) => ({
    slug: p.slug, name: p.name, brand: p.brand, price: p.price, compareAt: p.compareAt ?? null,
    rating: p.rating, reviewCount: p.reviewCount, image: p.image, badge: p.badge ?? null,
    category: p.category, scentType: p.scentType,
  }));
  return { items: slice, total, page: safePage, totalPages, perPage };
}

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const sp = req.nextUrl.searchParams;
    const q = sp.get("q") || "";
    const category = sp.get("category") || "";
    const brand = sp.get("brand") || "";
    const scent = sp.get("scent") || sp.get("scentType") || "";
    const minPrice = sp.get("minPrice") ? Number(sp.get("minPrice")) : 0;
    const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : 1000;
    const sort = sp.get("sort") || "popular";
    const flag = sp.get("flag") || "";
    const page = Math.max(1, Number(sp.get("page") || "1"));
    const perPage = Math.min(24, Math.max(1, Number(sp.get("perPage") || "12")));

    const conds = [];
    if (q) {
      conds.push(or(ilike(products.name, `%${q}%`), ilike(products.brand, `%${q}%`), ilike(products.category, `%${q}%`)));
    }
    if (category && category !== "All") conds.push(sql`${products.category} = ${category}`);
    if (brand && brand !== "All") {
      const brands = brand.split(",").filter(Boolean);
      if (brands.length === 1) conds.push(sql`${products.brand} = ${brands[0]}`);
      else if (brands.length > 1) conds.push(sql`${products.brand} = ANY(${brands})`);
    }
    if (scent && scent !== "All") {
      const scents = scent.split(",").filter(Boolean);
      if (scents.length === 1) conds.push(sql`${products.scentType} = ${scents[0]}`);
      else if (scents.length > 1) conds.push(sql`${products.scentType} = ANY(${scents})`);
    }
    conds.push(gte(products.price, minPrice));
    conds.push(lte(products.price, maxPrice));
    if (flag === "best") conds.push(sql`${products.isBestSeller} = true`);
    if (flag === "new") conds.push(sql`${products.isNewArrival} = true`);
    if (flag === "featured") conds.push(sql`${products.isFeatured} = true`);

    const where = conds.length ? and(...conds) : undefined;

    let orderBy: ReturnType<typeof desc> | ReturnType<typeof asc> | ReturnType<typeof sql> = desc(products.reviewCount);
    if (sort === "price-asc") orderBy = asc(products.price);
    else if (sort === "price-desc") orderBy = desc(products.price);
    else if (sort === "rating") orderBy = desc(products.rating);
    else if (sort === "newest") orderBy = desc(products.createdAt);
    else if (sort === "name") orderBy = asc(products.name);

    const all = await db.select().from(products).where(where).orderBy(orderBy as never);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(page, totalPages);
    const items = all.slice((safePage - 1) * perPage, safePage * perPage);

    if (total === 0) {
      const fb = staticFallback(sp);
      if (fb.total > 0) return NextResponse.json(fb);
    }
    return NextResponse.json({ items, total, page: safePage, totalPages, perPage });
  } catch (e) {
    console.error("products GET error", e);
    try {
      return NextResponse.json(staticFallback(req.nextUrl.searchParams));
    } catch {
      return NextResponse.json({ items: [], total: 0, page: 1, totalPages: 1 }, { status: 500 });
    }
  }
}
