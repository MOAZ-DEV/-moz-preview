import { ReactNode } from "react";
import { Breakpoint, CanvasItem, VariantState } from "../types";
import { DEFAULT_GAP } from "./constants";


export function createCanvasItems(
  element: ReactNode,
  breakpoints: Breakpoint[],
  gap = DEFAULT_GAP
): CanvasItem[] {
  const totalWidth =
    breakpoints.reduce((sum, bp) => sum + bp.width, 0) + gap * (breakpoints.length - 1);
  let x = -totalWidth / 2;

  return breakpoints.map((bp, i) => {
    const item: CanvasItem = {
      id: `${bp.variant}-${i}`,
      variant: bp.variant,
      position: { x, y: -bp.height / 2 },
      size: { width: bp.width, height: bp.height },
      element,
    };
    x += bp.width + gap;
    return item;
  });
}

export function variantsFromItems(items: CanvasItem[]): VariantState[] {
  return items.map((item) => ({
    id: item.id,
    variant: item.variant,
    x: item.position.x,
    y: item.position.y,
    width: item.size.width,
    height: item.size.height,
    naturalHeight: null,
    isFocused: false,
    isLoading: true,
    loadTime: null,
  }));
}

