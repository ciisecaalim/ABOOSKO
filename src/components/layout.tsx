"use client";
import { demoFetch, notify } from "@/lib/demo";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Modal } from "./feedback";
import { Search, Heart, ShoppingBag, User, Menu, X, Truck, ShieldCheck, Lock, Trash2, ArrowRight, ArrowLeft, Flower2, Camera, AtSign, Share2, Play, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, QtyStepper } from "./ui";

export function AnnouncementBar() {
  return (
    <div className="burgundy-gradient text-white text-center">
      <div className="max-w-[1440px] mx-auto px-4 py-2 flex items-center justify-center gap-6 text-[9px] sm:text-[11px] tracking-[0.14em] uppercase font-medium">
        <span className="hidden sm:flex items-center gap-2 opacity-90"><Truck size={13} /> Free delivery on orders over $50</span>
        <span className="hidden md:block w-px h-3 bg-white/20" />
        <span className="flex items-center justify-center gap-2"><Flower2 size={13} className="text-[#e6c988]" /> Luxury fragrances for every occasion</span>
        <span className="hidden md:block w-px h-3 bg-white/20" />
        <span className="hidden sm:block opacity-90">Complimentary gift wrapping</span>
      </div>
    </div>
  );
}

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Gift Sets", href: "/shop?category=Gift Sets" },
  { label: "About", href: "/#story" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist, setCartOpen } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  return (
    <header className="site-header sticky top-0 z-40 bg-[#fffbf7] border-b border-[#520a22]/10">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-2 h-[68px] sm:h-[80px]">
          <button className="lg:hidden nav-icon shrink-0" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen}><Menu size={21}/></button>
          <Link href="/" className="brand-logo flex shrink-0 flex-col items-center leading-none" aria-label="ABOOSTO home">
            <span className="flex items-center gap-2"><Flower2 size={18} className="hidden xl:block"/><span className="font-serif text-[19px] sm:text-[28px] tracking-[0.14em] font-semibold">ABOOSTO</span><Flower2 size={18} className="hidden xl:block"/></span>
            <span className="text-[6px] sm:text-[8px] tracking-[0.22em] uppercase text-[#a88436] mt-1.5">Beauty in Every Scent</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden lg:flex items-center justify-center gap-6 xl:gap-9 flex-1">
            {NAV.map(n => <Link key={n.label} href={n.href} aria-current={pathname === n.href ? "page" : undefined} className={"text-xs uppercase tracking-[0.12em] font-semibold py-3 hover:text-[#520a22] " + (pathname === n.href ? "text-[#520a22]" : "text-[#796970]")}>{n.label}</Link>)}
          </nav>
          <div className="flex items-center gap-0 sm:gap-1 shrink-0">
            <button className="nav-icon" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen(v => !v)}>{searchOpen ? <X size={19}/> : <Search size={19}/>}</button>
            <Link className="nav-icon hidden sm:inline-flex" href="/account" aria-label="Account"><User size={19}/></Link>
            <Link className="nav-icon relative" href="/wishlist" aria-label="Wishlist"><Heart size={19}/>{wishlist.length > 0 && <CountBadge n={wishlist.length}/>}</Link>
            <button className="nav-icon relative" aria-label="Cart" onClick={() => setCartOpen(true)}><ShoppingBag size={19}/>{cartCount > 0 && <CountBadge n={cartCount}/>}</button>
          </div>
        </div>
        {searchOpen && <form onSubmit={e => {e.preventDefault();router.push("/shop?q=" + encodeURIComponent(q.trim()));setSearchOpen(false);}} className="flex gap-2 pb-4 max-w-xl mx-auto fade-up">
          <input autoFocus aria-label="Search fragrances" value={q} onChange={e => setQ(e.target.value)} placeholder="Search a fragrance, brand or scent..." className="lux-input min-w-0"/>
          <Button type="submit" size="sm">Search</Button>
        </form>}
      </div>
      {mobileOpen && <Modal title="ABOOSTO" variant="drawer" onClose={() => setMobileOpen(false)}>
        <nav aria-label="Mobile navigation" className="flex flex-col">
          {[...NAV,{label:"Wishlist",href:"/wishlist"},{label:"Account",href:"/account"},{label:"Shopping bag",href:"/cart"}].map(n => <Link key={n.label} href={n.href} onClick={() => setMobileOpen(false)} className="flex items-center justify-between border-b border-[#520a22]/10 py-4 text-base text-[#520a22]">{n.label}<ChevronRight size={17}/></Link>)}
        </nav>
        <p className="font-serif italic mt-10 text-xl text-[#520a22]">More Than a Fragrance,<br/>A Feeling.</p>
        <p className="text-xs mt-4 text-[#8a767e]">Interactive demo ? Your favorites stay in this browser.</p>
      </Modal>}
    </header>
  );
}

function IconBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  const cls = `w-10 h-10 inline-flex items-center justify-center rounded-full transition cursor-pointer ${active ? "bg-[#520a22] text-white" : "text-[#520a22] hover:bg-[#520a22]/8"}`;
  if (onClick) {
    return (
      <button onClick={onClick} aria-label={label} className={cls}>
        {children}
      </button>
    );
  }
  return (
    <span aria-label={label} className={cls}>
      {children}
    </span>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-[#520a22] text-white text-[10px] font-semibold flex items-center justify-center border-2 border-[#fffbf7]">
      {n}
    </span>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, cart, subtotal, updateQty, removeLine } = useStore();
  if (!cartOpen) return null;
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 10;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#3d0718]/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#fffbf7] shadow-2xl flex flex-col fade-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#520a22]/10">
          <div>
            <h3 className="font-serif text-2xl text-[#520a22]">Your Bag</h3>
            <p className="text-xs text-[#8a767e] tracking-wide">{cart.length} item{cart.length !== 1 && "s"} · Free shipping over $50</p>
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-[#520a22]/5 rounded-full cursor-pointer" aria-label="Close cart"><X size={20} /></button>
        </div>
        {/* progress */}
        <div className="px-6 pt-4">
          <div className="bg-white border border-[#520a22]/10 rounded-xl p-3">
            <p className="text-xs text-[#520a22] mb-2">{subtotal >= 50 ? "You've unlocked FREE delivery" : `Add $${50 - subtotal} more for free delivery`}</p>
            <div className="h-1.5 rounded-full bg-[#f2d7de] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#c9a24b] to-[#520a22] transition-all" style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 && (
            <div className="text-center py-14">
              <ShoppingBag size={36} className="mx-auto text-[#d9c3a9]" />
              <p className="font-serif text-xl mt-4 text-[#2b2024]">Your bag is empty</p>
              <p className="text-sm text-[#8a767e] mt-1">Discover scents crafted for every occasion.</p>
              <div className="mt-5"><Button onClick={() => setCartOpen(false)}><Link href="/shop">Explore Collection</Link></Button></div>
            </div>
          )}
          {cart.map((l) => (
            <div key={l.id} className="flex gap-4 bg-white border border-[#520a22]/8 rounded-2xl p-3">
              <img src={l.image} alt={l.name} className="w-[72px] h-[86px] object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#a88436] font-semibold">{l.brand}</p>
                <p className="text-sm font-medium text-[#2b2024] truncate">{l.name}</p>
                <p className="text-xs text-[#8a767e]">Size: {l.size}</p>
                <div className="flex items-center justify-between mt-2">
                  <QtyStepper small qty={l.qty} onChange={(q) => updateQty(l.id, q)} />
                  <span className="font-serif text-lg text-[#520a22]">${l.price * l.qty}</span>
                </div>
              </div>
              <button onClick={() => removeLine(l.id)} className="self-start p-1.5 text-[#8a767e] hover:text-[#a4163a] cursor-pointer" aria-label="Remove"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-[#520a22]/10 px-6 py-5 bg-white">
            <div className="flex justify-between text-sm text-[#8a767e]"><span>Subtotal</span><span className="text-[#2b2024] font-medium">${subtotal}</span></div>
            <div className="flex justify-between text-sm text-[#8a767e] mt-1"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
            <div className="flex justify-between mt-2 pt-3 border-t border-dashed border-[#520a22]/15"><span className="font-medium">Total</span><span className="font-serif text-2xl text-[#520a22]">${subtotal + shipping}</span></div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link href="/cart" onClick={() => setCartOpen(false)}><Button variant="outline" className="w-full">View Cart</Button></Link>
              <Link href="/checkout" onClick={() => setCartOpen(false)}><Button className="w-full">Checkout <ArrowRight size={15} /></Button></Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-[#8a767e]">
              <span className="flex items-center gap-1"><Lock size={12} /> Secure checkout</span>
              <span className="flex items-center gap-1"><ShieldCheck size={12} /> 100% authentic</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    const res = await demoFetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (res.ok) { setDone(true); setEmail(""); } else { setError("Something went wrong. Try again."); }
  }
  return (
    <section className={`${compact ? "py-10" : "py-16 sm:py-20"} px-4`}>
      <div className="max-w-[1100px] mx-auto burgundy-gradient rounded-[28px] px-6 sm:px-12 py-12 sm:py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #e6c988 0, transparent 40%), radial-gradient(circle at 80% 70%, #f9dfe0 0, transparent 45%)" }} />
        <div className="relative">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#e6c988] font-semibold">Join the Maison</p>
          <h3 className="font-serif text-white text-[clamp(1.8rem,4vw,2.8rem)] mt-3 leading-tight">Get 15% Off Your First Ritual</h3>
          <p className="text-white/70 text-sm sm:text-[15px] mt-3 max-w-md mx-auto">Private drops, scent stories and members-only gifts. Beauty in every inbox.</p>
          {done ? (
            <div className="mt-7 inline-flex items-center gap-2 bg-white/10 border border-[#e6c988]/40 text-[#e6c988] px-6 py-3 rounded-full text-sm fade-up">
              Welcome to ABOOSTO — check your inbox for 15% off.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input type="email" required aria-label="Newsletter email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="flex-1 rounded-full px-6 py-3.5 text-sm bg-white text-[#2b2024] placeholder:text-[#8a767e]/70" />
              <Button variant="gold" size="lg" type="submit">Subscribe</Button>
            </form>
          )}
          {error && <p className="text-[#f3c8cb] text-xs mt-3">{error}</p>}
          <p className="text-white/40 text-[11px] mt-4 tracking-wide">Demo subscription only. No emails are sent.</p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const [social, setSocial] = useState(false);
  return (
    <footer id="footer" className="bg-[#2b1219] text-white">
      <div className="gold-line" />
      {social && <Modal title="The ABOOSTO community" onClose={() => setSocial(false)}><p className="text-sm text-[#8a767e]">Explore our story or copy a link to share this demo.</p><div className="flex flex-wrap gap-3 mt-5"><Link href="/#story" onClick={() => setSocial(false)} className="rounded-full bg-[#520a22] text-white px-5 py-3 text-sm">Our story</Link><Button variant="outline" onClick={async () => {try {await navigator.clipboard.writeText(window.location.origin);notify("Demo link copied.");} catch {notify("Copy the address from your browser to share this demo.","info");}}}>Copy link</Button><Link href="/contact" onClick={() => setSocial(false)} className="text-[#520a22] underline p-3">Contact us</Link></div></Modal>}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Flower2 size={20} className="text-[#e6c988]" />
              <span className="font-serif text-[26px] tracking-[0.2em] font-semibold">ABOOSTO</span>
            </div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-[#e6c988] mt-1">Beauty in Every Scent</p>
            <p className="text-white/60 text-sm mt-5 max-w-xs leading-relaxed">More Than a Fragrance, A Feeling. Curated luxury perfumes, gift rituals and signature oud — delivered with love.</p>
            <div className="flex gap-3 mt-6">
              {[Camera, AtSign, Share2, Play].map((Icon, i) => (
                <button key={i} onClick={() => setSocial(true)} className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-[#520a22] hover:border-[#520a22] hover:text-white transition" aria-label={["Instagram community", "Contact the boutique", "Share ABOOSTO", "Our fragrance story"][i]}>
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[12px] tracking-[0.22em] uppercase text-[#e6c988] font-semibold mb-5">Shop</h4>
            <ul className="space-y-3 text-sm text-white/65">
              <li><Link href="/shop?category=Women" className="hover:text-white transition">Women</Link></li>
              <li><Link href="/shop?category=Men" className="hover:text-white transition">Men</Link></li>
              <li><Link href="/shop?category=Unisex" className="hover:text-white transition">Unisex</Link></li>
              <li><Link href="/shop?category=Gift Sets" className="hover:text-white transition">Gift Sets</Link></li>
              <li><Link href="/shop?flag=best" className="hover:text-white transition">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] tracking-[0.22em] uppercase text-[#e6c988] font-semibold mb-5">Support</h4>
            <ul className="space-y-3 text-sm text-white/65">
              <li><Link href="/account" className="hover:text-white transition">Track Order</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition">Shipping & Returns</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition">Wishlist</Link></li>
              <li><Link href="/#story" className="hover:text-white transition">Our Story</Link></li>
              <li><Link href="/checkout" className="hover:text-white transition">Secure Checkout</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h4 className="text-[12px] tracking-[0.22em] uppercase text-[#e6c988] font-semibold mb-5">Boutique</h4>
            <ul className="space-y-3 text-sm text-white/65">
              <li className="flex gap-2"><MapPin size={15} className="shrink-0 mt-0.5 text-[#e6c988]" /> Maka Al-Mukarama Rd, Mogadishu</li>
              <li className="flex gap-2"><Phone size={15} className="shrink-0 mt-0.5 text-[#e6c988]" /> +252 61 000 0000</li>
              <li className="flex gap-2"><Mail size={15} className="shrink-0 mt-0.5 text-[#e6c988]" /> care@aboosto.com</li>
            </ul>
            <div className="flex gap-2 mt-5">
              {["VISA", "MC", "AMEX", "PayPal"].map((p) => (
                <span key={p} className="text-[9px] font-bold tracking-wider bg-white/10 border border-white/15 rounded px-2 py-1.5">{p}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/40">
          <p>© 2026 ABOOSTO. All rights reserved. Crafted with devotion.</p>
          <div className="flex items-center gap-5">
            <a href="/privacy" className="hover:text-white/80">Privacy</a>
            <a href="/terms" className="hover:text-white/80">Terms</a>
            <span className="flex items-center gap-1"><Lock size={11} /> Interactive shopping demo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-[13px] text-[#8a767e] flex-wrap">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-[#d9c3a9]">/</span>}
          {it.href ? <Link href={it.href} className="hover:text-[#520a22] transition">{it.label}</Link> : <span className="text-[#520a22] font-medium">{it.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-[13px] text-[#8a767e] hover:text-[#520a22] transition">
      <ArrowLeft size={15} /> {label}
    </Link>
  );
}
