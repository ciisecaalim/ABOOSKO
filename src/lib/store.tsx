"use client";
import { demoFetch, notify } from "@/lib/demo";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

export type CartLine = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  size: string;
  qty: number;
};

export type WishItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  rating: number;
};

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sid: string | null;
  try { sid = localStorage.getItem("aboosto_sid"); } catch {return "demo";}
  if (!sid) {
    sid = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    try {localStorage.setItem("aboosto_sid", sid);} catch {return "demo";}
  }
  return sid;
}

type StoreCtx = {
  sessionId: string;
  cart: CartLine[];
  wishlist: WishItem[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  cartCount: number;
  subtotal: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addToCart: (slug: string, size?: string, qty?: number) => Promise<boolean>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeLine: (id: string) => Promise<void>;
  toggleWishlist: (slug: string) => Promise<boolean>;
  isWished: (slug: string) => boolean;
  lastAdded: CartLine | null;
  setLastAdded: (v: CartLine | null) => void;
};

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState("server");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastAdded, setLastAdded] = useState<CartLine | null>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const refresh = useCallback(async () => {
    const sid = getSessionId();
    try {
      const [c, w] = await Promise.all([
        demoFetch(`/api/cart?sessionId=${sid}`).then((r) => r.json()),
        demoFetch(`/api/wishlist?sessionId=${sid}`).then((r) => r.json()),
      ]);
      if (c?.lines) setCart(c.lines);
      if (w?.items) setWishlist(w.items);
    } catch {
      /* offline fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("aboosto:changed", refresh);
    return () => {window.removeEventListener("storage",refresh);window.removeEventListener("aboosto:changed",refresh);};
  }, [refresh]);

  const addToCart = useCallback(
    async (slug: string, size = "50 ml", qty = 1) => {
      const sid = getSessionId();
      const res = await demoFetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, slug, size, qty }),
      });
      const data = await res.json();
      if (data?.lines) {
        setCart(data.lines);
        const found = data.lines.find((l: CartLine) => l.slug === slug && l.size === size);
        if (found) setLastAdded(found);
        setCartOpen(true);
      }
      return res.ok;
    },
    []
  );

  const updateQty = useCallback(async (id: string, qty: number) => {
    const sid = getSessionId();
    const res = await demoFetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, id, qty }),
    });
    const data = await res.json();
    if (data?.lines) setCart(data.lines);
  }, []);

  const removeLine = useCallback(async (id: string) => {
    const sid = getSessionId();
    const res = await demoFetch(`/api/cart?sessionId=${sid}&id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data?.lines) setCart(data.lines);
  }, []);

  const toggleWishlist = useCallback(
    async (slug: string) => {
      const sid = getSessionId();
      const res = await demoFetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, slug }),
      });
      const data = await res.json();
      if (data?.items) setWishlist(data.items);
      return !!data?.wished;
    },
    []
  );

  const isWished = useCallback((slug: string) => wishlist.some((w) => w.slug === slug), [wishlist]);

  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.qty * l.price, 0), [cart]);

  const value: StoreCtx = {
    sessionId,
    cart,
    wishlist,
    cartOpen,
    setCartOpen,
    cartCount,
    subtotal,
    loading,
    refresh,
    addToCart,
    updateQty,
    removeLine,
    toggleWishlist,
    isWished,
    lastAdded,
    setLastAdded,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
