export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function money(n: number): string {
  return `$${n.toFixed(0)}`;
}

export function parseGallery(g: unknown): string[] {
  if (Array.isArray(g)) return g as string[];
  if (typeof g === "string") {
    try {
      const parsed = JSON.parse(g);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export function parseSizes(s: unknown): string[] {
  if (Array.isArray(s)) return s as string[];
  if (typeof s === "string") {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return ["30 ml", "50 ml", "100 ml"];
    }
  }
  return ["30 ml", "50 ml", "100 ml"];
}
