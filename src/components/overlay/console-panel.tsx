import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib";
import { IconButton } from "../ui/button";
import { Badge } from "../ui/badge";
import { useCrowPreview } from "../provider";

type ConsoleLevel = "log" | "debug" | "info" | "warn" | "error";

type ConsoleEntry = {
  id: string;
  level: ConsoleLevel;
  time: number;
  variantId: string;
  args: string[];
};

const MAX_ENTRIES = 200;

const levelStyles: Record<ConsoleLevel, { dot: string; label: string; text: string }> = {
  log: { dot: "bg-muted-foreground", label: "log", text: "text-foreground" },
  debug: { dot: "bg-muted-foreground/60", label: "debug", text: "text-muted-foreground" },
  info: { dot: "bg-accent", label: "info", text: "text-accent" },
  warn: { dot: "bg-warning", label: "warn", text: "text-warning" },
  error: { dot: "bg-destructive", label: "error", text: "text-destructive" },
};

function formatTime(time: number) {
  const d = new Date(time);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(
    d.getMilliseconds(),
  ).padStart(3, "0")}`;
}

export function ConsolePanel({ onClose }: { onClose: () => void }) {
  const { state } = useCrowPreview();
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [filter, setFilter] = useState<ConsoleLevel | "all">("all");
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data as { type?: string };
      if (!data || data.type !== "crowPreviewConsole") return;
      const entry = data as unknown as ConsoleEntry;
      setEntries((prev) => [...prev.slice(-(MAX_ENTRIES - 1)), entry]);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Auto-scroll to bottom while the user is already at the bottom
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.level === filter)),
    [entries, filter],
  );

  const counts = useMemo(() => {
    const c: Record<ConsoleLevel, number> = { log: 0, debug: 0, info: 0, warn: 0, error: 0 };
    for (const e of entries) c[e.level]++;
    return c;
  }, [entries]);

  const variantName = (id: string) =>
    state.variants.find((v) => v.id === id)?.variant ?? id;

  return (
    <aside
      className="fixed bottom-4 right-4 z-40 flex min-h-[300px] w-[320px] flex-col border-l border-border rounded bg-background/95 backdrop-blur-md"
      aria-label="Preview console"
    >
      {/* Header */}
      <header className="flex shrink-0 items-center gap-1.5 border-b border-border px-2 py-1.5">
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="m3 4.5 4 3.5-4 3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12h4" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
          Console
        </span>
        {entries.length > 0 && (
          <Badge variant="secondary" className="normal-case">
            {entries.length}
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-0.5">
          <IconButton
            label="Clear console"
            size="xs"
            variant="ghost"
            onClick={() => setEntries([])}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2.5 4h11M6 4V2.5h4V4m-6.5 0 1 9h7l1-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
          <IconButton
            label="Close console"
            size="xs"
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="m5 5 6 6m0-6-6 6" strokeLinecap="round" />
            </svg>
          </IconButton>
        </div>
      </header>

      {/* Level filters */}
      <div className="flex shrink-0 items-center gap-0.5 border-b border-border px-2 py-1">
        {(["all", "log", "info", "warn", "error", "debug"] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setFilter(level)}
            className={cn(
              "h-5 rounded-xs px-1.5 text-[10px] font-medium transition-colors",
              filter === level
                ? "bg-surface-active text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {level}
            {level !== "all" && counts[level] > 0 && (
              <span className="ml-1 text-muted-foreground">{counts[level]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 py-1.5"
      >
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-[11px] text-muted-foreground/70">
            No console output yet.<br />
            Logs from the preview iframes appear here.
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {filtered.map((entry) => {
              const style = levelStyles[entry.level];
              return (
                <li
                  key={entry.id}
                  className={cn(
                    "rounded-xs border border-border bg-surface/60 px-2 py-1",
                    entry.level === "error" && "border-destructive/25 bg-destructive/5",
                    entry.level === "warn" && "border-warning/25 bg-warning/5",
                  )}
                >
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                    <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                    <span className={cn("uppercase", style.text)}>{style.label}</span>
                    <span className="tabular-nums">{formatTime(entry.time)}</span>
                    <Badge variant="outline" className="ml-auto normal-case">
                      {variantName(entry.variantId)}
                    </Badge>
                  </div>
                  <pre className="mt-0.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-snug text-foreground">
                    {entry.args.join(" ")}
                  </pre>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default ConsolePanel;
