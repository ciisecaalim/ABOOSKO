"use client";

import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" | "gold"; size?: "sm" | "md" | "lg" }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 rounded-full cursor-pointer disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    primary: "bg-[#520a22] text-white hover:bg-[#3d0718] hover:shadow-[0_14px_30px_-10px_rgba(82,10,34,0.6)]",
    secondary: "bg-[#f9dfe0] text-[#520a22] hover:bg-[#f3c8cb]",
    outline: "border border-[#520a22]/25 text-[#520a22] hover:border-[#520a22] hover:bg-[#520a22]/5 bg-white/70 backdrop-blur",
    ghost: "text-[#520a22] hover:bg-[#520a22]/5",
    gold: "bg-gradient-to-r from-[#c9a24b] to-[#a88436] text-white hover:brightness-110 hover:shadow-[0_14px_30px_-10px_rgba(201,162,75,0.7)]",
  };
  const sizes: Record<string, string> = {
    sm: "text-xs px-4 py-2.5",
    md: "text-sm px-7 py-3",
    lg: "text-sm px-9 py-4",
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "burgundy", className }: { children: React.ReactNode; tone?: "burgundy" | "gold" | "blush" | "dark" | "sale"; className?: string }) {
  const tones: Record<string, string> = {
    burgundy: "bg-[#520a22] text-white",
    gold: "bg-gradient-to-r from-[#c9a24b] to-[#a88436] text-white",
    blush: "bg-[#f9dfe0] text-[#520a22] border border-[#520a22]/10",
    dark: "bg-[#2b2024] text-white",
    sale: "bg-[#a4163a] text-white",
  };
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em]", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Rating({ value = 4.5, size = 13, className }: { value?: number; size?: number; className?: string }) {
  const full = Math.floor(value);
  const half = value - full >= 0.4;
  return (
    <span className={cn("inline-flex items-center gap-[2px]", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} size={size} className="fill-[#c9a24b] text-[#c9a24b]" />;
        if (i === full && half) return <StarHalf key={i} size={size} className="fill-[#c9a24b] text-[#c9a24b]" />;
        return <Star key={i} size={size} className="text-[#d9c3a9]" />;
      })}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow && (
        <p className={cn("text-[11px] font-semibold uppercase tracking-[0.28em] mb-3", light ? "text-[#e6c988]" : "text-[#a88436]")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn("font-serif text-[clamp(1.9rem,3.5vw,2.9rem)] leading-[1.08] font-medium", light ? "text-white" : "text-[#2b2024]")}>
        {title}
      </h2>
      {subtitle && <p className={cn("mt-3 text-[15px] leading-relaxed", light ? "text-white/70" : "text-[#8a767e]")}>{subtitle}</p>}
      <div className={cn("mt-5 flex items-center gap-3", align === "center" && "justify-center")}>
        <span className={cn("h-px w-10", light ? "bg-[#c9a24b]" : "bg-[#c9a24b]/70")} />
        <span className="w-1.5 h-1.5 rotate-45 bg-[#c9a24b]" />
        <span className={cn("h-px w-10", light ? "bg-[#c9a24b]" : "bg-[#c9a24b]/70")} />
      </div>
    </div>
  );
}

export function QtyStepper({ qty, onChange, small }: { qty: number; onChange: (q: number) => void; small?: boolean }) {
  return (
    <div className={cn("inline-flex items-center border border-[#520a22]/15 rounded-full bg-white", small ? "p-0.5" : "p-1")}>
      <button
        onClick={() => onChange(Math.max(1, qty - 1))}
        className={cn("rounded-full hover:bg-[#faf0f2] text-[#520a22] transition cursor-pointer", small ? "w-7 h-7 text-sm" : "w-9 h-9 text-lg")}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={cn("font-medium text-center text-[#2b2024]", small ? "w-7 text-xs" : "w-9 text-sm")}>{qty}</span>
      <button
        onClick={() => onChange(Math.min(9, qty + 1))}
        className={cn("rounded-full hover:bg-[#faf0f2] text-[#520a22] transition cursor-pointer", small ? "w-7 h-7 text-sm" : "w-9 h-9 text-lg")}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-[#520a22]/10 overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "px-5 py-3 text-[13px] font-medium tracking-wide whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px",
            active === t ? "border-[#520a22] text-[#520a22]" : "border-transparent text-[#8a767e] hover:text-[#520a22]"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-[12px] font-medium uppercase tracking-[0.12em] text-[#520a22]/80 mb-2">{label}</span>
      {children}
    </label>
  );
}

export function EmptyState({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-[#faf0f2] border border-[#520a22]/10 flex items-center justify-center mb-5">
        <span className="w-2.5 h-2.5 rotate-45 bg-[#c9a24b]" />
      </div>
      <h3 className="font-serif text-2xl text-[#2b2024]">{title}</h3>
      <p className="mt-2 text-sm text-[#8a767e] max-w-sm mx-auto">{subtitle}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
