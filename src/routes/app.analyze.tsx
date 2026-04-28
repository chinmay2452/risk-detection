import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Gauge,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "@/components/cyber/GlassCard";
import { KpiCard } from "@/components/cyber/KpiCard";
import { SeverityPill } from "@/components/cyber/SeverityPill";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Results — SentinelAI" },
      {
        name: "description",
        content: "Detailed risk analysis with severity, components, and recommendations.",
      },
    ],
  }),
  component: Analyze,
});

// ── Types ─────────────────────────────────────────────────────────────────────

type Severity = "Critical" | "High" | "Medium" | "Low";

interface Risk {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  severity_score?: number;
  score?: number;
  category: string;
  owasp: string;
  cwe: string;
  affected_components: string[];
  confidence: number;
  recommendation?: string[];
}

interface Summary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  overallRiskLevel: string;
  readyForMLScoring: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const tooltipStyle = {
  background: "oklch(0.21 0.035 265 / 0.95)",
  border: "1px solid oklch(0.78 0.16 215 / 0.3)",
  borderRadius: "0.75rem",
  fontSize: "0.75rem",
};

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "var(--color-chart-5)",
  High: "var(--color-chart-4)",
  Medium: "var(--color-chart-1)",
  Low: "var(--color-chart-3)",
};

// ── Component ─────────────────────────────────────────────────────────────────

