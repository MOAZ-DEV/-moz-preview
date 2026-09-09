// provider.tsx

import {
  createContext,
  useContext,
  useMemo,
  useRef,
} from "react";

import type { ReactInfiniteCanvasHandle } from "react-infinite-canvas";

import { cn, useCanvasData } from "../lib";
import Layout from "./layout";
import InfiniteCanvas from "./canvas";

import type {
  Breakpoint,
  MozPreviewContextValue,
  MozPreviewProviderProps,
} from "../types";

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  {
    variant: "desktop",
    width: 1440,
    height: 900,
  },
  {
    variant: "tablet",
    width: 768,
    height: 1024,
  },
  {
    variant: "mobile",
    width: 390,
    height: 844,
  },
];

const MozPreviewContext =
  createContext<MozPreviewContextValue | null>(null);

export function useMozPreview() {
  const context = useContext(MozPreviewContext);

  if (!context) {
    throw new Error(
      "useMozPreview must be used inside MozPreviewProvider",
    );
  }

  return context;
}

export default function MozPreviewProvider({
  children,
  breakpoints = DEFAULT_BREAKPOINTS,
  className,
  ...props
}: MozPreviewProviderProps) {
  const canvasRef =
    useRef<ReactInfiniteCanvasHandle | null>(null);

  const data = useCanvasData(
    children,
    breakpoints,
  );

  const contextValue = useMemo(
    () => ({
      canvasRef,
      breakpoints,
    }),
    [breakpoints],
  );

  return (
    <MozPreviewContext.Provider value={contextValue}>
      <main
        className={cn("relative h-full w-full", className)}
        style={{
          height: "100vh",
          width: "100vw",
        }}
        {...props}
      >
        <Layout>
          <InfiniteCanvas
            ref={canvasRef}
            data={data}
          />
        </Layout>
      </main>
    </MozPreviewContext.Provider>
  );
}