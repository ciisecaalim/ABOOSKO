"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, CreditCard, Truck, Gift, Check, ChevronLeft, Landmark, Wallet } from "lucide-react";
import { Breadcrumb } from "@/components/layout";
import { Button, Field } from "@/components/ui";
import { useStore } from "@/lib/store";

const SHIP = [
  { id: "standard", name: "Standard", desc: "3–5 days · Free over $50", price: 0 },
  { id: "express", name: "Express", desc: "1–2 days · Tracked priority", price: 18 },
  { id: "gift", name: "Gift Concierge", desc: "Wrapped + card + samples", price: 14 },
];
const PAY = [
  { id: "card", name: "Credit / Debit Card", desc: "Visa · Mastercard · Amex", icon: CreditCard },
  { id: "paypal", name: "PayPal", desc: "Pay securely with PayPal", icon: Wallet },
  { id: "cod", name: "Cash on Delivery", desc: "Available in Mogadishu", icon: Landmark },
];

function CheckoutInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { cart, subtotal, refresh } = useStore();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState(sp.get("code") || "");
  const [f, setF] = useState({ email: "", firstName: "", lastName: "", address: "", city: "", zip: "", country: "Somalia", phone: "", ship: "standard", pay: "card", card: "", exp: "", cvc: "", name: "" });

  useEffect(() => { setCode(sp.get("code") || ""); }, [sp]);

  const pct = code.toUpperCase() === "ABOOSTO15" ? 15 : code.toUpperCase() === "WELCOME10" ? 10 : code.toUpperCase() === "LUXE20" ? 20 : 0;
  const discount = Math.round((subtotal * pct) / 100);
  const shipObj = SHIP.find((s) => s.id === f.ship)!;
  const shipping = subtotal === 0 ? 0 : f.ship === "standard" ? (subtotal - discount >= 50 ? 0 : 10) : shipObj.price;
  const total = Math.max(0, subtotal - discount + shipping);

  const sid = typeof window !== "undefined" ? localStorage.getItem("aboosto_sid") || "guest" : "guest";

  async function place() {
    setError("");
    if (!f.email.includes("@")) { setError("Please enter a valid email."); return; }
    if (!f.firstName || !f.address || !f.city) { setError("Please complete your shipping details."); return; }
    if (f.pay === "card" && (f.card.replace(/\s/g, "").length < 12 || !f.exp || !f.cvc)) { setError("Please enter valid card details (demo checkout — no charge)."); return; }
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid, email: f.email, firstName: f.firstName, lastName: f.lastName,
          address: f.address, city: f.city, zip: f.zip, country: f.country, phone: f.phone,
          shippingMethod: f.ship, paymentMethod: f.pay, discountCode: code,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      await refresh();
      router.push(`/success?order=${d.order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPlacing(false);
    }
  }

  function set(k: string, v: string) { setF((p) => ({ ...p, [k]: v })); }

  return (
    <div className="bg-[#fffbf7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <h1 className="font-serif text-[clamp(2rem,4vw,2.8rem)] mt-2 flex items-center gap-3">Secure Checkout <Lock size={22} className="text-[#c9a24b]" /></h1>
        {/* steps */}
        <div className="flex items-center gap-2 sm:gap-4 mt-5">
          {["Information", "Shipping", "Payment"].map((s, i) => (
            <React.Fragment key={s}>
              <button onClick={() => setStep(i + 1)} className={`flex items-center gap-2 text-[13px] font-medium cursor-pointer ${step === i + 1 ? "text-[#520a22]" : "text-[#8a767e]"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step > i + 1 ? "bg-emerald-600 text-white" : step === i + 1 ? "bg-[#520a22] text-white" : "bg-white border border-[#520a22]/15"}`}>
                  {step > i + 1 ? <Check size={13} /> : i + 1}
                </span> {s}
              </button>
              {i < 2 && <span className="w-8 sm:w-16 h-px bg-[#520a22]/15" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="space-y-5">
          {/* 1 info */}
          <div className={`bg-white luxury-card rounded-[20px] p-6 sm:p-8 ${step !== 1 && "opacity-70"}`}>
            <h3 className="font-serif text-xl mb-5">01 · Customer Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email address" className="sm:col-span-2"><input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className="lux-input" /></Field>
              <Field label="First name"><input value={f.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Amira" className="lux-input" /></Field>
              <Field label="Last name"><input value={f.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Hassan" className="lux-input" /></Field>
              <Field label="Phone"><input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+252 61 ..." className="lux-input" /></Field>
              <Field label="Country"><input value={f.country} onChange={(e) => set("country", e.target.value)} className="lux-input" /></Field>
              <Field label="Address" className="sm:col-span-2"><input value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, building, apartment" className="lux-input" /></Field>
              <Field label="City"><input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Mogadishu" className="lux-input" /></Field>
              <Field label="ZIP / Postal"><input value={f.zip} onChange={(e) => set("zip", e.target.value)} placeholder="00252" className="lux-input" /></Field>
            </div>
            {step === 1 && <div className="mt-6 text-right"><Button onClick={() => setStep(2)}>Continue to Shipping</Button></div>}
          </div>

          {/* 2 shipping */}
          <div className={`bg-white luxury-card rounded-[20px] p-6 sm:p-8 ${step !== 2 && "opacity-70"}`}>
            <h3 className="font-serif text-xl mb-5">02 · Shipping Method</h3>
            <div className="space-y-3">
              {SHIP.map((s) => (
                <button key={s.id} onClick={() => set("ship", s.id)} className={`w-full flex items-center gap-4 border rounded-2xl p-4 text-left transition cursor-pointer ${f.ship === s.id ? "border-[#520a22] bg-[#faf0f2]" : "border-[#520a22]/12 hover:border-[#520a22]/40"}`}>
                  <span className={`w-11 h-11 rounded-full flex items-center justify-center ${f.ship === s.id ? "bg-[#520a22] text-white" : "bg-[#faf0f2] text-[#520a22]"}`}>
                    {s.id === "gift" ? <Gift size={18} /> : <Truck size={18} />}
                  </span>
                  <span className="flex-1"><span className="block font-medium text-sm">{s.name}</span><span className="text-xs text-[#8a767e]">{s.desc}</span></span>
                  <span className="font-serif text-lg text-[#520a22]">{s.id === "standard" ? (subtotal - discount >= 50 ? "Free" : "$10") : `$${s.price}`}</span>
                </button>
              ))}
            </div>
            {step === 2 && <div className="mt-6 flex justify-between"><button onClick={() => setStep(1)} className="text-sm text-[#8a767e] hover:text-[#520a22] inline-flex items-center gap-1 cursor-pointer"><ChevronLeft size={15} /> Back</button><Button onClick={() => setStep(3)}>Continue to Payment</Button></div>}
          </div>

          {/* 3 payment */}
          <div className={`bg-white luxury-card rounded-[20px] p-6 sm:p-8 ${step !== 3 && "opacity-70"}`}>
            <h3 className="font-serif text-xl mb-5">03 · Payment</h3>
            <div className="space-y-3">
              {PAY.map((p) => (
                <button key={p.id} onClick={() => set("pay", p.id)} className={`w-full flex items-center gap-4 border rounded-2xl p-4 text-left transition cursor-pointer ${f.pay === p.id ? "border-[#520a22] bg-[#faf0f2]" : "border-[#520a22]/12 hover:border-[#520a22]/40"}`}>
                  <p.icon size={20} className="text-[#520a22]" />
                  <span className="flex-1"><span className="block font-medium text-sm">{p.name}</span><span className="text-xs text-[#8a767e]">{p.desc}</span></span>
                  <span className={`w-5 h-5 rounded-full border-2 ${f.pay === p.id ? "border-[#520a22] bg-[#520a22]" : "border-[#520a22]/20"}`} />
                </button>
              ))}
            </div>
            {f.pay === "card" && (
              <div className="grid sm:grid-cols-2 gap-4 mt-5 bg-[#fff9f1] border border-[#520a22]/10 rounded-2xl p-5">
                <Field label="Cardholder name" className="sm:col-span-2"><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="AMIRA HASSAN" className="lux-input" /></Field>
                <Field label="Card number" className="sm:col-span-2"><input value={f.card} onChange={(e) => set("card", e.target.value)} placeholder="4111 2222 3333 4444" inputMode="numeric" className="lux-input" /></Field>
                <Field label="Expiry"><input value={f.exp} onChange={(e) => set("exp", e.target.value)} placeholder="MM / YY" className="lux-input" /></Field>
                <Field label="CVC"><input value={f.cvc} onChange={(e) => set("cvc", e.target.value)} placeholder="123" inputMode="numeric" className="lux-input" /></Field>
              </div>
            )}
            {step === 3 && <div className="mt-6 flex justify-between items-center"><button onClick={() => setStep(2)} className="text-sm text-[#8a767e] hover:text-[#520a22] inline-flex items-center gap-1 cursor-pointer"><ChevronLeft size={15} /> Back</button></div>}
          </div>
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-[90px] bg-white luxury-card rounded-[20px] p-6">
          <h3 className="font-serif text-xl">Order Summary</h3>
          <div className="mt-4 space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {cart.length === 0 && <p className="text-sm text-[#8a767e]">Your bag is empty. <Link href="/shop" className="text-[#520a22] underline">Continue shopping</Link></p>}
            {cart.map((l) => (
              <div key={l.id} className="flex gap-3 items-center">
                <div className="relative shrink-0"><img src={l.image} alt={l.name} className="w-14 h-16 object-cover rounded-xl" /><span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#520a22] text-white text-[11px] flex items-center justify-center">{l.qty}</span></div>
                <div className="flex-1 min-w-0"><p className="text-[13px] font-medium truncate">{l.name}</p><p className="text-[11px] text-[#8a767e]">{l.size}</p></div>
                <span className="text-sm font-medium">${l.price * l.qty}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-5">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" className="lux-input !py-2.5 uppercase" />
          </div>
          {pct > 0 && <p className="text-xs text-emerald-700 mt-2">{code.toUpperCase()} — {pct}% off applied.</p>}
          <div className="mt-5 space-y-2 text-sm border-t border-dashed border-[#520a22]/15 pt-4">
            <div className="flex justify-between text-[#8a767e]"><span>Subtotal</span><span className="text-[#2b2024] font-medium">${subtotal}</span></div>
            <div className="flex justify-between text-[#8a767e]"><span>Shipping ({shipObj.name})</span><span>{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
            <div className="flex justify-between text-[#8a767e]"><span>Discount</span><span className="text-emerald-700">−${discount}</span></div>
            <div className="flex justify-between pt-2"><span className="font-medium">Total</span><span className="font-serif text-2xl text-[#520a22] font-semibold">${total}</span></div>
          </div>
          {error && <p className="mt-4 text-xs text-[#a4163a] bg-[#a4163a]/5 border border-[#a4163a]/20 rounded-xl px-4 py-2.5">{error}</p>}
          <Button size="lg" className="w-full mt-5" onClick={place} disabled={placing || cart.length === 0}>
            <Lock size={15} /> {placing ? "Placing Order..." : `Pay $${total}`}
          </Button>
          <p className="text-[11px] text-[#8a767e] text-center mt-3 flex items-center justify-center gap-1"><Lock size={11} /> 256-bit SSL encrypted · Demo checkout, no real charge</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-serif text-xl">Preparing checkout...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
