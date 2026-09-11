import React, { useReducer, useMemo, ReactNode, useCallback, useEffect, useRef } from "react";
import {
  CrowPreviewContextValue,
  CrowPreviewProviderProps,
  State,
  Action,
  VariantState,
  Theme,
} from "../types";
import { DEFAULT_BREAKPOINTS, DEFAULT_GAP } from "../lib/constants";
import {
  createCanvasItems,
  variantsFromItems,
} from "../lib/canvas-utils";
import { Canvas } from "./canvas";
import { Nav } from "./overlay/nav";
import { Dock } from "./overlay/dock";
import { ConsolePanel } from "./overlay/console-panel";
import { SettingsPanel } from "./overlay/settings-panel";
import { useKeybindings } from "../hooks/use-keybindings";
import { getCameraController } from "../lib/camera";
import { cn } from "../lib";
import { loadWorkspace, saveWorkspace } from "../lib/persistence";
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

let uid = 0;
function nextId() {
  return `img-${Date.now()}-${++uid}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FOCUS": {
      const { id } = action.payload;
      return {
        ...state,
        variants: state.variants.map((v) => {
          if (v.id === id) {
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
      const { id, height, aspect } = action.payload;
      return {
        ...state,
        variants: state.variants.map((v) =>
          v.id === id
            ? {
                ...v,
                naturalHeight: height,
                ...(aspect !== undefined ? { aspect } : {}),
              }
            : v,
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
    case "TOGGLE_SETTINGS": {
      return {
        ...state,
        ui: { ...state.ui, settingsOpen: !state.ui.settingsOpen },
      };
    }
    case "SET_THEME": {
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload.theme },
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
        canvas: { ...state.canvas, offsetX: 0, offsetY: 0, scale: 1 },
      };
    }
    case "SET_VARIANTS": {
      return {
        ...state,
        variants: action.payload.variants,
      };
    }
    case "ADD_IMAGE_VARIANT": {
      const { source, width: w } = action.payload;
      const width = w ?? 420;
      const maxX = state.variants.length > 0
        ? Math.max(...state.variants.map((v) => v.x + v.width))
        : 0;
      return {
        ...state,
        variants: [
          ...state.variants,
          {
            id: nextId(),
            variant: "mobile" as const,
            kind: "image" as const,
            source,
            aspect: null,
            x: maxX + DEFAULT_GAP,
            y: 0,
            width,
            height: 300,
            naturalHeight: null,
            isFocused: false,
            isLoading: false,
            loadTime: null,
          },
        ],
      };
    }
    case "ADD_FIGMA_VARIANT": {
      const { url } = action.payload;
      const maxX = state.variants.length > 0
        ? Math.max(...state.variants.map((v) => v.x + v.width))
        : 0;
      return {
        ...state,
        variants: [
          ...state.variants,
          {
            id: nextId(),
            variant: "desktop" as const,
            kind: "figma" as const,
            source: url,
            aspect: null,
            x: maxX + DEFAULT_GAP,
            y: 0,
            width: 420,
            height: 560,
            naturalHeight: null,
            isFocused: false,
            isLoading: false,
            loadTime: null,
          },
        ],
      };
    }
    case "REMOVE_VARIANT": {
      const { id } = action.payload;
      return {
        ...state,
        variants: state.variants.filter((v) => v.id !== id),
      };
    }
    default:
      return state;
  }
}

function buildInitialState(
  initialVariants: VariantState[],
  defaultTheme: Theme,
  initialPath: string,
): State {
  const persisted = loadWorkspace();
  if (!persisted) {
    return {
      variants: initialVariants,
      ui: {
        isDraggable: true,
        currentPath: initialPath,
        recentPaths: [],
        consoleOpen: false,
        settingsOpen: false,
        theme: defaultTheme,
      },
      canvas: { offsetX: 0, offsetY: 0, scale: 1, restored: false },
    };
  }

  const elementMap = new Map(initialVariants.map((v) => [v.id, v]));
  const restoredElements = initialVariants.map((v) => {
    const p = persisted.variants.find((pv) => pv.id === v.id && pv.kind === "element");
    if (!p) return v;
    return {
      ...v,
      x: p.x,
      y: p.y,
      width: p.width,
      naturalHeight: p.naturalHeight,
    };
  });

  const imageVariants = persisted.variants
    .filter((v) => v.kind === "image" && v.source)
    .map((v): VariantState => ({
      id: v.id,
      variant: v.variant,
      kind: "image",
      source: v.source,
      aspect: v.aspect,
      x: v.x,
      y: v.y,
      width: v.width,
      height: 300,
      naturalHeight: v.naturalHeight,
      isFocused: false,
      isLoading: false,
      loadTime: null,
    }));

  const figmaVariants = persisted.variants
    .filter((v) => v.kind === "figma" && v.source)
    .map((v): VariantState => ({
      id: v.id,
      variant: v.variant,
      kind: "figma",
      source: v.source,
      aspect: null,
      x: v.x,
      y: v.y,
      width: v.width,
      height: v.height || 560,
      naturalHeight: null,
      isFocused: false,
      isLoading: false,
      loadTime: null,
    }));

  return {
    variants: [...restoredElements, ...imageVariants, ...figmaVariants],
    ui: {
      isDraggable: true,
      currentPath: initialPath,
      recentPaths: [],
      consoleOpen: false,
      settingsOpen: false,
      theme: persisted.theme ?? defaultTheme,
    },
    canvas: { ...persisted.canvas, restored: true },
  };
}

export function CrowPreviewProvider({
  children,
  breakpoints = DEFAULT_BREAKPOINTS,
  initialPath = "/",
  theme: propTheme = "dark",
  injectStyles = true,
  className,
}: CrowPreviewProviderProps) {
  const canvasItems = useMemo(
    () => createCanvasItems(children, breakpoints),
    [children, breakpoints],
  );
  const initialVariants = useMemo(
    () => variantsFromItems(canvasItems),
    [canvasItems],
  );

  const [state, dispatch] = useReducer(reducer, undefined, () =>
    buildInitialState(initialVariants, propTheme, initialPath),
  );

  // Persist workspace (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveWorkspace(state.variants, state.canvas, state.ui.theme);
    }, 500);
    return () => clearTimeout(saveTimerRef.current);
  }, [state.variants, state.canvas, state.ui.theme]);

  // Inject the compiled design-system stylesheet once at runtime
  useEffect(() => {
    if (injectStyles) mountStyles();
  }, [injectStyles]);

  // Sync variants when children/breakpoints change (preserve drag positions, images, figma)
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
      const existingById = new Map(state.variants.map((v) => [v.id, v]));
      const merged = newVariants.map((nv) => {
        const existing = existingById.get(nv.id);
        if (existing) {
          return {
            ...nv,
            x: existing.x,
            y: existing.y,
            width: existing.width,
            naturalHeight: existing.naturalHeight,
          };
        }
        return nv;
      });
      const extraVariants = state.variants.filter(
        (v) => v.kind !== "element",
      );
      dispatch({ type: "SET_VARIANTS", payload: { variants: [...merged, ...extraVariants] } });
    }
  }, [canvasItems, state.variants]);

  // Keybindings
  const getScale = useCallback(() => state.canvas.scale, [state.canvas.scale]);
  useKeybindings(dispatch, getScale);

  // Action creators
  const onSetPath = (path: string) =>
    dispatch({ type: "SET_PATH", payload: { path } });
  const onAddRecent = (path: string) =>
    dispatch({ type: "ADD_RECENT_PATH", payload: { path } });
  const onResetView = () => {
    dispatch({ type: "RESET_VIEW" });
    getCameraController()?.fitToView();
  };

  const contextValue: CrowPreviewContextValue = { state, dispatch };

  return (
    <CrowPreviewContext.Provider value={contextValue}>
      <main
        className={cn(
          "relative w-screen h-screen overflow-hidden",
          state.ui.theme === "light" && "light",
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
        {state.ui.settingsOpen && (
          <SettingsPanel />
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
