import { forwardRef } from "react";
import { cn } from "../../lib";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, children, ...props }, ref) {
    return (
      <span className="relative inline-flex w-full items-center">
        <select
          ref={ref}
          className={cn(
            "h-7 w-full appearance-none rounded-sm border border-input bg-surface px-2 pr-7 text-xs text-foreground",
            "focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive focus:border-destructive focus:ring-destructive/60",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 8 8"
          className="pointer-events-none absolute right-2 h-2 w-2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M1 2.5 4 5.5 7 2.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  },
);

export default Select;