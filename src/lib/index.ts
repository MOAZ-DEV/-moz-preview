import { ReactNode, useMemo } from "react";

import type { Breakpoint, CanvasItem } from "../types";

export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function useCanvasData(
  children: ReactNode,
  breakpoints: Breakpoint[],
  gap = 80,
) {
  return useMemo<CanvasItem[]>(() => {
    let x = 128;

    return breakpoints.map((breakpoint, index) => {
      const item: CanvasItem = {
        id: `${breakpoint.variant}-${index}`,
        variant: breakpoint.variant,

        position: {
          x,
          y: 128,
        },

        size: {
          width: breakpoint.width,
          height: breakpoint.height,
        },

        element: children,
      };

      x += breakpoint.width + gap;

      return item;
    });
  }, [children, breakpoints, gap]);
}

export function createCanvasItems(
  children: ReactNode,
  breakpoints: Breakpoint[],
  gap = 80,
) {
  const totalWidth =
    breakpoints.reduce((total, breakpoint) => total + breakpoint.width, 0) +
    gap * (breakpoints.length - 1);

  let x = -totalWidth / 2;

  return breakpoints.map((breakpoint, index) => {
    const item: CanvasItem = {
      id: `${breakpoint.variant}-${index}`,

      variant: breakpoint.variant,

      position: {
        x,
        y: -breakpoint.height / 2,
      },

      size: {
        width: breakpoint.width,
        height: breakpoint.height,
      },

      element: children,
    };

    x += breakpoint.width + gap;

    return item;
  });
}
