import React from "react";
import { cn } from "../../lib";

type Props = {
  side: "left" | "right";
  onMouseDown: (e: React.MouseEvent, side: "left" | "right") => void;
  isDraggable: boolean;
};

export function ResizeHandle({ side, onMouseDown, isDraggable }: Props) {
  return (
    <div
      data-resize-handle
      className={cn(
        "absolute top-0 bottom-0 w-3 cursor-ew-resize bg-transparent transition-colors group-hover:bg-accent/20",
        side === "left" ? "left-0" : "right-0",
        !isDraggable && "pointer-events-none opacity-0"
      )}
      onMouseDown={(e) => onMouseDown(e, side)}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-accent/70 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}