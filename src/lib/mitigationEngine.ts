export type RiskSeverity = "high" | "medium" | "low";
export type MitigationPriority = "Immediate" | "Planned" | "Advisory";
export type MitigationEffort = "High" | "Medium" | "Low";
export type MitigationStatus = "Pending" | "Fixed";

export interface DetectedRiskInput {
  id: string;
  risk_name?: string;
  name?: string;
  title?: string;
  severity: string;
  summary?: string;
  description?: string;
  affected_modules?: string[];
  affected_components?: string[];
  category?: string;
  score?: number;
  confidence?: number;
}

export interface Mitigation {
  id: string;
  risk_id: string;
  risk_name: string;
  severity: RiskSeverity;
  category: string;
  priority: MitigationPriority;
  effort: MitigationEffort;
  recommendation: string;
  steps: string[];
  impact: string;
  status: MitigationStatus;
  affected_modules: string[];
}

interface RuleMatch {
  title: string;
  recommendation: string;
  steps: string[];
  effort: MitigationEffort;
  impact: string;
}

function normalizeSeverity(value: string): RiskSeverity {
  const severity = String(value || "").toLowerCase();
  if (severity === "critical" || severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function priorityFromSeverity(severity: RiskSeverity): MitigationPriority {
  if (severity === "high") return "Immediate";
  if (severity === "medium") return "Planned";
  return "Advisory";
}

const ruleBook: Array<{ matcher: RegExp; build: (riskName: string) => RuleMatch }> = [
  {
    matcher: /missing encryption|unencrypted|plaintext/i,
    build: () => ({
      title: "Enforce End-to-End Encryption",
      recommendation:
        "Protect data in transit and at rest with TLS/HTTPS, strong encryption standards, and managed key lifecycle.",
      steps: [
        "Enforce TLS 1.2+ on all external and internal service communication.",
        "Encrypt sensitive data at rest using AES-256 with managed keys.",
        "Implement automated key rotation and key access audit trails.",
      ],
      effort: "High",
      impact: "Significantly reduces exposure of sensitive data across traffic and storage paths.",
    }),
  },
  {
    matcher: /excessive privilege|over-privileged|least privilege/i,
    build: () => ({
      title: "Apply Least Privilege Access Controls",
      recommendation:
        "Introduce role-based access control and periodic entitlement review to reduce privilege abuse risk.",
      steps: [
        "Define RBAC roles per function and remove wildcard permissions.",
        "Restrict service-to-service permissions to required actions only.",
        "Run monthly role and permission audits with approval workflow.",
      ],
      effort: "Medium",
      impact: "Lowers lateral movement risk and minimizes blast radius for compromised identities.",
    }),
  },
  {
    matcher: /public api exposure|exposed api|open api/i,
    build: () => ({
      title: "Harden Public API Surface",
      recommendation:
        "Protect internet-facing APIs with centralized policy enforcement and abuse controls.",
      steps: [
        "Route public APIs through an API gateway with authentication checks.",
        "Require signed access tokens for all protected endpoints.",
        "Add rate limiting and IP allow/deny policies for abuse protection.",
      ],
      effort: "Low",
      impact: "Reduces unauthorized API access and volumetric abuse.",
    }),
  },
  {
    matcher: /insecure data flow|unsafe data flow|untrusted flow/i,
    build: () => ({
      title: "Secure Inter-Service Data Flows",
      recommendation:
        "Harden communication paths by enforcing trust boundaries, encryption, and validation checkpoints.",
      steps: [
        "Encrypt service-to-service traffic in internal networks.",
        "Define and enforce trust boundaries between critical zones.",
        "Add schema validation and integrity checks at data exchange points.",
      ],
      effort: "High",
      impact: "Improves integrity and confidentiality of internal data movement.",
    }),
  },
  {
    matcher: /weak authentication|weak auth|missing mfa|credential stuffing/i,
    build: () => ({
      title: "Strengthen Authentication Controls",
      recommendation:
        "Improve identity assurance using modern auth controls and session hardening.",
      steps: [
        "Enable MFA for privileged and high-risk user flows.",
        "Use short-lived JWTs with rotation and revocation support.",
        "Adopt OAuth2/OpenID Connect and add brute-force throttling controls.",
      ],
      effort: "Medium",
      impact: "Decreases account takeover likelihood and session abuse.",
    }),
  },
  {
    matcher: /sensitive database exposure|exposed database|public database/i,
    build: () => ({
      title: "Isolate and Protect Data Stores",
      recommendation:
        "Restrict database exposure via network isolation and secure secret handling.",
      steps: [
        "Move data stores to private subnet and deny public ingress.",
        "Store DB credentials in a secret vault with rotation policies.",
        "Enable data access audit logging and anomaly alerting.",
      ],
      effort: "High",
      impact: "Prevents direct data store abuse and improves detection of unauthorized access.",
    }),
  },
  {
    matcher: /hardcoded secrets|embedded key|secret in code/i,
    build: () => ({
      title: "Remove Hardcoded Credentials",
      recommendation: "Externalize secrets from code and enforce a managed secret lifecycle.",
      steps: [
        "Replace in-code secrets with environment or secret manager references.",
        "Rotate affected credentials and invalidate previous values immediately.",
        "Add pre-commit secret scanning and CI gate checks.",
      ],
      effort: "Medium",
      impact: "Eliminates credential leakage pathways from source control and build artifacts.",
    }),
  },
  {
    matcher: /open storage bucket|public bucket|misconfigured bucket/i,
    build: () => ({
      title: "Lock Down Object Storage Access",
      recommendation: "Make storage private by default and issue controlled temporary access.",
      steps: [
        "Set private ACLs and block public object listing.",
        "Use signed URLs with short expirations for object access.",
        "Apply explicit bucket policy constraints and monitor policy drift.",
      ],
      effort: "Low",
      impact: "Prevents accidental data exposure from object storage misconfiguration.",
    }),
  },
];

function genericMitigation(riskName: string): RuleMatch {
  return {
    title: `Secure Design Remediation for ${riskName}`,
    recommendation:
      "Apply secure-by-design controls across access, data handling, and network boundaries for this risk.",
    steps: [
      "Validate access control and enforce least privilege on affected modules.",
      "Harden data paths with encryption, input validation, and trust boundaries.",
      "Add logging, alerting, and recurring architecture security review checks.",
    ],
    effort: "Medium",
    impact: "Improves baseline resilience and reduces recurrence of architecture-level weaknesses.",
  };
}

function resolveRule(riskName: string): RuleMatch {
  const matched = ruleBook.find((rule) => rule.matcher.test(riskName));
  return matched ? matched.build(riskName) : genericMitigation(riskName);
}

export function buildMitigations(detectedRisks: DetectedRiskInput[]): Mitigation[] {
  return detectedRisks.map((risk, index) => {
    const riskName = risk.risk_name || risk.name || risk.title || "Unspecified Risk";
    const severity = normalizeSeverity(risk.severity);
    const priority = priorityFromSeverity(severity);
    const rule = resolveRule(riskName);
    const affectedModules = risk.affected_modules || risk.affected_components || [];

    return {
      id: `MIT-${index + 1}-${risk.id}`,
      risk_id: risk.id,
      risk_name: riskName,
      severity,
      category: risk.category || "Architecture Security",
      priority,
      effort: rule.effort,
      recommendation: rule.recommendation,
      steps: rule.steps,
      impact: rule.impact,
      status: "Pending",
      affected_modules: affectedModules,
    };
  });
}

export function calculateHealthScore(mitigations: Mitigation[]): number {
  let score = 100;
  mitigations.forEach((m) => {
    if (m.status === "Fixed") return;
    if (m.severity === "high") score -= 18;
    else if (m.severity === "medium") score -= 10;
    else score -= 5;
  });
  return Math.max(0, score);
}
