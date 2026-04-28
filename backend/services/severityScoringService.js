/**
 * severityScoringService.js
 * 
 * AI/ML-inspired Severity Scoring module.
 * Runs after the rule engine (or AI extraction) and refines the severity of 
 * detected risks based on contextual factors from the architecture model.
 */

/**
 * Maps the initial severity string to a base score.
 * @param {string} severity 
 * @returns {number}
 */
function getBaseScore(severity) {
  const norm = (severity || '').toLowerCase();
  if (norm === 'critical') return 90;
  if (norm === 'high') return 75;
  if (norm === 'medium') return 45;
  if (norm === 'low') return 20;
  return 20; // Default fallback
}

/**
 * Recalculates the severity score for a single risk based on contextual factors.
 * 
 * SCORING FACTORS:
 * 1. Risk Type
 * 2. Data Sensitivity
 * 3. Exposure Level
 * 4. System Complexity
 * 5. Affected Components
 * 
 * @param {Object} risk 
 * @param {Object} architectureModel 
 * @returns {number} Score between 0 and 100
 */
function calculateSeverityScore(risk, architectureModel) {
  let score = getBaseScore(risk.severity);

  // 1. Risk Type
  const fullText = `${risk.name || ''} ${risk.cause || ''} ${risk.description || ''}`.toLowerCase();
  
  const criticalKeywords = ['data exposure', 'auth bypass', 'injection', 'authentication bypass', 'sql injection', 'cross-site scripting', 'xss', 'hardcoded credentials'];
  const mediumKeywords = ['missing api', 'incomplete architecture', 'insufficient detail', 'missing database', 'unspecified'];

  if (criticalKeywords.some(keyword => fullText.includes(keyword))) {
    score += 15; // Bump score for inherently critical risk types
  }
  if (mediumKeywords.some(keyword => fullText.includes(keyword))) {
    score -= 5; // Slightly decrease score for missing/incomplete architecture issues
  }

  // 2. Data Sensitivity
  if (architectureModel.sensitive_data && architectureModel.sensitive_data.length > 0) {
    score += 10; // If there is sensitive data in the system, any risk is slightly more dangerous
  }

  // 3. Exposure Level
  if (!architectureModel.trust_boundaries || architectureModel.trust_boundaries.length === 0) {
    score += 10; // Missing trust boundaries increases exposure
  }

  // 4. System Complexity
  const numComponents = (architectureModel.components || []).length;
  const numFlows = (architectureModel.data_flows || []).length;
  // E.g., a system with 4 components and 6 flows = 10 -> +5 score. Max +15.
  const complexityFactor = Math.floor((numComponents + numFlows) / 2);
  score += Math.min(15, complexityFactor); 

  // 5. Affected Components
  const numAffected = (risk.affected_components || []).length;
  score += numAffected * 5; // +5 for each affected component

  // Clamp score strictly between 0 and 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Maps a numeric score (0-100) to a severity label.
 * @param {number} score 
 * @returns {string} 'Low' | 'Medium' | 'High' | 'Critical'
 */
function mapScoreToSeverity(score) {
  if (score >= 86) return 'Critical';
  if (score >= 61) return 'High';
  if (score >= 31) return 'Medium';
  return 'Low';
}

/**
 * Refines the severity of a list of detected risks.
 * 
 * @param {Array} risks - List of risks from rule engine or AI service.
 * @param {Object} architectureModel - Validated architecture JSON.
 * @returns {Array} Updated risks with severity_score and adjusted severity.
 */
function refineRisks(risks, architectureModel) {
  if (!risks || !Array.isArray(risks)) {
    return [];
  }

  const arch = architectureModel || {};

  return risks.map(risk => {
    const score = calculateSeverityScore(risk, arch);
    const newSeverity = mapScoreToSeverity(score);

    return {
      ...risk,
      severity: newSeverity,
      severity_score: score
    };
  });
}

module.exports = {
  refineRisks,
  calculateSeverityScore,
  getBaseScore,
  mapScoreToSeverity
};
