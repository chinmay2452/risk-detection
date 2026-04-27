import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: string; positive?: boolean };
  accent?: "cyan" | "purple" | "green" | "orange" | "red";
  suffix?: string;
}

const accentMap = {
  cyan: "text-primary",
  purple: "text-secondary",
  green: "text-success",
  orange: "text-warning",
  red: "text-destructive",
} as const;

const bgMap = {
  cyan: "bg-primary/10 ring-primary/30",
  purple: "bg-secondary/10 ring-secondary/30",
  green: "bg-success/10 ring-success/30",
  orange: "bg-warning/10 ring-warning/30",
  red: "bg-destructive/10 ring-destructive/30",
} as const;

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  accent = "cyan",
  suffix,
}: KpiCardProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight">
            {value}
            {suffix && <span className="ml-1 text-base text-muted-foreground">{suffix}</span>}
          </p>
        </div>
        <div className={cn("rounded-xl p-2.5 ring-1", bgMap[accent])}>
          <Icon className={cn("size-5", accentMap[accent])} />
        </div>
      </div>
      {delta && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              delta.positive
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {delta.positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {delta.value}
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </GlassCard>
  );
}
