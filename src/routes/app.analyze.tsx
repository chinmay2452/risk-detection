import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gauge, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { useState } from "react";
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
import { risks, severityDistribution, topVulnerableComponents, type Severity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Results — SentinelAI" },
      { name: "description", content: "Detailed risk analysis with severity, components, and recommendations." },
    ],
  }),
  component: Analyze,
});

const tooltipStyle = {
  background: "oklch(0.21 0.035 265 / 0.95)",
  border: "1px solid oklch(0.78 0.16 215 / 0.3)",
  borderRadius: "0.75rem",
  fontSize: "0.75rem",
};

function Analyze() {
  const [filter, setFilter] = useState<Severity | "all">("all");
  const filtered = filter === "all" ? risks : risks.filter((r) => r.severity === filter);

  const counts = {
    total: risks.length,
    high: risks.filter((r) => r.severity === "high" || r.severity === "critical").length,
    medium: risks.filter((r) => r.severity === "medium").length,
    low: risks.filter((r) => r.severity === "low").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Step 4 of 4</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Analysis results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {risks.length} risks detected across the modeled architecture.
          </p>
        </div>
        <Link
          to="/app/mitigation"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform"
        >
          View mitigations <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Total risks" value={counts.total} icon={ShieldAlert} accent="cyan" />
        <KpiCard label="High / critical" value={counts.high} icon={ShieldX} accent="red" />
        <KpiCard label="Medium" value={counts.medium} icon={ShieldAlert} accent="orange" />
        <KpiCard label="Low" value={counts.low} icon={ShieldCheck} accent="green" />
        <KpiCard label="Confidence" value={94.2} suffix="%" icon={Gauge} accent="purple" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold">Top vulnerable components</h3>
          <div className="mt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVulnerableComponents} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.7 0.03 250)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="oklch(0.7 0.03 250)" fontSize={11} width={110} />
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
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Detected risks</h3>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
              <button
                key={f}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 pr-3 font-medium">Risk</th>
                <th className="py-2.5 pr-3 font-medium">Severity</th>
                <th className="py-2.5 pr-3 font-medium">Component</th>
                <th className="py-2.5 pr-3 font-medium">Cause</th>
                <th className="py-2.5 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/30 align-top transition-colors hover:bg-primary/5">
                  <td className="py-3 pr-3">
                    <p className="font-medium">{r.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{r.id}</p>
                  </td>
                  <td className="py-3 pr-3"><SeverityPill severity={r.severity} /></td>
                  <td className="py-3 pr-3 font-mono text-xs">{r.component}</td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground max-w-[18rem]">{r.cause}</td>
                  <td className="py-3 text-xs text-muted-foreground max-w-[20rem]">{r.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
