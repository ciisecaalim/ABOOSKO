"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Badge, Rating } from "./ui";
import { useStore } from "@/lib/store";

export type CardProduct = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAt?: number | null;
  rating: number | string;
  reviewCount?: number | null;
  image: string;
  badge?: string | null;
};

export function ProductCard({ p, index = 0 }: { p: CardProduct; index?: number }) {
  const { addToCart, toggleWishlist, isWished } = useStore();
  const wished = isWished(p.slug);
  const ratingNum = typeof p.rating === "string" ? parseFloat(p.rating) : p.rating;
  const discount = p.compareAt ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;

  return (
    <div
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#520a22]/10 bg-[#eee5dd]/40 transition-colors duration-300 hover:border-[#520a22]/25"
      style={{ animationDelay: `${(index % 8) * 60}ms` }}
    >
      <div className="relative shrink-0 aspect-square sm:aspect-[6/5] overflow-hidden bg-[#fdf0e2] img-zoom">
        <Link href={`/product/${p.slug}`} className="block h-full w-full">
          <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {p.badge && <Badge tone={p.badge.includes("-") || p.badge.includes("%") ? "sale" : "burgundy"}>{p.badge}</Badge>}
          {discount > 0 && !p.badge?.includes("%") && <Badge tone="sale">-{discount}%</Badge>}
        </div>
        <button
          onClick={() => toggleWishlist(p.slug)}
          aria-label={(wished ? "Remove " : "Add ") + p.name + (wished ? " from wishlist" : " to wishlist")} aria-pressed={wished}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur transition cursor-pointer ${
            wished ? "bg-[#520a22] text-white" : "bg-white/90 text-[#520a22] hover:bg-[#520a22] hover:text-white"
          }`}
        >
          <Heart size={16} className={wished ? "fill-current" : ""} />
        </button>
        {/* hover actions */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-400">
          <button
            onClick={() => addToCart(p.slug)}
            className="flex-1 bg-[#520a22]/95 backdrop-blur text-white text-[10px] sm:text-[12px] font-medium rounded-full py-3 flex items-center justify-center gap-2 hover:bg-[#3d0718] transition cursor-pointer"
          >
            <ShoppingBag size={14} /> Add to Cart
          </button>
          <Link href={`/product/${p.slug}`} className="hidden sm:flex w-11 h-11 shrink-0 rounded-full bg-white/95 backdrop-blur items-center justify-center text-[#520a22] hover:bg-white transition" aria-label="Quick view">
            <Eye size={16} />
          </Link>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4 text-left">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#a88436] font-semibold">{p.brand}</p>
        <Link href={`/product/${p.slug}`} className="block mt-1 font-sans font-medium text-[13px] sm:text-[14px] leading-5 h-10 shrink-0 text-[#2b2024] hover:text-[#520a22] transition line-clamp-2">
          {p.name}
        </Link>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Rating value={ratingNum} />
          <span className="text-[11px] text-[#8a767e]">{ratingNum.toFixed(1)}{p.reviewCount ? ` (${p.reviewCount})` : ""}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-auto pt-3">
          <span className="font-sans tabular-nums text-[16px] text-[#520a22] font-semibold">${p.price}</span>
          {p.compareAt && <span className="text-[13px] text-[#8a767e] line-through">${p.compareAt}</span>}
        </div>
      </div>
    </div>
  );
}

export function ProductRow({ products, title }: { products: CardProduct[]; title?: string }) {
  if (!products.length) return null;
  return (
    <div>
      {title && <h3 className="font-serif text-xl text-[#520a22] mb-4">{title}</h3>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p, i) => (
          <ProductCard key={p.slug} p={p} index={i} />
        ))}
      </div>
    </div>
  );
}
