import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText, GitCompare, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/cyber/GlassCard";
import { reportHistory as mockReportHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
// @ts-ignore
import html2pdf from "html2pdf.js";

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

function downloadPDF(report: any) {
  if (!report) return;

  const element = document.createElement('div');
  element.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
      <h1 style="color: #0ea5e9; margin-bottom: 5px;">SentinelAI Risk Report</h1>
      <p style="color: #666; margin-top: 0; margin-bottom: 30px;">Generated: ${report.date}</p>
      
      <div style="display: flex; justify-content: space-between; background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <div>
          <h3 style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase;">Project / ID</h3>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${report.project} · ${report.id}</p>
        </div>
        <div>
          <h3 style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase;">Health Score</h3>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: ${report.score >= 80 ? '#22c55e' : report.score >= 60 ? '#eab308' : '#ef4444'}">${report.score} / 100 (Grade ${report.grade})</p>
        </div>
        <div>
          <h3 style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase;">Risk Breakdown</h3>
          <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">
            <span style="color: #ef4444">${report.critical} Critical</span> &nbsp;|&nbsp;
            <span style="color: #f97316">${report.high} High</span> &nbsp;|&nbsp;
            <span style="color: #0ea5e9">${report.medium} Medium</span> &nbsp;|&nbsp;
            <span style="color: #22c55e">${report.low} Low</span>
          </p>
        </div>
      </div>

      ${report.architectureData ? `
      <h2 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #0f172a; margin-top: 40px;">1. Extracted Architecture</h2>
      <h3 style="color: #334155; margin-top: 20px;">Components</h3>
      <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
        ${(report.architectureData.components || []).map((c: any) => `<li><strong>${c.name}</strong> (${c.type}) - ${c.technology || c.tech || 'Unknown'}</li>`).join('')}
      </ul>
      <h3 style="color: #334155; margin-top: 20px;">Data Flows</h3>
      <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
        ${(report.architectureData.dataFlows || report.architectureData.data_flows || []).map((d: any) => `<li><strong>${d.from || d.source} &rarr; ${d.to || d.destination}</strong>: ${d.data || d.description}</li>`).join('')}
      </ul>
      ` : ''}

      ${report.validationResult ? `
      <h2 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #0f172a; margin-top: 40px;">2. Validation Assessment</h2>
      <p style="font-size: 14px;"><strong>Readiness Confidence:</strong> ${report.validationResult.confidence_score}%</p>
      <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
        ${(report.validationResult.issues || []).map((iss: any) => `<li style="color: #ef4444;"><strong>Warning (${iss.type}):</strong> ${iss.description}</li>`).join('')}
        ${(report.validationResult.issues || []).length === 0 ? `<li style="color: #22c55e;">All validation checks passed successfully.</li>` : ''}
      </ul>
      ` : ''}

      ${report.risks && report.risks.length > 0 ? `
      <h2 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #0f172a; margin-top: 40px; page-break-before: always;">3. Risk Analysis & Mitigation</h2>
      ${report.risks.map((r: any, i: number) => `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 16px;">${i+1}. ${r.name || r.title}</h4>
            <span style="background: ${r.severity === 'Critical' ? '#fee2e2' : r.severity === 'High' ? '#ffedd5' : r.severity === 'Medium' ? '#e0f2fe' : '#dcfce7'}; 
                         color: ${r.severity === 'Critical' ? '#991b1b' : r.severity === 'High' ? '#c2410c' : r.severity === 'Medium' ? '#0369a1' : '#166534'}; 
                         padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
              ${r.severity}
            </span>
          </div>
          <p style="font-size: 14px; color: #475569; margin-top: 0;"><strong>Affected Components:</strong> ${(r.affected_components || [r.component]).join(', ')}</p>
          <p style="font-size: 14px; color: #475569; margin-bottom: 10px;">${r.description || r.cause}</p>
          
          <div style="background: #f8fafc; padding: 10px; border-radius: 4px;">
            <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: bold; color: #0ea5e9;">Recommendations:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
              ${Array.isArray(r.recommendation) ? r.recommendation.map((rec: string) => `<li>${rec}</li>`).join('') : `<li>${r.recommendation}</li>`}
            </ul>
          </div>
        </div>
      `).join('')}
      ` : `
      <h2 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #0f172a; margin-top: 40px;">3. Risk Analysis & Mitigation</h2>
      <p style="font-size: 14px; color: #475569;">No significant security risks were detected in this architecture model.</p>
      `}
    </div>
  `;

  const opt = {
    margin:       10,
    filename:     `${report.id}_Security_Report.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

function downloadAllCSV(reports: any[]) {
  if (!reports || reports.length === 0) return;
  let content = `Report ID,Project,Date,Score,Grade,Critical,High,Medium,Low\n`;
  reports.forEach(r => {
    content += `${r.id},${r.project},"${r.date}",${r.score},${r.grade},${r.critical},${r.high},${r.medium},${r.low}\n`;
  });
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'all_reports.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Reports() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    // Load from local storage
    const stored = localStorage.getItem("sentinelReports");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setReports([...parsed, ...mockReportHistory]);
      } catch (err) {
        setReports([...mockReportHistory]);
      }
    } else {
      setReports([...mockReportHistory]);
    }
  }, []);

  // Use the latest report for the featured section
  const latestReport = reports.length > 0 ? reports[0] : mockReportHistory[0];

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
          <button onClick={() => downloadAllCSV(reports)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors cursor-pointer">
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
            <h3 className="mt-1 text-xl font-bold">{latestReport?.project || 'fintech-core'} · {latestReport?.id || 'RPT-2046'}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Generated {latestReport?.date || 'Apr 26, 2026'} · Health score {latestReport?.score || 88} · Grade {latestReport?.grade || 'A'}
            </p>
          </div>
          <button onClick={() => downloadPDF(latestReport)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform cursor-pointer">
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
              {reports.map((r, i) => (
                <tr key={`${r.id}-${i}`} className="border-b border-border/30 transition-colors hover:bg-primary/5">
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
                    <button onClick={() => downloadPDF(r)} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/40 px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors cursor-pointer mr-2">
                      <Download className="size-3" /> PDF
                    </button>
                    <button onClick={() => downloadAllCSV([r])} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/40 px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors cursor-pointer">
                      <Download className="size-3" /> CSV
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
