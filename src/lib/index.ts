import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  registerCameraController,
  getCameraController,
} from "./camera";
export type { CameraController } from "./camera";
export { createCanvasItems, variantsFromItems } from "./canvas-utils";
