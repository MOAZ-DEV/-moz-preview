import { useEffect, useState, useCallback, useRef } from "react";

export function useIdle(timeoutMs = 2500) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const reset = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setIsIdle(true), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
    ];
    for (const event of events) {
      window.addEventListener(event, reset, { passive: true });
    }
    reset();
    return () => {
      for (const event of events) {
        window.removeEventListener(event, reset);
      }
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
      }
    };
  }, [reset]);

  return isIdle;
}
