import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const AI_LOG_FILE = path.join(logsDir, 'ai-interactions.log');
const ERROR_LOG_FILE = path.join(logsDir, 'ai-errors.log');

/**
 * Format timestamp for logs
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Write to log file
 */
const writeToFile = (filepath, message) => {
  try {
    fs.appendFileSync(filepath, message + '\n', 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

/**
 * Log AI interaction start
 */
export const logAIRequest = (userId, sessionId, message, contextInfo = {}) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    type: 'AI_REQUEST',
    userId,
    sessionId,
    messageLength: message.length,
    message: message.substring(0, 200), // First 200 chars for privacy
    hasContext: Object.keys(contextInfo).length > 0,
    contextInfo
  };

  // Console log
  console.log('\n' + '='.repeat(80));
  console.log(`🤖 [AI REQUEST] ${timestamp}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Session: ${sessionId}`);
  console.log(`   Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
  if (Object.keys(contextInfo).length > 0) {
    console.log(`   Context: ${JSON.stringify(contextInfo)}`);
  }
  console.log('='.repeat(80));

  // File log
  writeToFile(AI_LOG_FILE, JSON.stringify(logEntry));
};

/**
 * Log conversation history being sent
 */
export const logConversationHistory = (sessionId, historyCount, history) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    type: 'CONVERSATION_HISTORY',
    sessionId,
    messageCount: historyCount,
    history: history.map(msg => ({
      role: msg.role,
      contentLength: msg.content.length,
      preview: msg.content.substring(0, 50)
    }))
  };

  // Console log
  console.log(`📚 [HISTORY] Sending ${historyCount} previous messages as context`);
  history.forEach((msg, idx) => {
    console.log(`   ${idx + 1}. [${msg.role}]: "${msg.content.substring(0, 60)}..."`);
  });

  // File log
  writeToFile(AI_LOG_FILE, JSON.stringify(logEntry));
};

/**
 * Log Ollama processing
 */
export const logOllamaProcessing = (sessionId, model) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    type: 'OLLAMA_PROCESSING',
    sessionId,
    model,
    status: 'processing'
  };

  // Console log
  console.log(`⚙️  [PROCESSING] Ollama model "${model}" is generating response...`);

  // File log
  writeToFile(AI_LOG_FILE, JSON.stringify(logEntry));
};

/**
 * Log AI response
 */
export const logAIResponse = (userId, sessionId, response, processingTime) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    type: 'AI_RESPONSE',
    userId,
    sessionId,
    responseLength: response.length,
    response: response.substring(0, 200), // First 200 chars
    processingTimeMs: processingTime,
    processingTimeSec: (processingTime / 1000).toFixed(2)
  };

  // Console log
  console.log(`✅ [AI RESPONSE] Generated in ${(processingTime / 1000).toFixed(2)}s`);
  console.log(`   Response length: ${response.length} characters`);
  console.log(`   Preview: "${response.substring(0, 150)}${response.length > 150 ? '...' : ''}"`);
  console.log('='.repeat(80) + '\n');

  // File log
  writeToFile(AI_LOG_FILE, JSON.stringify(logEntry));
};

/**
 * Log AI error
 */
export const logAIError = (userId, sessionId, error, errorCode) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    type: 'AI_ERROR',
    userId,
    sessionId,
    error: error.toString(),
    errorCode,
    stack: error.stack
  };

  // Console log
  console.error(`❌ [AI ERROR] ${timestamp}`);
  console.error(`   User ID: ${userId}`);
  console.error(`   Session: ${sessionId}`);
  console.error(`   Error Code: ${errorCode}`);
  console.error(`   Error: ${error.message}`);
  console.error('='.repeat(80) + '\n');

  // File log
  writeToFile(ERROR_LOG_FILE, JSON.stringify(logEntry));
};

/**
 * Log document compilation/processing (for future feature)
 */
export const logDocumentProcessing = (userId, sessionId, documentId, documentTitle, action) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    type: 'DOCUMENT_PROCESSING',
    userId,
    sessionId,
    documentId,
    documentTitle,
    action // 'analyzing', 'summarizing', 'extracting', etc.
  };

  // Console log
  console.log(`📄 [DOCUMENT] ${action} document: "${documentTitle}"`);
  console.log(`   Document ID: ${documentId}`);
  console.log(`   User ID: ${userId}`);

  // File log
  writeToFile(AI_LOG_FILE, JSON.stringify(logEntry));
};

/**
 * Log model warmup
 */
export const logModelWarmup = (model, success, duration) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    type: 'MODEL_WARMUP',
    model,
    success,
    durationMs: duration,
    durationSec: (duration / 1000).toFixed(2)
  };

  // Console log
  if (success) {
    console.log(`🔥 [WARMUP] Model "${model}" warmed up in ${(duration / 1000).toFixed(2)}s`);
  } else {
    console.log(`⚠️  [WARMUP] Model "${model}" warmup failed`);
  }

  // File log
  writeToFile(AI_LOG_FILE, JSON.stringify(logEntry));
};

/**
 * Log session creation/cleanup
 */
export const logSessionEvent = (sessionId, userId, event) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    type: 'SESSION_EVENT',
    sessionId,
    userId,
    event // 'created', 'cleared', 'expired'
  };

  // Console log
  console.log(`💬 [SESSION] ${event.toUpperCase()}: ${sessionId} (User: ${userId})`);

  // File log
  writeToFile(AI_LOG_FILE, JSON.stringify(logEntry));
};

/**
 * Get log statistics
 */
export const getLogStats = () => {
  try {
    const logContent = fs.readFileSync(AI_LOG_FILE, 'utf8');
    const lines = logContent.trim().split('\n');
    const logs = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    const stats = {
      totalInteractions: logs.filter(l => l.type === 'AI_REQUEST').length,
      totalResponses: logs.filter(l => l.type === 'AI_RESPONSE').length,
      totalErrors: logs.filter(l => l.type === 'AI_ERROR').length,
      averageProcessingTime: 0
    };

    const responseTimes = logs
      .filter(l => l.type === 'AI_RESPONSE' && l.processingTimeMs)
      .map(l => l.processingTimeMs);

    if (responseTimes.length > 0) {
      stats.averageProcessingTime = (
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      ).toFixed(2);
    }

    return stats;
  } catch (error) {
    return {
      error: 'Unable to read log statistics',
      totalInteractions: 0,
      totalResponses: 0,
      totalErrors: 0
    };
  }
};
