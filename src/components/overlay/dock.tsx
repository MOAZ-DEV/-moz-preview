import React from "react";
import { State } from "../../types";
import { cn } from "../../lib";
import { getCameraController } from "../../lib/camera";
import { Segmented } from "../ui/segmented";
import { IconButton } from "../ui/button";
import { Badge } from "../ui/badge";
import { MIN_SCALE, MAX_SCALE } from "../../lib/constants";

type Props = {
  state: State;
  dispatch: React.Dispatch<import("../../types").Action>;
};

type Device = "all" | "desktop" | "tablet" | "mobile";

export function Dock({ state, dispatch }: Props) {
  const focused = state.variants.find((v) => v.isFocused);
  const device: Device = focused ? focused.variant : "all";

  const setDevice = (value: Device) => {
    if (value === "all") {
      dispatch({ type: "UNFOCUS" });
      getCameraController()?.fitToView();
      return;
    }
    const target = state.variants.find((v) => v.variant === value);
    if (target) {
      dispatch({ type: "FOCUS", payload: { id: target.id } });
      getCameraController()?.zoomToVariant(target.id);
    }
  };

  const zoomBy = (delta: number) => {
    const next = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, Math.round((state.canvas.scale + delta) * 100) / 100),
    );
    dispatch({ type: "SET_SCALE", payload: { scale: next } });
  };

  return (
    <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-border bg-card/90 px-1.5 py-1",
          "shadow-xl shadow-black/30 backdrop-blur-md",
        )}
      >
        {/* Device switcher */}
        <Segmented<Device>
          size="xs"
          value={device}
          onChange={setDevice}
          options={[
            { value: "all", label: "All" },
            { value: "desktop", label: "Desktop", title: "1440×900" },
            { value: "tablet", label: "Tablet", title: "768×1024" },
            { value: "mobile", label: "Mobile", title: "390×844" },
          ]}
        />

        <div className="h-4 w-px bg-border" />

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5">
          <IconButton label="Zoom out" size="xs" variant="ghost" onClick={() => zoomBy(-0.1)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 8h8" strokeLinecap="round" />
            </svg>
          </IconButton>
          <span className="min-w-[42px] text-center font-mono text-[11px] tabular-nums text-foreground">
            {Math.round(state.canvas.scale * 100)}%
          </span>
          <IconButton label="Zoom in" size="xs" variant="ghost" onClick={() => zoomBy(0.1)}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 4v8M4 8h8" strokeLinecap="round" />
            </svg>
          </IconButton>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Console toggle */}
        <IconButton
          label={state.ui.consoleOpen ? "Close console" : "Open console"}
          size="xs"
          variant={state.ui.consoleOpen ? "secondary" : "ghost"}
          onClick={() => dispatch({ type: "TOGGLE_CONSOLE" })}
          className={
            state.ui.consoleOpen
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground"
          }
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="m3 4.5 4 3.5-4 3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12h4" strokeLinecap="round" />
          </svg>
        </IconButton>

        <div className="h-4 w-px bg-border" />

        {/* Lock toggle */}
        <div className="flex items-center gap-1.5">
          <IconButton
            label={state.ui.isDraggable ? "Disable drag & resize" : "Enable drag & resize"}
            size="xs"
            variant={state.ui.isDraggable ? "ghost" : "secondary"}
            onClick={() => dispatch({ type: "TOGGLE_DRAGGABLE" })}
            className={
              !state.ui.isDraggable
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            }
          >
            {state.ui.isDraggable ? (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="4" y="7" width="8" height="6.5" rx="1" />
                <path d="M6 7V5a2 2 0 0 1 4 0v2" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="4" y="7" width="8" height="6.5" rx="1" />
                <path d="M6 5a2 2 0 0 1 4 0v2" strokeLinecap="round" />
                <path d="M8 10v1.5" strokeLinecap="round" />
              </svg>
            )}
          </IconButton>
          <Badge variant={state.ui.isDraggable ? "accent" : "secondary"} className="hidden md:inline-flex">
            {state.ui.isDraggable ? "editable" : "locked"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default Dock;