import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/mock-data";

const styles: Record<Severity | "info", string> = {
  critical: "bg-destructive/15 text-destructive ring-destructive/30",
  high: "bg-warning/15 text-warning ring-warning/30",
  medium: "bg-primary/15 text-primary ring-primary/30",
  low: "bg-success/15 text-success ring-success/30",
  info: "bg-secondary/15 text-secondary ring-secondary/30",
};

export function SeverityPill({
  severity,
  className,
}: {
  severity: Severity | "info";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1",
        styles[severity],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

export function StatusPill({
  status,
}: {
  status: "Healthy" | "Warning" | "Critical" | string;
}) {
  const map: Record<string, string> = {
    Healthy: "bg-success/15 text-success ring-success/30",
    Warning: "bg-warning/15 text-warning ring-warning/30",
    Critical: "bg-destructive/15 text-destructive ring-destructive/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        map[status] ?? "bg-muted text-muted-foreground ring-border",
      )}
    >
      <span className="size-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
}
