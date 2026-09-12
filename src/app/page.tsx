import Link from "next/link";
import { ArrowRight, BadgeCheck, Truck, Lock, Gem, Headset, Play, Quote } from "lucide-react";



import { PRODUCTS, CATEGORIES, TESTIMONIALS, IMG } from "@/lib/data";
import { Button, Badge, Rating, SectionHeading } from "@/components/ui";
import { ProductCard } from "@/components/product";
import { Newsletter } from "@/components/layout";

export const dynamic = "force-dynamic";

type P = {
  slug: string; name: string; brand: string; price: number; compareAt: number | null;
  rating: string | number; reviewCount: number | null; image: string; badge: string | null;
};

async function getProducts(): Promise<P[]> {
  return PRODUCTS.map((p) => ({
    slug: p.slug, name: p.name, brand: p.brand, price: p.price,
    compareAt: p.compareAt ?? null, rating: p.rating, reviewCount: p.reviewCount,
    image: p.image, badge: p.badge ?? null,
  }));
}

export default async function HomePage() {
  const all = await getProducts();
  const best = all.filter(p => PRODUCTS.find(x => x.slug === p.slug)?.isBestSeller).slice(0, 4);
  const arrivals = all.filter(p => PRODUCTS.find(x => x.slug === p.slug)?.isNewArrival).slice(0, 4);
  const offers = all.filter((p) => p.compareAt).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section aria-labelledby="hero-title" className="fragrance-hero relative isolate flex h-screen min-h-[640px] flex-col overflow-hidden bg-[#32131f]">
        <img
          src={IMG.peony}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 z-0 h-full w-full object-cover object-[65%_center]"
        />
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: "linear-gradient(90deg, rgba(38, 9, 24, 0.92) 0%, rgba(55, 15, 33, 0.78) 42%, rgba(65, 18, 38, 0.38) 75%, rgba(44, 12, 29, 0.26) 100%), linear-gradient(0deg, rgba(34, 8, 22, 0.65), transparent 45%)",
          }}
          aria-hidden="true"
        />
        <div className="relative z-20 mx-auto flex w-full max-w-[1440px] flex-1 items-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[640px]">
            <p className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#f0d6b5] sm:text-[11px]">
              <span className="h-px w-9 bg-[#d5ad7e]" aria-hidden="true" />
              The art of fragrance
            </p>
            <h1 id="hero-title" className="font-sans text-[clamp(2rem,5vw,4.5rem)] font-medium leading-[1.12] tracking-[-0.045em] text-[#fff5ed]">
              <span className="block whitespace-nowrap">Your signature.</span>
              <span className="block whitespace-nowrap font-medium text-[#f0d6b5]">Your scent.</span>
            </h1>
            <p className="mt-6 max-w-[360px] text-[13px] font-normal leading-[1.8] text-[#eadbdc] sm:max-w-[380px] sm:text-[14px]">
              Discover exceptional scents for everyday rituals and unforgettable moments. Find the one that feels like you.
            </p>
            <div className="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
              <Link href="/shop" className="inline-flex min-h-14 items-center justify-center gap-8 rounded-full border border-[#d5ad7e]/60 bg-[#b98b60]/20 px-8 text-sm font-semibold text-[#fff5ed] backdrop-blur-sm transition-colors hover:bg-[#b98b60]/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d6b5]">
                Shop fragrances <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/shop?flag=featured" className="border-b border-[#f0d6b5]/50 pb-1 text-sm font-medium text-[#f0d6b5] transition-colors hover:border-[#f0d6b5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d6b5]">
                Explore the collection
              </Link>
            </div>
          </div>
        </div>
        <div className="relative z-20 mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 pb-8 sm:px-10 lg:px-16">
          <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f0d6b5] sm:text-xs">
            <BadgeCheck size={16} aria-hidden="true" /> Authentic scents. Beautifully curated.
          </p>
          <Link href="#collections" className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f0d6b5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d6b5]">
            Discover more <ArrowRight size={15} className="rotate-90" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="collections" aria-label="Shop by category" className="scroll-mt-24">
        {/* Categories */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-4 sm:pt-14">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORIES.map((c) => (
              <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name === "New In" ? "" : c.name)}${c.name === "New In" ? "&flag=new" : ""}`} className="group text-center">
                <div className="rounded-2xl overflow-hidden aspect-square luxury-card img-zoom">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <p className="mt-2 text-[12px] sm:text-[13px] font-medium text-[#2b2024] group-hover:text-[#520a22] transition">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <SectionHeading align="left" eyebrow="Chosen by you" title="Best Sellers" subtitle="Our most loved fragrances, chosen by you." />
          <Link href="/shop?flag=best" className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.1em] uppercase text-[#520a22] hover:gap-3 transition-all shrink-0">View All <ArrowRight size={15} /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {best.map((p, i) => (
            <ProductCard key={p.slug} p={{ ...p, rating: Number(p.rating) }} index={i} />
          ))}
        </div>
        <div className="text-center mt-8 sm:hidden"><Link href="/shop?flag=best"><Button variant="outline">View All Best Sellers</Button></Link></div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="bg-[#fff5ee] border-y border-[#520a22]/8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <SectionHeading align="left" eyebrow="Just landed" title="New Arrivals" subtitle="Fresh scents for a new you." />
            <Link href="/shop?flag=new" className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.1em] uppercase text-[#520a22] hover:gap-3 transition-all shrink-0">View All <ArrowRight size={15} /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {arrivals.map((p, i) => (
              <ProductCard key={p.slug} p={{ ...p, rating: Number(p.rating) }} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
        <div className="relative rounded-[28px] overflow-hidden burgundy-gradient">
          <div className="grid lg:grid-cols-2 items-center">
            <div className="p-8 sm:p-12 lg:p-16 text-center lg:text-left relative z-10">
              <Badge tone="gold">Limited Edition</Badge>
              <h3 className="font-serif text-white text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] mt-5">Find The Perfect<br />Perfume For Your Lifestyle</h3>
              <p className="text-white/65 tracking-[0.2em] uppercase text-[12px] mt-4">Elegant. Timeless. Unforgettable.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/shop"><Button variant="gold" size="lg">Shop Limited Edition</Button></Link>
                <Link href="/shop?category=Gift%20Sets"><Button size="lg" variant="outline" className="!border-white/25 !text-white hover:!bg-white/10">Gift Sets</Button></Link>
              </div>
            </div>
            <div className="relative h-[280px] sm:h-[360px] lg:h-[440px]">
              <img src={IMG.elegantWoman} alt="Luxury lifestyle" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#3d0718] via-[#3d0718]/20 to-transparent hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d0718]/60 to-transparent lg:hidden" />
              <Link href="/#story" aria-label="Explore our fragrance story" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center text-white hover:scale-110 transition cursor-pointer">
                <Play size={20} className="fill-white ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-10">
          {[
            { icon: BadgeCheck, t: "Authentic Products", s: "100% original, sealed" },
            { icon: Truck, t: "Fast Delivery", s: "2–4 days, tracked" },
            { icon: Lock, t: "Secure Payment", s: "256-bit encrypted" },
            { icon: Gem, t: "Premium Quality", s: "Curated maison houses" },
            { icon: Headset, t: "24/7 Support", s: "Concierge care" },
          ].map((b) => (
            <div key={b.t} className="luxury-card rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform">
              <b.icon size={22} className="mx-auto text-[#520a22]" />
              <p className="mt-3 text-[13px] font-semibold text-[#2b2024]">{b.t}</p>
              <p className="text-[11px] text-[#8a767e] mt-1">{b.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="bg-white border-y border-[#520a22]/8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative">
            <div className="rounded-[28px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(82,10,34,0.35)] img-zoom">
              <img src={IMG.sprayClose} alt="A passion for fragrance" className="w-full h-[380px] sm:h-[480px] object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-2 sm:right-8 bg-[#520a22] text-white rounded-2xl px-6 py-5 shadow-xl">
              <p className="font-serif text-3xl">12<span className="text-[#e6c988]">+</span></p>
              <p className="text-[11px] tracking-[0.2em] uppercase opacity-80">Years of craft</p>
            </div>
            <div className="absolute -top-5 -left-2 sm:left-8 bg-white rounded-2xl px-5 py-4 shadow-xl border border-[#520a22]/10">
              <p className="font-serif italic text-[#520a22] text-lg leading-tight">More Than a Fragrance,<br />A Feeling.</p>
            </div>
          </div>
          <div className="text-center lg:text-left pt-6 lg:pt-0">
            <SectionHeading align="left" eyebrow="Our Story" title="A Passion for Fragrance" />
            <p className="mt-5 text-[15px] leading-relaxed text-[#2b2024]/75">
              At ABOOSTO, we curate timeless fragrances that express identity, beauty and confidence. Every scent tells a story — from Parisian florals to Arabian oud, each bottle is hand-selected, authenticity-checked and wrapped like a gift.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto lg:mx-0">
              {[["48+", "Luxury houses"], ["12k+", "Happy clients"], ["4.9", "Average rating"]].map(([n, l]) => (
                <div key={l} className="text-center lg:text-left">
                  <p className="font-serif text-3xl text-[#520a22]">{n}</p>
                  <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a767e]">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-8"><Link href="/shop"><Button>Discover Our Curation <ArrowRight size={15} /></Button></Link></div>
          </div>
        </div>
      </section>

      {/* SPECIAL OFFERS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
        <SectionHeading eyebrow="Don't miss out" title="Special Offers" subtitle="Limited-time deals, timeless scents." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-10">
          {offers.map((p, i) => (
            <ProductCard key={p.slug} p={{ ...p, rating: Number(p.rating) }} index={i} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="blush-gradient border-y border-[#520a22]/8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
          <SectionHeading eyebrow="Testimonials" title="What Our Customers Say" subtitle="Real rituals, real radiance — from Mogadishu to Dubai." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-[20px] p-6 luxury-card hover:-translate-y-1 transition-transform">
                <Quote size={22} className="text-[#c9a24b]" />
                <Rating value={t.rating} className="mt-3" />
                <p className="text-[13.5px] leading-relaxed text-[#2b2024]/80 mt-3">“{t.text}”</p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#520a22]/8">
                  <span className="w-10 h-10 rounded-full burgundy-gradient text-white flex items-center justify-center font-serif text-lg">{t.name[0]}</span>
                  <div>
                    <p className="text-[13px] font-semibold">{t.name}</p>
                    <p className="text-[11px] text-[#8a767e]">{t.location} · {t.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />

      {/* brand footer strip */}
      <section className="text-center pb-14 px-4">
        <p className="font-serif text-[#520a22]/30 tracking-[0.3em] text-xs uppercase">Chanel · Dior · YSL · Lancôme · Armani · Tom Ford · Creed · Gucci</p>
      </section>
    </div>
  );
}
