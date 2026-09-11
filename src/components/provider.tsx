import React, { useReducer, useMemo, ReactNode, useCallback, useEffect, useRef } from "react";
import {
  CrowPreviewContextValue,
  CrowPreviewProviderProps,
  State,
  Action,
  VariantState,
} from "../types";
import { DEFAULT_BREAKPOINTS } from "../lib/constants";
import {
  createCanvasItems,
  variantsFromItems,
} from "../lib/canvas-utils";
import { Canvas } from "./canvas";
import { Nav } from "./overlay/nav";
import { Dock } from "./overlay/dock";
import { ConsolePanel } from "./overlay/console-panel";
import { useKeybindings } from "../hooks/use-keybindings";
import { cn } from "../lib";
import styles from "../generated/styles";

const STYLE_ID = "moz-preview-styles";

let stylesInjected = false;

function mountStyles() {
  if (stylesInjected) return;
  if (typeof document === "undefined") return;
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.setAttribute("data-moz-preview", "true");
    style.textContent = styles;
    document.head.appendChild(style);
  }
  stylesInjected = true;
}

// Reducer
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FOCUS": {
      const { id } = action.payload;
      return {
        ...state,
        variants: state.variants.map((v) => {
          if (v.id === id) {
            // compute focused layout (will be recalculated in Canvas based on viewport)
            return { ...v, isFocused: true };
          }
          return { ...v, isFocused: false };
        }),
      };
    }
    case "UNFOCUS": {
      return {
        ...state,
        variants: state.variants.map((v) => ({ ...v, isFocused: false })),
      };
    }
    case "MOVE_VARIANT": {
      const { id, x, y } = action.payload;
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.id === id ? { ...v, x: Math.round(x), y: Math.round(y) } : v,
        ),
      };
    }
    case "RESIZE_VARIANT": {
      const { id, width, x } = action.payload;
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.id === id
            ? {
                ...v,
                width: Math.round(width),
                ...(x !== undefined ? { x: Math.round(x) } : {}),
              }
            : v,
        ),
      };
    }
    case "SET_NATURAL_HEIGHT": {
      const { id, height } = action.payload;
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.id === id ? { ...v, naturalHeight: height } : v,
        ),
      };
    }
    case "SET_LOADING": {
      const { id, isLoading, loadTime } = action.payload;
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.id === id
            ? { ...v, isLoading, loadTime: loadTime ?? v.loadTime }
            : v,
        ),
      };
    }
    case "TOGGLE_DRAGGABLE": {
      return {
        ...state,
        ui: { ...state.ui, isDraggable: !state.ui.isDraggable },
      };
    }
    case "TOGGLE_CONSOLE": {
      return {
        ...state,
        ui: { ...state.ui, consoleOpen: !state.ui.consoleOpen },
      };
    }
    case "SET_PATH": {
      return {
        ...state,
        ui: { ...state.ui, currentPath: action.payload.path },
      };
    }
    case "ADD_RECENT_PATH": {
      const path = action.payload.path;
      if (state.ui.recentPaths.includes(path)) return state;
      return {
        ...state,
        ui: {
          ...state.ui,
          recentPaths: [path, ...state.ui.recentPaths].slice(0, 10),
        },
      };
    }
    case "SET_OFFSET": {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          offsetX: action.payload.offsetX,
          offsetY: action.payload.offsetY,
        },
      };
    }
    case "SET_SCALE": {
      return {
        ...state,
        canvas: { ...state.canvas, scale: action.payload.scale },
      };
    }
    case "RESET_VIEW": {
      return {
        ...state,
        canvas: { offsetX: 0, offsetY: 0, scale: 1 },
      };
    }
    case "SET_VARIANTS": {
      return {
        ...state,
        variants: action.payload.variants,
      };
    }
    default:
      return state;
  }
}

export function CrowPreviewProvider({
  children,
  breakpoints = DEFAULT_BREAKPOINTS,
  initialPath = "/",
  theme = "dark",
  injectStyles = true,
  className,
}: CrowPreviewProviderProps) {
  // Create initial variants from children (single element for all)
  const canvasItems = useMemo(
    () => createCanvasItems(children, breakpoints),
    [children, breakpoints],
  );
  const initialVariants = useMemo(
    () => variantsFromItems(canvasItems),
    [canvasItems],
  );

  const initialState: State = {
    variants: initialVariants,
    ui: {
      isDraggable: true,
      currentPath: initialPath,
      recentPaths: [],
      consoleOpen: false,
    },
    canvas: {
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  // Inject the compiled design-system stylesheet once at runtime
  useEffect(() => {
    if (injectStyles) mountStyles();
  }, [injectStyles]);

  // Sync variants when children/breakpoints change (preserve drag positions for existing ids)
  const prevIdsRef = useRef<string>("");
  useEffect(() => {
    const newVariants = variantsFromItems(canvasItems);
    const idKey = newVariants.map((v) => v.id).join(",");
    if (prevIdsRef.current === "") {
      prevIdsRef.current = idKey;
      return;
    }
    if (prevIdsRef.current !== idKey) {
      prevIdsRef.current = idKey;
      // Preserve x/y/width for existing ids, add new ones
      const existingById = new Map(state.variants.map((v) => [v.id, v]));
      const merged = newVariants.map((nv) => {
        const existing = existingById.get(nv.id);
        if (existing) {
          return { ...nv, x: existing.x, y: existing.y, width: existing.width, naturalHeight: existing.naturalHeight };
        }
        return nv;
      });
      dispatch({ type: "SET_VARIANTS", payload: { variants: merged } });
    }
  }, [canvasItems, state.variants]);

  // Keybindings — pass live scale getter to avoid stale closure
  const getScale = useCallback(() => state.canvas.scale, [state.canvas.scale]);
  useKeybindings(dispatch, getScale);

  // Action creators
  const onSetPath = (path: string) =>
    dispatch({ type: "SET_PATH", payload: { path } });
  const onAddRecent = (path: string) =>
    dispatch({ type: "ADD_RECENT_PATH", payload: { path } });
  const onResetView = () => dispatch({ type: "RESET_VIEW" });

  const contextValue: CrowPreviewContextValue = { state, dispatch };

  return (
    <CrowPreviewContext.Provider value={contextValue}>
      <main
        className={cn(
          "relative w-screen h-screen overflow-hidden",
          theme === "light" && "light",
          className
        )}
      >
        <Canvas childrenElements={children} className="w-full h-full" />
        <Nav
          state={state}
          onSetPath={onSetPath}
          onAddRecent={onAddRecent}
          onResetView={onResetView}
        />
        {state.ui.consoleOpen && (
          <ConsolePanel onClose={() => dispatch({ type: "TOGGLE_CONSOLE" })} />
        )}
        <Dock state={state} dispatch={dispatch} />
      </main>
    </CrowPreviewContext.Provider>
  );
}

// Context for hooks
import { createContext, useContext } from "react";
export const CrowPreviewContext = createContext<CrowPreviewContextValue | null>(
  null,
);
export function useCrowPreview() {
  const ctx = useContext(CrowPreviewContext);
  if (!ctx)
    throw new Error("useCrowPreview must be inside CrowPreviewProvider");
  return ctx;
}
