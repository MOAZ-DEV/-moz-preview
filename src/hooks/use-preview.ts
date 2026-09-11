import { ReactNode, useMemo } from "react";
import { Breakpoint } from "../types";
import { createCanvasItems } from "../lib/canvas-utils";

export function useCanvasData(
  children: ReactNode,
  breakpoints: Breakpoint[],
  gap = 80,
) {
  return useMemo(
    () => createCanvasItems(children, breakpoints, gap),
    [children, breakpoints, gap]
  );
}