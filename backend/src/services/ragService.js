import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
const getRagApiUrl = () => process.env.RAG_API_URL || '';
const getRagTimeout = () => Number(process.env.RAG_TIMEOUT_MS || 120000);
const getRagPythonCmd = () => process.env.RAG_PYTHON_CMD || 'python';
const getRagDefaultProvider = () => (process.env.RAG_DEFAULT_PROVIDER || 'LOCAL').toUpperCase();
const getOpenRouterApiKey = () => process.env.OPENROUTER_API_KEY || '';
const getOpenRouterModel = () => process.env.OPENROUTER_MODEL || 'google/gemma-3-12b-it:free';
const getOpenRouterApiUrl = () => process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const getOpenRouterReferer = () => process.env.OPENROUTER_REFERER || 'http://localhost:5173';
const getOpenRouterTitle = () => process.env.OPENROUTER_TITLE || 'NovaTrix RAG';
const getOpenRouterFallbackModels = () => {
  const raw = process.env.OPENROUTER_FALLBACK_MODELS || 'mistralai/mistral-7b-instruct:free,openai/gpt-3.5-turbo,google/gemma-3-4b-it:free';
  return raw.split(',').map((v) => v.trim()).filter(Boolean);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..', '..');
const defaultRagProjectPath = path.resolve(backendRoot, '..', '..', 'RAG', 'rag', 'iso_rag_project');
const getRagProjectPath = () => process.env.RAG_PROJECT_PATH || defaultRagProjectPath;

const buildRagMarkdownResponse = (payload) => {
  const retrieved = payload._retrieved_controls || [];
  const refs = retrieved.length > 0
    ? retrieved.map((r) => `- ${r.control_id} (score: ${Number(r.similarity_score || 0).toFixed(4)})`).join('\n')
    : '- No retrieved controls returned';

  return [
    `**Control ID:** ${payload.control_id || '-'}`,
    `**Applicable:** ${payload.applicable || '-'}`,
    `**Implementation Status:** ${payload.implementation_status || '-'}`,
    '',
    `**Justification**`,
    payload.justification || '-',
    '',
    `**Recommendation**`,
    payload.recommendation || '-',
    '',
    `**Retrieved Controls**`,
    refs
  ].join('\n');
};

const normalizeEnum = (value, allowed, fallback) => {
  const text = String(value || '').trim();
  if (allowed.includes(text)) return text;
  const lower = text.toLowerCase();
  if (allowed.includes('Yes') && (lower === 'ya' || lower === 'yes')) return 'Yes';
  if (allowed.includes('No') && (lower === 'tidak' || lower === 'no')) return 'No';
  if (allowed.includes('Partially Implemented') && lower.includes('partial')) return 'Partially Implemented';
  if (allowed.includes('Not Implemented') && (lower.includes('not') || lower.includes('belum'))) return 'Not Implemented';
  if (allowed.includes('Implemented') && (lower.includes('implemented') || lower.includes('sudah'))) return 'Implemented';
  return fallback;
};

const ensureStrictRagJson = (candidate, retrievedControls = []) => {
  const validControlPattern = /^A\.[5-8]\.\d+$/i;
  const topControl = retrievedControls[0]?.control_id || 'A.5.1';
  const controlIdRaw = String(candidate?.control_id || '').trim();
  const control_id = validControlPattern.test(controlIdRaw) ? controlIdRaw : topControl;
  const applicable = normalizeEnum(candidate?.applicable, ['Yes', 'No'], 'Yes');
  const implementation_status = normalizeEnum(
    candidate?.implementation_status,
    ['Implemented', 'Partially Implemented', 'Not Implemented'],
    'Partially Implemented'
  );
  const justification = String(candidate?.justification || '').trim() || 'Penilaian didasarkan pada kontrol yang di-retrieve dari basis pengetahuan internal.';
  const recommendation = String(candidate?.recommendation || '').trim() || 'Lakukan perbaikan kontrol sesuai temuan dan verifikasi implementasi secara berkala.';
  const retrieved_controls = retrievedControls.map((r) => ({
    id: r.control_id,
    score: Number(r.similarity_score || 0)
  }));

  return {
    control_id,
    applicable,
    implementation_status,
    justification,
    recommendation,
    retrieved_controls
  };
};

const extractJsonObjectFromText = (text) => {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  // Parse last valid JSON object in mixed stdout logs
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  let lastValid = null;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
      continue;
    }

    if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        const candidate = trimmed.slice(start, i + 1);
        try {
          lastValid = JSON.parse(candidate);
        } catch {
          // ignore invalid candidate
        }
        start = -1;
      }
    }
  }

  return lastValid;
};

