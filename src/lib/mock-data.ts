export type Severity = "critical" | "high" | "medium" | "low";

export const kpiData = {
  projectsAnalyzed: 248,
  risksDetected: 1432,
  highSeverity: 87,
  reportsGenerated: 196,
  accuracy: 96.4,
};

export const severityDistribution = [
  { name: "Critical", value: 18, color: "var(--color-chart-5)" },
  { name: "High", value: 69, color: "var(--color-chart-4)" },
  { name: "Medium", value: 142, color: "var(--color-chart-1)" },
  { name: "Low", value: 87, color: "var(--color-chart-3)" },
];

export const weeklyTrend = [
  { day: "Mon", risks: 24, mitigated: 18 },
  { day: "Tue", risks: 38, mitigated: 30 },
  { day: "Wed", risks: 31, mitigated: 27 },
  { day: "Thu", risks: 52, mitigated: 41 },
  { day: "Fri", risks: 47, mitigated: 44 },
  { day: "Sat", risks: 22, mitigated: 22 },
  { day: "Sun", risks: 19, mitigated: 17 },
];

export const moduleRisks = [
  { module: "Auth", risks: 28 },
  { module: "Payments", risks: 41 },
  { module: "API Gateway", risks: 36 },
  { module: "Database", risks: 19 },
  { module: "Storage", risks: 12 },
  { module: "Frontend", risks: 9 },
];

export const recentActivity = [
  { project: "fintech-core", risks: 41, status: "Critical", date: "2 min ago" },
  { project: "mobile-banking-api", risks: 18, status: "Healthy", date: "1 hr ago" },
  { project: "ecommerce-checkout", risks: 27, status: "Warning", date: "3 hr ago" },
  { project: "analytics-pipeline", risks: 8, status: "Healthy", date: "Yesterday" },
  { project: "auth-service-v3", risks: 33, status: "Critical", date: "Yesterday" },
  { project: "media-cdn", risks: 5, status: "Healthy", date: "2 days ago" },
];

export const extractedEntities = {
  components: [
    { name: "Web Client", type: "frontend", tech: "React 19" },
    { name: "API Gateway", type: "service", tech: "Node.js" },
    { name: "Auth Service", type: "service", tech: "Go" },
    { name: "Payment Worker", type: "service", tech: "Python" },
    { name: "Notification Hub", type: "service", tech: "Rust" },
  ],
  apis: [
    { path: "/api/auth/login", method: "POST", auth: "Public" },
    { path: "/api/payments/charge", method: "POST", auth: "JWT" },
    { path: "/api/users/me", method: "GET", auth: "JWT" },
    { path: "/api/admin/config", method: "PATCH", auth: "Admin" },
    { path: "/api/webhooks/stripe", method: "POST", auth: "HMAC" },
  ],
  databases: [
    { name: "users_db", engine: "PostgreSQL 16", encrypted: true },
    { name: "payments_db", engine: "PostgreSQL 16", encrypted: true },
    { name: "session_cache", engine: "Redis 7", encrypted: false },
    { name: "analytics_warehouse", engine: "ClickHouse", encrypted: true },
  ],
  roles: [
    { name: "Anonymous", scope: "public" },
    { name: "User", scope: "authenticated" },
    { name: "Merchant", scope: "scoped" },
    { name: "Admin", scope: "elevated" },
    { name: "System", scope: "internal" },
  ],
  dataFlows: [
    { from: "Web Client", to: "API Gateway", data: "Credentials" },
    { from: "API Gateway", to: "Auth Service", data: "Token" },
    { from: "Payment Worker", to: "payments_db", data: "Card data" },
    { from: "API Gateway", to: "Notification Hub", data: "Events" },
  ],
  trustBoundaries: [
    { name: "Public Internet → Edge", level: "high" },
    { name: "Edge → Internal Mesh", level: "medium" },
    { name: "Services → Database", level: "low" },
    { name: "Admin Console → Core", level: "high" },
  ],
};

export const validationChecks = [
  { label: "Components identified", status: "pass" as const },
  { label: "Data flows mapped", status: "pass" as const },
  { label: "Roles assigned", status: "pass" as const },
  { label: "Trust boundaries detected", status: "pass" as const },
  { label: "Public API exposed without rate limit", status: "warn" as const },
  { label: "Sensitive DB externally reachable", status: "warn" as const },
  { label: "Encryption-at-rest enabled", status: "pass" as const },
  { label: "Audit logging configured", status: "pass" as const },
];

export const risks: {
  id: string;
  title: string;
  severity: Severity;
  component: string;
  cause: string;
  recommendation: string;
}[] = [
  {
    id: "R-001",
    title: "Payment API publicly exposed",
    severity: "critical",
    component: "API Gateway",
    cause: "Endpoint /api/payments/charge lacks IP allowlist & rate limiting",
    recommendation: "Add JWT validation, enforce TLS 1.3, apply rate limit, restrict IP",
  },
  {
    id: "R-002",
    title: "Unencrypted PII in session cache",
    severity: "high",
    component: "session_cache",
    cause: "Redis runs without at-rest encryption",
    recommendation: "Enable encryption-at-rest and rotate access tokens",
  },
  {
    id: "R-003",
    title: "Admin endpoint missing MFA",
    severity: "high",
    component: "Auth Service",
    cause: "/api/admin/config accepts password-only auth",
    recommendation: "Require WebAuthn or TOTP for elevated scope",
  },
  {
    id: "R-004",
    title: "Webhook signature not verified",
    severity: "medium",
    component: "API Gateway",
    cause: "/api/webhooks/stripe parses body before HMAC check",
    recommendation: "Verify signature with timing-safe comparison before parse",
  },
  {
    id: "R-005",
    title: "Outdated dependency: lodash 4.17.20",
    severity: "medium",
    component: "Notification Hub",
    cause: "Known prototype pollution CVE-2020-8203",
    recommendation: "Upgrade to lodash 4.17.21+ or replace with native utilities",
  },
  {
    id: "R-006",
    title: "Verbose error stack traces in prod",
    severity: "low",
    component: "Web Client",
    cause: "NODE_ENV not set to production in build pipeline",
    recommendation: "Set NODE_ENV=production and strip stack traces from responses",
  },
  {
    id: "R-007",
    title: "No CSP header configured",
    severity: "medium",
    component: "Web Client",
    cause: "Missing Content-Security-Policy header",
    recommendation: "Apply strict CSP with nonce-based script policy",
  },
];

export const topVulnerableComponents = [
  { name: "API Gateway", risks: 14 },
  { name: "Payment Worker", risks: 11 },
  { name: "Auth Service", risks: 9 },
  { name: "session_cache", risks: 7 },
  { name: "Web Client", risks: 5 },
];

export const reportHistory = [
  { id: "RPT-2046", project: "fintech-core", date: "Apr 26, 2026", score: 88, grade: "A", critical: 1, high: 4, medium: 9, low: 12 },
  { id: "RPT-2042", project: "mobile-banking-api", date: "Apr 24, 2026", score: 74, grade: "B", critical: 2, high: 7, medium: 11, low: 8 },
  { id: "RPT-2038", project: "ecommerce-checkout", date: "Apr 22, 2026", score: 65, grade: "C", critical: 4, high: 9, medium: 13, low: 7 },
  { id: "RPT-2031", project: "analytics-pipeline", date: "Apr 18, 2026", score: 92, grade: "A", critical: 0, high: 2, medium: 5, low: 3 },
  { id: "RPT-2025", project: "auth-service-v3", date: "Apr 14, 2026", score: 58, grade: "D", critical: 5, high: 12, medium: 14, low: 9 },
];
