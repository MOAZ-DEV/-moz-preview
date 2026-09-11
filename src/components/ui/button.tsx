import { forwardRef } from "react";
import { cn } from "../../lib";

type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

type ButtonSize = "xs" | "sm" | "md";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_12px_-2px_var(--primary)]",
  secondary:
    "bg-secondary text-secondary-foreground border border-border hover:bg-surface-hover",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-surface hover:border-border-strong",
  ghost: "text-foreground hover:bg-surface-hover",
  destructive:
    "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground",
  link: "text-accent underline-offset-4 hover:underline h-auto px-0 py-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-6 px-2 text-[11px] gap-1 rounded-xs",
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-sm",
  md: "h-8 px-3 text-[13px] gap-2 rounded-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "default", size = "sm", type, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "link" ? "inline" : "border border-transparent",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

export type IconButtonProps = Omit<ButtonProps, "size"> & {
  size?: "xs" | "sm";
  label: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ className, size = "sm", label, children, ...props }, ref) {
    return (
      <Button
        ref={ref}
        size={size}
        aria-label={label}
        title={label}
        className={cn(
          "shrink-0",
          size === "xs" ? "h-6 w-6 p-0 [&>svg]:h-3.5 [&>svg]:w-3.5" : "h-7 w-7 p-0 [&>svg]:h-4 [&>svg]:w-4",
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

export default Button;