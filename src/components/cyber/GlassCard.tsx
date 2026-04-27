import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface GlassCardProps extends ComponentPropsWithoutRef<"div"> {
  hover?: boolean;
  glow?: "none" | "cyan" | "purple";
  children: ReactNode;
}

export function GlassCard({
  className,
  hover = true,
  glow = "none",
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl",
        hover && "glass-card-hover",
        glow === "cyan" && "glow-cyan",
        glow === "purple" && "glow-purple",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
