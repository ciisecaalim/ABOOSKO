"use client";
import { demoFetch, notify } from "@/lib/demo";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ArrowLeft, ArrowRight, Lock, Truck, ShieldCheck, Tag } from "lucide-react";
import { Breadcrumb } from "@/components/layout";
import { Button, QtyStepper, EmptyState } from "@/components/ui";
import { ProductCard, CardProduct } from "@/components/product";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const { cart, subtotal, updateQty, removeLine, sessionId } = useStore();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [codeError, setCodeError] = useState("");
  const [recs, setRecs] = useState<CardProduct[]>([]);

  useEffect(() => {
    demoFetch("/api/products?flag=best&perPage=4").then((r) => r.json()).then((d) => setRecs((d.items || []).map((p: Record<string, unknown>) => ({ ...p, rating: Number(p.rating ?? 4.5) }))));
  }, []);

  const discountPct = applied === "ABOOSTO15" ? 15 : applied === "WELCOME10" ? 10 : applied === "LUXE20" ? 20 : 0;
  const discount = Math.round((subtotal * discountPct) / 100);
  const shipping = subtotal === 0 ? 0 : subtotal - discount >= 50 ? 0 : 10;
  const total = Math.max(0, subtotal - discount + shipping);

  function apply() {
    const c = code.toUpperCase().trim();
    if (["ABOOSTO15", "WELCOME10", "LUXE20"].includes(c)) {
      setApplied(c); setCodeError("");notify("Discount applied.");
    } else {
      notify("Invalid discount code.","error");setCodeError("This code isn't valid. Try ABOOSTO15 for 15% off.");
    }
  }

  return (
    <div className="bg-[#fffbf7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <h1 className="font-serif text-[clamp(2rem,4vw,2.8rem)] mt-2">Your Cart</h1>
        <p className="text-sm text-[#8a767e]">{cart.length} item{cart.length !== 1 && "s"} in your cart</p>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {cart.length === 0 ? (
          <div className="bg-white luxury-card rounded-[24px]">
            <EmptyState
              title="Your bag is waiting to bloom"
              subtitle="Explore best sellers and new arrivals — every order arrives gift-wrapped with samples."
              action={<Link href="/shop"><Button>Explore Collection <ArrowRight size={15} /></Button></Link>}
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* lines */}
            <div className="space-y-4">
              {cart.map((l) => (
                <div key={l.id} className="bg-white luxury-card rounded-[20px] p-4 sm:p-5 flex gap-4 sm:gap-5">
                  <Link href={`/product/${l.slug}`} className="shrink-0">
                    <img src={l.image} alt={l.name} className="w-[90px] h-[110px] sm:w-[110px] sm:h-[132px] object-cover rounded-2xl" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#a88436] font-bold">{l.brand}</p>
                    <Link href={`/product/${l.slug}`} className="font-serif text-lg sm:text-xl hover:text-[#520a22] transition line-clamp-1">{l.name}</Link>
                    <p className="text-xs text-[#8a767e] mt-0.5">Size: {l.size} · Eau de Parfum</p>
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                      <QtyStepper qty={l.qty} onChange={(q) => updateQty(l.id, q)} />
                      <span className="font-serif text-xl text-[#520a22] font-semibold">${l.price * l.qty}</span>
                    </div>
                  </div>
                  <button onClick={() => removeLine(l.id)} className="self-start p-2 text-[#8a767e] hover:text-[#a4163a] hover:bg-[#a4163a]/5 rounded-full transition cursor-pointer" aria-label="Remove item">
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
              <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[#520a22] font-medium hover:gap-3 transition-all mt-2">
                <ArrowLeft size={15} /> Continue Shopping
              </Link>
            </div>

            {/* summary */}
            <div className="lg:sticky lg:top-[90px] space-y-4">
              <div className="bg-white luxury-card rounded-[20px] p-6">
                <h3 className="font-serif text-xl flex items-center gap-2"><Tag size={17} className="text-[#c9a24b]" /> Apply Discount Code</h3>
                <div className="flex gap-2 mt-3">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your code" className="lux-input !py-2.5 uppercase" />
                  <Button onClick={apply}>Apply</Button>
                </div>
                {codeError && <p className="text-xs text-[#a4163a] mt-2">{codeError}</p>}
                {applied && <p className="text-xs text-emerald-700 mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Code {applied} applied — {discountPct}% off your ritual.</p>}
                <p className="text-[11px] text-[#8a767e] mt-3">Try ABOOSTO15 · WELCOME10 · LUXE20</p>
              </div>

              <div className="bg-white luxury-card rounded-[20px] p-6">
                <h3 className="font-serif text-xl">Order Summary</h3>
                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-[#8a767e]"><span>Subtotal</span><span className="text-[#2b2024] font-medium">${subtotal}</span></div>
                  <div className="flex justify-between text-[#8a767e]"><span>Shipping</span><span className={shipping === 0 ? "text-emerald-700 font-medium" : ""}>{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
                  <div className="flex justify-between text-[#8a767e]"><span>Discount {applied && `(${applied})`}</span><span className="text-emerald-700">−${discount}</span></div>
                  <div className="flex justify-between pt-3 border-t border-dashed border-[#520a22]/15"><span className="font-medium">Total</span><span className="font-serif text-2xl text-[#520a22] font-semibold">${total}</span></div>
                </div>
                <Link href={`/checkout${applied ? `?code=${applied}` : ""}`}><Button size="lg" className="w-full mt-5">Proceed to Checkout <ArrowRight size={16} /></Button></Link>
                <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                  {[{ i: Lock, t: "Secure Checkout" }, { i: Truck, t: "Fast Delivery" }, { i: ShieldCheck, t: "100% Authentic" }].map((b) => (
                    <div key={b.t} className="text-[10px] text-[#8a767e]"><b.i size={16} className="mx-auto text-[#520a22] mb-1" />{b.t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* recs */}
        <div className="mt-14">
          <h3 className="font-serif text-[1.7rem] mb-6">You May Also Add</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recs.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
