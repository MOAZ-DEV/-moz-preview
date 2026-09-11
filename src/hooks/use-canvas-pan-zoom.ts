// src/hooks/useCanvasPanZoom.ts
import { useRef, useCallback, useEffect } from "react";
import { useCrowPreview } from "../components/provider";
import { MIN_SCALE, MAX_SCALE, PAN_SPEED } from "../lib/constants";

export function useCanvasPanZoom() {
  const { state, dispatch } = useCrowPreview();
  const { offsetX, offsetY, scale } = state.canvas;

  const isPanning = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffsetX = useRef(0);
  const startOffsetY = useRef(0);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
        dispatch({ type: "SET_SCALE", payload: { scale: newScale } });
        return;
      }
      const dy = e.deltaY * PAN_SPEED;
      const dx = e.shiftKey ? (e.deltaY + e.deltaX) * PAN_SPEED : e.deltaX * PAN_SPEED;
      dispatch({
        type: "SET_OFFSET",
        payload: { offsetX: offsetX + dx, offsetY: offsetY + dy },
      });
    },
    [scale, offsetX, offsetY, dispatch]
  );

  const movePan = useCallback(
    (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      dispatch({
        type: "SET_OFFSET",
        payload: { offsetX: startOffsetX.current + dx, offsetY: startOffsetY.current + dy },
      });
    },
    [dispatch]
  );

  const endPan = useCallback(() => {
    isPanning.current = false;
    window.removeEventListener("mousemove", movePan);
    window.removeEventListener("mouseup", endPan);
  }, [movePan]);

  const cancelPan = useCallback(() => {
    isPanning.current = false;
    window.removeEventListener("mousemove", movePan);
    window.removeEventListener("mouseup", endPan);
  }, [movePan, endPan]);

  const startPan = useCallback(
    (e: React.MouseEvent) => {
      isPanning.current = true;
      startX.current = e.clientX;
      startY.current = e.clientY;
      startOffsetX.current = offsetX;
      startOffsetY.current = offsetY;
      window.addEventListener("mousemove", movePan);
      window.addEventListener("mouseup", endPan);
    },
    [offsetX, offsetY, movePan, endPan]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    el.addEventListener("wheel", wheelHandler, { passive: false });
    return () => el.removeEventListener("wheel", wheelHandler);
  }, [handleWheel]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", movePan);
      window.removeEventListener("mouseup", endPan);
    };
  }, [movePan, endPan]);

  return {
    containerRef,
    offsetX,
    offsetY,
    scale,
    startPan,
    cancelPan,
    isPanning: isPanning.current,
  };
}