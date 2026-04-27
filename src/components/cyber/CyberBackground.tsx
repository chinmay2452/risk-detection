import { cn } from "@/lib/utils";

interface CyberBackgroundProps {
  className?: string;
  variant?: "full" | "subtle";
}

export function CyberBackground({ className, variant = "full" }: CyberBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Animated grid */}
      <div className="absolute inset-0 cyber-grid opacity-40 animate-grid" />

      {/* Radial glows */}
      <div className="absolute -top-40 -left-40 size-[520px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute top-1/3 -right-40 size-[600px] rounded-full bg-secondary/20 blur-3xl" />
      {variant === "full" && (
        <div className="absolute -bottom-40 left-1/3 size-[480px] rounded-full bg-primary-glow/15 blur-3xl" />
      )}

      {/* Floating orbs */}
      {variant === "full" && (
        <>
          <div className="absolute top-1/4 left-1/5 size-2 rounded-full bg-primary shadow-[0_0_20px] shadow-primary animate-float" />
          <div className="absolute top-2/3 left-2/3 size-1.5 rounded-full bg-secondary shadow-[0_0_15px] shadow-secondary animate-float [animation-delay:1.5s]" />
          <div className="absolute top-1/2 left-3/4 size-1 rounded-full bg-primary-glow shadow-[0_0_15px] shadow-primary-glow animate-float [animation-delay:3s]" />
          <div className="absolute top-1/3 left-1/2 size-1.5 rounded-full bg-primary animate-float [animation-delay:2s]" />
        </>
      )}

      {/* Top edge fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
    </div>
  );
}
