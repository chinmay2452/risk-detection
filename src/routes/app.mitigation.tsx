import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Check, Sparkles, TrendingUp, Wrench } from "lucide-react";
import { GlassCard } from "@/components/cyber/GlassCard";
import { SeverityPill } from "@/components/cyber/SeverityPill";
import { risks } from "@/lib/mock-data";

export const Route = createFileRoute("/app/mitigation")({
  head: () => ({
    meta: [
      { title: "Dynamic Mitigation — SentinelAI" },
      { name: "description", content: "Prioritized, actionable security fixes with health scoring." },
    ],
  }),
  component: Mitigation,
});

const fixes = [
  {
    risk: risks[0],
    actions: ["Add JWT validation middleware", "Enforce TLS 1.3", "Apply rate limiting (100 req/min)", "Restrict by IP allowlist"],
  },
  {
    risk: risks[1],
    actions: ["Enable Redis encryption-at-rest", "Rotate access tokens monthly", "Audit cached PII fields"],
  },
  {
    risk: risks[2],
    actions: ["Require WebAuthn for admin scope", "Add TOTP fallback", "Log auth attempts with geo-context"],
  },
  {
    risk: risks[3],
    actions: ["Verify HMAC before parse", "Use timing-safe comparison", "Reject requests > 60s old"],
  },
];

function Mitigation() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Recommendations</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Dynamic mitigation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prioritized fixes generated for your specific architecture.
        </p>
      </div>

      {/* Health hero */}
      <GlassCard hover={false} className="relative overflow-hidden p-8">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-success/15 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 size-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
          <div className="flex justify-center lg:justify-start">
            <HealthGauge score={88} grade="A" />
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-success">
              Architecture health score
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Strong posture — <span className="text-gradient">few critical gaps</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Applying all recommended fixes will raise your score to <span className="font-semibold text-success">96 / Grade A+</span>.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Stat label="Before" value="74" />
              <Stat label="Now" value="88" highlight />
              <Stat label="Projected" value="96" highlight />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Fix cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {fixes.map(({ risk, actions }) => (
          <GlassCard key={risk.id} className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                  <Wrench className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">{risk.title}</h3>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {risk.id} · {risk.component}
                  </p>
                </div>
              </div>
              <SeverityPill severity={risk.severity} />
            </div>

            <ul className="mt-4 space-y-2">
              {actions.map((a) => (
                <li
                  key={a}
                  className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/30 px-3 py-2.5 text-sm"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-success/20 text-success">
                    <Check className="size-3" />
                  </span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <TrendingUp className="size-3.5" /> +6 health pts
              </span>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:scale-[1.02] transition-transform">
                <Sparkles className="size-3.5" /> Apply fix
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="flex justify-end">
        <Link
          to="/app/reports"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform"
        >
          Generate report
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold ${highlight ? "text-gradient-cyan" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function HealthGauge({ score, grade }: { score: number; grade: string }) {
  const r = 80;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="relative size-52">
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="url(#healthGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ filter: "drop-shadow(0 0 12px oklch(0.72 0.18 155 / 0.6))" }}
        />
        <defs>
          <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-3)" />
            <stop offset="100%" stopColor="var(--color-chart-1)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Award className="mb-1 size-5 text-success" />
        <span className="font-mono text-5xl font-bold text-gradient-cyan">{score}</span>
        <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Grade {grade}
        </span>
      </div>
    </div>
  );
}
