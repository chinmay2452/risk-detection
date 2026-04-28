import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  Check,
  Download,
  GitBranch,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/cyber/GlassCard";
import { SeverityPill } from "@/components/cyber/SeverityPill";
import { supabase } from "@/lib/supabase";
import {
  buildMitigations,
  calculateHealthScore,
  type Mitigation,
  type MitigationPriority,
  type MitigationStatus,
} from "@/lib/mitigationEngine";

export const Route = createFileRoute("/app/mitigation")({
  head: () => ({
    meta: [
      { title: "Dynamic Mitigation — SentinelAI" },
      {
        name: "description",
        content: "Prioritized, actionable security fixes with health scoring.",
      },
    ],
  }),
  component: Mitigation,
});

function Mitigation() {
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | MitigationPriority>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MitigationStatus>("all");
  const [saveMessage, setSaveMessage] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("analysisRisks");
    if (!raw) {
      setMitigations([]);
      setLoading(false);
      return;
    }

    try {
      const parsedRisks = JSON.parse(raw);
      const generated = buildMitigations(parsedRisks);
      setMitigations(generated);

      const rows = generated.map((m) => ({
        risk_id: m.risk_id,
        recommendation: m.recommendation,
        priority: m.priority,
        implementation_effort: m.effort,
        status: m.status,
        created_at: new Date().toISOString(),
      }));

      supabase
        .from("mitigations")
        .upsert(rows, { onConflict: "risk_id" })
        .then(({ error }) => {
          if (error) {
            setSaveMessage(`Mitigations generated locally. Supabase sync failed: ${error.message}`);
          } else {
            setSaveMessage("Mitigations generated and synced to Supabase.");
          }
        });
    } catch (error) {
      console.error("Mitigation generation failed:", error);
      setSaveMessage("Failed to generate mitigations from analysis results.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredMitigations = useMemo(() => {
    return mitigations.filter((m) => {
      if (severityFilter !== "all" && m.severity !== severityFilter) return false;
      if (priorityFilter !== "all" && m.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!search.trim()) return true;

      const haystack =
        `${m.risk_name} ${m.category} ${m.recommendation} ${m.affected_modules.join(" ")}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [mitigations, severityFilter, priorityFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const immediate = mitigations.filter((m) => m.priority === "Immediate").length;
    const planned = mitigations.filter((m) => m.priority === "Planned").length;
    const advisory = mitigations.filter((m) => m.priority === "Advisory").length;
    const healthScore = calculateHealthScore(mitigations);
    return { immediate, planned, advisory, healthScore };
  }, [mitigations]);

  const markFixed = async (id: string) => {
    const target = mitigations.find((m) => m.id === id);
    if (!target) return;

    setMitigations((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Fixed" } : m)));

    const { error } = await supabase
      .from("mitigations")
      .update({ status: "Fixed" })
      .eq("risk_id", target.risk_id);

    if (error) {
      setSaveMessage(`Status updated locally. Supabase update failed: ${error.message}`);
      return;
    }
    setSaveMessage(`Marked ${target.risk_name} as fixed.`);
  };

  const recalculate = () => {
    setMitigations((prev) => [...prev]);
    setSaveMessage("Health score recalculated from latest mitigation status.");
  };

  const exportPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className="size-7 animate-spin text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Building mitigation plan…</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard hover={false} className="relative overflow-hidden p-6 lg:p-7">
        <div className="absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 size-56 rounded-full bg-success/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              ML Input Signal
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">System Health Score</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This score is derived from unresolved mitigation severity and is used as ML scoring
              input for prioritization.
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 p-4 ring-1 ring-primary/20">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Live score
              </p>
            </div>
            <p className="mt-2 font-mono text-3xl font-bold text-gradient-cyan">
              {stats.healthScore}%
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                style={{ width: `${stats.healthScore}%` }}
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
              <GitBranch className="size-3" />
              Derived from unresolved Immediate / Planned / Advisory mitigations
            </p>
          </div>
        </div>
      </GlassCard>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Recommendations
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Mitigation Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live risk-driven remediation plan generated from your analysis results.
        </p>
        {saveMessage && <p className="mt-2 text-xs text-muted-foreground">{saveMessage}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Total Risks" value={String(mitigations.length)} />
        <SummaryCard label="Immediate Fixes" value={String(stats.immediate)} />
        <SummaryCard label="Planned Fixes" value={String(stats.planned)} />
        <SummaryCard label="Advisory Fixes" value={String(stats.advisory)} />
        <SummaryCard label="Health Score" value={`${stats.healthScore}`} highlight />
      </div>

      <GlassCard className="p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search risk, category, module, recommendation…"
              className="w-full rounded-lg border border-border/60 bg-background/40 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
            className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
          >
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
          >
            <option value="all">All priorities</option>
            <option value="Immediate">Immediate</option>
            <option value="Planned">Planned</option>
            <option value="Advisory">Advisory</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="Pending">Pending</option>
            <option value="Fixed">Fixed</option>
          </select>
        </div>
      </GlassCard>

      {mitigations.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-3 text-lg font-semibold">No analysis data found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Run analysis first to generate dynamic mitigation recommendations.
          </p>
          <Link
            to="/app/analyze"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/30"
          >
            Back to Analyze Results
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredMitigations.map((m) => (
            <GlassCard
              key={m.id}
              className="p-6 transition-transform duration-300 hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-muted-foreground">{m.risk_id}</p>
                  <h3 className="mt-1 text-base font-semibold leading-snug">{m.risk_name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{m.recommendation}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <SeverityPill severity={m.severity} />
                  <Tag label={m.category} />
                  <Tag label={m.priority} emphasize={m.priority === "Immediate"} />
                  <Tag label={`Effort: ${m.effort}`} />
                  <Tag label={m.status} success={m.status === "Fixed"} />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Step-by-step fixes
                </p>
                <ul className="mt-2 space-y-2">
                  {m.steps.map((step, index) => (
                    <li
                      key={`${m.id}-${index}`}
                      className="flex items-start gap-2 rounded-lg border border-border/40 bg-background/30 px-3 py-2 text-sm"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-success/20 text-success">
                        <Check className="size-3" />
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Impact:</span> {m.impact}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {m.affected_modules.length > 0 ? (
                  m.affected_modules.map((module) => (
                    <span
                      key={`${m.id}-${module}`}
                      className="rounded bg-primary/10 px-2 py-1 text-[11px] font-mono text-primary ring-1 ring-primary/30"
                    >
                      {module}
                    </span>
                  ))
                ) : (
                  <span className="rounded bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
                    No specific module tagged
                  </span>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => markFixed(m.id)}
                  disabled={m.status === "Fixed"}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-4 py-2 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="size-3.5" />
                  {m.status === "Fixed" ? "Already Fixed" : "Mark Fixed"}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Download className="size-4" />
            Export Mitigation Report PDF
          </button>
          <button
            onClick={recalculate}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <RefreshCw className="size-4" />
            Recalculate Health Score
          </button>
        </div>
        <Link
          to="/app/analyze"
          className="inline-flex items-center gap-2 rounded-lg bg-primary/15 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/30"
        >
          <ArrowLeft className="size-4" />
          Back to Analyze Results
        </Link>
      </div>
    </div>
  );
}

function Tag({
  label,
  emphasize,
  success,
}: {
  label: string;
  emphasize?: boolean;
  success?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1",
        emphasize ? "bg-destructive/15 text-destructive ring-destructive/30" : "",
        success ? "bg-success/15 text-success ring-success/30" : "",
        !emphasize && !success ? "bg-secondary/15 text-secondary ring-secondary/30" : "",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <GlassCard className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 font-mono text-3xl font-bold ${highlight ? "text-gradient-cyan" : ""}`}>
        {value}
      </p>
    </GlassCard>
  );
}
