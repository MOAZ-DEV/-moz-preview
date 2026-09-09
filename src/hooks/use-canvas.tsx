// lib/use-canvas-data.ts

import { ReactNode, useMemo } from "react";

import type { Breakpoint } from "../types";
import { createCanvasItems } from "../lib";

export function useCanvasData(
  element: ReactNode,
  breakpoints: Breakpoint[],
) {
  return useMemo(
    () => createCanvasItems(element, breakpoints),
    [element, breakpoints],
  );
}