"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Breadcrumb } from "@/components/layout";
import { Button, EmptyState, Rating } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  return (
    <div className="bg-[#fffbf7] min-h-[60vh]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        <h1 className="font-serif text-[clamp(2rem,4vw,2.8rem)] mt-2 flex items-center gap-3">Wishlist <Heart size={24} className="text-[#520a22] fill-[#520a22]/10" /></h1>
        <p className="text-sm text-[#8a767e]">{wishlist.length} saved treasure{wishlist.length !== 1 && "s"}</p>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {wishlist.length === 0 ? (
          <div className="bg-white luxury-card rounded-[24px]">
            <EmptyState
              title="Nothing saved yet"
              subtitle="Tap the heart on any fragrance to keep it here for later — your future signature awaits."
              action={<Link href="/shop"><Button>Discover Fragrances <ArrowRight size={15} /></Button></Link>}
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((w) => (
              <div key={w.slug} className="luxury-card rounded-[20px] overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="relative aspect-[4/4.4] overflow-hidden bg-[#fdf0e2]">
                  <Link href={`/product/${w.slug}`}><img src={w.image} alt={w.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" /></Link>
                  <button onClick={() => toggleWishlist(w.slug)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#520a22] text-white flex items-center justify-center cursor-pointer" aria-label="Remove from wishlist">
                    <Heart size={15} className="fill-current" />
                  </button>
                </div>
                <div className="p-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#a88436] font-bold">{w.brand}</p>
                  <Link href={`/product/${w.slug}`} className="font-serif text-[17px] hover:text-[#520a22]">{w.name}</Link>
                  <div className="flex items-center justify-center gap-2 mt-1"><Rating value={w.rating} /><span className="text-[11px] text-[#8a767e]">{w.rating.toFixed(1)}</span></div>
                  <p className="font-serif text-xl text-[#520a22] font-semibold mt-1">${w.price}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => toggleWishlist(w.slug)}>Remove</Button>
                    <Button size="sm" onClick={() => addToCart(w.slug)}>Add to Cart</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
