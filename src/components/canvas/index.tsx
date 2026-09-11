import React, { RefObject, useCallback, useEffect, useRef } from "react";
import { State } from "../../types";
import { Viewport } from "./viewport";
import { useCanvasPanZoom } from "../../hooks/use-canvas-pan-zoom";
import { usePreventZoom } from "../../hooks/use-prevent-zoom";
import { cn } from "../../lib";
import { registerCameraController } from "../../lib/camera";
import { useCrowPreview } from "../provider";
import { MIN_SCALE, MAX_SCALE, GRID_EXTENT } from "../../lib/constants";
import { KeybindingsHint } from "../overlay/keybindings-hint";

type Props = {
  childrenElements: React.ReactNode;
  className?: string;
};

export function Canvas({ childrenElements, className }: Props) {
  const { state, dispatch } = useCrowPreview();
  const {
    containerRef,
    offsetX,
    offsetY,
    scale,
    startPan,
    cancelPan,
    isPanning,
  } = useCanvasPanZoom();

  usePreventZoom(containerRef as RefObject<HTMLDivElement>);

  // Fit all variants width-only (per segment assumptions set by createCanvasItems)
  const fitToView = useCallback(() => {
    const el = containerRef.current;
    if (!el || state.variants.length === 0) return;

    const rect = el.getBoundingClientRect();
    const vw = rect.width;
    const vh = rect.height;
    if (vw === 0 || vh === 0) return;

    const minX = Math.min(...state.variants.map((v) => v.x));
    const maxX = Math.max(...state.variants.map((v) => v.x + v.width));
    const contentWidth = maxX - minX;
    const contentCenterX = (minX + maxX) / 2;

    const minY = Math.min(...state.variants.map((v) => v.y));
    const maxY = Math.max(...state.variants.map((v) => v.y + v.height));
    const contentCenterY = (minY + maxY) / 2;

    const PADDING = 48; // px on each side
    const availableWidth = vw - PADDING * 2;
    const idealScale = availableWidth / contentWidth;
    const targetScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, idealScale));
    const clampedScale = targetScale;

    const targetOffsetX = vw / 2 - contentCenterX * clampedScale;
    const targetOffsetY = vh / 2 - contentCenterY * clampedScale;

    dispatch({ type: "SET_SCALE", payload: { scale: clampedScale } });
    dispatch({ type: "SET_OFFSET", payload: { offsetX: targetOffsetX, offsetY: targetOffsetY } });
  }, [state.variants, containerRef, dispatch]);

  // Always register the latest fit/zoom implementations so overlay controls
  // (dock, nav reset) can drive the camera without re-arming effects.
  const fitToViewRef = useRef(fitToView);
  fitToViewRef.current = fitToView;
  const zoomToVariantRef = useRef<(id: string) => void>(() => {});

  useEffect(() => {
    return registerCameraController({
      zoomToVariant: (id) => zoomToVariantRef.current(id),
      fitToView: () => fitToViewRef.current(),
    });
  }, []);

  // Fit all variants on mount / when variant count changes / container resizes
  // Intentionally NOT re-fitting on drag/resize of individual variants
  useEffect(() => {
    const el = containerRef.current;
    if (!el || state.variants.length === 0) return;

    const raf = requestAnimationFrame(() => fitToViewRef.current());
    const ro = new ResizeObserver(() => fitToViewRef.current());
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [containerRef, state.variants.length]);

  // Zoom-to-fit for a given variant
  const zoomToVariant = useCallback(
    (id: string) => {
      const variant = state.variants.find((v) => v.id === id);
      if (!variant) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const viewportWidth = rect.width;
      const viewportHeight = rect.height;

      // Target: center and scale to fill 80% of viewport
      const targetScale = Math.min(
        (viewportWidth * 0.8) / variant.width,
        (viewportHeight * 0.8) / variant.height,
      );
      const targetOffsetX =
        viewportWidth / 2 - (variant.x + variant.width / 2) * targetScale;
      const targetOffsetY =
        viewportHeight / 2 - (variant.y + variant.height / 2) * targetScale;

      dispatch({
        type: "SET_OFFSET",
        payload: { offsetX: targetOffsetX, offsetY: targetOffsetY },
      });
      dispatch({ type: "SET_SCALE", payload: { scale: targetScale } });
    },
    [state.variants, containerRef, dispatch],
  );
  zoomToVariantRef.current = zoomToVariant;

  // Background click: unfocus if focused, then start pan
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (state.variants.some((v) => v.isFocused)) {
        dispatch({ type: "UNFOCUS" });
      }
      startPan(e);
    }
  };

  const handleMouseLeave = () => {
    if (isPanning) {
      cancelPan();
    }
  };

  // Double-click on viewport: focus and zoom
  const handleViewportDoubleClick = (id: string) => {
    dispatch({ type: "FOCUS", payload: { id } });
    zoomToVariant(id);
  };

  // Handlers for viewport actions (these dispatch to reducer)
  const onMove = useCallback(
    (id: string, x: number, y: number) => {
      dispatch({ type: "MOVE_VARIANT", payload: { id, x, y } });
    },
    [dispatch],
  );

  const onResize = useCallback(
    (id: string, width: number, x?: number) => {
      dispatch({ type: "RESIZE_VARIANT", payload: { id, width, x } });
    },
    [dispatch],
  );

  const onHeightChange = useCallback(
    (id: string, height: number) => {
      dispatch({ type: "SET_NATURAL_HEIGHT", payload: { id, height } });
    },
    [dispatch],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-background",
        className,
      )}
      onMouseDown={handleBackgroundMouseDown}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute origin-top-left"
        onMouseDown={handleBackgroundMouseDown}
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Grid lives inside the transformed layer so it pans and zooms with the content */}
        <div
          aria-hidden
          className="pointer-events-none absolute bg-grid"
          style={{
            left: -GRID_EXTENT,
            top: -GRID_EXTENT,
            width: GRID_EXTENT * 2,
            height: GRID_EXTENT * 2,
          }}
        />
        {state.variants.map((variant) => (
          <Viewport
            key={variant.id}
            variant={variant}
            element={childrenElements}
            isDraggable={state.ui.isDraggable}
            scale={scale}
            onMove={onMove}
            onResize={onResize}
            onHeightChange={onHeightChange}
            onDoubleClick={() => handleViewportDoubleClick(variant.id)}
          />
        ))}
      </div>
      <KeybindingsHint />
    </div>
  );
}
