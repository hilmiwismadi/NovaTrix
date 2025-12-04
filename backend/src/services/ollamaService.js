import axios from 'axios';
import { logOllamaProcessing, logModelWarmup } from '../utils/logger.js';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'saki007ster/CybersecurityRiskAnalyst';

// Timeout for AI responses (60 seconds for first load, then faster)
const OLLAMA_TIMEOUT = 60000;

// System prompt for the AI
const SYSTEM_PROMPT = `You are an expert ISO 27001 compliance assistant for NovaTrix, an audit management system.

Your role is to:
1. Answer questions about ISO 27001 controls, requirements, and best practices
2. Provide guidance on compliance implementation
3. Analyze security gaps and recommend remediation
4. Explain technical security concepts in clear, professional language
5. Help users understand their compliance status and next steps

Keep responses concise (2-3 paragraphs), actionable, and focused on ISO 27001 compliance. If you don't know something, admit it rather than guessing.`;

/**
 * Send message to Ollama API and get response
 */
export const sendChatMessage = async (userMessage, conversationHistory = [], sessionId = null) => {
  const startTime = Date.now();

  try {
    // Build conversation context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    // Log that Ollama is processing
    logOllamaProcessing(sessionId, OLLAMA_MODEL);

    // Call Ollama API
    const response = await axios.post(
      `${OLLAMA_API_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false, // Use batch mode for simplicity
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      },
      {
        timeout: OLLAMA_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      message: response.data.message.content,
      model: OLLAMA_MODEL,
      processingTime
    };

  } catch (error) {
    console.error('Ollama API Error:', error.message);

    // Handle specific error cases
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'AI service is offline. Please ensure Ollama is running.',
        code: 'CONNECTION_REFUSED'
      };
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'AI response timeout. The model may be loading. Please try again.',
        code: 'TIMEOUT'
      };
    }

    if (error.response?.status === 404) {
      return {
        success: false,
        error: `Model "${OLLAMA_MODEL}" not found. Please pull the model first.`,
        code: 'MODEL_NOT_FOUND'
      };
    }

    return {
      success: false,
      error: 'An error occurred while processing your request.',
      code: 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Check if Ollama service is available
 */
export const checkOllamaStatus = async () => {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, {
      timeout: 5000
    });

    const hasModel = response.data.models?.some(
      m => m.name === OLLAMA_MODEL || m.name === `${OLLAMA_MODEL}:latest`
    );

    return {
      available: true,
      modelLoaded: hasModel,
      models: response.data.models?.map(m => m.name) || []
    };
  } catch (error) {
    return {
      available: false,
      modelLoaded: false,
      models: []
    };
  }
};

/**
 * Generate context-aware prompt with user's documents/gaps
 */
export const generateContextualPrompt = (userMessage, userContext = {}) => {
  let contextInfo = '';

  if (userContext.documents && userContext.documents.length > 0) {
    contextInfo += `\n\nUser has uploaded ${userContext.documents.length} documents: ${userContext.documents.map(d => d.title).join(', ')}.`;
  }

  if (userContext.gaps && userContext.gaps.length > 0) {
    contextInfo += `\n\nUser has ${userContext.gaps.length} identified gaps in controls: ${userContext.gaps.map(g => g.controlId).join(', ')}.`;
  }

  if (userContext.complianceScore !== undefined) {
    contextInfo += `\n\nCurrent compliance score: ${userContext.complianceScore}%.`;
  }

  return userMessage + (contextInfo ? contextInfo : '');
};

/**
 * Warm up the model by sending a test message
 * Call this when server starts to preload model into memory
 */
export const warmupModel = async () => {
  const startTime = Date.now();

  try {
    console.log('🔥 Warming up Ollama model...');

    await axios.post(
      `${OLLAMA_API_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hi' }
        ],
        stream: false
      },
      {
        timeout: OLLAMA_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const duration = Date.now() - startTime;
    logModelWarmup(OLLAMA_MODEL, true, duration);
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    logModelWarmup(OLLAMA_MODEL, false, duration);
    console.warn('⚠️  Model warmup failed:', error.message);
    console.warn('   First AI request may be slower than usual');
    return false;
  }
};