const runPythonWithStdin = (script, stdinText) => new Promise((resolve, reject) => {
  const ragTimeout = getRagTimeout();
  const child = spawn(getRagPythonCmd(), ['-c', script], {
    cwd: getRagProjectPath(),
    windowsHide: true
  });

  let stdout = '';
  let stderr = '';

  const timeoutHandle = setTimeout(() => {
    child.kill();
    const timeoutError = new Error(`Local RAG timed out after ${ragTimeout}ms`);
    timeoutError.code = 'ETIMEDOUT';
    timeoutError.rawOutput = `${stdout}\n${stderr}`;
    reject(timeoutError);
  }, ragTimeout);

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    if (stderr.length < 10000) {
      stderr += chunk.toString();
    }
  });

  child.on('error', (error) => {
    clearTimeout(timeoutHandle);
    reject(error);
  });

  child.on('close', (code) => {
    clearTimeout(timeoutHandle);
    if (code === 0) {
      resolve({ stdout, stderr });
      return;
    }

    const processError = new Error(`Local RAG process exited with code ${code}. ${stderr.slice(-1200)}`);
    processError.code = 'RAG_PROCESS_EXIT';
    processError.rawOutput = `${stdout}\n${stderr}`;
    reject(processError);
  });

  child.stdin.write(stdinText || '');
  child.stdin.end();
});

const runLocalRag = async (userMessage) => {
  const ragProjectPath = getRagProjectPath();
  const wrapperCode = `
import json, sys
sys.path.insert(0, r"${ragProjectPath}")
from rag.rag_pipeline import run_rag_raw
user_message = sys.stdin.read()
result, raw, elapsed, retrieved = run_rag_raw(user_message)
print(json.dumps({
  "result": result,
  "raw": raw,
  "elapsed": elapsed,
  "retrieved": retrieved
}, ensure_ascii=False))
  `.trim();

  const { stdout } = await runPythonWithStdin(wrapperCode, userMessage);

  const parsed = extractJsonObjectFromText(stdout);
  if (!parsed) {
    return {
      success: false,
      error: `RAG returned no parseable JSON output. Raw output: ${(stdout || '').slice(0, 500)}`,
      code: 'RAG_PARSE_FAILED',
      rawOutput: stdout
    };
  }
  const result = parsed.result;

  if (!result) {
    return {
      success: false,
      error: `RAG returned unparsable output: ${parsed.raw || 'Unknown parse error'}`,
      code: 'RAG_PARSE_FAILED',
      rawOutput: parsed.raw || stdout
    };
  }

  const combined = {
    ...result,
    _retrieved_controls: parsed.retrieved || []
  };

  return {
    success: true,
    message: buildRagMarkdownResponse(combined),
    model: 'RAG_LOCAL_PIPELINE',
    processingTime: Math.round((parsed.elapsed || 0) * 1000),
    rawOutput: parsed.raw || '',
    parsedResult: combined
  };
};

const runSharedRetrieval = async (userMessage) => {
  const ragProjectPath = getRagProjectPath();
  const wrapperCode = `
import json, sys
sys.path.insert(0, r"${ragProjectPath}")
from retrieval.retrieve import retrieve_top3, format_retrieved_for_prompt
from rag.rag_pipeline import build_rag_prompt
sentence = sys.stdin.read()
retrieved = retrieve_top3(sentence)
prompt = build_rag_prompt(sentence, retrieved)
print(json.dumps({
  "retrieved": retrieved,
  "prompt": prompt
}, ensure_ascii=False))
  `.trim();

  const { stdout } = await runPythonWithStdin(wrapperCode, userMessage);
  const parsed = extractJsonObjectFromText(stdout);
  if (!parsed || !Array.isArray(parsed.retrieved)) {
    return {
      success: false,
      error: `Shared retrieval failed. Raw output: ${(stdout || '').slice(0, 700)}`,
      code: 'RAG_RETRIEVAL_FAILED',
      rawOutput: stdout
    };
  }

  return {
    success: true,
    retrieved: parsed.retrieved,
    prompt: parsed.prompt || ''
  };
};

