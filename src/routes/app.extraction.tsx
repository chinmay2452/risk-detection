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
  const [aiData, setAiData] = useState<any>(null);

  useEffect(() => {
    async function performExtraction() {
      try {
        const extractedText = sessionStorage.getItem("extractedText");
        if (extractedText) {
          const res = await fetch("http://localhost:5000/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ extractedText })
          });
          const json = await res.json();
          if (json.success) setAiData(json.data);
        }
      } catch (err) {
        console.error("Extraction error:", err);
      }
      setDone(true);
    }

    if (phase >= phases.length - 1) {
      const t = setTimeout(() => performExtraction(), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase((p) => p + 1), 650);
    return () => clearTimeout(t);
  }, [phase]);

  if (!done) return <ExtractionLoading phase={phase} />;
  
  // If no data or failed, you can handle it or show mock data
  const dataToUse = aiData || {
    components: ["Failed to load AI data"],
    apis: [], databases: [], user_roles: [], data_flows: [], trust_boundaries: []
  };

  return <ExtractionResults data={dataToUse} />;
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

function ExtractionResults({ data }: { data: any }) {
  const sections = [
    { title: "Components", icon: Boxes, items: data.components || [] },
    { title: "APIs", icon: Globe, items: data.apis || [] },
    { title: "Databases", icon: Database, items: data.databases || [] },
    { title: "Roles", icon: Users, items: data.user_roles || [] },
    { title: "Data flows", icon: GitBranch, items: data.data_flows || [] },
    { title: "Trust boundaries", icon: ShieldCheck, items: data.trust_boundaries || [] },
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


