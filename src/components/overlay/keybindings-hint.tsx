import React from "react";
import { cn } from "../../lib";
import { DEFAULT_KEYBINDINGS } from "../../lib/keybindings";
import { useIdle } from "../../hooks/use-idle";

const displayOrder: Array<{ combo: string; icon: React.ReactNode }> = [
  {
    combo: "ctrl+plus",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
        <path d="M8 3v10M3 8h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    combo: "ctrl+minus",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
        <path d="M3 8h10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    combo: "ctrl+0",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
        <path d="M4.5 4v8M11.5 4v8M4.5 8h7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    combo: "l",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
        <rect x="3.5" y="7.5" width="4" height="5" rx="0.75" strokeLinecap="round" />
        <path d="M5.5 7.5V5a2.5 2.5 0 0 1 5 0v2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    combo: "escape",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
        <path d="M5 5l6 6m0-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function KeybindingsHint() {
  const isIdle = useIdle(2500);

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-700",
        isIdle ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="flex items-center gap-2 rounded-md border border-border bg-background/80 px-3 py-1.5 backdrop-blur-md">
        {displayOrder.map(({ combo, icon }, i) => {
          const binding = DEFAULT_KEYBINDINGS[combo];
          if (!binding) return null;
          return (
            <React.Fragment key={combo}>
              {i > 0 && <span className="h-3 w-px bg-border" />}
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-xs border border-border bg-surface px-1 font-mono text-[10px] text-muted-foreground">
                  {icon}
                </kbd>
                <span className="text-[10px] text-muted-foreground/80">
                  {binding.description}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
