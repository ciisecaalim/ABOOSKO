import { PRODUCTS } from "./data";

export const DEMO_KEY = "aboosto_demo_v1";
export type DemoReview = { id: string; slug: string; author: string; rating: number; title: string; body: string; verified: boolean; createdAt: string };
export type DemoLine = { id: string; productId: string; slug: string; name: string; brand: string; image: string; price: number; size: string; qty: number };
export type DemoOrder = { id: string; email: string; firstName: string; lastName: string; address: string; city: string; country: string; phone: string; zip: string; total: number; subtotal: number; shipping: number; discount: number; discountCode: string; shippingMethod: string; paymentMethod: string; status: string; createdAt: string; items: DemoLine[] };
type DemoState = { cart: DemoLine[]; wishlist: string[]; orders: DemoOrder[]; account: Record<string, string | boolean[]>; reviews: DemoReview[]; subscribers: string[] };
function empty(): DemoState { return { cart: [], wishlist: [], orders: [], account: {}, reviews: [], subscribers: [] }; }
export function notify(message: string, kind: "success" | "error" | "info" = "success") {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("aboosto:toast", { detail: { message, kind } }));
}
export function readDemo(): DemoState {
  if (typeof window === "undefined") return empty();
  const raw = localStorage.getItem(DEMO_KEY);
  if (!raw) return empty();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !["cart", "wishlist", "orders", "reviews", "subscribers"].every((key) => Array.isArray(parsed[key])) || typeof parsed.account !== "object" || !parsed.account) throw new Error();
    return parsed;
  } catch {
    throw new Error("Saved demo data could not be read. Reset the demo in Account settings.");
  }
}
function save(data: DemoState) {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(data)); }
  catch { throw new Error("Browser storage is unavailable or full. Enable local storage and try again."); }
  window.dispatchEvent(new Event("aboosto:changed"));
}
export function resetDemo() { localStorage.removeItem(DEMO_KEY); window.dispatchEvent(new Event("aboosto:changed")); }
export function discountPercent(code: string) {
  return ({ ABOOSTO15: 15, WELCOME10: 10, LUXE20: 20 } as Record<string, number>)[code.trim().toUpperCase()] || 0;
}
export function catalog(sp: URLSearchParams) {
  let items = [...PRODUCTS];
  const q = (sp.get("q") || "").trim().toLowerCase();
  const category = sp.get("category");
  if (q) items = items.filter(p => [p.name, p.brand, p.category, p.scentType, p.notesTop, p.notesHeart, p.notesBase].join(" ").toLowerCase().includes(q));
  if (category) items = items.filter(p => p.category === category);
  for (const [param, field] of [["brand", "brand"], ["scent", "scentType"]] as const) {
    const values = sp.get(param)?.split(",");
    if (values?.length) items = items.filter(p => values.includes(p[field]));
  }
  if (sp.has("maxPrice")) items = items.filter(p => p.price <= Number(sp.get("maxPrice")));
  if (sp.has("rating")) items = items.filter(p => p.rating >= Number(sp.get("rating")));
  const flag = sp.get("flag");
  if (flag === "best") items = items.filter(p => p.isBestSeller);
  if (flag === "new") items = items.filter(p => p.isNewArrival);
  if (flag === "featured") items = items.filter(p => p.isFeatured);
  const sort = sp.get("sort");
  if (sort === "price-asc") items.sort((a,b) => a.price-b.price);
  else if (sort === "price-desc") items.sort((a,b) => b.price-a.price);
  else if (sort === "rating") items.sort((a,b) => b.rating-a.rating);
  else if (sort === "newest") items.sort((a,b) => Number(!!b.isNewArrival)-Number(!!a.isNewArrival));
  else items.sort((a,b) => b.reviewCount-a.reviewCount);
  const perPage = Math.min(100, Math.max(1, Number(sp.get("perPage")) || 12));
  const totalPages = Math.max(1, Math.ceil(items.length/perPage));
  const page = Math.min(totalPages, Math.max(1, Number(sp.get("page")) || 1));
  return { items: items.slice((page-1)*perPage, page*perPage).map(p => ({...p, compareAt: p.compareAt ?? null, badge: p.badge ?? null})), total: items.length, totalPages, page };
}
function required(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Please enter " + name + ".");
  return value.trim();
}
function email(value: unknown) {
  const result = required(value, "your email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new Error("Please enter a valid email address.");
  return result;
}
function product(slug: unknown) {
  const p = PRODUCTS.find(p => p.slug === slug);
  if (!p) throw new Error("This fragrance could not be found.");
  return p;
}
function quantity(value: unknown) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 9) throw new Error("Choose a quantity between 1 and 9.");
  return n;
}
const wishlistItems = (state: DemoState) => state.wishlist.map(slug => PRODUCTS.find(p => p.slug === slug)).filter(p => !!p).map(p => ({...p, productId: p.slug}));
export async function demoFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = new URL(input, "https://demo.local");
  const method = init?.method || "GET";
  try {
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    if (url.pathname === "/api/products") return Response.json(catalog(url.searchParams));
    if (url.pathname.startsWith("/api/products/")) {
      const p = product(decodeURIComponent(url.pathname.split("/").pop() || ""));
      return Response.json({ product: {...p, compareAt: p.compareAt ?? null, badge: p.badge ?? null}, related: PRODUCTS.filter(x => x.slug !== p.slug && x.category === p.category).slice(0,4) });
    }
    // Each mutation reads the latest snapshot and saves once, including checkout.
    const state = readDemo();
    if (url.pathname === "/api/cart") {
      if (method === "POST") {
        const p = product(body.slug);
        const size = body.size && p.sizes.includes(body.size) ? body.size : p.sizes.includes("50 ml") ? "50 ml" : p.sizes[0];
        const qty = quantity(body.qty ?? 1);
        const existing = state.cart.find(l => l.slug === p.slug && l.size === size);
        const nextQty = (existing?.qty || 0) + qty;
        if (nextQty > Math.min(9, p.stock)) throw new Error("The maximum available quantity is " + Math.min(9,p.stock) + ".");
        if (existing) existing.qty = nextQty;
        else state.cart.push({ id: crypto.randomUUID(), productId: p.slug, slug:p.slug, name:p.name, brand:p.brand, image:p.image, price:p.price, size, qty });
        save(state); notify(p.name + " added to your bag.");
      } else if (method === "PATCH") {
        const line = state.cart.find(l => l.id === body.id);
        if (!line) throw new Error("This item is no longer in your bag.");
        if (body.qty <= 0) state.cart = state.cart.filter(l => l.id !== body.id);
        else line.qty = quantity(body.qty);
        save(state); notify("Bag updated.");
      } else if (method === "DELETE") {
        state.cart = url.searchParams.has("clear") ? [] : state.cart.filter(l => l.id !== url.searchParams.get("id"));
        save(state); notify("Item removed from your bag.");
      }
      return Response.json({lines: state.cart});
    }
    if (url.pathname === "/api/wishlist") {
      let wished = false;
      if (method === "POST") {
        const p = product(body.slug);
        wished = !state.wishlist.includes(p.slug);
        state.wishlist = wished ? [...state.wishlist, p.slug] : state.wishlist.filter(s => s !== p.slug);
        save(state); notify(wished ? "Saved to your favorites." : "Removed from favorites.");
      }
      return Response.json({items: wishlistItems(state), wished});
    }
    if (url.pathname === "/api/account") {
      if (method === "POST") {
        if (body.email) email(body.email);
        const account: DemoState["account"] = {};
        for (const key of ["name","email","phone","address","city","country"]) account[key] = typeof body[key] === "string" ? body[key].trim() : "";
        if (Array.isArray(body.preferences)) account.preferences = body.preferences.map(Boolean);
        state.account = {...state.account, ...account};
        save(state); notify("Your details have been saved in this browser.");
      }
      return Response.json({account: state.account});
    }
    if (url.pathname === "/api/newsletter") {
      const address = email(body.email).toLowerCase();
      if (!state.subscribers.includes(address)) state.subscribers.push(address);
      save(state); notify("You're on the demo list. Use ABOOSTO15 for 15% off.");
      return Response.json({ok: true});
    }
    if (url.pathname === "/api/reviews") {
      if (method === "POST") {
        const p = product(body.slug);
        const rating = Number(body.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Choose a rating from 1 to 5.");
        const review: DemoReview = { id:crypto.randomUUID(), slug:p.slug, author:required(body.author,"your name"), body:required(body.body,"your review"), title:String(body.title || "").trim(), rating, verified:false, createdAt:new Date().toISOString() };
        state.reviews.unshift(review); save(state); notify("Your demo review has been published.");
        return Response.json({review});
      }
      return Response.json({reviews:state.reviews.filter(r => r.slug === url.searchParams.get("slug"))});
    }
    if (url.pathname === "/api/orders") {
      if (method === "GET") return Response.json({orders: state.orders});
      if (!state.cart.length) throw new Error("Your bag is empty. Add a fragrance before checking out.");
      const addressEmail = email(body.email);
      const firstName = required(body.firstName,"your first name");
      const address = required(body.address,"your delivery address");
      const city = required(body.city,"your city");
      const country = required(body.country,"your country");
      if (!["standard","express","gift"].includes(body.shippingMethod)) throw new Error("Choose a shipping method.");
      if (!["card","paypal","cod"].includes(body.paymentMethod)) throw new Error("Choose a payment method.");
      if (body.paymentMethod === "cod" && city.toLowerCase() !== "mogadishu") throw new Error("Demo cash on delivery is available in Mogadishu. Choose card or PayPal.");
      if (body.outcome === "declined") throw new Error("Demo payment declined. Your bag is saved. Select a successful payment and try again.");
      if (body.paymentMethod === "card" && body.demoCard !== true) throw new Error("Use the demo card to continue.");
      const code = String(body.discountCode || "").trim().toUpperCase();
      const pct = discountPercent(code);
      if (code && !pct) throw new Error("That discount code is not valid. Try ABOOSTO15.");
      const items = state.cart.map(line => {
        const p = product(line.slug);
        quantity(line.qty);
        if (!p.sizes.includes(line.size) || line.qty > p.stock) throw new Error("An item in your bag is no longer available.");
        return {...line, price:p.price};
      });
      const subtotal = items.reduce((sum,l) => sum+l.price*l.qty,0);
      const discount = Math.round(subtotal*pct/100);
      const shipping = body.shippingMethod === "express" ? 18 : body.shippingMethod === "gift" ? 14 : subtotal-discount >= 50 ? 0 : 10;
      const order: DemoOrder = { id:crypto.randomUUID(), email:addressEmail, firstName, lastName:String(body.lastName || ""), address, city, country, zip:String(body.zip || ""), phone:String(body.phone || ""), items, subtotal, discount, shipping, total:subtotal-discount+shipping, discountCode:code, shippingMethod:body.shippingMethod, paymentMethod:body.paymentMethod, status:body.paymentMethod === "cod" ? "confirmed ? pay on delivery" : "confirmed ? demo paid", createdAt:new Date().toISOString() };
      state.orders.unshift(order); state.cart = []; save(state);
      notify("Demo order confirmed. No payment was charged.");
      return Response.json({order});
    }
    throw new Error("This demo action is unavailable.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    notify(message,"error");
    return Response.json({error:message},{status:400});
  }
}
