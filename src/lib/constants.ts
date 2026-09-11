import { Breakpoint } from "../types";

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { variant: "desktop", width: 1440, height: 900 },
  { variant: "tablet", width: 768, height: 1024 },
  { variant: "mobile", width: 390, height: 844 },
];

export const DEFAULT_GAP = 80;
export const MIN_SCALE = 0.1;
export const MAX_SCALE = 3.0;
export const FOCUS_PADDING = 40; // padding around focused variant
export const GRID_EXTENT = 25000; // half-size of the canvas grid plane, in px
export const PAN_SPEED = 1.5; // multiplier for wheel/scroll panning