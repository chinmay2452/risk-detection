/**
 * riskAnalysisService.js
 * Hybrid service: tries AI-powered analysis first, falls back to the rule engine.
 * Returns a unified risk format: { id, name, severity, affected_components,
 *   cause, description, recommendation[], confidence }
 */

const aiService = require('./ai.service');
const { runRuleEngine } = require('../rules/ruleEngine');

/**
 * Analyse a validated architecture model and return structured security risks.
 * @param {Object} architectureModel - Validated architecture JSON
 * @returns {Promise<{ risks: Array, summary: Object, source: string }>}
 */
async function analyseArchitecture(architectureModel) {
  if (!architectureModel || typeof architectureModel !== 'object') {
    throw new Error('Invalid architecture model provided to risk analysis service.');
  }

  let risks = null;
  let source = 'rule-engine';

  // ── Step 1: Try AI-powered grounded analysis ──────────────────────────────
  try {
    const aiRisks = await aiService.analyzeArchitectureWithAI(architectureModel);
    if (aiRisks && Array.isArray(aiRisks)) {
      risks = aiRisks;
      source = 'ai';
      console.log(`[RiskAnalysis] AI analysis succeeded. ${risks.length} risk(s) detected.`);
    }
  } catch (err) {
    console.warn('[RiskAnalysis] AI analysis threw unexpectedly:', err.message);
  }

  // ── Step 2: Fall back to rule engine if AI unavailable or returned null ───
  if (!risks) {
    console.log('[RiskAnalysis] Falling back to rule engine.');
    risks = runRuleEngine(architectureModel);
    source = 'rule-engine';
  }

  // ── Step 3: Apply Severity Scoring (AI/ML-inspired) ───────────────────────
  if (risks && risks.length > 0) {
    const { refineRisks } = require('./severityScoringService');
    risks = refineRisks(risks, architectureModel);
    console.log('[RiskAnalysis] Severity scoring applied to refine risks.');
  }

  // ── Step 4: Apply Mitigation Engine ────────────────────────────────────────
  if (risks && risks.length > 0) {
    const { generateMitigations } = require('./mitigationEngineService');
    // We optionally merge the mitigations back into the risk objects or use them as generated
    // The user strictly requested specific fields, so we map them to ensure we meet the output format,
    // but in a real pipeline we might retain 'description' and 'cause' for the UI.
    // For now, we will use the mitigation engine to transform the risks.
    risks = generateMitigations(risks);
    console.log('[RiskAnalysis] Mitigation engine applied to generate recommendations.');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const summary = buildSummary(risks, source);

  return { risks, summary };
}

/**
 * Build a summary object from the detected risks.
 */
function buildSummary(risks, source) {
  const normalize = (s) => (s || '').toLowerCase();

  return {
    total: risks.length,
    critical: risks.filter((r) => normalize(r.severity) === 'critical').length,
    high:     risks.filter((r) => normalize(r.severity) === 'high').length,
    medium:   risks.filter((r) => normalize(r.severity) === 'medium').length,
    low:      risks.filter((r) => normalize(r.severity) === 'low').length,
    overallRiskLevel: deriveOverallRiskLevel(risks),
    readyForMLScoring: risks.length > 0,
    source, // 'ai' | 'rule-engine'
  };
}

/**
 * Derive a single overall risk level from the detected risks.
 */
function deriveOverallRiskLevel(risks) {
  const severities = new Set(risks.map((r) => (r.severity || '').toLowerCase()));
  if (severities.has('critical')) return 'Critical';
  if (severities.has('high'))     return 'High';
  if (severities.has('medium'))   return 'Medium';
  if (severities.has('low'))      return 'Low';
  return 'None';
}

module.exports = { analyseArchitecture };
