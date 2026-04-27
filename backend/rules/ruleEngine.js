/**
 * ruleEngine.js
 * Core rule evaluation engine for the Hybrid AI Security Risk Detection Platform.
 * Strictly evidence-based evaluation.
 */

const rules = require('./rules.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toSet = (arr) => new Set((arr || []).map((s) => String(s).toLowerCase()));

const anyContains = (arr, keywords) =>
  (arr || []).some((item) =>
    keywords.some((kw) => String(item).toLowerCase().includes(kw))
  );

// Confidence scoring logic: High (80–100), Medium (50–79), Low (<50)
const computeConfidence = (evidencePoints) => {
  const totalWeight = evidencePoints.reduce((s, e) => s + e.weight, 0);
  const matchedWeight = evidencePoints
    .filter((e) => e.present)
    .reduce((s, e) => s + e.weight, 0);
  return totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);
};

// ─── Rule Conditions ──────────────────────────────────────────────────────────

const ruleConditions = {
  // R01 – Sensitive Data Exposure
  // IF sensitive_data exists AND trust_boundaries.length === 0
  R01(m) {
    const hasSensitiveData = (m.sensitive_data || []).length > 0;
    const hasNoBoundaries = (m.trust_boundaries || []).length === 0;
    if (!hasSensitiveData) return null; // strictly evidence-based
    const triggered = hasNoBoundaries;
    const confidence = computeConfidence([
      { present: hasSensitiveData, weight: 3 },
      { present: hasNoBoundaries, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R02 – Direct Database Access Without Intermediate Layer
  R02(m) {
    const hasDatabases = (m.databases || []).length > 0;
    const hasDataFlows = (m.data_flows || []).length > 0;
    if (!hasDatabases || !hasDataFlows) return null;

    const dbKeywords = (m.databases || []).map((d) => d.toLowerCase());
    const apiKeywords = [...(m.apis || []).map((a) => a.toLowerCase()), 'api', 'service', 'gateway'];

    const directFlows = (m.data_flows || []).filter((flow) => {
      const f = flow.toLowerCase();
      const refDb = dbKeywords.some((db) => f.includes(db)) || f.includes('database') || f.includes('db');
      const hasMiddleware = apiKeywords.some((api) => f.includes(api));
      return refDb && !hasMiddleware;
    });

    const triggered = directFlows.length > 0;
    const confidence = computeConfidence([
      { present: hasDatabases, weight: 2 },
      { present: triggered, weight: 3 },
      { present: (m.apis || []).length === 0, weight: 1 },
    ]);
    return { triggered, rawAffected: m.databases || [], confidence };
  },

  // R03 – Missing API Layer
  // IF data_flows exist AND apis.length === 0
  R03(m) {
    const hasDataFlows = (m.data_flows || []).length > 0;
    const hasNoApis = (m.apis || []).length === 0;
    if (!hasDataFlows) return null;
    const triggered = hasNoApis;
    const confidence = computeConfidence([
      { present: hasDataFlows, weight: 2 },
      { present: hasNoApis, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R04 – User Roles Without Access Control Boundaries
  R04(m) {
    const hasRoles = (m.user_roles || []).length > 0;
    const hasNoBoundaries = (m.trust_boundaries || []).length === 0;
    if (!hasRoles) return null;
    const triggered = hasNoBoundaries;
    const confidence = computeConfidence([
      { present: hasRoles, weight: 2 },
      { present: hasNoBoundaries, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R05 – Unused Database
  // IF databases exist AND no data flow references them
  R05(m) {
    const hasDatabases = (m.databases || []).length > 0;
    if (!hasDatabases) return null;
    const dbKeywords = (m.databases || []).map((d) => d.toLowerCase());
    
    // Find databases that aren't referenced in any flow
    const unusedDbs = (m.databases || []).filter(db => {
        const dbLower = db.toLowerCase();
        const isReferenced = (m.data_flows || []).some(f => f.toLowerCase().includes(dbLower));
        return !isReferenced;
    });

    const triggered = unusedDbs.length > 0;
    const confidence = computeConfidence([
      { present: hasDatabases, weight: 2 },
      { present: triggered, weight: 3 },
    ]);
    return { triggered, rawAffected: unusedDbs, confidence };
  },

  // R07 – External Dependencies Without Trust Boundaries
  // ONLY evaluate external dependency risks if: external_dependencies.length > 0
  R07(m) {
    const hasExtDeps = (m.external_dependencies || []).length > 0;
    if (!hasExtDeps) return null;
    const hasNoBoundaries = (m.trust_boundaries || []).length === 0;
    const triggered = hasNoBoundaries;
    const confidence = computeConfidence([
      { present: hasExtDeps, weight: 3 },
      { present: hasNoBoundaries, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R09 – Sensitive Data Transmitted Without Encryption Reference
  R09(m) {
    const hasSensitiveData = (m.sensitive_data || []).length > 0;
    const hasDataFlows = (m.data_flows || []).length > 0;
    if (!hasSensitiveData || !hasDataFlows) return null;

    const encryptionKeywords = ['tls', 'ssl', 'https', 'encrypt', 'secure', 'aes', 'rsa'];
    const hasEncryptionRef =
      anyContains(m.data_flows, encryptionKeywords) ||
      anyContains(m.trust_boundaries, encryptionKeywords);

    const triggered = !hasEncryptionRef;
    const confidence = computeConfidence([
      { present: hasSensitiveData, weight: 3 },
      { present: hasDataFlows, weight: 2 },
      { present: !hasEncryptionRef, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R10 – APIs Present Without Authentication Reference
  R10(m) {
    const hasApis = (m.apis || []).length > 0;
    if (!hasApis) return null;

    const authKeywords = ['auth', 'jwt', 'oauth', 'token', 'api key', 'apikey', 'bearer', 'session', 'login'];
    const hasAuthRef =
      anyContains(m.apis, authKeywords) ||
      anyContains(m.components, authKeywords) ||
      anyContains(m.trust_boundaries, authKeywords) ||
      anyContains(m.data_flows, authKeywords);

    const triggered = !hasAuthRef;
    const confidence = computeConfidence([
      { present: hasApis, weight: 2 },
      { present: !hasAuthRef, weight: 3 }
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R11 – Insecure Communication
  // IF data_flows exist AND trust_boundaries.length === 0
  R11(m) {
    const hasDataFlows = (m.data_flows || []).length > 0;
    if (!hasDataFlows) return null;
    const hasNoBoundaries = (m.trust_boundaries || []).length === 0;
    const triggered = hasNoBoundaries;
    const confidence = computeConfidence([
      { present: hasDataFlows, weight: 2 },
      { present: hasNoBoundaries, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R12 – SQL Injection Risk (APIs Directly Accessing Databases)
  R12(m) {
    const hasApis = (m.apis || []).length > 0;
    const hasDatabases = (m.databases || []).length > 0;
    if (!hasApis || !hasDatabases) return null;

    const validationKeywords = ['orm', 'validation', 'sanitiz', 'parameteriz', 'prepared', 'middleware', 'input validation'];
    const hasValidationRef =
      anyContains(m.components, validationKeywords) ||
      anyContains(m.apis, validationKeywords) ||
      anyContains(m.data_flows, validationKeywords);

    const triggered = !hasValidationRef;
    const confidence = computeConfidence([
      { present: hasApis, weight: 2 },
      { present: hasDatabases, weight: 2 },
      { present: !hasValidationRef, weight: 3 },
    ]);
    return { triggered, rawAffected: m.databases || [], confidence };
  },

  // R14 – External Dependencies With No Validation / Gateway Layer
  // ONLY evaluate external dependency risks if: external_dependencies.length > 0
  R14(m) {
    const hasExtDeps = (m.external_dependencies || []).length > 0;
    if (!hasExtDeps) return null;

    const gatewayKeywords = ['gateway', 'proxy', 'firewall', 'waf', 'validator', 'api gateway'];
    const hasGateway =
      anyContains(m.components, gatewayKeywords) ||
      anyContains(m.apis, gatewayKeywords) ||
      anyContains(m.trust_boundaries, gatewayKeywords);

    const triggered = !hasGateway;
    const confidence = computeConfidence([
      { present: hasExtDeps, weight: 3 },
      { present: !hasGateway, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R18 – Insecure Direct Object Reference Risk
  R18(m) {
    const hasRoles = (m.user_roles || []).length > 0;
    const hasDatabases = (m.databases || []).length > 0;
    if (!hasRoles || !hasDatabases) return null;

    const dbKeywords = (m.databases || []).map((d) => d.toLowerCase());
    const roleKeywords = (m.user_roles || []).map((r) => r.toLowerCase());

    const directRoleDbFlow = (m.data_flows || []).some((flow) => {
      const f = flow.toLowerCase();
      const refRole = roleKeywords.some((r) => f.includes(r));
      const refDb = dbKeywords.some((db) => f.includes(db)) || f.includes('database') || f.includes('db');
      const hasAuthCheck = ['auth', 'permission', 'rbac', 'acl', 'authoriz'].some((kw) => f.includes(kw));
      return refRole && refDb && !hasAuthCheck;
    });

    const triggered = directRoleDbFlow;
    const confidence = computeConfidence([
      { present: hasRoles, weight: 2 },
      { present: hasDatabases, weight: 2 },
      { present: directRoleDbFlow, weight: 3 },
    ]);
    return { triggered, rawAffected: m.databases || [], confidence };
  },

  // R19 – Privilege Escalation Risk — Multiple Roles Without Boundaries
  R19(m) {
    const roleCount = (m.user_roles || []).length;
    if (roleCount < 2) return null;
    const hasNoBoundaries = (m.trust_boundaries || []).length === 0;
    const triggered = hasNoBoundaries;
    const confidence = computeConfidence([
      { present: roleCount >= 2, weight: 2 },
      { present: hasNoBoundaries, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },

  // R20 – Unprotected Admin / Privileged Role
  R20(m) {
    const privilegedKeywords = ['admin', 'root', 'superuser', 'administrator', 'privileged', 'super admin'];
    const privilegedRoles = (m.user_roles || []).filter((r) =>
      privilegedKeywords.some((kw) => r.toLowerCase().includes(kw))
    );
    if (privilegedRoles.length === 0) return null;

    const hasNoBoundaries = (m.trust_boundaries || []).length === 0;
    const triggered = hasNoBoundaries;
    const confidence = computeConfidence([
      { present: privilegedRoles.length > 0, weight: 3 },
      { present: hasNoBoundaries, weight: 3 },
    ]);
    return { triggered, rawAffected: m.components || [], confidence };
  },
};

// ─── Main Engine ───────────────────────────────────────────────────────────────

function runRuleEngine(architectureModel) {
  if (!architectureModel || typeof architectureModel !== 'object') {
    return [];
  }

  // CRITICAL FIX 4: Data Flow Dependency
  if ((architectureModel.data_flows || []).length === 0) {
    return [{
      id: "R000",
      name: "Insufficient Architecture Detail",
      severity: "Medium",
      affected_components: [],
      cause: "No data flows defined in architecture",
      description: "Security risks cannot be determined without system interactions",
      recommendation: [
        "Define data flows between components",
        "Provide interaction details"
      ],
      confidence: 90
    }];
  }

  const detectedRisks = [];
  
  // CRITICAL FIX 2: Strict Entity Validation (components OR databases)
  const allComponents = [
      ...(architectureModel.components || []), 
      ...(architectureModel.databases || [])
  ];
  const validEntitiesSet = new Set(allComponents);

  for (const rule of rules) {
    const conditionFn = ruleConditions[rule.id];

    if (typeof conditionFn !== 'function') {
      console.warn(`[RuleEngine] No condition function found for rule ${rule.id}. Skipping.`);
      continue;
    }

    let result;
    try {
      result = conditionFn(architectureModel);
    } catch (err) {
      console.error(`[RuleEngine] Error evaluating rule ${rule.id}:`, err.message);
      continue;
    }

    if (result === null) continue;

    const { triggered, rawAffected, confidence } = result;

    if (!triggered) continue;

    // Strict Entity Validation logic
    const validAffectedComponents = rawAffected.filter(c => validEntitiesSet.has(c));
    
    if (validAffectedComponents.length === 0) {
      continue; // Discard risk if no components matched strict entity validation
    }

    detectedRisks.push({
      id: rule.id,
      name: rule.name,
      severity: rule.severity,
      affected_components: validAffectedComponents,
      cause: rule.cause || rule.description,
      description: rule.description,
      recommendation: rule.recommendation || [],
      confidence
    });
  }

  const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  detectedRisks.sort(
    (a, b) =>
      (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
  );

  return detectedRisks;
}

module.exports = { runRuleEngine };
