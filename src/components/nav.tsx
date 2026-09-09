import { ComponentProps } from "react";
import { cn } from "../lib";
import Button from "./ui/button";

export type NavProps = {} & ComponentProps<"nav">;

export default function Nav({ className, children, ...props }: NavProps) {
  return (
    <nav
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 flex flex-row gap-1 items-center p-2 rounded-md bg-accent/45 backdrop-blur-sm border border-foreground/45",
        className,
      )}
    >
      {children}
    </nav>
  );
}
