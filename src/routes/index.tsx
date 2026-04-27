import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Github,
  Layers,
  Lock,
  Network,
  Play,
  Radar,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  Wrench,
  Zap,
} from "lucide-react";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { GlassCard } from "@/components/cyber/GlassCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SentinelAI — AI-Powered Software Security Risk Detection" },
      {
        name: "description",
        content:
          "Detect software security risks before they become breaches. AI-powered analysis of repos, diagrams, and docs with dynamic mitigation.",
      },
      { property: "og:title", content: "SentinelAI — Detect risks before breaches" },
      {
        property: "og:description",
        content:
          "AI-powered cybersecurity platform that extracts architecture, scores risk severity, and recommends fixes.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Brain,
    title: "AI Architecture Extraction",
    desc: "Parse repos, UML, PDFs and diagrams into a unified system model.",
  },
  {
    icon: Radar,
    title: "Risk Detection Engine",
    desc: "Continuously scan components, APIs and data flows for threats.",
  },
  {
    icon: Target,
    title: "ML Severity Scoring",
    desc: "Confidence-calibrated CVSS-aligned scoring with context awareness.",
  },
  {
    icon: Wrench,
    title: "Dynamic Mitigation",
    desc: "Get prioritized, actionable fixes mapped to your stack.",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    desc: "Audit-ready exports with timeline, deltas and evidence.",
  },
];

const steps = [
  {
    icon: Github,
    title: "Connect",
    desc: "Drop a repo URL, architecture image, UML, or PDF — we ingest them all.",
  },
  {
    icon: Sparkles,
    title: "Extract & Analyze",
    desc: "Our AI maps components, APIs, data flows and trust boundaries.",
  },
  {
    icon: Shield,
    title: "Mitigate",
    desc: "Receive prioritized fixes with health scoring and exportable reports.",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <CyberBackground />

      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/40 blur-md" />
            <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Shield className="size-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold leading-none">SentinelAI</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              Security Platform
            </p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#stats" className="hover:text-foreground transition-colors">Trust</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/app/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:shadow-primary/80 transition-shadow"
          >
            Launch app <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="size-3.5" />
            New · GPT-class threat model auto-extraction
          </div>

          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Detect software security risks{" "}
            <span className="text-gradient">before they become breaches</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
            AI-powered platform that analyzes repositories, architecture diagrams and documents
            to detect risks and recommend mitigations — in minutes, not weeks.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/app/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_50px_-8px] shadow-primary hover:shadow-primary transition-all hover:scale-[1.02]"
            >
              Get started free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/app/extraction"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-6 py-3.5 text-sm font-semibold backdrop-blur hover:bg-accent transition-colors"
            >
              <Play className="size-4 text-primary" />
              Live demo
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" /> SOC 2 ready
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" /> SBOM &amp; SLSA aware
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-success" /> No code leaves your tenant
            </span>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-12 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl" />
          <GlassCard hover={false} className="relative overflow-hidden p-1.5">
            <div className="relative rounded-xl bg-card/60 p-6">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/70" />
                <span className="ml-3 text-xs font-mono text-muted-foreground">
                  sentinelai.app — fintech-core scan
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                <MiniStat label="Components mapped" value="42" icon={Layers} accent="text-primary" />
                <MiniStat label="Risks detected" value="87" icon={ShieldAlert} accent="text-warning" />
                <MiniStat label="Health score" value="88/100" icon={Zap} accent="text-success" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {["API Gateway", "Auth Service", "Payment Worker", "session_cache"].map((c, i) => (
                  <div
                    key={c}
                    className="rounded-lg border border-border/50 bg-background/40 p-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Node {i + 1}
                    </p>
                    <p className="mt-1 font-mono text-xs">{c}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${60 + i * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Capabilities
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            A complete <span className="text-gradient-cyan">AI security pipeline</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Five purpose-built modules that turn raw artifacts into prioritized, actionable
            security intelligence.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <GlassCard key={f.title} className="p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
          <GlassCard hover={false} className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/15 to-secondary/15">
            <div className="absolute -right-6 -top-6 size-32 rounded-full bg-primary/20 blur-2xl" />
            <Lock className="size-6 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Zero-trust by design</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Single-tenant analysis. Your code never leaves your boundary.
            </p>
            <Link
              to="/app/dashboard"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
            >
              Explore the dashboard <ArrowRight className="size-4" />
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
            Workflow
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            From source to <span className="text-gradient">secured</span> in three steps
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <GlassCard key={s.title} className="relative p-7">
              <div className="absolute right-6 top-6 font-mono text-5xl font-bold text-primary/15">
                0{i + 1}
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-1 ring-primary/30">
                <s.icon className="size-6 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <GlassCard hover={false} className="relative overflow-hidden p-10 lg:p-16">
          <div className="absolute -left-16 top-1/2 size-72 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-16 top-1/2 size-72 -translate-y-1/2 rounded-full bg-secondary/15 blur-3xl" />
          <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { v: "12,400+", l: "Repos scanned" },
              { v: "1.8M", l: "Risks mitigated" },
              { v: "96.4%", l: "Model accuracy" },
              { v: "< 90s", l: "Avg. scan time" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="font-mono text-4xl font-bold text-gradient-cyan md:text-5xl">
                  {s.v}
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          Ready to <span className="text-gradient">harden your stack</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Try the live demo — no signup required. Explore the full security workflow with
          realistic mock data.
        </p>
        <Link
          to="/app/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-7 py-4 text-sm font-semibold text-primary-foreground shadow-[0_0_60px_-10px] shadow-primary hover:scale-[1.02] transition-transform"
        >
          Open the dashboard <ArrowRight className="size-4" />
        </Link>
      </section>

      <footer className="relative z-10 border-t border-border/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
          <p>© 2026 SentinelAI — Built for engineering security teams.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          </div>
        </div>
      </footer>

      {/* Suppress unused */}
      <span className="hidden">
        <Network className="size-0" />
      </span>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Layers;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${accent}`} />
      </div>
      <p className="mt-2 font-mono text-2xl font-bold">{value}</p>
    </div>
  );
}
