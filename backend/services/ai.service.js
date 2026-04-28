const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const fs = require('fs');

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.groqApiKey = process.env.GROQ_API_KEY;

    // Gemini Setup
    if (this.geminiApiKey && !this.geminiApiKey.includes('your_')) {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
      this.geminiModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
      this.model = this.genAI.getGenerativeModel({ model: this.geminiModels[0] });
    }

    // Groq Setup
    if (this.groqApiKey && !this.groqApiKey.includes('your_')) {
      this.groq = new Groq({ apiKey: this.groqApiKey });
      this.groqModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192'];
    }
  }

  getSystemPrompt(inputType = "text") {
    return `You are an AI system responsible for extracting software architecture from MULTIPLE input formats.

## INPUT TYPE: ${inputType}

## TASK — Perform a COMPLETE analysis in 4 steps:

### STEP 1: NORMALIZATION
Convert the given input into a clean textual understanding:
* If PDF/text/OCR → use the extracted text directly
* If image/UML → interpret labels and connections (if vision supported)
* If JSON → parse structure directly

### STEP 2: STRICT EXTRACTION
Extract ONLY explicitly present or strongly supported elements.

### STEP 3: TYPE-SPECIFIC RULES
* image/uml: Interpret labels as components, arrows as flows, cylinders as DBs.
* pdf/text: Identify services and storage from descriptions.
* code: Identify controllers, routes, and DB connections.

### STEP 4: SELF-VALIDATION
✔ components must NOT be empty if input has entities.
✔ Every entity in data_flows must exist in components.

## OUTPUT FORMAT (STRICT JSON ONLY):
{
  "input_type": "${inputType}",
  "extraction_confidence": 0-100,
  "components": [],
  "apis": [],
  "databases": [],
  "user_roles": [],
  "data_flows": [],
  "trust_boundaries": [],
  "sensitive_data": [],
  "external_dependencies": [],
  "missing_parameters": [],
  "corrections_made": [],
  "notes": []
}

## FIELD DEFINITIONS:
- extraction_confidence: 80-100=clear, 50-79=partial, <50=weak
- missing_parameters: fields that could not be extracted
- corrections_made: list of fixes applied`;
  }

  fileToGenerativePart(filePath, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
        mimeType,
      },
    };
  }

  getMimeType(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const map = {
      png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml"
    };
    return map[ext] || "image/png";
  }

  async extractArchitecture(inputText, inputType = "text", filePath = null) {
    console.log(`[AIService] Starting extraction for ${inputType}. Input length: ${inputText ? inputText.length : 0}`);
    
    // 1. Try Gemini (Supports Vision)
    if (this.genAI) {
      for (const modelName of this.geminiModels) {
        try {
          console.log(`[AIService] Trying Gemini: ${modelName}...`);
          const model = this.genAI.getGenerativeModel({ model: modelName });
          const prompt = `${this.getSystemPrompt(inputType)}\n\n## INPUT:\n${inputText}`;
          let result;

          if (filePath && fs.existsSync(filePath) && (inputType === "image" || inputType === "uml")) {
            console.log(`[AIService] Using vision for ${filePath}`);
            const mimeType = this.getMimeType(filePath);
            const imagePart = this.fileToGenerativePart(filePath, mimeType);
            result = await model.generateContent([prompt, imagePart]);
          } else {
            result = await model.generateContent(prompt);
          }

          const response = await result.response;
          const text = response.text().replace(/```json/gi, '').replace(/```/gi, '').trim();
          let parsed = JSON.parse(text);
          console.log(`[AIService] Gemini ${modelName} success!`);
          parsed.notes = parsed.notes || [];
          parsed.notes.push(`Extracted via Gemini (${modelName})`);
          return this.validateAndCorrect(parsed, inputType);
        } catch (err) {
          console.warn(`[AIService] Gemini ${modelName} failed: ${err.message}`);
        }
      }
    }

    // 2. Try Groq (Fast Text-only Fallback)
    if (this.groq) {
      console.log(`[AIService] Gemini failed or unavailable. Trying Groq...`);
      for (const modelName of this.groqModels) {
        try {
          console.log(`[AIService] Trying Groq: ${modelName}...`);
          
          // Groq models are text-only usually, so we use the OCR/Text input
          const completion = await this.groq.chat.completions.create({
            messages: [
              { role: "system", content: this.getSystemPrompt(inputType) },
              { role: "user", content: `## INPUT:\n${inputText}` }
            ],
            model: modelName,
            response_format: { type: "json_object" }
          });

          let parsed = JSON.parse(completion.choices[0].message.content);
          console.log(`[AIService] Groq ${modelName} success!`);
          parsed.notes = parsed.notes || [];
          parsed.notes.push(`Extracted via Groq (${modelName})`);
          return this.validateAndCorrect(parsed, inputType);
        } catch (err) {
          console.warn(`[AIService] Groq ${modelName} failed: ${err.message}`);
        }
      }
    }

    // 3. Heuristic Fallback
    console.warn('[AIService] All AI models failed or unavailable. Using heuristic fallback.');
    return this.getSmartFallbackResponse(inputText, inputType, filePath);
  }

  validateAndCorrect(data, inputType) {
    const required = ['components', 'apis', 'databases', 'user_roles', 'data_flows', 'trust_boundaries', 'sensitive_data', 'external_dependencies'];
    required.forEach(f => { if (!Array.isArray(data[f])) data[f] = []; });
    data.input_type = data.input_type || inputType;
    data.missing_parameters = required.filter(f => data[f].length === 0);
    return data;
  }

  getSmartFallbackResponse(inputText, inputType = "text", filePath = null) {
    if ((inputType === "image" || inputType === "uml") && (!inputText || inputText.includes('minimal text'))) {
      return {
        input_type: inputType,
        extraction_confidence: 30,
        components: ["[Requires AI Vision]"],
        notes: ["API quota exhausted. OCR failed to find text labels in diagram."],
        _retryable: true,
        missing_parameters: ['components']
      };
    }

    const text = (inputText || "").toLowerCase();
    const result = {
      input_type: inputType,
      extraction_confidence: 40,
      components: [], apis: [], databases: [], user_roles: [], data_flows: [], trust_boundaries: [], sensitive_data: [], external_dependencies: [],
      missing_parameters: [], corrections_made: ["Used heuristic pattern matching"], notes: ["AI unavailable, using local patterns."]
    };

    const patterns = {
      components: [/web\s*app/g, /frontend/g, /backend/g, /server/g, /microservice/g, /auth\s*service/g, /dashboard/g, /gateway/g],
      databases: [/mysql/g, /postgres/g, /mongodb/g, /redis/g, /database/g, /s3/g],
      apis: [/rest\s*api/g, /graphql/g, /grpc/g, /http/g],
      user_roles: [/admin/g, /user/g, /developer/g, /manager/g]
    };

    Object.keys(patterns).forEach(key => {
      patterns[key].forEach(regex => {
        const match = text.match(regex);
        if (match) {
          const label = regex.source.replace(/\\s\*/g, ' ').replace(/\//g, '').toUpperCase();
          if (!result[key].includes(label)) result[key].push(label);
        }
      });
    });

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
* ALWAYS provide at least one helpful suggestion in the "suggestions" array, even if the architecture is perfectly valid.
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
      
      if (!parsedJson.suggestions || !Array.isArray(parsedJson.suggestions) || parsedJson.suggestions.length === 0) {
        parsedJson.suggestions = ["Review the extracted architecture manually before proceeding to security analysis."];
      }
      
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
