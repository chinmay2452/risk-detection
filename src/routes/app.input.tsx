import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Braces,
  Code2,
  FileText,
  Github,
  Image as ImageIcon,
  Network,
  Upload,
} from "lucide-react";
import { useState, useEffect, type DragEvent } from "react";
import { GlassCard } from "@/components/cyber/GlassCard";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/input")({
  head: () => ({
    meta: [
      { title: "Smart Input — SentinelAI" },
      { name: "description", content: "Connect a repository or upload artifacts to begin AI-powered security analysis." },
    ],
  }),
  component: SmartInput,
});

function SmartInput() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Step 1 of 4</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Smart Input</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Drop in any combination of repo, diagrams, docs or code. Our extraction engine fuses
          everything into a single architecture model.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* RepoCard removed as per requirements */}
        <DropZoneCard
          icon={ImageIcon}
          title="Architecture image"
          desc="PNG, JPG, SVG up to 20MB"
          accept="image/*"
        />
        <DropZoneCard
          icon={Network}
          title="UML / Flowchart"
          desc="UML, draw.io, Mermaid exports"
          accept=".xml,.svg,image/*"
        />
        <DropZoneCard
          icon={FileText}
          title="PDF / Documents"
          desc="Specs, threat models, audits"
          accept=".pdf,.docx,.md"
        />
        <CodeSnippetCard />
        <JsonCard />
      </div>

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        <Link
          to="/app/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          Cancel
        </Link>
        <Link
          to="/app/extraction"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px] shadow-primary hover:scale-[1.02] transition-transform"
        >
          Continue to extraction <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function RepoCard() {
  const [url, setUrl] = useState("");
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <Github className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">GitHub Repository</h3>
          <p className="text-xs text-muted-foreground">Public or connected via OAuth</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/org/repo"
          className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          className="w-full rounded-lg bg-primary/15 py-2 text-sm font-medium text-primary ring-1 ring-primary/30 hover:bg-primary/25 transition-colors"
        >
          Connect repository
        </button>
      </div>
    </GlassCard>
  );
}

function DropZoneCard({
  icon: Icon,
  title,
  desc,
  accept,
}: {
  icon: typeof Upload;
  title: string;
  desc: string;
  accept: string;
}) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function handleFileUpload(selectedFile: File) {
    if (!selectedFile) return;
    setFile(selectedFile.name);
    setUploading(true);
    setStatusMsg("Uploading...");

    const formData = new FormData();
    formData.append("files", selectedFile);

    try {
      const response = await fetch(apiUrl("/api/upload"), {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMsg("Upload success!");
        if (data.data && data.data[0] && data.data[0].extractedText) {
          sessionStorage.setItem("extractedText", data.data[0].extractedText);
          sessionStorage.setItem("filePath", data.data[0].filePath);
          let type = "text";
          if (title.toLowerCase().includes("image")) type = "image";
          if (title.toLowerCase().includes("uml")) type = "uml";
          if (title.toLowerCase().includes("pdf")) type = "pdf";
          if (title.toLowerCase().includes("json")) type = "json";
          sessionStorage.setItem("inputType", type);
        }
      } else {
        setStatusMsg(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      setStatusMsg("Connection error");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileUpload(f);
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary/15 ring-1 ring-secondary/30">
          <Icon className="size-5 text-secondary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "mt-4 flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors",
          drag
            ? "border-primary bg-primary/10"
            : "border-border/60 bg-background/30 hover:border-primary/50 hover:bg-primary/5",
          uploading ? "opacity-50 cursor-not-allowed" : ""
        )}
      >
        <Upload className="size-5 text-muted-foreground" />
        {file ? (
          <div className="mt-2 text-center">
            <p className="truncate px-3 text-xs font-mono text-primary">{file}</p>
            {statusMsg && <p className="mt-1 text-[10px] text-muted-foreground">{statusMsg}</p>}
          </div>
        ) : (
          <>
            <p className="mt-2 text-xs">
              <span className="font-medium text-primary">Click to upload</span> or drag &amp; drop
            </p>
            <p className="text-[10px] text-muted-foreground">{accept}</p>
          </>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
          }}
        />
      </label>
    </GlassCard>
  );
}

function CodeSnippetCard() {
  const defaultCode = `// Paste your code here\nexport async function handler(req) {\n  const body = await req.json();\n  return Response.json(body);\n}`;
  const [code, setCode] = useState(defaultCode);

  useEffect(() => {
    // Only set on mount if nothing else is there, or just let it be.
    // Actually, setting it on mount might overwrite the file upload.
    // Let's only set it if there's no extractedText
    if (!sessionStorage.getItem("extractedText")) {
      sessionStorage.setItem("extractedText", defaultCode);
      sessionStorage.setItem("inputType", "code");
    }
  }, []);

  const handleUpdate = (val: string) => {
    setCode(val);
    sessionStorage.setItem("extractedText", val);
    sessionStorage.setItem("inputType", "code");
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-warning/15 ring-1 ring-warning/30">
          <Code2 className="size-5 text-warning" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Paste code snippet</h3>
          <p className="text-xs text-muted-foreground">Single file or function</p>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => handleUpdate(e.target.value)}
        onFocus={(e) => handleUpdate(e.target.value)}
        rows={6}
        className="mt-4 w-full rounded-lg border border-border bg-background/40 p-3 text-xs font-mono leading-relaxed placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </GlassCard>
  );
}

function JsonCard() {
  const defaultJson = `{\n  "components": ["Frontend UI", "Auth Service"],\n  "apis": ["REST API"],\n  "databases": ["PostgreSQL"],\n  "trustBoundaries": ["VPC"]\n}`;
  const [jsonStr, setJsonStr] = useState(defaultJson);

  useEffect(() => {
    if (!sessionStorage.getItem("extractedText")) {
      sessionStorage.setItem("extractedText", defaultJson);
      sessionStorage.setItem("inputType", "json");
    }
  }, []);

  const handleUpdate = (val: string) => {
    setJsonStr(val);
    sessionStorage.setItem("extractedText", val);
    sessionStorage.setItem("inputType", "json");
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-success/15 ring-1 ring-success/30">
          <Braces className="size-5 text-success" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Advanced JSON input</h3>
          <p className="text-xs text-muted-foreground">Pre-defined system model</p>
        </div>
      </div>
      <textarea
        value={jsonStr}
        onChange={(e) => handleUpdate(e.target.value)}
        onFocus={(e) => handleUpdate(e.target.value)}
        rows={6}
        className="mt-4 w-full rounded-lg border border-border bg-background/40 p-3 text-xs font-mono leading-relaxed placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="button"
        className="mt-2 text-xs font-medium text-primary hover:underline"
      >
        Format JSON
      </button>
    </GlassCard>
  );
}
