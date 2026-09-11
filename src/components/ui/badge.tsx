import { cn } from "../../lib";

type BadgeVariant =
  | "default"
  | "accent"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  accent: "bg-accent/15 text-accent border border-accent/25",
  secondary: "bg-secondary text-secondary-foreground border border-border",
  outline: "border border-border text-muted-foreground",
  success: "bg-success/15 text-success border border-success/25",
  warning: "bg-warning/15 text-warning border border-warning/25",
  destructive: "bg-destructive/15 text-destructive border border-destructive/25",
};

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center gap-1 whitespace-nowrap rounded-xs px-1.5 text-[10px] font-medium uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export default Badge;