const runRagApi = async (userMessage, conversationHistory, sessionId) => {
  const ragApiUrl = getRagApiUrl();
  const response = await axios.post(
    `${ragApiUrl}/chat`,
    {
      message: userMessage,
      history: conversationHistory,
      sessionId
    },
    {
      timeout: getRagTimeout(),
      headers: { 'Content-Type': 'application/json' }
    }
  );

  const message = response.data?.message || response.data?.answer;
  if (!message) {
    return {
      success: false,
      error: 'RAG pipeline returned an invalid response payload.',
      code: 'RAG_INVALID_RESPONSE'
    };
  }

  return {
    success: true,
    message,
    model: 'RAG_PIPELINE',
    processingTime: 0,
    rawOutput: JSON.stringify(response.data),
    parsedResult: null
  };
};

const callOpenRouter = async (model, formatPrompt, openRouterApiKey) => {
  const response = await axios.post(
    getOpenRouterApiUrl(),
    {
      model,
      messages: [{ role: 'user', content: formatPrompt }],
      temperature: 0.1
    },
    {
      timeout: getRagTimeout(),
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': getOpenRouterReferer(),
        'X-OpenRouter-Title': getOpenRouterTitle()
      }
    }
  );
  return response;
};

const buildOpenRouterErrorDetail = (error) => {
  const status = error?.response?.status || null;
  const data = error?.response?.data || null;
  const rawMessage =
    data?.error?.metadata?.raw ||
    data?.error?.message ||
    data?.message ||
    error?.message ||
    'Unknown error';

  return {
    status,
    isRateLimited: status === 429,
    rawMessage,
    detail: data ? JSON.stringify(data) : rawMessage
  };
};

const shouldRetryOpenRouterError = (error) => {
  const { status, rawMessage } = buildOpenRouterErrorDetail(error);
  const text = String(rawMessage || '').toLowerCase();
  if ([400, 404, 408, 409, 429, 500, 502, 503, 504].includes(status)) return true;
  if (text.includes('rate-limit')) return true;
  if (text.includes('rate limited')) return true;
  if (text.includes('no endpoints found')) return true;
  if (text.includes('temporarily unavailable')) return true;
  return false;
};

const runOpenRouterRag = async (userMessage, options = {}) => {
  const selectedModel = options.model || getOpenRouterModel();
  const openRouterApiKey = getOpenRouterApiKey();

  if (!openRouterApiKey) {
    return {
      success: false,
      error: 'OPENROUTER_API_KEY is not configured in backend/.env.',
      code: 'OPENROUTER_KEY_MISSING',
      rawOutput: ''
    };
  }

  const retrieval = await runSharedRetrieval(userMessage);
  if (!retrieval.success) {
    return {
      success: false,
      error: retrieval.error,
      code: retrieval.code,
      rawOutput: retrieval.rawOutput
    };
  }

  const strictJsonInstruction = `
Keluaran WAJIB satu JSON valid saja (tanpa markdown/code fence) dengan schema:
{
  "control_id": "A.x.x",
  "applicable": "Yes|No",
  "implementation_status": "Implemented|Partially Implemented|Not Implemented",
  "justification": "bahasa Indonesia",
  "recommendation": "bahasa Indonesia",
  "retrieved_controls": [
    {"id":"A.x.x","score":0.0000}
  ]
}
Aturan wajib:
- Gunakan HANYA evidence retrieved controls yang disediakan.
- Jangan gunakan pengetahuan eksternal.
- Bahasa Indonesia untuk justification dan recommendation.
- Field retrieved_controls harus memuat top-3 kontrol terambil beserta skor.
`.trim();

  const formatPrompt = `${retrieval.prompt}\n\n${strictJsonInstruction}`;

  const startTime = Date.now();
  const modelsToTry = [selectedModel, ...getOpenRouterFallbackModels().filter((m) => m !== selectedModel)];
  let response = null;
  let lastError = null;
  let usedModel = selectedModel;
  let seenRateLimit = false;
  let rateLimitMessage = '';

  for (const model of modelsToTry) {
    try {
      response = await callOpenRouter(model, formatPrompt, openRouterApiKey);
      usedModel = model;
      break;
    } catch (error) {
      lastError = error;
      const { status, isRateLimited, rawMessage } = buildOpenRouterErrorDetail(error);
      if (isRateLimited) {
        seenRateLimit = true;
        rateLimitMessage = rawMessage;
      }
      if (shouldRetryOpenRouterError(error)) {
        continue;
      }
      throw error;
    }
  }

  if (!response) {
    const { status, detail } = buildOpenRouterErrorDetail(lastError);
    if (seenRateLimit) {
      return {
        success: false,
        error: `OpenRouter rate-limited the selected model(s). ${rateLimitMessage || 'Please retry shortly.'}`,
        code: 'OPENROUTER_RATE_LIMIT',
        processingTime: Date.now() - startTime,
        rawOutput: detail
      };
    }

    return {
      success: false,
      error: `OpenRouter failed for all candidate models. Last status: ${status || 'N/A'}`,
      code: 'OPENROUTER_MODEL_UNAVAILABLE',
      processingTime: Date.now() - startTime,
      rawOutput: detail
    };
  }

  const message = response.data?.choices?.[0]?.message?.content || '';
  if (!message) {
    return {
      success: false,
      error: 'OpenRouter returned empty completion.',
      code: 'OPENROUTER_EMPTY',
      rawOutput: JSON.stringify(response.data)
    };
  }

  const parsed = extractJsonObjectFromText(message);
  const strictJson = ensureStrictRagJson(parsed || {}, retrieval.retrieved);

  return {
    success: true,
    message: JSON.stringify(strictJson, null, 2),
    model: usedModel,
    provider: 'API',
    processingTime: Date.now() - startTime,
    rawOutput: JSON.stringify({
      providerResponse: response.data,
      retrieved: retrieval.retrieved
    }),
    parsedResult: {
      ...strictJson,
      _retrieved_controls: retrieval.retrieved
    }
  };
};

