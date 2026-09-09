import { ComponentProps } from "react";
import { cn } from "../lib";
import Button from "./ui/button";

export type DockProps = {} & ComponentProps<"div">;

export default function Dock({ className, children, ...props }: DockProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-row gap-1 items-center p-2 rounded-md bg-accent/45 backdrop-blur-sm border border-foreground/45",
        className,
      )}
    >
      {children}
      <div className="flex flex-row gap-1 items-center">
        <Button>Toggle</Button>
      </div>
    </div>
  );
}
