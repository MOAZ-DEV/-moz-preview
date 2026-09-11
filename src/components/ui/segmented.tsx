import { cn } from "../../lib";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  title?: string;
  disabled?: boolean;
};

export type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "xs" | "sm";
  className?: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-sm border border-border bg-surface p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            title={option.title}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[3px] font-medium transition-colors duration-150",
              size === "xs" ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-[11px]",
              active
                ? "bg-surface-active text-foreground shadow-sm shadow-black/20"
                : "text-muted-foreground hover:text-foreground",
              "disabled:pointer-events-none disabled:opacity-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;