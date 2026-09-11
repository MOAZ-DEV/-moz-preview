// src/hooks/usePreventZoom.ts
import { useEffect } from "react";

export function usePreventZoom(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };

    const preventKeyZoom = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "=", "-", "0"].includes(e.key)) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", preventWheelZoom, { passive: false });
    window.addEventListener("keydown", preventKeyZoom);
    return () => {
      el.removeEventListener("wheel", preventWheelZoom);
      window.removeEventListener("keydown", preventKeyZoom);
    };
  }, [containerRef]);
}