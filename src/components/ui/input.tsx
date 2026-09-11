import { forwardRef } from "react";
import { cn } from "../../lib";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const base =
  "h-7 w-full rounded-sm border border-input bg-surface px-2 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors duration-150 " +
  "focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          base,
          invalid && "border-destructive focus:border-destructive focus:ring-destructive/60",
          className,
        )}
        {...props}
      />
    );
  },
);

export default Input;