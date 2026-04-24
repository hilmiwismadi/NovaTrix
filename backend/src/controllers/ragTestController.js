import { PrismaClient } from '@prisma/client';
import { sendRagMessage } from '../services/ragService.js';

const prisma = new PrismaClient();

export const runRagTest = async (req, res) => {
  try {
    const { query, documentSlug, provider = 'LOCAL', model = null } = req.body;
    const userId = req.user?.id || null;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'query is required'
      });
    }

    let documentId = null;
    if (documentSlug) {
      const doc = await prisma.document.findUnique({ where: { slug: documentSlug } });
      if (doc) documentId = doc.id;
    }

    const run = await prisma.ragTestRun.create({
      data: {
        userId,
        documentId,
        queryText: query,
        status: 'pending',
        provider: provider?.toUpperCase() || 'LOCAL'
      }
    });

    const startedAt = Date.now();
    const result = await sendRagMessage(query, [], `ragtest-${run.id}`, { provider, model });
    const totalElapsedMs = Date.now() - startedAt;
    const llmProcessingMs = result.processingTime || null;

    const updated = await prisma.ragTestRun.update({
      where: { id: run.id },
      data: {
        outputText: result.success ? result.message : null,
        processingTimeMs: totalElapsedMs,
        status: result.success ? 'success' : 'failed',
        errorMessage: result.success ? null : result.error,
        detailedLog: result.rawOutput || (result.success ? 'Completed without raw logs.' : 'No detailed log returned by provider.'),
        provider: result.model || result.provider || (provider?.toUpperCase() || 'LOCAL')
      }
    });

    return res.json({
      runId: updated.id,
      status: updated.status,
      output: updated.outputText,
      processingTimeMs: updated.processingTimeMs,
      llmInferenceMs: llmProcessingMs,
      timing: result.timing || null,
      error: updated.errorMessage,
      detailedLog: updated.detailedLog,
      provider: updated.provider,
      model: result.model || null,
      parsedSummary: result.parsedResult || null
    });
  } catch (error) {
    console.error('runRagTest error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to run RAG test',
      detail: error.message
    });
  }
};

export const getRagTestRuns = async (req, res) => {
  try {
    const runs = await prisma.ragTestRun.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        document: {
          select: { id: true, slug: true, title: true }
        },
        user: {
          select: { id: true, email: true, fullName: true }
        }
      }
    });

    return res.json({ runs, total: runs.length });
  } catch (error) {
    console.error('getRagTestRuns error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch RAG test data',
      detail: error.message
    });
  }
};
