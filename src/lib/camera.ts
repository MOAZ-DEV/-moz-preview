export type CameraController = {
  zoomToVariant: (id: string) => void;
  fitToView: () => void;
};

let controller: CameraController | null = null;

export function registerCameraController(cb: CameraController): () => void {
  controller = cb;
  return () => {
    if (controller === cb) controller = null;
  };
}

export function getCameraController(): CameraController | null {
  return controller;
}