function Analyze() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Severity | "all">("all");

  // ── Fetch live results from backend ─────────────────────────────────────
  useEffect(() => {
    async function runAnalysis() {
      try {
        const raw = sessionStorage.getItem("architectureData");
        if (!raw) {
          setError("No architecture data found. Please complete the extraction step first.");
          setLoading(false);
          return;
        }

        const architectureData = JSON.parse(raw);

        const res = await fetch(apiUrl("/api/analyze"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(architectureData),
        });

        const json = await res.json();

        if (json.success) {
          const fetchedRisks = json.data.risks || [];
          const fetchedSummary = json.data.summary || null;

          setRisks(fetchedRisks);
          setSummary(fetchedSummary);
          sessionStorage.setItem("analysisRisks", JSON.stringify(fetchedRisks));
          sessionStorage.setItem("analysisSummary", JSON.stringify(fetchedSummary));

          // Auto-generate a report entry
          if (fetchedSummary) {
            const reportId = `RPT-${Math.floor(1000 + Math.random() * 9000)}`;
            const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            let score = 100 - (fetchedSummary.critical * 20 + fetchedSummary.high * 10 + fetchedSummary.medium * 5 + fetchedSummary.low * 2);
            if (score < 0) score = 0;
            
            let grade = 'A';
            if (score < 90) grade = 'B';
            if (score < 70) grade = 'C';
            if (score < 50) grade = 'D';

            // Gather extra data for the comprehensive PDF report
            let architectureData = null;
            let validationResult = null;
            try {
              const archStr = sessionStorage.getItem("architectureData");
              if (archStr) architectureData = JSON.parse(archStr);
              
              const valStr = sessionStorage.getItem("validationResult");
              if (valStr) validationResult = JSON.parse(valStr);
            } catch(e) {}

            const newReport = {
              id: reportId,
              project: "Current Model",
              date: dateStr,
              score,
              grade,
              critical: fetchedSummary.critical || 0,
              high: fetchedSummary.high || 0,
              medium: fetchedSummary.medium || 0,
              low: fetchedSummary.low || 0,
              architectureData,
              validationResult,
              risks: fetchedRisks
            };

            const existingReportsStr = localStorage.getItem("sentinelReports");
            let reportsList = existingReportsStr ? JSON.parse(existingReportsStr) : [];
            // Prevent duplicates if we just remounted the component and re-fetched the same analysis (check latest report score/counts)
            if (reportsList.length === 0 || reportsList[0].score !== score || reportsList[0].critical !== fetchedSummary.critical) {
              reportsList.unshift(newReport);
              localStorage.setItem("sentinelReports", JSON.stringify(reportsList));
            }
          }
        } else {
          setError(json.message || "Analysis failed.");
        }
      } catch (err: any) {
        setError("Could not connect to the analysis server. Is the backend running?");
        console.error("Analysis fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    runAnalysis();
  }, []);

  // ── Derived chart data ────────────────────────────────────────────────────
  const severityDistribution = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    risks.forEach((r) => {
      counts[r.severity] = (counts[r.severity] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: SEVERITY_COLORS[name] }));
  }, [risks]);

  const topVulnerableComponents = useMemo(() => {
    const map: Record<string, number> = {};
    risks.forEach((r) => {
      r.affected_components.forEach((c) => {
        map[c] = (map[c] || 0) + 1;
      });
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, risks]) => ({ name, risks }));
  }, [risks]);

  const avgConfidence = useMemo(() => {
    if (!risks.length) return 0;
    return Math.round(risks.reduce((s, r) => s + r.confidence, 0) / risks.length);
  }, [risks]);

  const filtered = useMemo(
    () => (filter === "all" ? risks : risks.filter((r) => r.severity === filter)),
    [risks, filter],
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Running Rule Engine…</h2>
        <p className="text-sm text-muted-foreground">
          Evaluating architecture model against 20 security rules
        </p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlert className="size-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Analysis Error</h2>
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        <Link
          to="/app/extraction"
          className="mt-2 rounded-xl border border-border bg-background/60 px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          ← Back to extraction
        </Link>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Step 4 of 4
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Analysis results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {risks.length > 0
              ? `${risks.length} risk${risks.length !== 1 ? "s" : ""} detected — overall level: `
              : "No risks detected in the modeled architecture. "}
            {risks.length > 0 && summary && (
              <span
                className={cn("font-semibold", {
                  "text-destructive": summary.overallRiskLevel === "Critical",
                  "text-orange-400": summary.overallRiskLevel === "High",
                  "text-yellow-400": summary.overallRiskLevel === "Medium",
                  "text-green-400":
                    summary.overallRiskLevel === "Low" || summary.overallRiskLevel === "None",
                })}
              >
                {summary.overallRiskLevel}
              </span>
            )}
          </p>
        </div>
        <Link
          to="/app/mitigation"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform"
        >
          View mitigations <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Total risks" value={summary?.total ?? 0} icon={ShieldAlert} accent="cyan" />
        <KpiCard label="Critical" value={summary?.critical ?? 0} icon={ShieldX} accent="red" />
        <KpiCard label="High" value={summary?.high ?? 0} icon={ShieldAlert} accent="orange" />
        <KpiCard label="Medium" value={summary?.medium ?? 0} icon={ShieldAlert} accent="orange" />
        <KpiCard label="Low" value={summary?.low ?? 0} icon={ShieldCheck} accent="green" />
      </div>

      {/* Charts — only render if there are risks */}
      {risks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Severity donut */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold">Severity distribution</h3>
            <div className="mt-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {severityDistribution.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Top vulnerable components bar chart */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold">Top affected components</h3>
            <div className="mt-2 h-72">
              {topVulnerableComponents.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topVulnerableComponents} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(1 0 0 / 0.06)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="oklch(0.7 0.03 250)"
                      fontSize={11}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="oklch(0.7 0.03 250)"
                      fontSize={11}
                      width={130}
                      tickFormatter={(v: string) => (v.length > 16 ? v.slice(0, 15) + "…" : v)}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
                    <Bar dataKey="risks" radius={[0, 6, 6, 0]} fill="url(#vulnGrad)" />
                    <defs>
                      <linearGradient id="vulnGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--color-chart-5)" />
                        <stop offset="100%" stopColor="var(--color-chart-4)" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No component data available
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Risk table */}
      <GlassCard className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Detected risks</h3>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "Critical", "High", "Medium", "Low"] as const).map((f) => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors",
                  filter === f
                    ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                    : "bg-background/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {risks.length === 0
              ? "✅ No security risks detected in this architecture model."
              : `No ${filter} risks found.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 pr-3 font-medium">Risk</th>
                  <th className="py-2.5 pr-3 font-medium text-center">AI Score</th>
                  <th className="py-2.5 pr-3 font-medium">Severity</th>
                  <th className="py-2.5 pr-3 font-medium">Affected Components</th>
                  <th className="py-2.5 pr-3 font-medium">Cause</th>
                  <th className="py-2.5 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <RiskRow key={r.id} risk={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ── RiskRow ───────────────────────────────────────────────────────────────────

function RiskRow({ risk }: { risk: Risk }) {
  const [expanded, setExpanded] = useState(false);
  const hasRecs = Array.isArray(risk.recommendation) && risk.recommendation.length > 0;
  const displayScore =
    typeof risk.severity_score === "number"
      ? risk.severity_score
      : typeof risk.score === "number"
        ? risk.score
        : "—";

  return (
    <>
      <tr
        className={cn(
          "border-b border-border/30 align-top transition-colors cursor-pointer",
          expanded ? "bg-primary/5" : "hover:bg-primary/5",
        )}
        onClick={() => hasRecs && setExpanded((v) => !v)}
        title={hasRecs ? "Click to toggle recommendations" : undefined}
      >
        {/* Risk name + id + description */}
        <td className="py-3 pr-3 max-w-[18rem]">
          <div className="flex items-start gap-2">
            {hasRecs && (
              <span
                className={cn(
                  "mt-1 shrink-0 text-primary transition-transform duration-200",
                  expanded ? "rotate-90" : "",
                )}
              >
                ▶
              </span>
            )}
            <div>
              <p className="font-medium leading-snug">{risk.name}</p>
              <p className="mt-0.5 font-mono text-[10px] text-primary">{risk.id}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">{risk.description}</p>
            </div>
          </div>
        </td>

        {/* AI Score */}
        <td className="py-3 pr-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex items-center justify-center size-8 rounded-lg bg-primary/10 border border-primary/20 font-mono text-xs font-bold text-primary">
              {displayScore}
            </span>
            <span className="text-[9px] uppercase tracking-tighter text-muted-foreground">
              Score
            </span>
          </div>
        </td>

        {/* Severity */}
        <td className="py-3 pr-3 whitespace-nowrap">
          <SeverityPill severity={risk.severity.toLowerCase() as any} />
        </td>

        {/* Affected components */}
        <td className="py-3 pr-3">
          <div className="flex flex-wrap gap-1">
            {risk.affected_components.slice(0, 4).map((c) => (
              <span
                key={c}
                className="inline-block rounded bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {c}
              </span>
            ))}
            {risk.affected_components.length > 4 && (
              <span className="inline-block rounded bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                +{risk.affected_components.length - 4} more
              </span>
            )}
          </div>
        </td>

        {/* Cause */}
        <td className="py-3 pr-3 text-xs text-muted-foreground max-w-[18rem] leading-snug">
          {risk.cause || risk.description}
        </td>

        {/* Confidence bar */}
        <td className="py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                style={{ width: `${risk.confidence}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{risk.confidence}%</span>
          </div>
        </td>
      </tr>

      {/* Expandable recommendations row */}
      {expanded && hasRecs && (
        <tr className="border-b border-border/20 bg-primary/3">
          <td colSpan={6} className="px-8 pb-4 pt-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-primary">
              Recommendations
            </p>
            <ul className="space-y-1.5">
              {risk.recommendation.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}