export const sendRagMessage = async (userMessage, conversationHistory = [], sessionId = null, options = {}) => {
  const startTime = Date.now();
  const provider = (options.provider || getRagDefaultProvider()).toUpperCase();

  try {
    if (provider === 'API') {
      const apiResult = await runOpenRouterRag(userMessage, options);
      return {
        ...apiResult,
        processingTime: apiResult.processingTime || (Date.now() - startTime),
        provider: 'API'
      };
    }

    if (getRagApiUrl()) {
      const result = await runRagApi(userMessage, conversationHistory, sessionId);
      return { ...result, processingTime: Date.now() - startTime, provider: 'HTTP' };
    }

    if (!fs.existsSync(getRagProjectPath())) {
      return {
        success: false,
        error: `RAG_PROJECT_PATH not found: ${getRagProjectPath()}. Set RAG_PROJECT_PATH or RAG_API_URL in backend/.env.`,
        code: 'RAG_PROJECT_NOT_FOUND'
      };
    }

    const localResult = await runLocalRag(userMessage);
    return {
      ...localResult,
      processingTime: localResult.processingTime || (Date.now() - startTime),
      provider: 'LOCAL'
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'RAG pipeline API is offline. Ensure your RAG service is running.',
        code: 'RAG_CONNECTION_REFUSED',
        processingTime: Date.now() - startTime,
        rawOutput: error.rawOutput || JSON.stringify(error.response?.data || {})
      };
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'RAG pipeline timed out. Please try again.',
        code: 'RAG_TIMEOUT',
        processingTime: Date.now() - startTime,
        rawOutput: error.rawOutput || ''
      };
    }

    if (error.code === 'ENOENT') {
      return {
        success: false,
        error: `Python command not found: "${getRagPythonCmd()}". Set RAG_PYTHON_CMD in backend/.env.`,
        code: 'RAG_PYTHON_NOT_FOUND',
        processingTime: Date.now() - startTime,
        rawOutput: error.rawOutput || ''
      };
    }

    return {
      success: false,
      error: `RAG pipeline request failed: ${error.message}`,
      code: 'RAG_UNKNOWN_ERROR',
      processingTime: Date.now() - startTime,
      rawOutput: error.rawOutput || JSON.stringify({
        status: error.response?.status || null,
        statusText: error.response?.statusText || null,
        data: error.response?.data || null,
        message: error.message
      })
    };
  }
};

export const extractControlIdFromRagMessage = (message = '') => {
  const match = message.match(/\*\*Control ID:\*\*\s*([A-Za-z0-9\.\-]+)/i);
  return match ? match[1].trim() : null;
};

export const checkRagStatus = async () => {
  if (getRagApiUrl()) {
    try {
      await axios.get(`${getRagApiUrl()}/health`, { timeout: 5000 });
      return {
        available: true,
        modelLoaded: true,
        models: ['RAG_PIPELINE_API']
      };
    } catch {
      return {
        available: false,
        modelLoaded: false,
        models: []
      };
    }
  }

  return {
    available: fs.existsSync(getRagProjectPath()),
    modelLoaded: fs.existsSync(getRagProjectPath()),
    models: ['RAG_LOCAL_PIPELINE']
  };
};
