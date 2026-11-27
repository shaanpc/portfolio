import { queryOptions, type QueryClient } from "@tanstack/react-query";
import seedWorks from "@/data/works.json";

export interface Work {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  year?: string;
  medium?: string;
  client?: string;
  description?: string;
  story?: string;
  imageSrc: string;
  gallery?: string[];
  behanceUrl?: string;
  contraUrl?: string;
  featured?: boolean;
}

export type WorkInput = Omit<Work, "id"> & { id?: string };

export const DEFAULT_CATEGORIES = [
  "Illustration",
  "Branding & Identity",
  "Packaging Design",
  "Social Media Design",
  "Ad Campaigns",
  "Photo Manipulation",
  "Visual Storytelling",
] as const;

export const ARCHIVE_CATEGORIES = ["All", ...DEFAULT_CATEGORIES] as const;

const STORAGE_KEY = "shan_pc_portfolio_works_v2";

function normalizeWork(raw: Partial<Work>, fallbackIndex = 0): Work {
  const title = (raw.title ?? "Untitled Work").trim() || "Untitled Work";
  const gallery = Array.isArray(raw.gallery)
    ? raw.gallery.map((item) => String(item).trim()).filter(Boolean)
    : undefined;

  return {
    id:
      raw.id?.trim() ||
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "work"}-${fallbackIndex}`,
    title,
    subtitle: raw.subtitle?.trim() || undefined,
    category: (raw.category ?? "Branding & Identity").trim() || "Branding & Identity",
    year: raw.year?.trim() || undefined,
    medium: raw.medium?.trim() || undefined,
    client: raw.client?.trim() || undefined,
    description: raw.description?.trim() || undefined,
    story: raw.story?.trim() || undefined,
    imageSrc: raw.imageSrc?.trim() || "/projects/covers/traces-illustration-story.jpg",
    gallery: gallery && gallery.length > 0 ? gallery : undefined,
    behanceUrl: raw.behanceUrl?.trim() || undefined,
    contraUrl: raw.contraUrl?.trim() || undefined,
    featured: Boolean(raw.featured),
  };
}

function readLocalWorks(): Work[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map((item, idx) => normalizeWork(item, idx));
  } catch {
    return null;
  }
}

function writeLocalWorks(works: Work[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
  } catch {
    // Ignore quota errors if localStorage is full
  }
}

export async function fetchWorks(): Promise<Work[]> {
  try {
    const res = await fetch("/api/works", { cache: "no-store" });
    const contentType = res.headers.get("content-type") ?? "";
    if (res.ok && contentType.includes("application/json")) {
      const data = (await res.json()) as Partial<Work>[];
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((item, idx) => normalizeWork(item, idx));
        writeLocalWorks(normalized);
        return normalized;
      }
    }
  } catch {
    // Fallback to localStorage / bundled JSON when running static build
  }

  const local = readLocalWorks();
  if (local) return local;

  return (seedWorks as Partial<Work>[]).map((item, idx) => normalizeWork(item, idx));
}

export interface SaveResult {
  works: Work[];
  mode: "disk" | "browser";
}

export async function saveWorks(works: Work[]): Promise<SaveResult> {
  const normalized = works.map((item, idx) => normalizeWork(item, idx));
  writeLocalWorks(normalized);

  try {
    const res = await fetch("/api/works", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
    const contentType = res.headers.get("content-type") ?? "";
    if (res.ok && contentType.includes("application/json")) {
      return { works: normalized, mode: "disk" };
    }
  } catch {
    // Static build fallback
  }

  return { works: normalized, mode: "browser" };
}

export function createWorkSlug(title: string, existingIds: Set<string>): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "work";
  if (!existingIds.has(base)) return base;
  let counter = 2;
  while (existingIds.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

export async function uploadArtworkFile(file: File): Promise<{ url: string; storedOnDisk: boolean }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, dataUrl }),
    });
    const contentType = res.headers.get("content-type") ?? "";
    if (res.ok && contentType.includes("application/json")) {
      const payload = (await res.json()) as { url?: string };
      if (payload.url) {
        return { url: payload.url, storedOnDisk: true };
      }
    }
  } catch {
    // Static hosting fallback: embed dataUrl directly
  }

  return { url: dataUrl, storedOnDisk: false };
}

export function worksQueryOptions() {
  return queryOptions({
    queryKey: ["works"],
    queryFn: fetchWorks,
    staleTime: 1000 * 30,
  });
}

export function ensureWorksData(queryClient: QueryClient): Promise<Work[]> {
  return queryClient.query({
    ...worksQueryOptions(),
    staleTime: "static",
  });
}

export function categoriesInUse(works: Work[]): string[] {
  const present = new Set(works.map((w) => w.category).filter(Boolean));
  const ordered: string[] = [];
  for (const cat of DEFAULT_CATEGORIES) {
    if (present.has(cat)) {
      ordered.push(cat);
      present.delete(cat);
    }
  }
  for (const extra of present) {
    ordered.push(extra);
  }
  return ["All", ...ordered];
}

export function filterWorks(works: Work[], category: string): Work[] {
  if (!category || category === "All") return works;
  return works.filter((w) => w.category === category);
}

export function getSeedWorks(): Work[] {
  return (seedWorks as Partial<Work>[]).map((item, idx) => normalizeWork(item, idx));
}
