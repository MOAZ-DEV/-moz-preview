import React, { useCallback, useEffect, useRef, useState } from "react";
import { State } from "../../types";
import { cn } from "../../lib";
import { IconButton } from "../ui/button";
import { Badge } from "../ui/badge";
import { useClickOutside } from "../../hooks/use-click-outside";

type Props = {
  state: State;
  onSetPath: (path: string) => void;
  onAddRecent: (path: string) => void;
  onResetView: () => void;
};

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-sm bg-primary text-background shadow-[0_0_10px_-2px_var(--primary)]",
        className,
      )}
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <path d="M6.5 1.5a1 1 0 0 0-2 0v1.1a4 4 0 0 0-2.9 2.9H.5a1 1 0 0 0 0 2h1.1a4 4 0 0 0 2.9 2.9v1.1a1 1 0 0 0 2 0v-1.1a4 4 0 0 0 2.9-2.9h1.1a1 1 0 0 0 0-2h-1.1a4 4 0 0 0-2.9-2.9V1.5Z" />
      </svg>
    </span>
  );
}

function RecentMenu({
  paths,
  onSelect,
}: {
  paths: string[];
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <IconButton
        ref={buttonRef}
        label="Recent paths"
        variant="ghost"
        size="xs"
        onClick={() => setOpen((v) => !v)}
        className="data-[open=true]:bg-surface-active"
        data-open={open}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z" />
          <path d="M8 5v3l2 1.5" strokeLinecap="round" />
        </svg>
      </IconButton>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 origin-top-right rounded-md border border-border bg-popover p-1 shadow-xl shadow-black/40">
          <div className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent paths
          </div>
          <div className="max-h-56 overflow-y-auto">
            {paths.map((path, i) => (
              <button
                key={`${path}-${i}`}
                type="button"
                onClick={() => {
                  onSelect(path);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xs px-2 py-1.5 text-left font-mono text-xs text-foreground hover:bg-surface-active"
              >
                <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M7 2h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7l2-1 2-1 2-1 2-1" />
                  <path d="M4 2 2 4" strokeLinecap="round" />
                </svg>
                <span className="truncate">{path}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Nav({ state, onSetPath, onAddRecent, onResetView }: Props) {
  const [inputValue, setInputValue] = useState(state.ui.currentPath);

  useEffect(() => {
    setInputValue(state.ui.currentPath);
  }, [state.ui.currentPath]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const path = inputValue.trim() || "/";
      onSetPath(path);
      onAddRecent(path);
    },
    [inputValue, onSetPath, onAddRecent],
  );

  return (
    <nav className="fixed left-1/2 top-3 z-50 -translate-x-1/2">
      <div
        className={cn(
          "flex items-center gap-1 rounded-md border border-border bg-card/90 py-1 pl-1.5 pr-1",
          "shadow-xl shadow-black/30 backdrop-blur-md",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-1.5 pr-1.5">
          <LogoMark />
          <span className="hidden font-mono text-[11px] font-semibold tracking-tight text-foreground sm:inline">
            moz/preview
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Path form */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="pointer-events-none pl-1 font-mono text-xs text-muted-foreground">
            /
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="path"
            spellCheck={false}
            autoComplete="off"
            aria-label="Current path"
            className="h-6 w-[110px] rounded-sm bg-transparent px-1.5 font-mono text-xs text-foreground placeholder:font-sans placeholder:text-muted-foreground/50 focus:outline-none sm:w-[180px]"
          />
          <IconButton
            label="Go to path"
            size="xs"
            type="submit"
            className="ml-0.5 text-muted-foreground hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
        </form>

        {state.ui.recentPaths.length > 0 && (
          <RecentMenu
            paths={state.ui.recentPaths}
            onSelect={(path) => {
              onSetPath(path);
              setInputValue(path);
            }}
          />
        )}

        <div className="h-4 w-px bg-border" />

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <IconButton
            label="Reset view"
            size="xs"
            variant="ghost"
            onClick={onResetView}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3.5 3v3.5H7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.1 10a5.5 5.5 0 1 0 .4-5.4L3.5 6.5" strokeLinecap="round" />
            </svg>
          </IconButton>

          <Badge variant="secondary" className="hidden sm:inline-flex">
            {state.variants.length} variants
          </Badge>
        </div>
      </div>
    </nav>
  );
}

export default Nav;