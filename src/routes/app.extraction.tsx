import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Database,
  GitBranch,
  Globe,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/cyber/GlassCard";
import { extractedEntities } from "@/lib/mock-data";

export const Route = createFileRoute("/app/extraction")({
  head: () => ({
    meta: [
      { title: "AI Extraction — SentinelAI" },
      { name: "description", content: "AI extracts components, APIs, data flows and trust boundaries from your inputs." },
    ],
  }),
  component: Extraction,
});

const phases = [
  "Parsing repository tree…",
  "Detecting frameworks &amp; runtimes…",
  "Mapping API surface…",
  "Resolving data flows…",
  "Identifying trust boundaries…",
  "Building system model…",
];

function Extraction() {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (phase >= phases.length - 1) {
      const t = setTimeout(() => setDone(true), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase((p) => p + 1), 650);
    return () => clearTimeout(t);
  }, [phase]);

  if (!done) return <ExtractionLoading phase={phase} />;
  return <ExtractionResults />;
}

function ExtractionLoading({ phase }: { phase: number }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="relative mb-10 size-48">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin [animation-duration:2s]" />
        <div className="absolute inset-3 rounded-full border-2 border-secondary/20" />
        <div className="absolute inset-3 rounded-full border-b-2 border-secondary animate-spin [animation-duration:3s] [animation-direction:reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary glow-cyan animate-pulse-glow">
            <Sparkles className="size-9 text-primary-foreground" />
          </div>
        </div>
        <div className="absolute inset-0 animate-spin [animation-duration:6s]">
          <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_15px] shadow-primary" />
        </div>
      </div>

      <h2 className="text-3xl font-bold tracking-tight">
        AI is extracting your <span className="text-gradient">system architecture</span>
      </h2>
      <p
        className="mt-4 font-mono text-sm text-primary animate-pulse"
        dangerouslySetInnerHTML={{ __html: phases[phase] }}
      />

      <div className="mt-10 w-full max-w-md">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
            style={{ width: `${((phase + 1) / phases.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Phase {phase + 1} of {phases.length}
        </p>
      </div>
    </div>
  );
}

function ExtractionResults() {
  const sections = [
    { title: "Components", icon: Boxes, items: extractedEntities.components.map((c) => `${c.name} · ${c.tech}`) },
    { title: "APIs", icon: Globe, items: extractedEntities.apis.map((a) => `${a.method} ${a.path} · ${a.auth}`) },
    { title: "Databases", icon: Database, items: extractedEntities.databases.map((d) => `${d.name} · ${d.engine}`) },
    { title: "Roles", icon: Users, items: extractedEntities.roles.map((r) => `${r.name} · ${r.scope}`) },
    { title: "Data flows", icon: GitBranch, items: extractedEntities.dataFlows.map((f) => `${f.from} → ${f.to} (${f.data})`) },
    { title: "Trust boundaries", icon: ShieldCheck, items: extractedEntities.trustBoundaries.map((t) => `${t.name} · ${t.level}`) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Step 2 of 4</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Extracted architecture</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review entities the AI inferred from your inputs.
          </p>
        </div>
        <Link
          to="/app/validation"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform"
        >
          Validate model <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Node graph visual */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold">System graph</h3>
        <div className="mt-4 overflow-x-auto">
          <NodeGraph />
        </div>
      </GlassCard>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <GlassCard key={s.title} className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                <s.icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.items.length} detected</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {s.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/30 px-3 py-2 text-xs font-mono"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span className="truncate">{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function NodeGraph() {
  const nodes = [
    { id: "client", label: "Web Client", x: 80, y: 140, color: "var(--color-chart-1)" },
    { id: "gateway", label: "API Gateway", x: 280, y: 140, color: "var(--color-chart-1)" },
    { id: "auth", label: "Auth Service", x: 480, y: 60, color: "var(--color-chart-2)" },
    { id: "pay", label: "Payment Worker", x: 480, y: 220, color: "var(--color-chart-2)" },
    { id: "db1", label: "users_db", x: 680, y: 60, color: "var(--color-chart-3)" },
    { id: "db2", label: "payments_db", x: 680, y: 220, color: "var(--color-chart-3)" },
  ];
  const edges = [
    ["client", "gateway"],
    ["gateway", "auth"],
    ["gateway", "pay"],
    ["auth", "db1"],
    ["pay", "db2"],
  ];

  const get = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <svg viewBox="0 0 800 300" className="w-full min-w-[700px]">
      <defs>
        <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {edges.map(([a, b]) => {
        const A = get(a), B = get(b);
        return (
          <g key={`${a}-${b}`}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="url(#edge)" strokeWidth="2" />
            <circle r="3" fill="var(--color-chart-1)">
              <animateMotion dur="3s" repeatCount="indefinite" path={`M${A.x},${A.y} L${B.x},${B.y}`} />
            </circle>
          </g>
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="34" fill="oklch(0.21 0.035 265)" stroke={n.color} strokeWidth="2" />
          <circle cx={n.x} cy={n.y} r="34" fill={n.color} fillOpacity="0.1" />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill="oklch(0.95 0.01 240)"
          >
            {n.label.length > 11 ? n.label.slice(0, 10) + "…" : n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
