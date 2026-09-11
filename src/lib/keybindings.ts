export const DEFAULT_KEYBINDINGS: Record<string, { action: string; description?: string }> = {
  "ctrl+plus": { action: "zoomIn", description: "Zoom in" },
  "ctrl+minus": { action: "zoomOut", description: "Zoom out" },
  "ctrl+0": { action: "resetZoom", description: "Reset zoom" },
  "escape": { action: "unfocus", description: "Unfocus variant" },
  "l": { action: "toggleDraggable", description: "Lock/Unlock dragging" },
};

export function normalizeKeyEvent(e: KeyboardEvent): string | null {
  const key = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  const shift = e.shiftKey;
  const alt = e.altKey;

  // special handling for +, -, 0
  if (key === "+" || key === "=") {
    return ctrl ? "ctrl+plus" : null;
  }
  if (key === "-") {
    return ctrl ? "ctrl+minus" : null;
  }
  if (key === "0") {
    return ctrl ? "ctrl+0" : null;
  }
  // simple key combos
  let combo = "";
  if (ctrl) combo += "ctrl+";
  if (shift) combo += "shift+";
  if (alt) combo += "alt+";
  combo += key;
  return combo;
}