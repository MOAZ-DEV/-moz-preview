import { ReactNode, useMemo } from "react";
import type { Breakpoint } from "../types";
import { createCanvasItems } from "../lib/canvas-utils";

export function useCanvasData(
  element: ReactNode,
  breakpoints: Breakpoint[],
  gap = 80,
) {
  return useMemo(
    () => createCanvasItems(element, breakpoints, gap),
    [element, breakpoints, gap],
  );
}