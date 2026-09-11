import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(
  onOutside: () => void,
  active = true,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const listener = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) onOutside();
    };
    // mousedown (not click) fires before focus/blur races in nested menus
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [onOutside, active]);

  return ref;
}

export default useClickOutside;