import type { ComponentProps } from "react";

import { cn } from "../lib";

export type LayoutProps = ComponentProps<"div">;

export default function Layout({
  className,
  children,
  ...props
}: LayoutProps) {
  return (
    <div
      className={cn("h-full w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}