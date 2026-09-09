import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AnnouncementBar, Navbar, Footer, CartDrawer } from "@/components/layout";

export const metadata: Metadata = {
  title: "ABOOSTO — Beauty in Every Scent | Luxury Fragrance Boutique",
  description: "More Than a Fragrance, A Feeling. Discover premium perfumes, signature oud and gift rituals at ABOOSTO.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#fffbf7] text-[#2b2024] antialiased min-h-screen flex flex-col">
        <StoreProvider>
          <AnnouncementBar />
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
