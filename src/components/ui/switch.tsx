import { forwardRef } from "react";
import { cn } from "../../lib";

export type SwitchProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch({ className, checked, onCheckedChange, disabled, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full border transition-colors duration-150",
          checked
            ? "border-primary bg-primary"
            : "border-border-strong bg-track hover:border-border-strong",
          disabled && "pointer-events-none opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none absolute h-[14px] w-[14px] rounded-full bg-foreground shadow-sm transition-transform duration-150",
            checked ? "translate-x-[13px] bg-background" : "translate-x-[1px] bg-muted-foreground",
          )}
        />
      </button>
    );
  },
);

export default Switch;