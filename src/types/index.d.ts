// src/index.d.ts
import type { ReactNode, RefObject } from "react";
import type { ReactInfiniteCanvasHandle } from "react-infinite-canvas";

export type BreakpointVariant = "desktop" | "tablet" | "mobile";

export type Breakpoint = {
  variant: BreakpointVariant;
  width: number;
  height: number;
};

export type CanvasItem = {
  id: string;
  variant: BreakpointVariant;
  position: { x: number; y: number };
  size: { width: number; height: number };
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
} & React.ComponentPropsWithoutRef<"main">;

export declare function useMozPreview(): MozPreviewContextValue;
export declare const MozPreviewProvider: React.FC<MozPreviewProviderProps>;
export declare const View: React.ForwardRefExoticComponent<any>;
export declare const InfiniteCanvas: React.FC<any>;
export declare const Layout: React.FC<any>;
export declare function cn(...classes: Array<string | undefined | false | null>): string;
export declare function useCanvasData(
  children: ReactNode,
  breakpoints: Breakpoint[],
  gap?: number
): CanvasItem[];
export declare function createCanvasItems(
  children: ReactNode,
  breakpoints: Breakpoint[],
  gap?: number
): CanvasItem[];