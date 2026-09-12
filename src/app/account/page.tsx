"use client";
import { demoFetch, notify, resetDemo } from "@/lib/demo";

import React, { useEffect, useState } from "react";
import { User, Package, MapPin, Heart, Settings, Check, Truck } from "lucide-react";
import { Breadcrumb } from "@/components/layout";
import { Button, Field, Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { Modal } from "@/components/feedback";

type Order = {
  id: string; email: string; total: number; status: string; createdAt: string;
  shippingMethod: string; items?: { name: string; qty: number; price: number; image: string; size: string }[];
};

export default function AccountPage() {
  const { sessionId, wishlist, cartCount } = useStore();
  const [tab, setTab] = useState("Orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "", city: "", country: "Somalia" });
  const [saved, setSaved] = useState(false);
  const [preferences,setPreferences] = useState([true,true,true,false]);
  const [confirmReset,setConfirmReset] = useState(false);

  useEffect(() => {
    if (!sessionId || sessionId === "server") return;
    demoFetch(`/api/orders?sessionId=${sessionId}`).then((r) => r.json()).then((d) => setOrders(d.orders || []));
    demoFetch(`/api/account?sessionId=${sessionId}`).then((r) => r.json()).then((d) => {
      if(Array.isArray(d.account?.preferences)) setPreferences(d.account.preferences);
      if (d.account) setProfile({ name: d.account.name || "", email: d.account.email || "", phone: d.account.phone || "", address: d.account.address || "", city: d.account.city || "", country: d.account.country || "Somalia" });
    });
  }, [sessionId]);

  async function save() {
    const response = await demoFetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, ...profile, preferences }) });
    if (!response.ok) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const tabs = [
    { id: "Orders", icon: Package },
    { id: "Profile", icon: User },
    { id: "Addresses", icon: MapPin },
    { id: "Wishlist", icon: Heart },
    { id: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-[#fffbf7]">
      {confirmReset && <Modal title="Reset this demo?" onClose={() => setConfirmReset(false)}><p className="text-sm text-[#8a767e]">This removes the demo bag, favorites, orders, reviews and profile saved in this browser.</p><div className="flex gap-3 mt-6"><Button variant="outline" onClick={() => setConfirmReset(false)}>Cancel</Button><Button onClick={() => {try {resetDemo();setOrders([]);setProfile({name:"",email:"",phone:"",address:"",city:"",country:"Somalia"});setPreferences([true,true,true,false]);setConfirmReset(false);notify("Demo data reset.");} catch {notify("Browser storage is unavailable.","error");}}}>Reset demo</Button></div></Modal>}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Account" }]} />
        <div className="flex items-center gap-5 mt-4">
          <span className="w-16 h-16 rounded-full burgundy-gradient text-white flex items-center justify-center font-serif text-3xl shadow-lg">
            {(profile.name || "A")[0].toUpperCase()}
          </span>
          <div>
            <h1 className="font-serif text-[clamp(1.8rem,3.5vw,2.5rem)]">{profile.name || "My Account"}</h1>
            <p className="text-sm text-[#8a767e]">{profile.email || "Welcome to your maison"} · {orders.length} orders · {wishlist.length} saved · {cartCount} in bag</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        <aside className="bg-white luxury-card rounded-[20px] p-3 lg:sticky lg:top-[90px] flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition cursor-pointer ${tab === t.id ? "bg-[#520a22] text-white" : "text-[#2b2024]/70 hover:bg-[#faf0f2]"}`}>
              <t.icon size={17} /> {t.id}
            </button>
          ))}
        </aside>

        <div className="bg-white luxury-card rounded-[24px] p-6 sm:p-8 min-h-[420px]">
          {tab === "Orders" && (
            <div>
              <h3 className="font-serif text-2xl">Order History</h3>
              <p className="text-sm text-[#8a767e] mt-1">Track every ritual you've ordered with ABOOSTO.</p>
              <div className="mt-6 space-y-4">
                {orders.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-[#520a22]/15 rounded-2xl">
                    <Package size={30} className="mx-auto text-[#d9c3a9]" />
                    <p className="font-serif text-xl mt-3">No orders yet</p>
                    <p className="text-sm text-[#8a767e]">Your confirmed orders will appear here with tracking.</p>
                    <div className="mt-4"><Link href="/shop"><Button>Start Shopping</Button></Link></div>
                  </div>
                )}
                {orders.map((o) => (
                  <div key={o.id} className="border border-[#520a22]/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-semibold">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-[#8a767e]">{new Date(o.createdAt).toLocaleDateString()} · {o.shippingMethod} · {o.items?.reduce((s, i) => s + i.qty, 0) || 0} items</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone="burgundy">{o.status}</Badge>
                        <span className="font-serif text-xl text-[#520a22] font-semibold">${o.total}</span>
                      </div>
                    </div>
                    {o.items && o.items.length > 0 && (
                      <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
                        {o.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-3 bg-[#fff9f1] border border-[#520a22]/8 rounded-xl p-2 pr-4 shrink-0">
                            <img src={it.image} alt={it.name} className="w-11 h-13 h-[52px] object-cover rounded-lg" />
                            <div><p className="text-xs font-medium max-w-[140px] truncate">{it.name}</p><p className="text-[11px] text-[#8a767e]">×{it.qty} · {it.size}</p></div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700"><Truck size={13} /> In transit — arriving in 2–4 days. Tracking sent to {o.email}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Profile" && (
            <div>
              <h3 className="font-serif text-2xl">Profile Details</h3>
              <p className="text-sm text-[#8a767e] mt-1">Keep your concierge details up to date.</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <Field label="Full name"><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="lux-input" placeholder="Amira Hassan" /></Field>
                <Field label="Email"><input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="lux-input" placeholder="you@example.com" /></Field>
                <Field label="Phone"><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="lux-input" placeholder="+252 ..." /></Field>
                <Field label="City"><input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="lux-input" /></Field>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button onClick={save}>{saved ? <><Check size={15} /> Saved</> : "Save Changes"}</Button>
                {saved && <span className="text-sm text-emerald-700">Profile updated.</span>}
              </div>
            </div>
          )}

          {tab === "Addresses" && (
            <div>
              <h3 className="font-serif text-2xl">Saved Addresses</h3>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="border border-[#520a22] bg-[#faf0f2] rounded-2xl p-5">
                  <Badge tone="burgundy">Default</Badge>
                  <p className="font-medium mt-3">{profile.name || "—"}</p>
                  <p className="text-sm text-[#8a767e] mt-1">{profile.address || "Add your delivery address"}, {profile.city}, {profile.country}<br />{profile.phone}</p>
                </div>
                <div className="border border-dashed border-[#520a22]/20 rounded-2xl p-5">
                  <Field label="Street address"><input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="lux-input" placeholder="Maka Al-Mukarama Rd" /></Field>
                  <div className="mt-3"><Button variant="outline" onClick={save}>Save Address</Button></div>
                </div>
              </div>
            </div>
          )}

          {tab === "Wishlist" && (
            <div>
              <h3 className="font-serif text-2xl">Saved Fragrances ({wishlist.length})</h3>
              {wishlist.length === 0 ? (
                <p className="text-sm text-[#8a767e] mt-3">No saved items. <Link href="/shop" className="text-[#520a22] underline">Explore the boutique</Link></p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {wishlist.map((w) => (
                    <Link key={w.slug} href={`/product/${w.slug}`} className="flex gap-4 border border-[#520a22]/10 rounded-2xl p-3 hover:border-[#520a22] transition">
                      <img src={w.image} alt={w.name} className="w-16 h-20 object-cover rounded-xl" />
                      <div><p className="text-[10px] uppercase tracking-[0.18em] text-[#a88436] font-bold">{w.brand}</p><p className="font-medium text-sm">{w.name}</p><p className="font-serif text-lg text-[#520a22]">${w.price}</p></div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Settings" && (
            <div>
              <h3 className="font-serif text-2xl">Preferences</h3>
              <div className="mt-6 space-y-4 max-w-md">
                {["Email me about new arrivals", "SMS order updates", "Birthday gift surprises", "Members-only private sales"].map((s, i) => (
                  <label key={s} className="flex items-center justify-between border border-[#520a22]/10 rounded-2xl px-5 py-4 cursor-pointer">
                    <span className="text-sm">{s}</span>
                    <input type="checkbox" checked={preferences[i]} onChange={e => setPreferences(previous => previous.map((v,index) => index === i ? e.target.checked : v))} className="w-5 h-5 accent-[#520a22]" />
                  </label>
                ))}
                <Button onClick={save}>Save Preferences</Button><div className="border-t border-[#520a22]/10 pt-6"><h4 className="font-semibold">Demo data</h4><p className="text-sm text-[#8a767e] mt-2 mb-4">Your profile, favorites and orders are stored only in this browser.</p><Button variant="outline" onClick={() => setConfirmReset(true)}>Reset demo data</Button></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
