# AI-Powered Software Security Risk Detection Platform

A premium, futuristic cybersecurity SaaS dashboard with 8 fully designed pages, glassmorphism UI, and a cohesive dark cyber-AI aesthetic.

## Design System

**Theme tokens (added to `src/styles.css`):**
- Background: deep navy gradient `#0b1020` → `#0a0e1f` with subtle radial glows
- Primary accent: electric cyan `oklch(0.78 0.18 210)` with neon glow
- Secondary accent: vibrant purple `oklch(0.65 0.25 295)`
- Status colors: success green, warning amber, danger red
- Glassmorphism: `backdrop-blur` + translucent borders + inner glow
- Typography: Inter (UI) + JetBrains Mono (code/metrics)
- Custom utilities: `.glass-card`, `.neon-border`, `.glow-cyan`, `.glow-purple`, animated grid background, scanning line, pulse-glow, gradient text

**Shared components:**
- `AppShell` — sidebar + topbar layout for authenticated/app pages
- `Sidebar` — collapsible nav with icon mode, active route glow
- `Topbar` — search, notifications, user menu
- `GlassCard`, `KpiCard`, `StatusBadge`, `SeverityPill`
- `CyberBackground` — animated grid + floating orbs + particle network
- Reusable charts (Recharts): theme-styled pie, line, bar with neon strokes

## Routes (TanStack Start file-based)

```text
src/routes/
  __root.tsx              shell + global meta
  index.tsx               Landing
  app.tsx                 Layout (sidebar + topbar)
  app.dashboard.tsx       Dashboard
  app.input.tsx           Smart Input
  app.extraction.tsx      AI Extraction
  app.validation.tsx      Validation
  app.analyze.tsx         Analyze Results
  app.mitigation.tsx      Dynamic Mitigation
  app.reports.tsx         Reports
```

Each route gets its own `head()` with unique title + description + og tags.

## Page Specs

**1. Landing (`/`)**
- Animated hero: glowing network/particle canvas, gradient headline, dual CTAs ("Get Started" → `/app/dashboard`, "Live Demo")
- Trust strip with logos placeholder
- Features grid (5 glass cards with icons): AI Architecture Extraction, Risk Detection Engine, ML Severity Scoring, Dynamic Mitigation, PDF Reports
- "How it works" 3-step timeline
- Stats band (projects scanned, risks mitigated, accuracy)
- Footer with CTA

**2. Dashboard (`/app/dashboard`)**
- 5 KPI cards with sparkline + delta: Projects Analyzed, Risks Detected, High Severity, Reports Generated, Accuracy %
- Charts row: Severity donut (Recharts), Weekly Risk Trend (area/line), Module Risk Bar
- Recent Activity table: Project / Risks / Status / Date with status pills

**3. Smart Input (`/app/input`)**
- Tabbed/grid of 6 premium upload cards with drag-drop:
  - GitHub Repo URL (input + connect button)
  - Architecture Image (drop zone)
  - UML/Flowchart (drop zone)
  - PDF/Docs (drop zone)
  - Paste Code Snippet (Monaco-style textarea)
  - Advanced JSON Input (textarea with format helper)
- Footer "Continue → AI Extraction"

**4. AI Extraction (`/app/extraction`)**
- Initial loading state: animated cyber scanner ring + status text cycling ("Parsing repo… Mapping components… Identifying trust boundaries…")
- After completion: 6 category cards (Components, APIs, Databases, Roles, Data Flows, Trust Boundaries) each listing extracted entities
- Visual node graph (SVG-based interactive flow showing components ↔ APIs ↔ DB)

**5. Validation (`/app/validation`)**
- Big circular progress: "Architecture Readiness 92%"
- Checklist with mixed pass/warn states
- Side panel: detected issues count + severity legend
- Footer: Back / Run Analysis (primary glow)

**6. Analyze Results (`/app/analyze`)**
- 5 KPI cards: Total Risks, High, Medium, Low, Confidence %
- Charts: Severity distribution (donut), Top Vulnerable Components (horizontal bar)
- Filterable risks table: Risk / Severity / Component / Cause / Recommendation with row expansion

**7. Dynamic Mitigation (`/app/mitigation`)**
- Hero score panel: "Architecture Health 88 / Grade A" with radial gauge
- Prioritized fix cards (sorted by severity), each with title, affected component, recommendation list with checkboxes, "Apply Fix" CTA
- Before/After mini-stats

**8. Reports (`/app/reports`)**
- Action bar: Download PDF, Export CSV, New Report
- History table with project, date, score, severity counts, actions
- Compare drawer: pick two scans → side-by-side delta view

## Mock Data

Static mock data in `src/lib/mock-data.ts` (projects, risks, components, history). Realistic security-flavored content (e.g., "Payment API publicly exposed", "Unencrypted PII in transit").

## Technical Notes

- TanStack Start v1, file-based routing under `src/routes/`
- Tailwind v4 via `src/styles.css` `@theme inline` tokens
- shadcn/ui primitives already installed (Card, Button, Table, Tabs, Progress, Badge, Sidebar, Dialog, Dropdown)
- Recharts for charts (theme-tinted strokes/fills via CSS vars)
- lucide-react icons (Shield, ShieldAlert, Activity, GitBranch, Cpu, Database, etc.)
- All animations via Tailwind keyframes + tw-animate-css; respect `prefers-reduced-motion`
- Fully responsive (mobile sidebar collapses to sheet)
- No backend required for the demo — purely frontend with mock data; later we can wire Lovable Cloud + AI Gateway for real extraction/scoring

## Out of Scope (for this pass)
- Real auth, real repo cloning, actual AI inference
- Persistence (history is mocked)
- PDF generation backend (button can trigger a client-side print-to-PDF stub)

After approval I'll build all 8 pages, the design system, shared shell, mock data, and charts in one pass.