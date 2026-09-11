import { useEffect, useCallback } from "react";

export function useIframeHeight(
  variantId: string,
  onHeightChange: (id: string, height: number) => void
) {
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Validate origin — only accept same-origin messages (iframe srcDoc is same-origin)
      if (event.origin !== window.location.origin && event.origin !== "null") return;
      if (event.data?.type === "crowPreviewResize" && event.data?.id === variantId) {
        const height = event.data.height;
        if (typeof height === "number" && Number.isFinite(height) && height > 0 && height < 100000) {
          onHeightChange(variantId, Math.round(height));
        }
      }
    },
    [variantId, onHeightChange]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);
}