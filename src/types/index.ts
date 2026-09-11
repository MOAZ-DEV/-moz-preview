import { ReactNode } from "react";

export type BreakpointVariant = "desktop" | "tablet" | "mobile";

export type Breakpoint = {
  variant: BreakpointVariant;
  width: number;
  height: number;
};

export type VariantState = {
  id: string;
  variant: BreakpointVariant;
  x: number;
  y: number;
  width: number;
  height: number;          // current display height
  naturalHeight: number | null; // reported by iframe
  isFocused: boolean;
  isLoading: boolean;
  loadTime: number | null;
};

export type UIState = {
  isDraggable: boolean;
  currentPath: string;
  recentPaths: string[];
  consoleOpen: boolean;
};

export type CanvasState = {
  offsetX: number;
  offsetY: number;
  scale: number;
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
  | { type: "SET_NATURAL_HEIGHT"; payload: { id: string; height: number } }
  | { type: "SET_LOADING"; payload: { id: string; isLoading: boolean; loadTime?: number } }
  | { type: "TOGGLE_DRAGGABLE" }
  | { type: "TOGGLE_CONSOLE" }
  | { type: "SET_PATH"; payload: { path: string } }
  | { type: "ADD_RECENT_PATH"; payload: { path: string } }
  | { type: "SET_OFFSET"; payload: { offsetX: number; offsetY: number } }
  | { type: "SET_SCALE"; payload: { scale: number } }
  | { type: "RESET_VIEW" }
  | { type: "SET_VARIANTS"; payload: { variants: VariantState[] } };

export type CrowPreviewContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

export type CrowPreviewProviderProps = {
  children: ReactNode;
  breakpoints?: Breakpoint[];
  initialPath?: string;
  theme?: "light" | "dark";
  /** Set to false when you import the stylesheet yourself */
  injectStyles?: boolean;
  className?: string;
};

// Aliases for @moz/preview branding (Crow -> Moz)
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