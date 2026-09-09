"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Badge, Rating } from "@/components/ui";
import { ProductCard, CardProduct } from "@/components/product";
import { BRANDS, SCENT_TYPES, IMG } from "@/lib/data";

const CATS = ["Women", "Men", "Unisex", "Gift Sets", "Signature"];
const SORTS = [
  { v: "popular", l: "Popularity" },
  { v: "newest", l: "Newest" },
  { v: "price-asc", l: "Price: Low to High" },
  { v: "price-desc", l: "Price: High to Low" },
  { v: "rating", l: "Top Rated" },
];

function ShopInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<CardProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [category, setCategory] = useState(sp.get("category") || "");
  const [brands, setBrands] = useState<string[]>([]);
  const [scents, setScents] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(350);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(sp.get("q") || "");
  const flag = sp.get("flag") || "";

  useEffect(() => {
    setCategory(sp.get("category") || "");
    setQ(sp.get("q") || "");
    setPage(1);
  }, [sp]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (brands.length) p.set("brand", brands.join(","));
    if (scents.length) p.set("scent", scents.join(","));
    p.set("maxPrice", String(maxPrice));
    p.set("sort", sort);
    if (flag) p.set("flag", flag);
    p.set("page", String(page));
    p.set("perPage", "9");
    return p.toString();
  }, [q, category, brands, scents, maxPrice, sort, flag, page]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/products?${query}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setItems((d.items || []).map((p: Record<string, unknown>) => ({ ...p, rating: Number(p.rating ?? 4.5) })));
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [query]);

  function toggle(list: string[], v: string, set: (x: string[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    setPage(1);
  }

  function clearAll() {
    setCategory(""); setBrands([]); setScents([]); setMaxPrice(350); setQ(""); setPage(1);
    router.push("/shop");
  }

  const activeCount = (category ? 1 : 0) + brands.length + scents.length + (maxPrice < 350 ? 1 : 0) + (q ? 1 : 0);

  const filters = (
    <div className="space-y-7 [&>div+div]:border-t [&>div+div]:border-[#520a22]/10 [&>div+div]:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-base font-semibold text-[#520a22]">Filters</h3>
        <button onClick={clearAll} className="text-xs text-[#8a767e] hover:text-[#520a22] underline underline-offset-2 cursor-pointer">Clear All{activeCount > 0 && ` (${activeCount})`}</button>
      </div>

      <div>
        <h4 className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#2b2024] mb-3">Category</h4>
        <div className="space-y-2.5">
          {CATS.map((c) => (
            <label key={c} className="flex items-center gap-3 text-sm cursor-pointer group">
              <input type="checkbox" checked={category === c} onChange={() => { setCategory(category === c ? "" : c); setPage(1); }} className="w-4 h-4 accent-[#520a22]" />
              <span className="text-[#2b2024]/80 group-hover:text-[#520a22]">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#2b2024] mb-3">Price Range</h4>
        <input type="range" min={50} max={350} value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} className="w-full accent-[#520a22]" />
        <div className="flex justify-between text-xs text-[#8a767e] mt-1"><span>$50</span><span className="font-semibold text-[#520a22]">Up to ${maxPrice}</span></div>
      </div>

      <div>
        <h4 className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#2b2024] mb-3">Brand</h4>
        <div className="space-y-2.5 max-h-[210px] overflow-y-auto pr-1">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-3 text-sm cursor-pointer group">
              <input type="checkbox" checked={brands.includes(b)} onChange={() => toggle(brands, b, setBrands)} className="w-4 h-4 accent-[#520a22]" />
              <span className="text-[#2b2024]/80 group-hover:text-[#520a22]">{b}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#2b2024] mb-3">Scent Type</h4>
        <div className="flex flex-wrap gap-2">
          {SCENT_TYPES.map((s) => (
            <button key={s} onClick={() => toggle(scents, s, setScents)} className={`px-4 py-2 rounded-full text-xs font-medium border transition cursor-pointer ${scents.includes(s) ? "bg-[#520a22] text-white border-[#520a22]" : "border-[#520a22]/15 text-[#2b2024]/70 hover:border-[#520a22]"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#2b2024] mb-3">Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3].map((r) => (
            <div key={r} className="flex items-center gap-2 text-sm text-[#8a767e]"><Rating value={r} /> <span className="text-xs">& up</span></div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden relative">
        <img src={IMG.giftRoses} alt="Gift sets" className="w-full h-44 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3d0718]/85 to-transparent flex flex-col justify-end p-4 text-left">
          <p className="font-serif text-white text-lg leading-tight">Luxury Gifts<br />For Special Moments</p>
          <span className="text-[#e6c988] text-xs mt-2 underline underline-offset-2">Shop Gift Sets</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f3ede7]">
      <section className="relative isolate overflow-hidden bg-[#34212c]" aria-labelledby="shop-title">
        <img src={IMG.flatlay} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(43,19,33,.94), rgba(62,31,47,.82) 45%, rgba(62,31,47,.28))" }} />
        <div className="relative mx-auto max-w-[1440px] px-6 py-10 sm:px-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-3 text-[11px] text-[#eedde1]/75">
            <Link href="/" className="hover:text-white">Home</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-[#f0d6b5]">Shop</span>
          </nav>
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[#dfbc94]">The fragrance collection</p>
          <h1 id="shop-title" className="font-sans text-[clamp(2rem,4vw,3.5rem)] font-medium leading-tight tracking-[-0.04em] text-[#fff5ed]">Find your signature scent.</h1>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-[#eadbdc]">Exceptional perfumes, timeless favourites, and a little something unexpected. Curated for you.</p>
        </div>
      </section>
      <nav aria-label="Fragrance categories" className="border-b border-[#520a22]/10 bg-[#e9ded8]/60">
        <div className="mx-auto flex max-w-[1440px] gap-7 overflow-x-auto px-6 sm:px-10">
          {["", ...CATS].map((c) => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); }} aria-pressed={category === c} className={"shrink-0 border-b-2 py-5 text-xs font-medium transition-colors cursor-pointer " + (category === c ? "border-[#520a22] text-[#520a22]" : "border-transparent text-[#77636b] hover:text-[#520a22]")}>
              {c || "All fragrances"}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-7 sm:py-9 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-8">
        {/* sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="border-r border-[#520a22]/10 pr-7 py-1">{filters}</div>
        </aside>

        <div>
          {/* toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-[#520a22]/10 flex-wrap">
            <button onClick={() => setFiltersOpen(true)} className="lg:hidden inline-flex items-center gap-2 border border-[#520a22]/15 rounded-full px-5 py-2.5 text-sm bg-white cursor-pointer">
              <SlidersHorizontal size={15} /> Filters {activeCount > 0 && <Badge tone="burgundy" className="!px-2">{activeCount}</Badge>}
            </button>
            <p className="hidden lg:block text-sm text-[#8a767e]">Showing <strong className="text-[#520a22]">{items.length}</strong> of {total} products</p>
            <div className="flex items-center gap-3 ml-auto">
              <label htmlFor="shop-sort" className="text-xs text-[#8a767e] hidden sm:block">Sort by</label>
              <select id="shop-sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="lux-input !w-auto !rounded-lg !bg-transparent !py-2.5 text-sm pr-4 cursor-pointer">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>

          {q && (
            <div className="mb-5 inline-flex items-center gap-2 bg-white border border-[#520a22]/10 rounded-full px-4 py-2 text-sm">
              Results for “<strong>{q}</strong>” <button onClick={() => { setQ(""); router.push("/shop"); }} className="cursor-pointer hover:text-[#a4163a]"><X size={14} /></button>
            </div>
          )}

          {loading ? (
            <div className="grid auto-rows-fr grid-cols-2 xl:grid-cols-3 items-stretch gap-4 sm:gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="luxury-card rounded-[20px] overflow-hidden animate-pulse">
                  <div className="aspect-square sm:aspect-[6/5] bg-[#f7e3cd]" />
                  <div className="p-4 space-y-2"><div className="h-3 bg-[#f7e3cd] rounded w-2/3 mx-auto" /><div className="h-4 bg-[#f7e3cd] rounded w-1/2 mx-auto" /></div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white luxury-card rounded-[20px] p-14 text-center">
              <p className="font-serif text-2xl">No fragrances match your ritual</p>
              <p className="text-sm text-[#8a767e] mt-2">Try widening your price range or clearing a filter.</p>
              <div className="mt-6"><Button onClick={clearAll}>Clear Filters</Button></div>
            </div>
          ) : (
            <div className="grid auto-rows-fr grid-cols-2 xl:grid-cols-3 items-stretch gap-4 sm:gap-5">
              {items.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}
            </div>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="w-10 h-10 rounded-full border border-[#520a22]/15 flex items-center justify-center disabled:opacity-40 hover:bg-[#520a22] hover:text-white transition cursor-pointer" aria-label="Previous"><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-full text-sm transition cursor-pointer ${page === i + 1 ? "bg-[#520a22] text-white" : "border border-[#520a22]/15 hover:border-[#520a22]"}`}>{i + 1}</button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="w-10 h-10 rounded-full border border-[#520a22]/15 flex items-center justify-center disabled:opacity-40 hover:bg-[#520a22] hover:text-white transition cursor-pointer" aria-label="Next"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </div>

      {/* mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#3d0718]/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[min(320px,100vw)] bg-[#f3ede7] p-6 overflow-y-auto">
            <div className="flex justify-end mb-4"><button onClick={() => setFiltersOpen(false)} className="p-2 cursor-pointer" aria-label="Close filters"><X size={20} /></button></div>
            {filters}
            <div className="mt-6"><Button className="w-full" onClick={() => setFiltersOpen(false)}>Show {total} Results</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-serif text-xl">Loading boutique...</div>}>
      <ShopInner />
    </Suspense>
  );
}
