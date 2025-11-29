# NovaTrix AI Implementation Guide

## Executive Summary

This guide provides step-by-step instructions for integrating AI capabilities into NovaTrix for automated document analysis, interview analysis, and intelligent SoA generation. The system is designed to work WITHOUT AI initially, with all AI features as optional enhancements.

---

## Table of Contents

1. [AI Provider Recommendation](#ai-provider-recommendation)
2. [Document Analysis AI Features](#document-analysis-ai-features)
3. [Interview Analysis AI Features](#interview-analysis-ai-features)
4. [SoA AI Assistance Features](#soa-ai-assistance-features)
5. [Backend Implementation Guide](#backend-implementation-guide)
6. [Frontend Integration Guide](#frontend-integration-guide)
7. [Cost Optimization Strategies](#cost-optimization-strategies)
8. [Testing and Validation](#testing-and-validation)

---

## AI Provider Recommendation

### Recommended: Google Gemini 1.5 Flash

**Why Gemini 1.5 Flash:**
- ✅ **Free Tier:** 15 requests/minute, 1500 requests/day
- ✅ **Easy Integration:** Official Node.js SDK
- ✅ **Massive Context:** 1M tokens (entire documents + ISO standard)
- ✅ **System Instructions:** Persistent context without fine-tuning
- ✅ **Cost Effective:** $0.075 per 1M input, $0.30 per 1M output (paid tier)

### Alternative Providers

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **OpenAI GPT-4** | Most mature, excellent quality | More expensive, 128K token limit | $0.03/1K tokens |
| **Anthropic Claude 3.5** | Best reasoning, 200K context | Medium cost | $0.015/1K tokens |
| **Ollama (Local)** | Free, private, offline | Requires GPU, lower quality | Free |
| **Google Gemini Pro** | Free tier, easy setup | Rate limits on free tier | Free/Paid |

**Decision Matrix:**
- **Development/Testing:** Gemini 1.5 Flash (free tier)
- **Production (budget):** Gemini 1.5 Flash (paid tier)
- **Production (privacy):** Ollama with Llama 3.1
- **Production (quality):** Claude 3.5 Sonnet

---

## Document Analysis AI Features

### Feature 1: Auto-Generate Document Summaries

**Purpose:** Automatically generate summaryShort, summaryDetailed, and summaryIsoCompliance when document is uploaded.

**Database Fields (Already Exist):**
```prisma
model Document {
  summaryShort         String?  // Brief 1-2 sentence summary
  summaryDetailed      String?  // Detailed paragraph summary
  summaryIsoCompliance String?  // ISO 27001 compliance analysis
  readPercentage       Float    @default(0.0)
  gapCount             Int      @default(0)
}
```

**Backend Implementation:**

**File:** `backend/src/services/aiService.js`
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeDocument(documentText, documentTitle) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are an ISO 27001:2022 compliance expert. Analyze security policy documents and provide:
1. Short summary (1-2 sentences)
2. Detailed summary (1 paragraph)
3. ISO 27001 compliance analysis (which Annex A controls are addressed)

Format response as JSON:
{
  "summaryShort": "...",
  "summaryDetailed": "...",
  "summaryIsoCompliance": "...",
  "suggestedControls": ["A.5.1", "A.6.3", ...]
}`
  });

  const prompt = `
Document Title: ${documentTitle}

Document Content:
${documentText}

Analyze this document and provide JSON response with summaries and suggested Annex A controls.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to parse AI response');
}
```

**File:** `backend/src/controllers/documentsController.js`
```javascript
import { analyzeDocument } from '../services/aiService.js';
import pdf from 'pdf-parse';
import fs from 'fs/promises';

// New endpoint: POST /api/documents/:slug/analyze
export async function analyzeDocumentEndpoint(req, res) {
  try {
    const { slug } = req.params;

    // Get document from database
    const document = await prisma.document.findUnique({
      where: { slug }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Extract text from PDF
    const pdfBuffer = await fs.readFile(document.filePath);
    const pdfData = await pdf(pdfBuffer);
    const documentText = pdfData.text;

    // Call AI service
    const analysis = await analyzeDocument(documentText, document.title);

    // Update document with AI analysis
    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        summaryShort: analysis.summaryShort,
        summaryDetailed: analysis.summaryDetailed,
        summaryIsoCompliance: analysis.summaryIsoCompliance,
        status: 'analyzed'
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        activityType: 'document_analyzed',
        entityType: 'documents',
        entityId: document.id,
        description: `AI analysis completed for "${document.title}"`,
        metadata: JSON.stringify({ suggestedControls: analysis.suggestedControls })
      }
    });

    res.json({
      success: true,
      document: updatedDocument,
      suggestedControls: analysis.suggestedControls
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze document',
      details: error.message
    });
  }
}
```

**Frontend Integration:**

**File:** `frontend/src/pages/DocumentDetailView.jsx`
```javascript
// Add "Analyze with AI" button
const handleAnalyze = async () => {
  setIsAnalyzing(true);
  try {
    const response = await fetch(`/api/documents/${slug}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      // Update document state
      setDocument(data.document);

      // Show suggested controls
      if (data.suggestedControls?.length > 0) {
        setShowControlSuggestions(true);
        setSuggestedControls(data.suggestedControls);
      }

      toast.success('Document analyzed successfully!');
    }
  } catch (error) {
    toast.error('Failed to analyze document');
  } finally {
    setIsAnalyzing(false);
  }
};

// UI
<button onClick={handleAnalyze} disabled={isAnalyzing}>
  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
</button>

{showControlSuggestions && (
  <div className="control-suggestions">
    <h3>AI Suggested Controls</h3>
    {suggestedControls.map(controlId => (
      <button key={controlId} onClick={() => addControlToAnnotation(controlId)}>
        {controlId} - Add to Annotation
      </button>
    ))}
  </div>
)}
```

**Dependencies to Install:**
```bash
npm install @google/generative-ai pdf-parse
```

**Environment Variables (.env):**
```
GEMINI_API_KEY=your_api_key_here
```

**Get API Key:** https://aistudio.google.com/app/apikey

---

### Feature 2: Auto-Identify Controls from Document Text

**Purpose:** Scan document and automatically suggest which Annex A controls are mentioned or addressed.

**AI Prompt Template:**
```javascript
export async function identifyControls(documentText) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are an ISO 27001:2022 expert. Given a document, identify which Annex A controls (A.5.1 through A.8.29) are mentioned or addressed.

Return ONLY a JSON array of control IDs with confidence scores:
[
  {"controlId": "A.5.1", "confidence": 0.95, "evidence": "Document mentions policies and procedures..."},
  {"controlId": "A.8.2", "confidence": 0.87, "evidence": "Access control procedures described..."}
]`
  });

  const prompt = `Analyze this document and identify relevant ISO 27001:2022 Annex A controls:\n\n${documentText}`;

  const result = await model.generateContent(prompt);
  const text = (await result.response).text();

  return JSON.parse(text);
}
```

**Usage:**
- Run automatically after document upload
- Allow user to review and approve suggested controls
- Create annotations automatically for high-confidence matches

---

### Feature 3: Auto-Highlight Key Compliance Sections

**Purpose:** Automatically create annotations for important compliance-related sections.

**Implementation Strategy:**
1. Extract text with position data from PDF
2. Use AI to identify key sections
3. Create annotations programmatically

**AI Prompt:**
```javascript
export async function identifyKeySection(documentText) {
  const prompt = `
Identify the most important compliance-related sections in this document.
For each section, provide:
- page number
- starting text (first 50 chars)
- ending text (last 50 chars)
- control relevance (which Annex A controls)
- importance (high/medium/low)

Document:
${documentText}

Return JSON array of sections.
`;

  // Process with AI
  // Match text positions in PDF
  // Create annotations
}
```

---

## Interview Analysis AI Features

### Feature 1: Generate Interview Summary

**Purpose:** Automatically summarize interview Q&A into aiSummary field.

**Database Fields (Already Exist):**
```prisma
model Interview {
  aiSummary          String?  // Interview summary
  aiKeyStatements    String?  // JSON array of key statements
  aiContradictions   String?  // JSON array of contradictions
  aiMaturityScore    Float?   // 0.0 to 5.0
}
```

**Backend Implementation:**

**File:** `backend/src/services/aiService.js`
```javascript
export async function analyzeInterview(interviewData) {
  const { respondent, questions } = interviewData;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are an ISO 27001 auditor analyzing interview responses. Provide:
1. Summary of interview
2. Key statements (important quotes or findings)
3. Contradictions (inconsistencies in answers or with documented policies)
4. Maturity score (0-5 scale based on CMMI levels)

Return JSON:
{
  "summary": "...",
  "keyStatements": ["statement1", "statement2"],
  "contradictions": ["contradiction1"],
  "maturityScore": 3.5,
  "maturityJustification": "..."
}`
  });

  // Build prompt from Q&A
  let prompt = `Interview with: ${respondent.name} (${respondent.role})\n\n`;

  questions.forEach((qa, index) => {
    prompt += `Q${index + 1}: ${qa.questionText}\n`;
    prompt += `A${index + 1}: ${qa.answerText || 'No answer provided'}\n\n`;
  });

  prompt += '\nAnalyze this interview and provide JSON response.';

  const result = await model.generateContent(prompt);
  const text = (await result.response).text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to parse AI response');
}
```

**File:** `backend/src/controllers/interviewsController.js`
```javascript
// New endpoint: POST /api/interviews/:id/analyze
export async function analyzeInterviewEndpoint(req, res) {
  try {
    const { id } = req.params;

    // Fetch interview with all Q&A and respondent
    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(id) },
      include: {
        respondent: true,
        interviewQA: {
          include: {
            interviewQAControls: {
              include: {
                control: true
              }
            }
          }
        }
      }
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Call AI service
    const analysis = await analyzeInterview({
      respondent: interview.respondent,
      questions: interview.interviewQA
    });

    // Update interview
    const updatedInterview = await prisma.interview.update({
      where: { id: interview.id },
      data: {
        aiSummary: analysis.summary,
        aiKeyStatements: JSON.stringify(analysis.keyStatements),
        aiContradictions: JSON.stringify(analysis.contradictions),
        aiMaturityScore: analysis.maturityScore,
        status: 'analyzed'
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        activityType: 'interview_analyzed',
        entityType: 'interviews',
        entityId: interview.id,
        description: `AI analysis completed for interview with ${interview.respondent.name}`,
        metadata: JSON.stringify({ maturityScore: analysis.maturityScore })
      }
    });

    res.json({
      success: true,
      interview: updatedInterview,
      analysis: {
        maturityJustification: analysis.maturityJustification
      }
    });

  } catch (error) {
    console.error('Interview analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze interview' });
  }
}
```

**Frontend Integration:**

**File:** `frontend/src/pages/InterviewDashboard.jsx`
```javascript
const handleAnalyze = async (interviewId) => {
  setIsAnalyzing(true);
  try {
    const response = await fetch(`/api/interviews/${interviewId}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      // Refresh interview data
      await fetchInterviews();
      toast.success('Interview analyzed successfully!');
    }
  } catch (error) {
    toast.error('Failed to analyze interview');
  } finally {
    setIsAnalyzing(false);
  }
};

// Add button to interview card
<button onClick={() => handleAnalyze(interview.id)}>
  Analyze with AI
</button>
```

---

### Feature 2: Detect Contradictions

**Purpose:** Identify inconsistencies in interview answers or contradictions with documented policies.

**AI Prompt Strategy:**
```javascript
export async function detectContradictions(interviewQA, documentPolicies) {
  const prompt = `
Compare these interview answers with documented policies and identify contradictions:

INTERVIEW ANSWERS:
${formatInterviewQA(interviewQA)}

DOCUMENTED POLICIES:
${formatPolicies(documentPolicies)}

Return JSON array of contradictions:
[
  {
    "type": "internal" or "policy",
    "description": "...",
    "evidence": "...",
    "severity": "high/medium/low"
  }
]
`;

  // Process with AI
}
```

---

### Feature 3: Calculate Maturity Score

**Purpose:** Assess organizational maturity based on interview responses.

**Maturity Levels:**
1. **Initial (1.0):** Ad-hoc processes, no documentation
2. **Managed (2.0):** Some processes documented but inconsistent
3. **Defined (3.0):** Standardized processes, well-documented
4. **Measured (4.0):** Metrics tracked, continuous monitoring
5. **Optimized (5.0):** Continuous improvement, proactive

**AI Scoring Logic:**
```javascript
const maturityPrompt = `
Based on these interview responses, assess the organization's security maturity on a 0-5 scale:

1.0 = Initial (ad-hoc)
2.0 = Managed (repeatable)
3.0 = Defined (standardized)
4.0 = Measured (quantified)
5.0 = Optimized (continuous improvement)

Interview:
${interviewText}

Return JSON:
{
  "maturityScore": 3.5,
  "justification": "...",
  "strengths": [...],
  "weaknesses": [...]
}
`;
```

---

## SoA AI Assistance Features

### Feature 1: Auto-Determine Control Applicability

**Purpose:** Suggest whether each control is applicable based on risk assessment and business context.

**Backend Implementation:**

**File:** `backend/src/services/aiService.js`
```javascript
export async function suggestApplicability(controlId, organizationContext, risks) {
  const prompt = `
Given this organization context and identified risks, determine if ISO 27001 control ${controlId} is applicable.

ORGANIZATION CONTEXT:
- Industry: ${organizationContext.industry}
- Size: ${organizationContext.employeeCount} employees
- Scope: ${organizationContext.scope}
- Business Type: ${organizationContext.businessType}

IDENTIFIED RISKS:
${risks.map(r => `- ${r.threat} affecting ${r.asset} (Risk Score: ${r.riskScore})`).join('\n')}

CONTROL: ${controlId}
${getControlDescription(controlId)}

Return JSON:
{
  "applicable": true/false,
  "justification": "...",
  "relatedRisks": ["risk1", "risk2"],
  "confidence": 0.95
}
`;

  const result = await model.generateContent(prompt);
  // Parse and return
}
```

**Usage:**
- Run when initializing SoA
- Allow user to override AI suggestions
- Provide justification for transparency

---

### Feature 2: Draft Justification Text

**Purpose:** Auto-generate justification text for why a control is applicable or not applicable.

**AI Prompt:**
```javascript
export async function draftJustification(control, applicability, evidence) {
  const prompt = `
Draft a professional justification for why control ${control.id} is ${applicability ? 'applicable' : 'not applicable'}.

CONTROL: ${control.title}
DESCRIPTION: ${control.description}

EVIDENCE:
${evidence.map(e => `- ${e.type}: ${e.summary}`).join('\n')}

Write 2-3 sentences justifying the applicability decision.
`;

  // Generate justification
}
```

---

### Feature 3: Suggest Remediation Actions

**Purpose:** For non-compliant or partially compliant controls, suggest remediation steps.

**AI Prompt:**
```javascript
export async function suggestRemediation(control, currentStatus, gaps) {
  const prompt = `
Control ${control.id} is currently ${currentStatus}.

GAPS IDENTIFIED:
${gaps.map(g => `- ${g.description} (${g.severity})`).join('\n')}

Suggest 3-5 specific, actionable remediation steps to achieve compliance.

Return JSON:
[
  {
    "action": "...",
    "priority": "high/medium/low",
    "estimatedEffort": "...",
    "estimatedCost": "..."
  }
]
`;

  // Generate remediation plan
}
```

---

## Backend Implementation Guide

### Step 1: Install Dependencies

```bash
cd backend
npm install @google/generative-ai pdf-parse
```

### Step 2: Create AI Service

**File:** `backend/src/services/aiService.js`
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Document Analysis
export async function analyzeDocument(documentText, documentTitle) {
  // Implementation above
}

export async function identifyControls(documentText) {
  // Implementation above
}

// Interview Analysis
export async function analyzeInterview(interviewData) {
  // Implementation above
}

export async function detectContradictions(interviewQA, policies) {
  // Implementation above
}

// SoA Assistance
export async function suggestApplicability(controlId, context, risks) {
  // Implementation above
}

export async function draftJustification(control, applicability, evidence) {
  // Implementation above
}

export async function suggestRemediation(control, status, gaps) {
  // Implementation above
}

// Error Handling
export function handleAIError(error) {
  if (error.message.includes('quota')) {
    return { error: 'AI quota exceeded. Please try again later.' };
  }
  if (error.message.includes('api key')) {
    return { error: 'AI service configuration error.' };
  }
  return { error: 'AI analysis failed. Please try again.' };
}
```

### Step 3: Add AI Routes

**File:** `backend/src/routes/documents.routes.js`
```javascript
import { analyzeDocumentEndpoint } from '../controllers/documentsController.js';

router.post('/:slug/analyze', authMiddleware, analyzeDocumentEndpoint);
```

**File:** `backend/src/routes/interviews.routes.js`
```javascript
import { analyzeInterviewEndpoint } from '../controllers/interviewsController.js';

router.post('/:id/analyze', authMiddleware, analyzeInterviewEndpoint);
```

### Step 4: Environment Configuration

**File:** `backend/.env`
```bash
# AI Configuration
GEMINI_API_KEY=your_api_key_here
AI_ENABLED=true  # Toggle AI features on/off
AI_MODEL=gemini-1.5-flash
AI_MAX_TOKENS=100000
AI_TIMEOUT=30000  # 30 seconds
```

**File:** `backend/src/config/ai.config.js`
```javascript
export const aiConfig = {
  enabled: process.env.AI_ENABLED === 'true',
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.AI_MODEL || 'gemini-1.5-flash',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 100000,
  timeout: parseInt(process.env.AI_TIMEOUT) || 30000
};

export function checkAIAvailable() {
  if (!aiConfig.enabled) {
    throw new Error('AI features are disabled');
  }
  if (!aiConfig.apiKey) {
    throw new Error('AI API key not configured');
  }
  return true;
}
```

### Step 5: Add Graceful Fallback

**Strategy:** All AI features should be OPTIONAL. System works fully without AI.

```javascript
export async function analyzeDocumentSafely(documentText, title) {
  try {
    checkAIAvailable();
    return await analyzeDocument(documentText, title);
  } catch (error) {
    console.warn('AI analysis unavailable:', error.message);
    return {
      summaryShort: null,
      summaryDetailed: null,
      summaryIsoCompliance: null,
      suggestedControls: []
    };
  }
}
```

---

## Frontend Integration Guide

### Step 1: Add AI Indicators to UI

**Visual Cues:**
- Show "AI" badge on AI-generated content
- Add "Analyze with AI" buttons
- Display loading states during analysis
- Show confidence scores for suggestions

**Example:**
```jsx
{document.summaryShort && (
  <div className="summary">
    <span className="ai-badge">AI Generated</span>
    <p>{document.summaryShort}</p>
  </div>
)}

<button onClick={handleAnalyze} disabled={!aiEnabled || isAnalyzing}>
  {isAnalyzing ? (
    <>
      <Spinner /> Analyzing...
    </>
  ) : (
    <>
      <SparklesIcon /> Analyze with AI
    </>
  )}
</button>
```

### Step 2: Handle AI Errors Gracefully

```javascript
const handleAnalyze = async () => {
  try {
    setIsAnalyzing(true);
    const response = await fetch(`/api/documents/${slug}/analyze`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (response.ok) {
      setDocument(data.document);
      toast.success('Analysis complete!');
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    toast.error(error.message || 'AI analysis unavailable');
    // Fallback: allow manual input
    setShowManualSummaryForm(true);
  } finally {
    setIsAnalyzing(false);
  }
};
```

### Step 3: Add Feature Toggles

**File:** `frontend/src/config/features.js`
```javascript
export const features = {
  aiDocumentAnalysis: import.meta.env.VITE_AI_ENABLED === 'true',
  aiInterviewAnalysis: import.meta.env.VITE_AI_ENABLED === 'true',
  aiSoaAssistance: import.meta.env.VITE_AI_ENABLED === 'true'
};

export function isAIEnabled() {
  return import.meta.env.VITE_AI_ENABLED === 'true';
}
```

**File:** `frontend/.env`
```
VITE_AI_ENABLED=false  # Set to true to enable AI features
```

**Usage:**
```jsx
import { features } from '../config/features';

{features.aiDocumentAnalysis && (
  <button onClick={handleAnalyze}>Analyze with AI</button>
)}
```

---

## Cost Optimization Strategies

### 1. Caching AI Responses

```javascript
// Cache document analysis results
const cache = new Map();

export async function analyzeDocumentCached(documentId, documentText) {
  const cacheKey = `doc_${documentId}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = await analyzeDocument(documentText);
  cache.set(cacheKey, result);

  return result;
}
```

### 2. Batch Processing

```javascript
// Process multiple documents in single API call
export async function analyzeDocumentsBatch(documents) {
  const prompt = documents.map((doc, i) =>
    `Document ${i + 1}: ${doc.title}\n${doc.text}\n\n`
  ).join('');

  // Single AI call for multiple documents
  const results = await model.generateContent(prompt);

  // Parse multiple responses
  return parseMultipleResults(results);
}
```

### 3. Token Optimization

```javascript
// Truncate long documents to save tokens
export function truncateDocument(text, maxTokens = 50000) {
  // Estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;

  if (text.length <= maxChars) {
    return text;
  }

  // Keep start and end, remove middle
  const keepStart = Math.floor(maxChars * 0.6);
  const keepEnd = Math.floor(maxChars * 0.4);

  return text.slice(0, keepStart) +
         '\n\n[... content truncated ...]\n\n' +
         text.slice(-keepEnd);
}
```

### 4. Rate Limiting

```javascript
import pLimit from 'p-limit';

// Limit concurrent AI requests
const limit = pLimit(5); // Max 5 simultaneous requests

export async function analyzeMultipleDocuments(documents) {
  const promises = documents.map(doc =>
    limit(() => analyzeDocument(doc.text, doc.title))
  );

  return Promise.all(promises);
}
```

### 5. Fallback to Simpler Models

```javascript
export async function analyzeWithFallback(documentText) {
  try {
    // Try premium model first
    return await analyzeWithModel('gemini-1.5-pro', documentText);
  } catch (error) {
    if (error.message.includes('quota')) {
      // Fallback to flash model
      return await analyzeWithModel('gemini-1.5-flash', documentText);
    }
    throw error;
  }
}
```

---

## Testing and Validation

### Unit Tests for AI Service

**File:** `backend/tests/aiService.test.js`
```javascript
import { analyzeDocument, analyzeInterview } from '../src/services/aiService.js';

describe('AI Service', () => {
  describe('analyzeDocument', () => {
    it('should return valid summary structure', async () => {
      const mockText = 'This is a sample security policy...';
      const result = await analyzeDocument(mockText, 'Test Policy');

      expect(result).toHaveProperty('summaryShort');
      expect(result).toHaveProperty('summaryDetailed');
      expect(result).toHaveProperty('summaryIsoCompliance');
      expect(result).toHaveProperty('suggestedControls');
      expect(Array.isArray(result.suggestedControls)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const result = await analyzeDocumentSafely('', '');
      expect(result.summaryShort).toBeNull();
    });
  });

  describe('analyzeInterview', () => {
    it('should calculate maturity score between 0-5', async () => {
      const mockInterview = {
        respondent: { name: 'John', role: 'IT Manager' },
        questions: [
          { questionText: 'Q1', answerText: 'A1' }
        ]
      };

      const result = await analyzeInterview(mockInterview);

      expect(result.maturityScore).toBeGreaterThanOrEqual(0);
      expect(result.maturityScore).toBeLessThanOrEqual(5);
    });
  });
});
```

### Integration Tests

**File:** `backend/tests/integration/ai.test.js`
```javascript
describe('AI Endpoints', () => {
  it('POST /api/documents/:slug/analyze should analyze document', async () => {
    const response = await request(app)
      .post('/api/documents/test-policy/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.document.summaryShort).toBeTruthy();
  });

  it('POST /api/interviews/:id/analyze should analyze interview', async () => {
    const response = await request(app)
      .post('/api/interviews/1/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.interview.aiMaturityScore).toBeTruthy();
  });
});
```

### Manual Testing Checklist

- [ ] Get Gemini API key from Google AI Studio
- [ ] Add API key to .env file
- [ ] Upload test document (security policy)
- [ ] Click "Analyze with AI" button
- [ ] Verify summaries are generated
- [ ] Check suggested controls are relevant
- [ ] Create test interview with Q&A
- [ ] Click "Analyze Interview"
- [ ] Verify maturity score is reasonable (0-5)
- [ ] Check contradictions are identified
- [ ] Test error handling (remove API key, check graceful fallback)
- [ ] Test rate limiting (analyze 10 documents quickly)
- [ ] Verify AI responses are cached

---

## Monitoring and Logging

### Track AI Usage

**File:** `backend/src/services/aiService.js`
```javascript
export async function analyzeDocumentWithLogging(documentText, title) {
  const startTime = Date.now();

  try {
    const result = await analyzeDocument(documentText, title);

    // Log success
    await prisma.aiUsageLog.create({
      data: {
        operation: 'document_analysis',
        tokensUsed: estimateTokens(documentText),
        durationMs: Date.now() - startTime,
        success: true,
        model: 'gemini-1.5-flash'
      }
    });

    return result;
  } catch (error) {
    // Log failure
    await prisma.aiUsageLog.create({
      data: {
        operation: 'document_analysis',
        tokensUsed: 0,
        durationMs: Date.now() - startTime,
        success: false,
        errorMessage: error.message,
        model: 'gemini-1.5-flash'
      }
    });

    throw error;
  }
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4); // Rough estimate
}
```

### Add Usage Tracking Table

```prisma
model AIUsageLog {
  id           Int      @id @default(autoincrement())
  operation    String   // document_analysis, interview_analysis, etc.
  tokensUsed   Int
  durationMs   Int
  success      Boolean
  errorMessage String?
  model        String
  createdAt    DateTime @default(now())

  @@map("ai_usage_logs")
}
```

### Cost Dashboard

```javascript
// GET /api/ai/usage-stats
export async function getAIUsageStats(req, res) {
  const stats = await prisma.aiUsageLog.aggregate({
    _sum: { tokensUsed: true },
    _count: { id: true },
    _avg: { durationMs: true }
  });

  const estimatedCost = (stats._sum.tokensUsed / 1000000) * 0.075; // Gemini pricing

  res.json({
    totalRequests: stats._count.id,
    totalTokens: stats._sum.tokensUsed,
    averageDuration: stats._avg.durationMs,
    estimatedCost: `$${estimatedCost.toFixed(2)}`
  });
}
```

---

## Quick Start Guide

### For Claude (Future AI Integration)

When ready to add AI features, follow these steps:

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install @google/generative-ai pdf-parse
   ```

2. **Get API Key:**
   - Visit https://aistudio.google.com/app/apikey
   - Create free API key
   - Add to `backend/.env`: `GEMINI_API_KEY=your_key`

3. **Create AI Service:**
   - Copy code from "Backend Implementation Guide" section
   - Create `backend/src/services/aiService.js`
   - Implement functions: `analyzeDocument`, `analyzeInterview`

4. **Add Routes:**
   - Update `documents.routes.js`: Add `POST /:slug/analyze`
   - Update `interviews.routes.js`: Add `POST /:id/analyze`

5. **Update Controllers:**
   - Add `analyzeDocumentEndpoint` to documentsController
   - Add `analyzeInterviewEndpoint` to interviewsController

6. **Frontend Integration:**
   - Add "Analyze with AI" buttons to DocumentDetailView
   - Add "Analyze with AI" buttons to InterviewDashboard
   - Handle loading states and errors

7. **Test:**
   - Upload document → Click analyze → Check summaries
   - Create interview → Click analyze → Check maturity score

8. **Monitor:**
   - Track usage in database
   - Monitor costs via `/api/ai/usage-stats`
   - Implement rate limiting if needed

---

## Troubleshooting

### Common Issues

**Issue: "API key not valid"**
- Solution: Verify API key is correct in .env file
- Check: https://aistudio.google.com/app/apikey

**Issue: "Quota exceeded"**
- Solution: Using free tier? Wait for rate limit reset (1 minute)
- Alternative: Upgrade to paid tier or use Ollama

**Issue: "Failed to parse AI response"**
- Solution: AI didn't return JSON. Update prompt to enforce JSON output
- Add: "Return ONLY valid JSON, no other text"

**Issue: "Analysis taking too long"**
- Solution: Implement timeout (30 seconds)
- Optimize: Truncate long documents before sending

**Issue: "Poor quality suggestions"**
- Solution: Improve prompts with more examples
- Alternative: Switch to Claude 3.5 for better reasoning

---

## Summary

This guide provides everything needed to integrate AI into NovaTrix:
- ✅ Document analysis (summaries, control identification)
- ✅ Interview analysis (maturity scoring, contradiction detection)
- ✅ SoA assistance (applicability, justifications, remediation)
- ✅ Cost optimization strategies
- ✅ Error handling and fallbacks
- ✅ Testing and monitoring

**System works fully WITHOUT AI - AI is optional enhancement.**

When ready to implement, follow the Quick Start Guide and reference specific sections for detailed code examples.
