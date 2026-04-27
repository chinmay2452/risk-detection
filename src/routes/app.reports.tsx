import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText, GitCompare, Plus } from "lucide-react";
import { GlassCard } from "@/components/cyber/GlassCard";
import { reportHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SentinelAI" },
      { name: "description", content: "Download, export and compare security reports across scans." },
    ],
  }),
  component: Reports,
});

function gradeColor(grade: string) {
  if (grade === "A") return "bg-success/15 text-success ring-success/30";
  if (grade === "B") return "bg-primary/15 text-primary ring-primary/30";
  if (grade === "C") return "bg-warning/15 text-warning ring-warning/30";
  return "bg-destructive/15 text-destructive ring-destructive/30";
}

function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Audit trail</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Export and compare past scans for compliance and trend analysis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <FileSpreadsheet className="size-4" /> Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <GitCompare className="size-4" /> Compare scans
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform">
            <Plus className="size-4" /> New report
          </button>
        </div>
      </div>

      {/* Featured */}
      <GlassCard hover={false} className="relative overflow-hidden p-8">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary glow-cyan">
            <FileText className="size-8 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Latest</p>
            <h3 className="mt-1 text-xl font-bold">fintech-core · RPT-2046</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Generated Apr 26, 2026 · Health score 88 · Grade A
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform">
            <Download className="size-4" /> Download PDF
          </button>
        </div>
      </GlassCard>

      {/* History table */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold">History</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 pr-3 font-medium">Report ID</th>
                <th className="py-2.5 pr-3 font-medium">Project</th>
                <th className="py-2.5 pr-3 font-medium">Date</th>
                <th className="py-2.5 pr-3 font-medium">Score</th>
                <th className="py-2.5 pr-3 font-medium">Grade</th>
                <th className="py-2.5 pr-3 font-medium">Severity breakdown</th>
                <th className="py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportHistory.map((r) => (
                <tr key={r.id} className="border-b border-border/30 transition-colors hover:bg-primary/5">
                  <td className="py-3 pr-3 font-mono text-xs">{r.id}</td>
                  <td className="py-3 pr-3 font-medium">{r.project}</td>
                  <td className="py-3 pr-3 text-muted-foreground text-xs">{r.date}</td>
                  <td className="py-3 pr-3 font-mono">{r.score}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1",
                        gradeColor(r.grade),
                      )}
                    >
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-destructive">{r.critical}C</span>
                      <span className="rounded bg-warning/15 px-1.5 py-0.5 text-warning">{r.high}H</span>
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-primary">{r.medium}M</span>
                      <span className="rounded bg-success/15 px-1.5 py-0.5 text-success">{r.low}L</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/40 px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors">
                      <Download className="size-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
