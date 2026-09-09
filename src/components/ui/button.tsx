import { cn } from "../../lib";
import { ComponentProps } from "react";

type sizeType = "sm" | "md" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
type variantType = "default" | "secondary" | "destructive" | "ghost" | "link";

export type ButtonProps = {
  size?: sizeType;
  variant?: variantType;
} & ComponentProps<"button">;

export default function Button({
  size = "sm",
  variant = "default",
  className,
  children,
  ...props
}: ButtonProps) {

  const variantClasses: { [K in variantType]: string } = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizeClasses: { [K in sizeType]: string } = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
    "icon-sm": "h-8 w-8 p-0",
    "icon-md": "h-10 w-10 p-0",
    "icon-lg": "h-12 w-12 p-0",
  };

  const classNameProp = cn(
    className,
    sizeClasses[size],
    variantClasses[variant],
  );

  return (
    <button className={classNameProp} {...props}>
      {children}
    </button>
  );
}
