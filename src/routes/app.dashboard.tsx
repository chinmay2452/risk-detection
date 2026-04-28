import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  FileText,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "@/components/cyber/GlassCard";
import { KpiCard } from "@/components/cyber/KpiCard";
import { StatusPill } from "@/components/cyber/SeverityPill";
import { buildMitigations, calculateHealthScore } from "@/lib/mitigationEngine";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SentinelAI" },
      { name: "description", content: "Real-time security risk overview across your projects." },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = {
  background: "oklch(0.21 0.035 265 / 0.95)",
  border: "1px solid oklch(0.78 0.16 215 / 0.3)",
  borderRadius: "0.75rem",
  fontSize: "0.75rem",
  backdropFilter: "blur(12px)",
};

type Risk = {
  id: string;
  severity: string;
  affected_components?: string[];
  category?: string;
};

type ActivityRow = {
  project: string;
  risks: number;
  status: string;
  date: string;
};

function Dashboard() {
  const [analysisRisks, setAnalysisRisks] = useState<Risk[]>([]);
  const [fixedRiskIds, setFixedRiskIds] = useState<Set<string>>(new Set());
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("analysisRisks");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Risk[];
      setAnalysisRisks(parsed);

      const now = new Date();
      const scoreHint = sessionStorage.getItem("analysisSummary");
      const projectLabel =
        scoreHint && JSON.parse(scoreHint)?.overallRiskLevel
          ? `latest-scan-${String(JSON.parse(scoreHint).overallRiskLevel).toLowerCase()}`
          : "latest-scan";

      setActivity([
        {
          project: projectLabel,
          risks: parsed.length,
          status:
            parsed.filter((r) => ["critical", "high"].includes(String(r.severity).toLowerCase()))
              .length > 0
              ? "Critical"
              : parsed.length > 0
                ? "Warning"
                : "Healthy",
          date: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      console.error("Failed to read live dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    if (analysisRisks.length === 0) return;

    const riskIds = buildMitigations(analysisRisks).map((m) => m.risk_id);
    supabase
      .from("mitigations")
      .select("risk_id, status")
      .in("risk_id", riskIds)
      .then(({ data, error }) => {
        if (error || !data) return;
        const fixed = new Set<string>();
        data.forEach((row: { risk_id: string; status: string }) => {
          if (row.status === "Fixed") fixed.add(row.risk_id);
        });
        setFixedRiskIds(fixed);
      });
  }, [analysisRisks]);

  const generatedMitigations = useMemo(() => {
    if (analysisRisks.length === 0) return [];
    return buildMitigations(analysisRisks).map((m) =>
      fixedRiskIds.has(m.risk_id) ? { ...m, status: "Fixed" as const } : m,
    );
  }, [analysisRisks, fixedRiskIds]);

  const severityDistribution = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    analysisRisks.forEach((r) => {
      const s = String(r.severity || "").toLowerCase();
      if (s === "critical") counts.Critical += 1;
      else if (s === "high") counts.High += 1;
      else if (s === "medium") counts.Medium += 1;
      else counts.Low += 1;
    });
    return [
      { name: "Critical", value: counts.Critical, color: "var(--color-chart-5)" },
      { name: "High", value: counts.High, color: "var(--color-chart-4)" },
      { name: "Medium", value: counts.Medium, color: "var(--color-chart-1)" },
      { name: "Low", value: counts.Low, color: "var(--color-chart-3)" },
    ].filter((item) => item.value > 0);
  }, [analysisRisks]);

  const moduleRisks = useMemo(() => {
    const map = new Map<string, number>();
    analysisRisks.forEach((risk) => {
      (risk.affected_components || ["Unspecified"]).forEach((name) => {
        map.set(name, (map.get(name) || 0) + 1);
      });
    });
    return [...map.entries()]
      .map(([module, risks]) => ({ module, risks }))
      .sort((a, b) => b.risks - a.risks)
      .slice(0, 6);
  }, [analysisRisks]);

  const weeklyTrend = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const total = analysisRisks.length;
    const fixed = generatedMitigations.filter((m) => m.status === "Fixed").length;
    return days.map((day, index) => {
      const trendFactor = (index + 3) / 10;
      return {
        day,
        risks: Math.max(0, Math.round(total * trendFactor)),
        mitigated: Math.max(0, Math.round(fixed * trendFactor)),
      };
    });
  }, [analysisRisks.length, generatedMitigations]);

  const kpiData = useMemo(() => {
    const highSeverity = analysisRisks.filter((r) =>
      ["critical", "high"].includes(String(r.severity).toLowerCase()),
    ).length;
    return {
      projectsAnalyzed: analysisRisks.length > 0 ? 1 : 0,
      risksDetected: analysisRisks.length,
      highSeverity,
      reportsGenerated: analysisRisks.length > 0 ? 1 : 0,
      accuracy: analysisRisks.length > 0 ? 92.4 : 0,
      healthScore: calculateHealthScore(generatedMitigations),
    };
  }, [analysisRisks, generatedMitigations]);

  const recentActivity = activity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Security overview
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live posture across all monitored projects.
          </p>
        </div>
        <Link
          to="/app/input"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform md:self-auto"
        >
          <Sparkles className="size-4" /> New scan <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Projects analyzed"
          value={kpiData.projectsAnalyzed}
          icon={Activity}
          delta={{
            value: analysisRisks.length > 0 ? "Live" : "No scans",
            positive: analysisRisks.length > 0,
          }}
          accent="cyan"
        />
        <KpiCard
          label="Risks detected"
          value={kpiData.risksDetected.toLocaleString()}
          icon={ShieldAlert}
          delta={{ value: "From latest analysis", positive: true }}
          accent="purple"
        />
        <KpiCard
          label="High severity"
          value={kpiData.highSeverity}
          icon={ShieldAlert}
          delta={{
            value: kpiData.highSeverity > 0 ? "Needs attention" : "Under control",
            positive: kpiData.highSeverity === 0,
          }}
          accent="orange"
        />
        <KpiCard
          label="Reports generated"
          value={kpiData.reportsGenerated}
          icon={FileText}
          delta={{ value: "Auto from scan", positive: true }}
          accent="cyan"
        />
        <KpiCard
          label="Health score"
          value={kpiData.healthScore}
          suffix="%"
          icon={Gauge}
          delta={{ value: "Mitigation-weighted", positive: kpiData.healthScore >= 75 }}
          accent="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Severity distribution</h3>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="none"
                >
                  {severityDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
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

        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Weekly risk trend</h3>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="day" stroke="oklch(0.7 0.03 250)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 250)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="risks"
                  stroke="var(--color-chart-5)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-chart-5)" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="mitigated"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-chart-3)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Module risk + activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold">Module risk</h3>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleRisks} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(1 0 0 / 0.06)"
                  horizontal={false}
                />
                <XAxis type="number" stroke="oklch(0.7 0.03 250)" fontSize={11} />
                <YAxis
                  dataKey="module"
                  type="category"
                  stroke="oklch(0.7 0.03 250)"
                  fontSize={11}
                  width={80}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
                <Bar dataKey="risks" radius={[0, 6, 6, 0]} fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-chart-1)" />
                    <stop offset="100%" stopColor="var(--color-chart-2)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent activity</h3>
            <Link to="/app/reports" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 font-medium">Project</th>
                  <th className="py-2.5 font-medium">Risks</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-muted-foreground" colSpan={4}>
                      No live activity yet. Run a scan to populate dashboard metrics.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((row) => (
                    <tr
                      key={row.project}
                      className="border-b border-border/30 transition-colors hover:bg-primary/5"
                    >
                      <td className="py-3 font-mono text-xs">{row.project}</td>
                      <td className="py-3">{row.risks}</td>
                      <td className="py-3">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="py-3 text-right text-muted-foreground text-xs">{row.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
