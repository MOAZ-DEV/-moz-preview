import { useState, useRef, useCallback, useEffect } from "react";
import { VariantState } from "../types";

type Side = "left" | "right";

export function useResize(
  variant: VariantState,
  onResize: (id: string, width: number, x?: number) => void,
  isDraggable: boolean,
  scale = 1
) {
  const [isResizing, setIsResizing] = useState(false);
  const sideRef = useRef<Side>("right");
  const startX = useRef(0);
  const startWidth = useRef(0);
  const startVariantX = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, side: Side) => {
      if (!isDraggable) return;
      e.stopPropagation();
      setIsResizing(true);
      sideRef.current = side;
      startX.current = e.clientX;
      startWidth.current = variant.width;
      startVariantX.current = variant.x;
    },
    [isDraggable, variant.width, variant.x]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const dx = (e.clientX - startX.current) / scale;
      let newWidth = startWidth.current + dx;
      if (sideRef.current === "left") {
        newWidth = startWidth.current - dx;
        const newX = startVariantX.current + dx;
        if (newWidth > 20) {
          onResize(variant.id, newWidth, newX);
        }
      } else {
        if (newWidth > 20) {
          onResize(variant.id, newWidth);
        }
      }
    },
    [isResizing, onResize, variant.id, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return { isResizing, handleMouseDown };
}