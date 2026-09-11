import type { VariantState, Theme, BreakpointVariant } from "../types";

const STORAGE_KEY = "moz-preview:workspace:v1";

type PersistedVariant = {
  id: string;
  kind: "element" | "image" | "figma";
  variant: BreakpointVariant;
  source: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalHeight: number | null;
  aspect: number | null;
};

export type PersistedWorkspace = {
  version: 1;
  variants: PersistedVariant[];
  canvas: { offsetX: number; offsetY: number; scale: number };
  theme: Theme;
};

export function loadWorkspace(): PersistedWorkspace | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.variants)) return null;
    return data as PersistedWorkspace;
  } catch {
    return null;
  }
}

export function saveWorkspace(variants: VariantState[], canvas: { offsetX: number; offsetY: number; scale: number }, theme: Theme): void {
  try {
    if (typeof localStorage === "undefined") return;
    const persisted: PersistedWorkspace = {
      version: 1,
      variants: variants.map((v) => ({
        id: v.id,
        kind: v.kind,
        variant: v.variant,
        source: v.source,
        x: v.x,
        y: v.y,
        width: v.width,
        height: v.height,
        naturalHeight: v.naturalHeight,
        aspect: v.aspect,
      })),
      canvas: { offsetX: canvas.offsetX, offsetY: canvas.offsetY, scale: canvas.scale },
      theme,
    };
    const json = JSON.stringify(persisted);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    // Quota exceeded — retry without image data to preserve positions
    try {
      if (typeof localStorage === "undefined") return;
      const minimal: PersistedWorkspace = {
        version: 1,
        variants: variants
          .filter((v) => v.kind === "element")
          .map((v) => ({
            id: v.id,
            kind: v.kind,
            variant: v.variant,
            source: null,
            x: v.x,
            y: v.y,
            width: v.width,
            height: v.height,
            naturalHeight: v.naturalHeight,
            aspect: null,
          })),
        canvas: { offsetX: canvas.offsetX, offsetY: canvas.offsetY, scale: canvas.scale },
        theme,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
      console.warn("[moz-preview] Workspace saved without images (storage quota).");
    } catch {
      console.warn("[moz-preview] Could not persist workspace.");
    }
  }
}

export function clearWorkspace(): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}
