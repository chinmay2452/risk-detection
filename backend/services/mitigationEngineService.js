/**
 * mitigationEngineService.js
 * 
 * Generates actionable security recommendations based on risk type, severity, and affected components.
 * Runs after severity scoring.
 */

/**
 * Maps severity to mitigation priority.
 * @param {string} severity 
 * @returns {string} Immediate | High | Medium | Low
 */
function getPriority(severity) {
  const norm = (severity || '').toLowerCase();
  if (norm === 'critical') return 'Immediate';
  if (norm === 'high') return 'High';
  if (norm === 'medium') return 'Medium';
  if (norm === 'low') return 'Low';
  return 'Low'; // default
}

/**
 * Generates concrete recommendations based on risk name, description, cause, and affected components.
 * @param {Object} risk 
 * @returns {Array<string>}
 */
function getRecommendations(risk) {
  const fullText = `${risk.name || ''} ${risk.cause || ''} ${risk.description || ''}`.toLowerCase();
  const recommendations = [];

  // SQL Injection
  if (fullText.includes('sql') || fullText.includes('injection')) {
    recommendations.push('Use prepared statements (parameterized queries) for all database access.');
    recommendations.push('Implement strict input validation and sanitization for all user-supplied data.');
    recommendations.push('Consider using an Object-Relational Mapper (ORM) to abstract database queries.');
  }
  // Sensitive Data Exposure / Missing Encryption
  else if (fullText.includes('sensitive data exposure') || fullText.includes('missing encryption') || fullText.includes('unencrypted') || fullText.includes('plaintext')) {
    recommendations.push('Encrypt sensitive data at rest using strong encryption algorithms (e.g., AES-256).');
    recommendations.push('Enforce TLS 1.2 or higher for all communication involving sensitive data.');
    recommendations.push('Implement robust access controls and least privilege principles for data access.');
  }
  // Missing API Layer / Incomplete Architecture
  else if (fullText.includes('missing api') || fullText.includes('missing api layer') || fullText.includes('incomplete architecture')) {
    recommendations.push('Define explicit REST or GraphQL APIs for all interactions between major components.');
    recommendations.push('Introduce an API Gateway to centralize authentication, rate limiting, and routing.');
    recommendations.push('Enforce strict authentication and authorization at the API layer.');
  }
  // Insecure Communication
  else if (fullText.includes('insecure communication') || fullText.includes('http') || fullText.includes('untrusted')) {
    recommendations.push('Require HTTPS for all external and internal endpoints.');
    recommendations.push('Add TLS encryption for all intra-component communication.');
    recommendations.push('Secure internal communication channels using mutual TLS (mTLS) or VPNs.');
  }
  // Cross-Site Scripting (XSS)
  else if (fullText.includes('xss') || fullText.includes('cross-site scripting')) {
    recommendations.push('Contextually encode all user-supplied output before rendering it in the browser.');
    recommendations.push('Implement a strong Content Security Policy (CSP) to restrict active content sources.');
    recommendations.push('Use modern web frameworks that automatically escape XSS by design.');
  }
  // Authentication / Authorization Bypass
  else if (fullText.includes('auth bypass') || fullText.includes('authentication') || fullText.includes('authorization') || fullText.includes('hardcoded')) {
    recommendations.push('Implement a centralized, robust identity and access management (IAM) solution.');
    recommendations.push('Ensure all endpoints perform strict authorization checks on every request.');
    recommendations.push('Remove any hardcoded credentials and use a secure secrets management vault.');
  }
  // Default / Fallback Generic
  else {
    recommendations.push('Conduct a targeted security review and threat model of the affected component.');
    recommendations.push('Ensure the component follows secure by design principles and least privilege.');
    recommendations.push('Implement extensive logging and monitoring to detect anomalous behavior.');
  }

  // Context Awareness based on affected components
  if (risk.affected_components && risk.affected_components.length > 0) {
    const componentsList = risk.affected_components.join(', ');
    recommendations.push(`Apply targeted patching and security hardening specifically to: ${componentsList}.`);
  }

  // Ensure we return 2-4 concrete steps
  return recommendations.slice(0, 4);
}

/**
 * Transforms detected risks into actionable mitigation steps.
 * @param {Array} risks 
 * @returns {Array}
 */
function generateMitigations(risks) {
  if (!risks || !Array.isArray(risks)) return [];

  return risks.map(risk => {
    return {
      id: risk.id || `RISK-${Math.floor(Math.random() * 10000)}`,
      name: risk.name || 'Unknown Risk',
      severity: risk.severity || 'Low',
      affected_components: risk.affected_components || [],
      recommendation: getRecommendations(risk),
      priority: getPriority(risk.severity)
    };
  });
}

module.exports = {
  generateMitigations,
  getRecommendations,
  getPriority
};
