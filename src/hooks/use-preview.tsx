import { ReactNode, useMemo } from "react";
import { Breakpoint, CanvasItem } from "../types";

export function useCanvasData(
  children: ReactNode,
  breakpoints: Breakpoint[],
  gap = 80,
) {
  return useMemo(() => {
    const totalWidth =
      breakpoints.reduce(
        (total, breakpoint) => total + breakpoint.width,
        0,
      ) +
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
  }, [children, breakpoints, gap]);
}