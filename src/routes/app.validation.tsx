import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ShieldAlert } from "lucide-react";
import { GlassCard } from "@/components/cyber/GlassCard";
import { validationChecks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/validation")({
  head: () => ({
    meta: [
      { title: "Validation — SentinelAI" },
      { name: "description", content: "Architecture readiness scoring before risk analysis." },
    ],
  }),
  component: Validation,
});

function Validation() {
  const score = 92;
  const passes = validationChecks.filter((c) => c.status === "pass").length;
  const warns = validationChecks.filter((c) => c.status === "warn").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Step 3 of 4</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Model validation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm completeness before running the risk analysis pass.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Score */}
        <GlassCard className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Architecture readiness
          </p>
          <ScoreRing score={score} />
          <p className="mt-2 text-sm">
            <span className="font-semibold text-success">Ready</span> for analysis
          </p>
        </GlassCard>

        {/* Checklist */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Validation checklist</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-success">
                <Check className="size-3.5" /> {passes} passed
              </span>
              <span className="inline-flex items-center gap-1.5 text-warning">
                <AlertTriangle className="size-3.5" /> {warns} warnings
              </span>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {validationChecks.map((c) => (
              <li
                key={c.label}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
                  c.status === "pass"
                    ? "border-success/30 bg-success/5"
                    : "border-warning/30 bg-warning/5",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full",
                      c.status === "pass"
                        ? "bg-success/20 text-success"
                        : "bg-warning/20 text-warning",
                    )}
                  >
                    {c.status === "pass" ? (
                      <Check className="size-4" />
                    ) : (
                      <AlertTriangle className="size-4" />
                    )}
                  </span>
                  <span>{c.label}</span>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    c.status === "pass" ? "text-success" : "text-warning",
                  )}
                >
                  {c.status === "pass" ? "Pass" : "Warn"}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard hover={false} className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="size-5 text-warning" />
          <p className="text-sm text-muted-foreground">
            Warnings won&apos;t block analysis but may surface as detected risks.
          </p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <Link
            to="/app/extraction"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors sm:flex-initial"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
          <Link
            to="/app/analyze"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform sm:flex-initial"
          >
            Run analysis <ArrowRight className="size-4" />
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;

  return (
    <div className="relative my-4 size-44">
      <svg viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="10" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ filter: "drop-shadow(0 0 10px oklch(0.78 0.16 215 / 0.6))" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" />
            <stop offset="100%" stopColor="var(--color-chart-2)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-5xl font-bold text-gradient-cyan">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
