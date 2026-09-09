import {
  forwardRef,
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { BreakpointVariant } from "..";
export type CanvasProps = {
  id: string;
  size: { width: number; height: number };
  variant: BreakpointVariant;
  element: ReactNode;
} & Omit<ComponentProps<"div">, "children">;
const Viewport = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { id, size, variant, element, className, style, ...props },
  ref,
) {
  const [iframeDocument, setIframeDocument] = useState<Document | null>(null);
  useEffect(() => {
    setIframeDocument(null);
  }, [size.width, size.height]);
  return (
    <div
      id={id}
      ref={ref}
      className={className}
      data-breakpoint={variant}
      style={{
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      <iframe
        title={`Moz Preview — ${variant}`}
        srcDoc={` <!doctype html> <html> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style> html, body { margin: 0; padding: 0; width: 100%; min-height: 100%; } body { overflow-x: hidden; } *, *::before, *::after { box-sizing: border-box; } </style> </head> <body> <div id="crow-preview-root"></div> </body> </html> `}
        // view.tsx – inside onLoad
        onLoad={(event) => {
          const iframe = event.currentTarget;
          const doc = iframe.contentDocument;
          if (!doc) return;
        
          // 1. Copy all stylesheets and style tags from parent head
          const parentHead = document.head;
          const cloneStyles = () => {
            const iframeHead = doc.head;
            // Clear existing styles (optional, to avoid duplicates)
            iframeHead.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());
        
            // Copy <link rel="stylesheet"> and <style> tags
            parentHead.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => {
              const clone = el.cloneNode(true);
              iframeHead.appendChild(clone);
            });
          };
        
          cloneStyles();
        
          // 2. Also copy any dynamically injected styles (e.g., from MUI, styled-components)
          //    For simplicity, we copy on each load – you can also observe mutations.
          
          setIframeDocument(doc);
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          margin: 0,
          padding: 0,
        }}
      />
      {iframeDocument &&
        createPortal(
          <div id="crow-preview-root" data-crow-breakpoint={variant}>
            {element}
          </div>,
          iframeDocument.getElementById("crow-preview-root") ??
            iframeDocument.body,
        )}
    </div>
  );
});
Viewport.displayName = "View";
export default Viewport;