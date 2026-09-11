import { useState, useRef, useCallback, useEffect } from "react";
import { VariantState } from "../types";

export function useDrag(
  variant: VariantState,
  onMove: (id: string, x: number, y: number) => void,
  isDraggable: boolean,
  scale = 1
) {
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startVariantX = useRef(0);
  const startVariantY = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggable) return;
      // ignore if click on resize handle (they handle their own drag)
      const target = e.target as HTMLElement;
      if (target.closest("[data-resize-handle]")) return;

      e.stopPropagation(); // prevent canvas pan
      setIsDragging(true);
      startX.current = e.clientX;
      startY.current = e.clientY;
      startVariantX.current = variant.x;
      startVariantY.current = variant.y;
    },
    [isDraggable, variant.x, variant.y]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - startX.current) / scale;
      const dy = (e.clientY - startY.current) / scale;
      onMove(variant.id, startVariantX.current + dx, startVariantY.current + dy);
    },
    [isDragging, onMove, variant.id, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { isDragging, handleMouseDown };
}