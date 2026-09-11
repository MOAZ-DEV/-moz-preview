import { useEffect, useCallback, useMemo } from "react";
import { DEFAULT_KEYBINDINGS, normalizeKeyEvent } from "../lib/keybindings";
import { Action } from "../types";
import { MIN_SCALE, MAX_SCALE } from "../lib/constants";

export function useKeybindings(
  dispatch: React.Dispatch<Action>,
  getScale: () => number,
  customBindings?: Record<string, { action: string }>
) {
  const bindings = useMemo(
    () => ({ ...DEFAULT_KEYBINDINGS, ...customBindings }),
    [customBindings]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const combo = normalizeKeyEvent(e);
      if (!combo) return;
      const binding = bindings[combo];
      if (!binding) return;

      e.preventDefault();

      switch (binding.action) {
        case "zoomIn": {
          const next = Math.min(MAX_SCALE, getScale() + 0.1);
          dispatch({ type: "SET_SCALE", payload: { scale: next } });
          break;
        }
        case "zoomOut": {
          const next = Math.max(MIN_SCALE, getScale() - 0.1);
          dispatch({ type: "SET_SCALE", payload: { scale: next } });
          break;
        }
        case "resetZoom":
          dispatch({ type: "SET_SCALE", payload: { scale: 1 } });
          dispatch({ type: "SET_OFFSET", payload: { offsetX: 0, offsetY: 0 } });
          break;
        case "unfocus":
          dispatch({ type: "UNFOCUS" });
          break;
        case "toggleDraggable":
          dispatch({ type: "TOGGLE_DRAGGABLE" });
          break;
        default:
          break;
      }
    },
    [bindings, dispatch, getScale]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}