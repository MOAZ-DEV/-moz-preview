import React, { useState, useRef, forwardRef, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { VariantState, Theme } from "../../types";
import { ResizeHandle } from "./resize-handle";
import { useDrag } from "../../hooks/use-drag";
import { useResize } from "../../hooks/use-resize";
import { useIframeHeight } from "../../hooks/use-iframe-height";
import { cn } from "../../lib";
import { figmaEmbedUrl } from "../../lib/figma";
import { CrowPreviewContext } from "../provider";

function useOptionalTheme(): Theme {
  const ctx = useContext(CrowPreviewContext);
  return ctx?.state.ui.theme ?? "dark";
}

type Props = {
  variant: VariantState;
  element: React.ReactNode;
  isDraggable: boolean;
  scale?: number;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, x?: number) => void;
  onHeightChange: (id: string, height: number) => void;
  onDoubleClick: () => void;
};

export const Viewport = forwardRef<HTMLDivElement, Props>(function Viewport(
  {
    variant,
    element,
    isDraggable,
    scale,
    onMove,
    onResize,
    onHeightChange,
    onDoubleClick,
  },
  ref
) {
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveDraggable = isDraggable && !variant.isFocused;
  const { handleMouseDown: dragStart } = useDrag(variant, onMove, effectiveDraggable, scale ?? 1);
  const { handleMouseDown: resizeStart } = useResize(variant, onResize, effectiveDraggable, scale ?? 1);
  const theme = useOptionalTheme();

  useIframeHeight(variant.id, onHeightChange);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (!target.closest("[data-resize-handle]")) {
      dragStart(e);
    }
  };

  const displayHeight =
    variant.kind === "image"
      ? (variant.naturalHeight ?? variant.height)
      : variant.isFocused
        ? variant.height
        : variant.naturalHeight ?? variant.height;

  const label =
    variant.kind === "element"
      ? variant.variant
      : variant.kind === "image"
        ? "image"
        : "figma";

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute group rounded-md overflow-hidden bg-card shadow-xl transition-all duration-300",
        variant.isFocused
          ? "z-50 border border-border-strong ring-2 ring-accent/70 shadow-2xl scale-100"
          : "z-10 border border-border hover:shadow-2xl hover:border-border-strong",
      )}
      style={{
        left: variant.x,
        top: variant.y,
        width: variant.width,
        height: displayHeight,
        transition: "left 0.3s, top 0.3s, width 0.3s, height 0.3s",
        cursor: effectiveDraggable ? "grab" : "default",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Image variant */}
      {variant.kind === "image" && variant.source && (
        <ImageContent
          source={variant.source}
          variantId={variant.id}
          width={variant.width}
          onHeightChange={onHeightChange}
          isFocused={variant.isFocused}
        />
      )}

      {/* Figma variant */}
      {variant.kind === "figma" && variant.source && (
        <iframe
          src={figmaEmbedUrl(variant.source, theme)}
          className="w-full h-full border-0"
          allowFullScreen
          style={{ pointerEvents: variant.isFocused ? "auto" : "none" }}
          title="Figma frame"
        />
      )}

      {/* Element variant (default) */}
      {variant.kind === "element" && (
        <ElementContent
          variant={variant}
          element={element}
          iframeDoc={iframeDoc}
          setIframeDoc={setIframeDoc}
          onDoubleClick={onDoubleClick}
          isFocused={variant.isFocused}
        />
      )}

      <ResizeHandle
        side="left"
        onMouseDown={resizeStart}
        isDraggable={effectiveDraggable}
      />
      <ResizeHandle
        side="right"
        onMouseDown={resizeStart}
        isDraggable={effectiveDraggable}
      />

      <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 rounded-xs border border-border bg-card/90 px-1.5 py-0.5 font-mono text-[10px] text-foreground backdrop-blur-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/60">·</span>
        <span className="tabular-nums">
          {Math.round(variant.width)}×{Math.round(displayHeight)}
        </span>
      </div>
    </div>
  );
});

Viewport.displayName = "Viewport";

/* ------------------------------------------------------------------ */
/*  Element content (iframe srcDoc)                                    */
/* ------------------------------------------------------------------ */

