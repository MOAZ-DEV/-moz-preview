import React, { useCallback, useRef } from "react";
import { useCrowPreview } from "../provider";
import { IconButton } from "../ui/button";
import { Segmented } from "../ui/segmented";
import { DEFAULT_KEYBINDINGS } from "../../lib/keybindings";
import type { Theme } from "../../types";

const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024;

const KEYBINDING_ICONS: Record<string, React.ReactNode> = {
  "ctrl+plus": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  ),
  "ctrl+minus": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M3 8h10" strokeLinecap="round" />
    </svg>
  ),
  "ctrl+0": (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M4.5 4v8M11.5 4v8M4.5 8h7" strokeLinecap="round" />
    </svg>
  ),
  l: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <rect x="3.5" y="7.5" width="4" height="5" rx="0.75" strokeLinecap="round" />
      <path d="M5.5 7.5V5a2.5 2.5 0 0 1 5 0v2.5" strokeLinecap="round" />
    </svg>
  ),
  escape: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M5 5l6 6m0-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function SettingsPanel() {
  const { state, dispatch } = useCrowPreview();
  const fileRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<HTMLInputElement>(null);
  const figmaUrlRef = useRef<HTMLInputElement>(null);

  const imageVariants = state.variants.filter((v) => v.kind === "image");
  const figmaVariants = state.variants.filter((v) => v.kind === "figma");

  const handleAddImage = useCallback(() => {
    const url = imageUrlRef.current?.value.trim();
    if (!url) return;
    dispatch({ type: "ADD_IMAGE_VARIANT", payload: { source: url } });
    if (imageUrlRef.current) imageUrlRef.current.value = "";
  }, [dispatch]);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_UPLOAD_BYTES) {
        console.warn("[moz-preview] Image too large (max ~2.5 MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        dispatch({ type: "ADD_IMAGE_VARIANT", payload: { source: dataUrl } });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [dispatch],
  );

  const handleAddFigma = useCallback(() => {
    const url = figmaUrlRef.current?.value.trim();
    if (!url) return;
    dispatch({ type: "ADD_FIGMA_VARIANT", payload: { url } });
    if (figmaUrlRef.current) figmaUrlRef.current.value = "";
  }, [dispatch]);

  return (
    <aside
      className="fixed bottom-16 right-4 z-40 flex max-h-[calc(100vh-5rem)] w-[300px] flex-col rounded border border-border bg-background/95 backdrop-blur-md md:bottom-3 md:right-auto md:left-3 md:top-14 md:w-[320px]"
    >
      {/* Header */}
      <header className="flex shrink-0 items-center gap-1.5 border-b border-border px-3 py-2">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 text-accent" aria-hidden="true">
          <circle cx="8" cy="8" r="2.25" />
          <path d="M6.9 2.6a1.1 1.1 0 0 1 2.2 0v.7a.6.6 0 0 0 .33.53l.63.32a.6.6 0 0 0 .62-.07l.55-.46a1.1 1.1 0 0 1 1.5 1.5l-.46.55a.6.6 0 0 0-.07.62l.32.63a.6.6 0 0 0 .53.33h.7a1.1 1.1 0 0 1 0 2.2h-.7a.6.6 0 0 0-.53.33l-.32.63a.6.6 0 0 0 .07.62l.46.55a1.1 1.1 0 0 1-1.5 1.5l-.55-.46a.6.6 0 0 0-.62-.07l-.63.32a.6.6 0 0 0-.33.53v.7a1.1 1.1 0 0 1-2.2 0v-.7a.6.6 0 0 0-.33-.53l-.63-.32a.6.6 0 0 0-.62.07l-.55.46a1.1 1.1 0 0 1-1.5-1.5l.46-.55a.6.6 0 0 0 .07-.62l-.32-.63a.6.6 0 0 0-.53-.33h-.7a1.1 1.1 0 0 1 0-2.2h.7a.6.6 0 0 0 .53-.33l.32-.63a.6.6 0 0 0-.07-.62l-.46-.55a1.1 1.1 0 0 1 1.06-.94" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
          Settings
        </span>
        <IconButton
          label="Close settings"
          size="xs"
          variant="ghost"
          onClick={() => dispatch({ type: "TOGGLE_SETTINGS" })}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="m5 5 6 6m0-6-6 6" strokeLinecap="round" />
          </svg>
        </IconButton>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-2.5">
        {/* Theme */}
        <section className="mb-4">
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Theme</h3>
          <Segmented<Theme>
            size="xs"
            value={state.ui.theme}
            onChange={(v) => dispatch({ type: "SET_THEME", payload: { theme: v } })}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
          />
        </section>

        {/* Keybindings */}
        <section className="mb-4">
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Keybindings</h3>
          <ul className="flex flex-col gap-0.5">
            {Object.entries(DEFAULT_KEYBINDINGS).map(([combo, binding]) => (
              <li key={combo} className="flex items-center justify-between gap-2 rounded-xs px-2 py-1 hover:bg-surface-hover">
                <div className="flex items-center gap-1.5">
                  <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-xs border border-border bg-surface px-1 font-mono text-[10px] text-muted-foreground">
                    {KEYBINDING_ICONS[combo] ?? combo}
                  </kbd>
                  <span className="text-[11px] text-muted-foreground/80">{binding.description}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/50">{combo}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Images */}
        <section className="mb-4">
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Images</h3>
          <div className="flex gap-1.5 mb-1.5">
            <input
              ref={imageUrlRef}
              type="url"
              placeholder="Paste image URL…"
              spellCheck={false}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddImage(); } }}
              className="h-6 flex-1 rounded-xs border border-input bg-surface px-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <IconButton label="Add image" size="xs" onClick={handleAddImage} className="text-muted-foreground hover:text-foreground">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" />
              </svg>
            </IconButton>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mb-1.5 flex w-full items-center justify-center gap-1.5 rounded-xs border border-dashed border-border bg-surface/50 py-2 text-[11px] text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M4 12V4a1 1 0 0 1 1-1h3.5l1 1H12a1 1 0 0 1 1 1v1" strokeLinecap="round" />
              <path d="M3.5 11.5V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1.5M8 6v5M5.5 8.5 8 11l2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Upload image
          </button>
          {imageVariants.length > 0 && (
            <ul className="flex flex-col gap-1 mt-1">
              {imageVariants.map((v) => (
                <li key={v.id} className="flex items-center gap-2 rounded-xs border border-border bg-surface/60 px-2 py-1">
                  {v.source && (
                    <div className="h-6 w-10 shrink-0 overflow-hidden rounded-xs bg-surface-active">
                      <img src={v.source} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <span className="flex-1 truncate font-mono text-[10px] text-muted-foreground">
                    {v.source?.slice(0, 36)}{v.source && v.source.length > 36 ? "…" : ""}
                  </span>
                  <IconButton
                    label="Remove image"
                    size="xs"
                    variant="ghost"
                    onClick={() => dispatch({ type: "REMOVE_VARIANT", payload: { id: v.id } })}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="m5 5 6 6m0-6-6 6" strokeLinecap="round" />
                    </svg>
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Figma frames */}
        <section>
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Figma frames</h3>
          <div className="flex gap-1.5 mb-1.5">
            <input
              ref={figmaUrlRef}
              type="url"
              placeholder="Paste Figma share link…"
              spellCheck={false}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddFigma(); } }}
              className="h-6 flex-1 rounded-xs border border-input bg-surface px-2 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <IconButton label="Add Figma frame" size="xs" onClick={handleAddFigma} className="text-muted-foreground hover:text-foreground">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" />
              </svg>
            </IconButton>
          </div>
          {figmaVariants.length > 0 && (
            <ul className="flex flex-col gap-1">
              {figmaVariants.map((v) => (
                <li key={v.id} className="flex items-center gap-2 rounded-xs border border-border bg-surface/60 px-2 py-1">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true">
                    <rect x="2" y="2" width="5" height="5" rx="2" />
                    <rect x="9" y="2" width="5" height="5" rx="2" />
                    <rect x="2" y="9" width="5" height="5" rx="2" />
                  </svg>
                  <span className="flex-1 truncate font-mono text-[10px] text-muted-foreground">
                    {v.source?.slice(0, 36)}{v.source && v.source.length > 36 ? "…" : ""}
                  </span>
                  <IconButton
                    label="Remove Figma frame"
                    size="xs"
                    variant="ghost"
                    onClick={() => dispatch({ type: "REMOVE_VARIANT", payload: { id: v.id } })}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="m5 5 6 6m0-6-6 6" strokeLinecap="round" />
                    </svg>
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}

export default SettingsPanel;
