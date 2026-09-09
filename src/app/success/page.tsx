"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Truck, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui";

function SuccessInner() {
  const sp = useSearchParams();
  const orderId = sp.get("order") || "";
  const [order, setOrder] = useState<{ id: string; total: number; email: string } | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem("aboosto_sid") || "";
    if (!sid) return;
    fetch(`/api/orders?sessionId=${sid}`).then((r) => r.json()).then((d) => {
      const found = (d.orders || []).find((o: { id: string }) => o.id === orderId) || (d.orders || [])[0];
      if (found) setOrder(found);
    });
  }, [orderId]);

  return (
    <div className="max-w-[720px] mx-auto px-4 py-16 text-center">
      <span className="mx-auto w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <CheckCircle2 size={38} className="text-emerald-600" />
      </span>
      <p className="mt-6 text-[11px] tracking-[0.3em] uppercase text-[#a88436] font-semibold">Order Confirmed</p>
      <h1 className="font-serif text-[clamp(2.2rem,5vw,3.2rem)] mt-2">Shukran — Your Ritual Is On Its Way</h1>
      <p className="text-[15px] text-[#8a767e] mt-3 max-w-md mx-auto">
        {order ? <>Order <strong className="text-[#520a22]">#{order.id.slice(0, 8).toUpperCase()}</strong> · ${order.total} — a confirmation was sent to <strong>{order.email}</strong>.</> : "Your order has been placed. A confirmation email with tracking is on its way."}
      </p>
      <div className="grid grid-cols-3 gap-3 mt-8 text-center">
        {[{ i: Package, t: "Wrapped", s: "Gift coffret + samples" }, { i: Truck, t: "Shipped", s: "Tracked in 24h" }, { i: Gift, t: "Delivered", s: "In 2–4 days" }].map((s) => (
          <div key={s.t} className="bg-white luxury-card rounded-2xl p-4">
            <s.i size={20} className="mx-auto text-[#520a22]" />
            <p className="text-[13px] font-semibold mt-2">{s.t}</p>
            <p className="text-[11px] text-[#8a767e]">{s.s}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link href="/shop"><Button size="lg">Continue Shopping <ArrowRight size={15} /></Button></Link>
        <Link href="/account"><Button size="lg" variant="outline">Track in Account</Button></Link>
      </div>
      <p className="font-serif italic text-[#520a22]/60 text-lg mt-10">More Than a Fragrance, A Feeling.</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-serif text-xl">Confirming...</div>}>
      <SuccessInner />
    </Suspense>
  );
}