function ElementContent({
  variant,
  element,
  iframeDoc,
  setIframeDoc,
  onDoubleClick,
  isFocused,
}: {
  variant: VariantState;
  element: React.ReactNode;
  iframeDoc: Document | null;
  setIframeDoc: (doc: Document | null) => void;
  onDoubleClick: () => void;
  isFocused: boolean;
}) {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html, body { margin:0; padding:0; width:100%; min-height:100%; }
          body { overflow-x: hidden; }
          #crow-root { width:100%; min-height:100vh; }
        </style>
      </head>
      <body>
        <div id="crow-root"></div>
        <script>
          function sendHeight() {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({
              type: 'crowPreviewResize',
              id: '${variant.id}',
              height
            }, '*');
          }
          window.addEventListener('load', sendHeight);
          window.addEventListener('resize', sendHeight);
          const observer = new MutationObserver(sendHeight);
          observer.observe(document.documentElement, {
            attributes: true,
            childList: true,
            subtree: true,
          });

          (function captureConsole() {
            var levels = ['log', 'debug', 'info', 'warn', 'error'];
            levels.forEach(function (level) {
              var original = console[level];
              console[level] = function () {
                var args = Array.prototype.slice.call(arguments);
                try {
                  window.parent.postMessage({
                    type: 'crowPreviewConsole',
                    id: '${variant.id}',
                    level: level,
                    time: Date.now(),
                    args: args.map(function (a) {
                      if (typeof a === 'undefined') return 'undefined';
                      try {
                        if (typeof a === 'object' && a !== null) {
                          var s = JSON.stringify(a, null, 1);
                          return s === undefined ? String(a) : s;
                        }
                        return String(a);
                      } catch (err) {
                        try { return String(a); } catch (e2) { return '[Unserializable]'; }
                      }
                    })
                  }, '*');
                } catch (e) {}
                original.apply(console, arguments);
              };
            });
          })();
        </script>
      </body>
    </html>
  `;

  const syncStyles = (doc: Document) => {
    const parentHead = document.head;
    const iframeHead = doc.head;
    const seen = new Set<string>();
    parentHead.querySelectorAll("link[rel='stylesheet'], style").forEach((el) => {
      const href = (el as HTMLLinkElement).href;
      const key = el.tagName === "LINK" ? href : `style:${el.textContent?.slice(0, 500) ?? ""}`;
      if (seen.has(key)) return;
      seen.add(key);
      const already = iframeHead.querySelector(
        el.tagName === "LINK" ? `link[href="${href}"]` : `style[data-cloned]`
      );
      if (
        el.tagName === "STYLE" &&
        (el as HTMLStyleElement).id === "moz-preview-styles" &&
        iframeHead.querySelector("#moz-preview-styles")
      ) {
        return;
      }
      if (el.tagName === "LINK" && iframeHead.querySelector(`link[href="${href}"]`)) return;
      const clone = el.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-cloned", "true");
      iframeHead.appendChild(clone);
    });

    try {
      const adopted = (document as any).adoptedStyleSheets as CSSStyleSheet[] | undefined;
      const iframeAdopted = (doc as any).adoptedStyleSheets as CSSStyleSheet[] | undefined;
      if (adopted && iframeAdopted !== undefined) {
        (doc as any).adoptedStyleSheets = [...adopted];
      } else if (adopted) {
        adopted.forEach((sheet) => {
          const style = doc.createElement("style");
          style.setAttribute("data-cloned", "true");
          try {
            style.textContent = Array.from(sheet.cssRules).map((r) => r.cssText).join("\n");
          } catch {}
          if (style.textContent) iframeHead.appendChild(style);
        });
      }
    } catch {}
  };

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.currentTarget;
    const doc = iframe.contentDocument;
    if (!doc) return;
    syncStyles(doc);
    setIframeDoc(doc);
  };

  useEffect(() => {
    if (!iframeDoc) return;
    const observer = new MutationObserver(() => syncStyles(iframeDoc));
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true });
    const interval = setInterval(() => syncStyles(iframeDoc), 1000);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [iframeDoc]);

  return (
    <>
      <iframe
        srcDoc={srcDoc}
        onLoad={handleIframeLoad}
        className="w-full h-full border-0"
        style={{ pointerEvents: isFocused ? "auto" : "none" }}
      />
      {iframeDoc &&
        createPortal(
          <div id="crow-root" data-crow-breakpoint={variant.variant}>
            {element}
          </div>,
          iframeDoc.getElementById("crow-root") ?? iframeDoc.body
        )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Image content (<img>)                                             */
/* ------------------------------------------------------------------ */

function ImageContent({
  source,
  variantId,
  width,
  onHeightChange,
  isFocused,
}: {
  source: string;
  variantId: string;
  width: number;
  onHeightChange: (id: string, height: number) => void;
  isFocused: boolean;
}) {
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0) {
      const ratio = img.naturalHeight / img.naturalWidth;
      onHeightChange(variantId, Math.round(width * ratio));
    }
  };

  return (
    <img
      src={source}
      alt=""
      draggable={false}
      onLoad={handleLoad}
      className="h-full w-full object-cover"
      style={{ pointerEvents: isFocused ? "auto" : "none" }}
    />
  );
}
