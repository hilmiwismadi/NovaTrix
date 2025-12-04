import { sendChatMessage, checkOllamaStatus, generateContextualPrompt } from '../services/ollamaService.js';
import { PrismaClient } from '@prisma/client';
import {
  logAIRequest,
  logConversationHistory,
  logAIResponse,
  logAIError,
  logSessionEvent,
  logDocumentProcessing,
  getLogStats
} from '../utils/logger.js';

const prisma = new PrismaClient();

// In-memory session storage (for session-only memory)
const chatSessions = new Map();

/**
 * POST /api/ai/chat
 * Send message to AI and get response
 */
export const chat = async (req, res) => {
  const requestStartTime = Date.now();

  try {
    const { message, sessionId, history = [], includeContext = false } = req.body;
    const userId = req.user.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required'
      });
    }

    // Generate or use existing session ID
    const currentSessionId = sessionId || `${userId}-${Date.now()}`;

    // Get or create session
    let session = chatSessions.get(currentSessionId);
    if (!session) {
      session = {
        userId,
        messages: [],
        createdAt: new Date()
      };
      chatSessions.set(currentSessionId, session);
      logSessionEvent(currentSessionId, userId, 'created');
    }

    // Build conversation history (limit to last 10 messages)
    const conversationHistory = history.slice(-10);

    // Log the incoming request
    logAIRequest(userId, currentSessionId, message, {
      hasHistory: conversationHistory.length > 0,
      historyCount: conversationHistory.length,
      includeContext
    });

    // Log conversation history if present
    if (conversationHistory.length > 0) {
      logConversationHistory(currentSessionId, conversationHistory.length, conversationHistory);
    }

    // Optional: Include user context (documents, gaps, etc.)
    let enhancedMessage = message;
    if (includeContext) {
      try {
        console.log('📊 Fetching user context for personalized response...');

        // Fetch user's context from database
        const [documents, controls] = await Promise.all([
          prisma.document.findMany({
            where: { userId },
            select: { id: true, title: true }
          }),
          prisma.control.findMany({
            where: { userId },
            select: { controlId: true, complianceStatus: true }
          })
        ]);

        const gaps = controls.filter(c => c.complianceStatus === 'NON_COMPLIANT');
        const complianceScore = controls.length > 0
          ? Math.round((controls.filter(c => c.complianceStatus === 'COMPLIANT').length / controls.length) * 100)
          : 0;

        console.log(`   Found ${documents.length} documents, ${gaps.length} gaps, ${complianceScore}% compliance`);

        // Log document processing if analyzing documents
        if (documents.length > 0) {
          documents.forEach(doc => {
            logDocumentProcessing(userId, currentSessionId, doc.id, doc.title, 'analyzing_for_context');
          });
        }

        enhancedMessage = generateContextualPrompt(message, {
          documents,
          gaps,
          complianceScore
        });
      } catch (dbError) {
        console.error('Error fetching user context:', dbError);
        // Continue with original message if context fetch fails
      }
    }

    // Send to Ollama
    const result = await sendChatMessage(enhancedMessage, conversationHistory, currentSessionId);

    if (!result.success) {
      // Log the error
      logAIError(userId, currentSessionId, new Error(result.error), result.code);

      return res.status(503).json({
        error: 'AI service error',
        message: result.error,
        code: result.code
      });
    }

    // Log the successful AI response
    const totalProcessingTime = Date.now() - requestStartTime;
    logAIResponse(userId, currentSessionId, result.message, result.processingTime || totalProcessingTime);

    // Store message in session
    session.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: result.message, timestamp: new Date() }
    );

    return res.json({
      message: result.message,
      sessionId: currentSessionId,
      model: result.model,
      processingTime: result.processingTime
    });

  } catch (error) {
    // Log the error
    const userId = req.user?.id || 'unknown';
    const sessionId = req.body?.sessionId || 'unknown';
    logAIError(userId, sessionId, error, 'INTERNAL_ERROR');

    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process chat message'
    });
  }
};

/**
 * GET /api/ai/status
 * Check AI service status
 */
export const getStatus = async (req, res) => {
  try {
    const status = await checkOllamaStatus();

    return res.json({
      status: status.available ? 'online' : 'offline',
      modelLoaded: status.modelLoaded,
      availableModels: status.models
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      error: 'Failed to check AI service status'
    });
  }
};

/**
 * DELETE /api/ai/session/:sessionId
 * Clear chat session
 */
export const clearSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = chatSessions.get(sessionId);

    if (!session || session.userId !== userId) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    chatSessions.delete(sessionId);
    logSessionEvent(sessionId, userId, 'cleared');

    return res.json({
      message: 'Session cleared successfully'
    });
  } catch (error) {
    console.error('Clear session error:', error);
    return res.status(500).json({
      error: 'Failed to clear session'
    });
  }
};

/**
 * GET /api/ai/logs/stats
 * Get AI interaction statistics
 */
export const getStats = async (req, res) => {
  try {
    const stats = getLogStats();
    const activeSessions = chatSessions.size;

    return res.json({
      ...stats,
      activeSessions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve statistics'
    });
  }
};

// Clean up old sessions (run periodically)
setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  for (const [sessionId, session] of chatSessions.entries()) {
    if (now - session.createdAt.getTime() > ONE_HOUR) {
      chatSessions.delete(sessionId);
      logSessionEvent(sessionId, session.userId, 'expired');
    }
  }
}, 15 * 60 * 1000); // Run every 15 minutes
