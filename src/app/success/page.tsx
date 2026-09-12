"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Printer } from "lucide-react";
import { readDemo, type DemoOrder } from "@/lib/demo";
function Receipt() {
  const params = useSearchParams();
  const id = params.get("order");
  const [order,setOrder] = useState<DemoOrder|null>(null);
  const [loaded,setLoaded] = useState(false);
  useEffect(()=>{try {setOrder(readDemo().orders.find(o=>o.id===id)||null);} finally {setLoaded(true);}},[id]);
  if(!loaded) return <p className="p-16 text-center">Loading receipt?</p>;
  if(!order) return <div className="text-center py-24 px-6"><Package size={40} className="mx-auto text-[#520a22]"/><h1 className="font-serif text-3xl mt-4">Order not found</h1><p className="text-[#8a767e] mt-3">This browser has no demo receipt for that order.</p><Link href="/account" className="inline-block text-[#520a22] underline mt-5">View your orders</Link></div>;
  return <div className="max-w-[760px] mx-auto px-4 py-12"><div className="text-center"><CheckCircle2 size={58} className="success-bloom text-emerald-700 mx-auto"/><p className="text-xs tracking-[0.2em] uppercase text-[#a88436] mt-5">Demo order confirmed</p><h1 className="font-serif text-4xl mt-3">Thank you, {order.firstName}.</h1><p className="text-sm text-[#8a767e] mt-3">No real payment, email or delivery. Your receipt is saved in this browser.</p></div>
    <div className="bg-white luxury-card rounded-2xl mt-8 p-6 sm:p-8"><div className="flex justify-between gap-3 flex-wrap"><div><h2 className="font-semibold">Order #{order.id.slice(0,8).toUpperCase()}</h2><p className="text-xs text-[#8a767e] mt-1">{new Date(order.createdAt).toLocaleString()}</p></div><span className="text-sm text-emerald-700">{order.status}</span></div>
    <div className="space-y-4 my-6">{order.items.map(line=><div key={line.id} className="flex items-center gap-4"><img src={line.image} alt={line.name} className="w-14 h-16 object-cover rounded-xl"/><div className="flex-1"><Link href={"/product/"+line.slug} className="text-sm font-medium">{line.name}</Link><p className="text-xs text-[#8a767e]">{line.size} ? Qty {line.qty}</p></div><span>${line.price*line.qty}</span></div>)}</div>
    <div className="border-t border-[#520a22]/10 pt-5 space-y-2 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>${order.subtotal}</span></p><p className="flex justify-between"><span>Discount</span><span>?${order.discount}</span></p><p className="flex justify-between"><span>Delivery</span><span>${order.shipping}</span></p><p className="flex justify-between font-semibold text-xl"><span>Total</span><span>${order.total}</span></p></div>
    <div className="grid sm:grid-cols-2 gap-6 mt-7 text-sm"><div><h3 className="font-semibold">Delivery details</h3><p className="text-[#8a767e] mt-2">{order.address}<br/>{order.city}, {order.country}<br/>{order.email}</p></div><div><h3 className="font-semibold">Order status</h3><p className="text-[#8a767e] mt-2">Confirmed in demo<br/>{order.shippingMethod} delivery ? {order.paymentMethod}<br/>No shipment is scheduled.</p></div></div></div>
    <div className="flex flex-wrap justify-center gap-3 mt-7 print:hidden"><Link href="/shop" className="bg-[#520a22] text-white rounded-full px-6 py-3 text-sm">Continue shopping</Link><Link href="/account" className="border border-[#520a22]/20 rounded-full px-6 py-3 text-sm">My orders</Link><button onClick={()=>window.print()} className="inline-flex items-center gap-2 text-sm px-4"><Printer size={16}/>Print receipt</button></div>
  </div>;
}
export default function SuccessPage(){return <Suspense fallback={<p className="p-16 text-center">Loading receipt?</p>}><Receipt/></Suspense>;}
