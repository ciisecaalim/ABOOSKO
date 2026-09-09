"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingBag, Zap, Truck, ShieldCheck, RotateCcw, Check, Minus, Plus, PenLine } from "lucide-react";
import { Breadcrumb, BackLink } from "@/components/layout";
import { Button, Badge, Rating, Tabs, QtyStepper } from "@/components/ui";
import { ProductCard, CardProduct } from "@/components/product";
import { useStore } from "@/lib/store";
import { parseGallery, parseSizes } from "@/lib/utils";

type FullProduct = {
  slug: string; name: string; brand: string; tagline: string; description: string;
  category: string; scentType: string; price: number; compareAt: number | null;
  rating: string | number; reviewCount: number; image: string; gallery: string | string[];
  sizes: string | string[]; stock: number; badge: string | null;
  notesTop: string; notesHeart: string; notesBase: string; ingredients: string; howToUse: string;
};

type Rev = { id: string; author: string; rating: number; title: string; body: string; verified: boolean; createdAt: string };

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart, toggleWishlist, isWished } = useStore();
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [related, setRelated] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("Description");
  const [reviews, setReviews] = useState<Rev[]>([]);
  const [form, setForm] = useState({ author: "", rating: 5, title: "", body: "" });
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product) {
          setProduct(d.product);
          const sizes = parseSizes(d.product.sizes);
          setSize(sizes.includes("50 ml") ? "50 ml" : sizes[0]);
          setRelated((d.related || []).map((p: Record<string, unknown>) => ({ ...p, rating: Number(p.rating ?? 4.5) })));
        }
      })
      .finally(() => setLoading(false));
    fetch(`/api/reviews?slug=${slug}`).then((r) => r.json()).then((d) => setReviews(d.reviews || []));
  }, [slug]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!form.author || !form.body) return;
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, ...form }) });
    if (res.ok) {
      const d = await res.json();
      setReviews((r) => [d.review, ...r]);
      setForm({ author: "", rating: 5, title: "", body: "" });
      setPosted(true);
      setTimeout(() => setPosted(false), 3000);
    }
  }

  if (loading) {
    return <div className="max-w-[1200px] mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 animate-pulse"><div className="aspect-square bg-[#f7e3cd] rounded-[24px]" /><div className="space-y-4"><div className="h-8 bg-[#f7e3cd] rounded w-2/3" /><div className="h-4 bg-[#f7e3cd] rounded" /><div className="h-12 bg-[#f7e3cd] rounded-full w-1/2" /></div></div>;
  }
  if (!product) {
    return <div className="text-center py-24"><p className="font-serif text-3xl">Fragrance not found</p><div className="mt-6"><Link href="/shop"><Button>Back to Shop</Button></Link></div></div>;
  }

  const gallery = [product.image, ...parseGallery(product.gallery).filter((g) => g !== product.image)].slice(0, 5);
  const sizes = parseSizes(product.sizes);
  const ratingNum = Number(product.rating || 4.5);
  const wished = isWished(product.slug);
  const discount = product.compareAt ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100) : 0;

  return (
    <div className="bg-[#fffbf7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: product.name }]} />
        <div className="mt-3"><BackLink href="/shop" label="Back to Shop" /></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-14 grid lg:grid-cols-2 gap-10 lg:gap-14">
        {/* gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <div className="flex sm:flex-col gap-3 justify-center">
            {gallery.map((g, i) => (
              <button key={i} onClick={() => setImg(i)} className={`w-16 h-20 sm:w-[72px] sm:h-[88px] rounded-xl overflow-hidden border-2 transition cursor-pointer ${img === i ? "border-[#520a22]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <img src={g} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 relative rounded-[28px] overflow-hidden luxury-card img-zoom">
            <img src={gallery[img]} alt={product.name} className="w-full h-[420px] sm:h-[560px] object-cover" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.badge && <Badge tone="burgundy">{product.badge}</Badge>}
              {discount > 0 && <Badge tone="sale">Save {discount}%</Badge>}
            </div>
            <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-[11px] tracking-[0.16em] uppercase px-4 py-2 rounded-full text-[#520a22] font-semibold">{product.scentType} · {product.category}</span>
          </div>
        </div>

        {/* info */}
        <div>
          <p className="text-[12px] tracking-[0.24em] uppercase text-[#a88436] font-semibold">{product.brand}</p>
          <h1 className="font-serif text-[clamp(2rem,4vw,2.9rem)] leading-[1.05] mt-2">{product.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <Rating value={ratingNum} size={15} />
            <span className="text-sm text-[#8a767e]">{ratingNum.toFixed(1)} ({product.reviewCount || reviews.length * 40 + 120} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 mt-4">
            <span className="font-serif text-[2.4rem] text-[#520a22] font-semibold">${product.price}</span>
            {product.compareAt && <span className="text-lg text-[#8a767e] line-through">${product.compareAt}</span>}
            {product.compareAt && <Badge tone="sale">Save ${product.compareAt - product.price}</Badge>}
          </div>
          <p className="text-[15px] text-[#2b2024]/75 leading-relaxed mt-4">{product.tagline}</p>

          {/* notes preview */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[{ l: "Top Notes", v: product.notesTop }, { l: "Heart Notes", v: product.notesHeart }, { l: "Base Notes", v: product.notesBase }].map((n) => (
              <div key={n.l} className="bg-white luxury-card rounded-2xl p-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#a88436] font-bold">{n.l}</p>
                <p className="text-[12px] text-[#2b2024]/80 mt-1.5 leading-snug line-clamp-3">{n.v}</p>
              </div>
            ))}
          </div>

          {/* size */}
          <div className="mt-6">
            <p className="text-[12px] font-semibold tracking-[0.16em] uppercase mb-3">Select Size: <span className="text-[#520a22]">{size}</span></p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`px-6 py-3 rounded-full text-sm border transition cursor-pointer ${size === s ? "bg-[#520a22] text-white border-[#520a22]" : "border-[#520a22]/20 hover:border-[#520a22]"}`}>{s}</button>
              ))}
            </div>
          </div>

          {/* qty + stock */}
          <div className="flex items-center gap-4 mt-6 flex-wrap">
            <QtyStepper qty={qty} onChange={setQty} />
            <span className="text-sm flex items-center gap-2 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> In Stock — {product.stock} bottles ready</span>
          </div>

          {/* actions */}
          <div className="flex gap-3 mt-6">
            <Button size="lg" className="flex-1" onClick={() => addToCart(product.slug, size, qty)}><ShoppingBag size={17} /> Add to Cart</Button>
            <button onClick={() => toggleWishlist(product.slug)} aria-label="Wishlist" className={`w-[54px] h-[54px] rounded-full border flex items-center justify-center transition cursor-pointer ${wished ? "bg-[#520a22] text-white border-[#520a22]" : "border-[#520a22]/20 hover:border-[#520a22] text-[#520a22]"}`}>
              <Heart size={19} className={wished ? "fill-current" : ""} />
            </button>
          </div>
          <Button size="lg" variant="secondary" className="w-full mt-3" onClick={async () => { await addToCart(product.slug, size, qty); router.push("/checkout"); }}><Zap size={16} /> Buy Now — ${product.price * qty}</Button>

          {/* assurances */}
          <div className="grid grid-cols-3 gap-3 mt-6 text-center">
            {[{ i: Truck, t: "Free Delivery", s: "On orders over $50" }, { i: ShieldCheck, t: "100% Authentic", s: "Sealed & original" }, { i: RotateCcw, t: "Easy Returns", s: "7-day policy" }].map((a) => (
              <div key={a.t} className="bg-white border border-[#520a22]/8 rounded-2xl p-3">
                <a.i size={18} className="mx-auto text-[#520a22]" />
                <p className="text-[12px] font-semibold mt-2">{a.t}</p>
                <p className="text-[11px] text-[#8a767e]">{a.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white luxury-card rounded-[24px] overflow-hidden">
          <div className="px-4 sm:px-8 pt-2"><Tabs tabs={["Description", "Ingredients", "How to Use", `Reviews (${reviews.length || product.reviewCount || 0})`]} active={tab} onChange={setTab} /></div>
          <div className="p-6 sm:p-10">
            {tab === "Description" && (
              <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
                <div>
                  <p className="text-[15px] leading-relaxed text-[#2b2024]/80">{product.description}</p>
                  <div className="mt-6 space-y-3">
                    {[["Brand", product.brand], ["Category", product.category], ["Scent Type", product.scentType], ["Top Notes", product.notesTop], ["Heart Notes", product.notesHeart], ["Base Notes", product.notesBase]].map(([k, v]) => (
                      <div key={k} className="flex gap-4 text-sm border-b border-[#520a22]/6 pb-3">
                        <span className="w-28 shrink-0 font-semibold text-[#520a22]">{k}</span>
                        <span className="text-[#2b2024]/75">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="blush-gradient rounded-2xl p-6 h-fit">
                  <h4 className="font-serif text-xl text-[#520a22]">The ABOOSTO Ritual</h4>
                  <ul className="mt-4 space-y-3 text-sm text-[#2b2024]/75">
                    <li className="flex gap-2"><Check size={16} className="text-[#c9a24b] shrink-0 mt-0.5" /> Mist on moisturised pulse points for 8+ hour wear</li>
                    <li className="flex gap-2"><Check size={16} className="text-[#c9a24b] shrink-0 mt-0.5" /> Never rub wrists — let the top notes bloom</li>
                    <li className="flex gap-2"><Check size={16} className="text-[#c9a24b] shrink-0 mt-0.5" /> Store away from light to preserve the oils</li>
                  </ul>
                </div>
              </div>
            )}
            {tab === "Ingredients" && <p className="text-[15px] leading-relaxed text-[#2b2024]/80 max-w-3xl">{product.ingredients}</p>}
            {tab === "How to Use" && <p className="text-[15px] leading-relaxed text-[#2b2024]/80 max-w-3xl">{product.howToUse}</p>}
            {tab.startsWith("Reviews") && (
              <div className="grid lg:grid-cols-[1fr_380px] gap-10">
                <div className="space-y-5">
                  {reviews.length === 0 && <p className="text-sm text-[#8a767e]">Be the first to review this fragrance — your ritual inspires others.</p>}
                  {reviews.map((r) => (
                    <div key={r.id} className="border border-[#520a22]/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between"><Rating value={r.rating} /><span className="text-[11px] text-[#8a767e]">{new Date(r.createdAt).toLocaleDateString()}</span></div>
                      <p className="font-medium mt-2">{r.title || "Verified review"}</p>
                      <p className="text-sm text-[#2b2024]/75 mt-1 leading-relaxed">{r.body}</p>
                      <p className="text-xs text-[#8a767e] mt-3">— {r.author} {r.verified && <span className="text-emerald-700 font-medium">· Verified Buyer</span>}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#fff9f1] border border-[#520a22]/10 rounded-2xl p-6 h-fit">
                  <h4 className="font-serif text-xl flex items-center gap-2"><PenLine size={18} /> Write a Review</h4>
                  {posted && <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">Thank you — your review is live.</p>}
                  <form onSubmit={submitReview} className="mt-4 space-y-3">
                    <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Your name" className="lux-input" required />
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })} className={`text-xl cursor-pointer ${n <= form.rating ? "text-[#c9a24b]" : "text-[#d9c3a9]"}`}>★</button>
                      ))}
                    </div>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Headline (optional)" className="lux-input" />
                    <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="How does it wear? Compliments? Longevity?" rows={4} className="lux-input" required />
                    <Button type="submit" className="w-full">Submit Review</Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* related */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-[1.8rem]">You May Also Like</h3>
          <Link href="/shop" className="text-[13px] uppercase tracking-[0.12em] text-[#520a22] font-medium">View All</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {related.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}
        </div>
      </div>
    </div>
  );
}
