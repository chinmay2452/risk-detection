const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    } else {
      this.genAI = null;
      this.model = null;
    }
  }

  getSystemPrompt() {
    return `You are an AI system designed for STRICT information extraction from software architecture-related documents.

Your task is to extract ONLY explicitly stated or strongly evidenced architectural elements from the given input.

## CRITICAL INSTRUCTIONS (VERY IMPORTANT):

1. DO NOT assume or invent architecture.

2. DO NOT add common system components like:
   * Web Application
   * Backend API
   * Payment Gateway
   * Authentication Service
     UNLESS they are clearly mentioned in the input.

3. ONLY extract:
   * Elements directly stated
   * Elements strongly implied with clear textual evidence

4. If something is not clearly present:
   → RETURN EMPTY ARRAY []

5. This is NOT a guessing task. This is STRICT extraction.

## EXTRACTION TASK:
Extract the following:
### Components
ONLY include if explicitly mentioned: (e.g., "Rule Engine", "Backend Server", "Dashboard")
### APIs / Interfaces
ONLY include if clearly mentioned: (e.g., "REST API", "HTTP Interface")
### Databases / Storage
ONLY include if explicitly stated
### User Roles
Extract actors such as: Software Architect, Developer, User, External System
### Data Flows
ONLY include if clearly described as movement between components
### Trust Boundaries
ONLY include if explicitly mentioned or clearly defined (e.g., Client-Server separation)
### Sensitive Data
ONLY include if mentioned (e.g., credentials, PII, confidential data)
### External Dependencies
ONLY include if clearly stated (e.g., third-party APIs)

## OUTPUT FORMAT (STRICT JSON ONLY — NO TEXT):
{
  "components": [],
  "apis": [],
  "databases": [],
  "user_roles": [],
  "data_flows": [],
  "trust_boundaries": [],
  "sensitive_data": [],
  "external_dependencies": []
}

## VALIDATION RULES:
* If unsure → DO NOT include
* If ambiguous → SKIP
* If generic → SKIP
* Prefer missing data over incorrect data

## FINAL GOAL:
Produce HIGH-PRECISION structured output with ZERO hallucination. Accuracy > completeness.`;
  }

  async extractArchitecture(inputText) {
    if (!this.model) {
      console.warn("GEMINI_API_KEY is not set. Returning mock data.");
      return this.getMockResponse();
    }

    try {
      const prompt = `${this.getSystemPrompt()}\n\n## INPUT:\n${inputText}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up the text in case the LLM returned markdown code blocks
      text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

      const parsedJson = JSON.parse(text);
      return parsedJson;
    } catch (error) {
      console.error('Error generating AI content. Using smart fallback:', error.message);
      // Fallback to heuristic mock extraction if the API key fails
      return this.getSmartFallbackResponse(inputText);
    }
  }

  getSmartFallbackResponse(inputText) {
    const text = inputText.toLowerCase();
    const result = {
      components: [],
      apis: [],
      databases: [],
      user_roles: [],
      data_flows: [],
      trust_boundaries: [],
      sensitive_data: [],
      external_dependencies: []
    };

    if (text.includes('web application')) result.components.push('Web Application');
    if (text.includes('backend api') || text.includes('backend server')) result.components.push('Backend Server');
    if (text.includes('authentication service')) result.components.push('Authentication Service');
    if (text.includes('rule engine')) result.components.push('Rule Engine');
    if (text.includes('dashboard')) result.components.push('Dashboard');
    
    if (text.includes('rest api')) result.apis.push('REST API');
    if (text.includes('http interface')) result.apis.push('HTTP Interface');
    
    if (text.includes('mysql')) result.databases.push('MySQL Database');
    if (text.includes('mongodb')) result.databases.push('MongoDB');
    if (text.includes('redis')) result.databases.push('Redis Cache');
    
    if (text.includes('payment gateway')) result.external_dependencies.push('Payment Gateway');
    if (text.includes('third-party api')) result.external_dependencies.push('Third-Party API');
    
    if (text.includes('user')) result.user_roles.push('User');
    if (text.includes('admin')) result.user_roles.push('Admin');
    if (text.includes('software architect')) result.user_roles.push('Software Architect');
    if (text.includes('developer')) result.user_roles.push('Developer');

    if (text.includes('data flow:') || text.includes('user → web application')) {
      result.data_flows.push("User → Web Application → Backend API → Database");
    }
    
    if (text.includes('sensitive data:') || text.includes('user credentials')) {
      result.sensitive_data.push("User credentials");
    }
    if (text.includes('payment information')) {
      result.sensitive_data.push("Payment information");
    }
    
    if (text.includes('trust boundaries:') || text.includes('internet → web application')) {
      result.trust_boundaries.push("Internet → Web Application");
    }
    if (text.includes('client-server separation')) {
      result.trust_boundaries.push("Client-Server separation");
    }

    return result;
  }

  getValidationSystemPrompt() {
    return `You are an AI system responsible for validating a structured software architecture model.

Your task is to analyze the given JSON architecture model and verify whether it is complete, consistent, and suitable for security risk analysis.

## VALIDATION TASK:

Perform the following checks:

### 1. Completeness Check
Verify if essential elements are present:
* At least one component
* At least one user role (if applicable)
* At least one data store (if system involves data)
* APIs if communication is mentioned

### 2. Consistency Check
* Ensure all elements referenced in data flows exist in components
* Ensure no undefined entities appear in data flows
* Ensure naming consistency (no duplicates with different names)

### 3. Logical Validity
* Check if the architecture makes logical sense
* Identify missing connections (e.g., components with no interaction)
* Identify isolated elements (unused components)

### 4. Security Analysis Readiness
Determine if the model has enough detail for:
* Risk detection
* Rule evaluation
* Threat classification

## OUTPUT FORMAT (STRICT JSON ONLY):
{
  "is_valid": true/false,
  "issues": [
    {
      "type": "Missing / Inconsistent / Logical",
      "description": ""
    }
  ],
  "suggestions": [
    ""
  ],
  "confidence_score": 0-100
}

## STRICT RULES:
* DO NOT hallucinate missing architecture
* Only report issues based on given data
* If everything is fine, return empty issues array []
* Be precise and concise
`;
  }

  getAnalysisSystemPrompt() {
    return `You are a security analysis engine for the Hybrid AI-Powered Software Security Risk Detection Platform.

Your task is to analyze a VALIDATED architecture model and generate security risks that are STRICTLY grounded in the provided data.

## CRITICAL INSTRUCTIONS (MUST FOLLOW):
1. DO NOT invent or assume any components, APIs, databases, or systems.
2. ONLY reference elements that exist in the input JSON.
3. Every risk MUST reference an existing component OR database OR data flow.
4. If something is NOT present in the architecture → DO NOT include it.
5. DO NOT generate generic web risks unless supported by the input.
6. Accuracy and grounding are more important than quantity.

## ANALYSIS RULES:

### Baseline Heuristic Rules:
- Sensitive data exists but no trust boundaries → Data Exposure Risk
- Components exist but no data flows → Incomplete Architecture Risk
- User roles exist but no access control or boundaries → Access Control Risk
- Databases exist but appear in no data flow → Unused or Exposed Data Store
- APIs missing when communication is implied → Communication Risk

### Advanced Rules (OWASP/CWE):
- Sensitive Data Exposure (A02:2021)
- Broken Access Control (A01:2021)
- Injection risks when APIs interact with databases without validation (A03:2021)
- Insecure Communication — data flows without trust boundaries (A02:2021)
- Missing Security Boundaries (A04:2021)
- Insufficient Logging when no monitoring component exists (A09:2021)

## OUTPUT FORMAT (STRICT JSON ARRAY ONLY — NO TEXT OUTSIDE JSON):
[
  {
    "id": "R001",
    "name": "",
    "severity": "Critical | High | Medium | Low",
    "affected_components": [],
    "cause": "",
    "description": "",
    "recommendation": ["step 1", "step 2", "step 3"],
    "confidence": 0-100
  }
]

## FIELD RULES:
- "affected_components": ONLY names from the input "components" or "databases" arrays. NEVER invent names.
- "cause": Explain the issue using actual elements from the architecture (component/API/database names).
- "description": Why this is a security risk in this specific architecture.
- "recommendation": 2–4 concrete, actionable mitigation steps.
- "confidence": 80–100 for strong evidence, 50–79 for partial, below 50 for weak inference.

## VALIDATION BEFORE RETURNING:
For each risk, verify:
- Does every entity in "affected_components" exist in the input JSON?
- If NO → discard that risk entirely.

## STRICT RULES:
- Return ONLY a valid JSON array.
- Return [] if no risks are detected.
- NO hallucination. NO generic assumptions. FULL consistency with the input.`;
  }

  async analyzeArchitectureWithAI(architectureModel) {
    if (!this.model) {
      return null; // Signal to fall back to rule engine
    }

    try {
      const prompt = `${this.getAnalysisSystemPrompt()}\n\n## INPUT (Architecture Model JSON):\n${JSON.stringify(architectureModel, null, 2)}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) return null;

      // Validate: filter out any risk that references non-existent components
      const validComponents = new Set([
        ...(architectureModel.components || []).map(c => c.toLowerCase()),
        ...(architectureModel.databases || []).map(d => d.toLowerCase()),
      ]);

      const validated = parsed.filter(risk => {
        if (!risk.id || !risk.name || !risk.severity) return false;
        // Allow risks with empty affected_components (model-level issues)
        if (!risk.affected_components || risk.affected_components.length === 0) return true;
        // At least one referenced component must exist in the model
        return risk.affected_components.some(c =>
          validComponents.has(String(c).toLowerCase())
        );
      });

      return validated;
    } catch (error) {
      console.error('[AIService] AI analysis failed. Will fall back to rule engine:', error.message);
      return null;
    }
  }

  async validateArchitecture(architectureJson) {
    if (!this.model) {
      console.warn("GEMINI_API_KEY is not set. Returning mock validation data.");
      return this.getSmartValidationFallbackResponse(architectureJson);
    }

    try {
      const prompt = `${this.getValidationSystemPrompt()}\n\n## INPUT (Architecture Model JSON):\n${JSON.stringify(architectureJson, null, 2)}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up the text in case the LLM returned markdown code blocks
      text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

      const parsedJson = JSON.parse(text);
      return parsedJson;
    } catch (error) {
      console.error('Error generating AI content for validation. Using smart fallback:', error.message);
      return this.getSmartValidationFallbackResponse(architectureJson);
    }
  }

  getSmartValidationFallbackResponse(architectureJson) {
    let issues = [];
    let suggestions = [];
    let confidence_score = 75;

    if (!architectureJson.components || architectureJson.components.length === 0) {
      issues.push({
        type: "Missing",
        description: "No components defined in the architecture."
      });
      suggestions.push("Define at least one system component.");
      confidence_score -= 30;
    }

    if (architectureJson.data_flows && architectureJson.data_flows.length > 0) {
      // Basic heuristic: check if components are mentioned in data flows
      const dataFlowText = architectureJson.data_flows.join(' ').toLowerCase();
      if (architectureJson.components) {
        let matchedComponent = false;
        architectureJson.components.forEach(comp => {
          if (dataFlowText.includes(comp.toLowerCase())) {
            matchedComponent = true;
          }
        });
        if (!matchedComponent && architectureJson.components.length > 0) {
          issues.push({
            type: "Inconsistent",
            description: "Components defined do not seem to participate in any data flows."
          });
          suggestions.push("Ensure components are part of the defined data flows.");
          confidence_score -= 20;
        }
      }
    } else {
        issues.push({
            type: "Missing",
            description: "No data flows defined. Interactions are required for security analysis."
        });
        suggestions.push("Define data flows between components.");
        confidence_score -= 20;
    }

    return {
      is_valid: issues.length === 0,
      issues: issues,
      suggestions: suggestions.length > 0 ? suggestions : ["Architecture seems valid and ready for security analysis."],
      confidence_score: Math.max(0, confidence_score)
    };
  }
}

module.exports = new AIService();
