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
}

module.exports = new AIService();
