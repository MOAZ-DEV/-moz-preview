import { ReactNode } from "react";

export type BreakpointVariant = "desktop" | "tablet" | "mobile";

export type Breakpoint = {
  variant: BreakpointVariant;
  width: number;
  height: number;
};

export type VariantKind = "element" | "image" | "figma";

export type VariantState = {
  id: string;
  variant: BreakpointVariant;
  kind: VariantKind;
  source: string | null;
  aspect: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalHeight: number | null;
  isFocused: boolean;
  isLoading: boolean;
  loadTime: number | null;
};

export type Theme = "light" | "dark";

export type UIState = {
  isDraggable: boolean;
  currentPath: string;
  recentPaths: string[];
  consoleOpen: boolean;
  settingsOpen: boolean;
  theme: Theme;
};

export type CanvasState = {
  offsetX: number;
  offsetY: number;
  scale: number;
  restored: boolean;
};

export type State = {
  variants: VariantState[];
  ui: UIState;
  canvas: CanvasState;
};

export type Action =
  | { type: "FOCUS"; payload: { id: string } }
  | { type: "UNFOCUS" }
  | { type: "MOVE_VARIANT"; payload: { id: string; x: number; y: number } }
  | { type: "RESIZE_VARIANT"; payload: { id: string; width: number; x?: number } }
  | { type: "SET_NATURAL_HEIGHT"; payload: { id: string; height: number; aspect?: number | null } }
  | { type: "SET_LOADING"; payload: { id: string; isLoading: boolean; loadTime?: number } }
  | { type: "TOGGLE_DRAGGABLE" }
  | { type: "TOGGLE_CONSOLE" }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "SET_THEME"; payload: { theme: Theme } }
  | { type: "SET_PATH"; payload: { path: string } }
  | { type: "ADD_RECENT_PATH"; payload: { path: string } }
  | { type: "SET_OFFSET"; payload: { offsetX: number; offsetY: number } }
  | { type: "SET_SCALE"; payload: { scale: number } }
  | { type: "RESET_VIEW" }
  | { type: "SET_VARIANTS"; payload: { variants: VariantState[] } }
  | { type: "ADD_IMAGE_VARIANT"; payload: { source: string; width?: number } }
  | { type: "ADD_FIGMA_VARIANT"; payload: { url: string } }
  | { type: "REMOVE_VARIANT"; payload: { id: string } };

export type CrowPreviewContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

export type CrowPreviewProviderProps = {
  children: ReactNode;
  breakpoints?: Breakpoint[];
  initialPath?: string;
  theme?: Theme;
  /** Set to false when you import the stylesheet yourself */
  injectStyles?: boolean;
  className?: string;
};

// Aliases for @moz/preview branding
export type MozPreviewContextValue = CrowPreviewContextValue;
export type MozPreviewProviderProps = CrowPreviewProviderProps;

// For the element to render inside each variant
export type CanvasItem = {
  id: string;
  variant: BreakpointVariant;
  position: { x: number; y: number };
  size: { width: number; height: number };
  element: ReactNode;
};
