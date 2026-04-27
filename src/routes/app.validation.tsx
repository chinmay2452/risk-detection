import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { GlassCard } from "@/components/cyber/GlassCard";
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

// ── Types ────────────────────────────────────────────────────────────────────

interface ValidationIssue {
  type: "Missing" | "Inconsistent" | "Logical";
  description: string;
}

interface ValidationResult {
  is_valid: boolean;
  issues: ValidationIssue[];
  suggestions: string[];
  confidence_score: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readValidationResult(): ValidationResult {
  try {
    const raw = sessionStorage.getItem("validationResult");
    if (raw) return JSON.parse(raw) as ValidationResult;
  } catch {
    /* fall through to default */
  }
  // Graceful default when nothing is in sessionStorage yet
  return {
    is_valid: false,
    issues: [
      {
        type: "Missing",
        description: "No validation data found. Please complete the extraction step first.",
      },
    ],
    suggestions: ["Go back and upload a file to start the extraction process."],
    confidence_score: 0,
  };
}

function issueIcon(type: ValidationIssue["type"]) {
  if (type === "Missing") return XCircle;
  if (type === "Inconsistent") return AlertTriangle;
  return Info;
}

// ── Component ─────────────────────────────────────────────────────────────────

function Validation() {
  const result = useMemo(() => readValidationResult(), []);

  const { is_valid, issues, suggestions, confidence_score } = result;

  // Build a unified checklist:
  // • One item per issue (warn / fail)
  // • If no issues at all → single "pass" item
  const checklist = useMemo(() => {
    if (issues.length === 0) {
      return [{ label: "All checks passed", status: "pass" as const, type: undefined }];
    }
    return issues.map((iss) => ({
      label: iss.description,
      status: "warn" as const,
      type: iss.type,
    }));
  }, [issues]);

  const passes = checklist.filter((c) => c.status === "pass").length;
  const warns = checklist.filter((c) => c.status === "warn").length;

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
        {/* Score ring */}
        <GlassCard className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Architecture readiness
          </p>
          <ScoreRing score={confidence_score} isValid={is_valid} />
          <p className="mt-2 text-sm">
            {is_valid ? (
              <span className="font-semibold text-success">Ready</span>
            ) : (
              <span className="font-semibold text-warning">Needs review</span>
            )}{" "}
            for analysis
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
            {checklist.map((c, idx) => {
              const Icon = c.type ? issueIcon(c.type) : Check;
              return (
                <li
                  key={idx}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                    c.status === "pass"
                      ? "border-success/30 bg-success/5"
                      : "border-warning/30 bg-warning/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                        c.status === "pass"
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="leading-snug">{c.label}</span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        c.status === "pass" ? "text-success" : "text-warning"
                      )}
                    >
                      {c.status === "pass" ? "Pass" : "Warn"}
                    </span>
                    {c.type && (
                      <span className="rounded bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {c.type}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                Suggestions
              </p>
              <ul className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard
        hover={false}
        className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
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

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, isValid }: { score: number; isValid: boolean }) {
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
          stroke={isValid ? "url(#ringGrad)" : "url(#ringWarn)"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{
            filter: isValid
              ? "drop-shadow(0 0 10px oklch(0.78 0.16 215 / 0.6))"
              : "drop-shadow(0 0 10px oklch(0.78 0.18 75 / 0.6))",
          }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" />
            <stop offset="100%" stopColor="var(--color-chart-2)" />
          </linearGradient>
          <linearGradient id="ringWarn" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.18 75)" />
            <stop offset="100%" stopColor="oklch(0.65 0.15 55)" />
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
