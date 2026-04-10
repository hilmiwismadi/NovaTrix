# NovaTrix RAG Flow Comparison (Local vs API)

This document explains the **current actual implementation** from query input to final answer generation.

## 1) Where query enters the system

- `/documents/:slug` flow:
  - User highlights text in `PDFAnnotationViewer`.
  - Frontend calls `onTextSelected` in `DocumentDetailView`.
  - Frontend sends request to `POST /api/ai/chat` with prompt containing document slug/page/highlighted text.

- `/ragtest` flow:
  - User inputs query manually.
  - Frontend calls `POST /api/ragtest` with `{ query, provider, model }`.
  - Backend calls `sendRagMessage(...)`.

## 2) Backend router/provider decision

Main logic is in `backend/src/services/ragService.js`:

- `sendRagMessage(..., options)`
  - If `options.provider === 'API'` (or default provider is API) -> `runOpenRouterRag(...)`
  - Else, if `RAG_API_URL` exists -> `runRagApi(...)` (HTTP bridge mode)
  - Else -> `runLocalRag(...)` (local Python pipeline bridge)

## 3) LOCAL flow (true pipeline with KB retrieval)

When LOCAL is used:

1. Node spawns Python process and imports:
   - `rag.rag_pipeline.run_rag_raw`
2. Query is passed via `stdin`.
3. Python pipeline executes retrieval/generation internally:
   - embedding/search over its own knowledge base
   - top relevant controls retrieval
   - grounded structured output generation
4. Python returns JSON payload:
   - `result` (structured fields)
   - `retrieved` (retrieved controls + similarity)
   - `elapsed`
5. Node formats output to markdown:
   - Control ID / Applicable / Implementation Status / Justification / Recommendation / Retrieved Controls

This is the path that currently behaves like RAG with KB retrieval.

## 4) API flow (current behavior)

When API is used:

1. Node sends prompt directly to OpenRouter `/chat/completions`.
2. Prompt asks model to produce fixed markdown structure.
3. There is **NO local retrieval stage** in this path:
   - no local embedding lookup
   - no local top-3 Annex retrieval from your RAG project
4. The model may respond in English/Indonesian depending on prompt/model behavior.

So your suspicion is correct: current API mode is **LLM direct completion**, not full local RAG KB pipeline.

## 5) Why you saw 404/429

- 404: selected model slug had no available endpoint.
- 429: provider rate limit for free-tier models.

Current mitigations:
- model fallback list
- retry across fallback models on 400/404/429/503
- detailed provider error payload persisted in `detailedLog`

## 6) Data persistence and observability

`/api/ragtest` stores into `rag_test_runs`:
- `queryText`, `outputText`, `status`
- `processingTimeMs`
- `provider`
- `errorMessage`
- `detailedLog` (raw provider output / error payload)

`/api/ragtest/data` returns historical runs for inspection.

## 7) Gap against your expected API behavior

Expected:
- API provider should still run RAG-style retrieval (KB + embeddings + top controls), then generation.

Current:
- API provider skips retrieval and performs direct LLM completion.

## 8) Recommended next implementation (if you want parity)

To make API mode match local RAG behavior:

1. Keep retrieval in pipeline (local or remote vector DB service).
2. Retrieve top-k controls/chunks first.
3. Build grounded prompt containing retrieved evidence.
4. Send grounded prompt to OpenRouter model for final synthesis.
5. Persist retrieved evidence + scores in DB with output.

This would make API mode = retrieval + generation, not generation-only.
