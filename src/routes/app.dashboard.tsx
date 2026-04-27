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
import {
  kpiData,
  moduleRisks,
  recentActivity,
  severityDistribution,
  weeklyTrend,
} from "@/lib/mock-data";

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

function Dashboard() {
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
          delta={{ value: "+12%", positive: true }}
          accent="cyan"
        />
        <KpiCard
          label="Risks detected"
          value={kpiData.risksDetected.toLocaleString()}
          icon={ShieldAlert}
          delta={{ value: "+4.3%", positive: false }}
          accent="purple"
        />
        <KpiCard
          label="High severity"
          value={kpiData.highSeverity}
          icon={ShieldAlert}
          delta={{ value: "-8%", positive: true }}
          accent="orange"
        />
        <KpiCard
          label="Reports generated"
          value={kpiData.reportsGenerated}
          icon={FileText}
          delta={{ value: "+22%", positive: true }}
          accent="cyan"
        />
        <KpiCard
          label="Model accuracy"
          value={kpiData.accuracy}
          suffix="%"
          icon={Gauge}
          delta={{ value: "+0.6%", positive: true }}
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
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.7 0.03 250)" fontSize={11} />
                <YAxis dataKey="module" type="category" stroke="oklch(0.7 0.03 250)" fontSize={11} width={80} />
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
                {recentActivity.map((row) => (
                  <tr
                    key={row.project}
                    className="border-b border-border/30 transition-colors hover:bg-primary/5"
                  >
                    <td className="py-3 font-mono text-xs">{row.project}</td>
                    <td className="py-3">{row.risks}</td>
                    <td className="py-3"><StatusPill status={row.status} /></td>
                    <td className="py-3 text-right text-muted-foreground text-xs">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
