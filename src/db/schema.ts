import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const products = pgTable("products", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  brand: varchar("brand", { length: 120 }).notNull(),
  tagline: text("tagline"),
  description: text("description"),
  category: varchar("category", { length: 80 }).notNull(),
  scentType: varchar("scent_type", { length: 80 }).notNull(),
  gender: varchar("gender", { length: 40 }).default("Unisex"),
  price: integer("price").notNull(),
  compareAt: integer("compare_at"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("4.50"),
  reviewCount: integer("review_count").default(0),
  image: text("image").notNull(),
  gallery: text("gallery").default("[]"),
  sizes: text("sizes").default('["30 ml","50 ml","100 ml"]'),
  stock: integer("stock").default(48),
  badge: varchar("badge", { length: 60 }),
  isBestSeller: boolean("is_best_seller").default(false),
  isNewArrival: boolean("is_new_arrival").default(false),
  isFeatured: boolean("is_featured").default(false),
  notesTop: text("notes_top"),
  notesHeart: text("notes_heart"),
  notesBase: text("notes_base"),
  ingredients: text("ingredients"),
  howToUse: text("how_to_use"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull(),
  author: varchar("author", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 200 }),
  body: text("body").notNull(),
  verified: boolean("verified").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 80 }).notNull(),
  productId: uuid("product_id").notNull(),
  size: varchar("size", { length: 30 }).default("50 ml"),
  qty: integer("qty").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 80 }).notNull(),
  productId: uuid("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 80 }),
  email: varchar("email", { length: 200 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  address: varchar("address", { length: 250 }),
  city: varchar("city", { length: 120 }),
  zip: varchar("zip", { length: 30 }),
  country: varchar("country", { length: 100 }),
  phone: varchar("phone", { length: 60 }),
  shippingMethod: varchar("shipping_method", { length: 80 }).default("standard"),
  paymentMethod: varchar("payment_method", { length: 80 }).default("card"),
  subtotal: integer("subtotal").default(0),
  shipping: integer("shipping").default(0),
  discount: integer("discount").default(0),
  total: integer("total").default(0),
  discountCode: varchar("discount_code", { length: 60 }),
  status: varchar("status", { length: 60 }).default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull(),
  productId: uuid("product_id"),
  name: varchar("name", { length: 200 }).notNull(),
  size: varchar("size", { length: 30 }),
  qty: integer("qty").default(1),
  price: integer("price").default(0),
  image: text("image"),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 200 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  sessionId: varchar("session_id", { length: 80 }).primaryKey(),
  name: varchar("name", { length: 160 }),
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 60 }),
  address: varchar("address", { length: 250 }),
  city: varchar("city", { length: 120 }),
  country: varchar("country", { length: 100 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
