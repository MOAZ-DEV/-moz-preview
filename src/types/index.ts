// types.ts

import type { ReactNode, RefObject } from "react";
import type { ReactInfiniteCanvasHandle } from "react-infinite-canvas";

export type BreakpointVariant =
  | "desktop"
  | "tablet"
  | "mobile";

export type Breakpoint = {
  variant: BreakpointVariant;
  width: number;
  height: number;
};

export type CanvasItem = {
  id: string;
  variant: BreakpointVariant;

  position: {
    x: number;
    y: number;
  };

  size: {
    width: number;
    height: number;
  };

  element: ReactNode;
};

export type MozPreviewContextValue = {
  canvasRef: RefObject<ReactInfiniteCanvasHandle | null>;
  breakpoints: Breakpoint[];
};

export type MozPreviewProviderProps = {
  children: ReactNode;
  breakpoints?: Breakpoint[];
  className?: string;
};