// Annotation Store
// Zustand store for managing PDF annotations

import { create } from 'zustand';
import apiClient from '../api/client';
import useSOAStore from './soaStore';

const extractSummaryObject = (input) => {
  if (!input) return null;
  if (typeof input === 'object') return input;

  const text = String(input).trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // ignore and continue
  }

  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  let candidate = null;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }
    if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        const segment = text.slice(start, i + 1);
        try {
          candidate = JSON.parse(segment);
        } catch {
          // ignore invalid segment
        }
        start = -1;
      }
    }
  }

  return candidate;
};

const normalizeParsedSummary = (raw) => {
  const obj = extractSummaryObject(raw);
  if (!obj) return null;

  const retrievedControls = Array.isArray(obj.retrieved_controls)
    ? obj.retrieved_controls.map((item) => ({
        id: item?.id || '-',
        score: Number(item?.score || 0)
      }))
    : [];

  return {
    controlId: String(obj.control_id || '-'),
    applicable: String(obj.applicable || '-'),
    implementationStatus: String(obj.implementation_status || '-'),
    justification: String(obj.justification || '-'),
    recommendation: String(obj.recommendation || '-'),
    retrievedControls
  };
};

const useAnnotationStore = create((set, get) => ({
  // State
  annotations: [],
  isLoading: false,
  error: null,

  parseControlIdFromSummary: (summary = '', parsedSummary = null) => {
    const normalized = normalizeParsedSummary(parsedSummary || summary);
    if (normalized?.controlId && normalized.controlId !== '-') {
      return normalized.controlId;
    }
    const match = String(summary).match(/\*\*Control ID:\*\*\s*([A-Za-z0-9.-]+)/i);
    return match ? match[1].trim() : null;
  },

  // Fetch annotations for a document
  fetchAnnotations: async (documentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/annotations/document/${documentId}`);
      set({
        annotations: response.data.annotations,
        isLoading: false
      });
      return { success: true, data: response.data.annotations };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch annotations';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Create annotation
  createAnnotation: async (annotationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/annotations', annotationData);

      // Map backend fields to frontend fields
      const mappedAnnotation = {
        ...response.data.annotation,
        content: response.data.annotation.highlightedText,
        position: response.data.annotation.positionData,
        pageNumber: JSON.parse(response.data.annotation.positionData).pageNumber
      };

      // Add to annotations list
      set((state) => ({
        annotations: [mappedAnnotation, ...state.annotations],
        isLoading: false
      }));

      return { success: true, data: mappedAnnotation };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create annotation';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createAnnotationFromRag: async ({ documentId, selectedText, position, pageNumber, summary, parsedSummary, rawOutput, elapsedMs }) => {
    set({ isLoading: true, error: null });
    try {
      const normalizedSummary = normalizeParsedSummary(parsedSummary || summary);
      const controlId = get().parseControlIdFromSummary(summary, normalizedSummary);
      const payload = {
        documentId,
        content: selectedText,
        position,
        pageNumber,
        color: '#ADD8E6',
        summary,
        ragParsedSummary: normalizedSummary || null,
        ragRawOutput: rawOutput || null,
        ragElapsedMs: elapsedMs || null,
        ragStatus: 'success',
        ragControlId: controlId || null,
        controlIds: controlId ? [controlId] : []
      };

      const response = await apiClient.post('/annotations', payload);
      const mappedAnnotation = {
        ...response.data.annotation,
        content: response.data.annotation.highlightedText,
        position: response.data.annotation.positionData,
        pageNumber: JSON.parse(response.data.annotation.positionData).pageNumber,
        summary: response.data.annotation.summary || summary,
        parsedSummary: normalizeParsedSummary(
          response.data.annotation.ragParsedSummary || normalizedSummary || response.data.annotation.summary || summary
        )
      };

      set((state) => ({
        annotations: [mappedAnnotation, ...state.annotations],
        isLoading: false
      }));

      if (normalizedSummary?.controlId && normalizedSummary.controlId !== '-') {
        await useSOAStore.getState().syncFromAnnotation({
          controlId: normalizedSummary.controlId,
          applicable: normalizedSummary.applicable,
          implementationStatus: normalizedSummary.implementationStatus,
          justification: normalizedSummary.justification,
          recommendation: normalizedSummary.recommendation
        });
      }

      return { success: true, data: mappedAnnotation };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create RAG annotation';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update annotation
  updateAnnotation: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/annotations/${id}`, updateData);

      // Update in annotations list
      set((state) => ({
        annotations: state.annotations.map((ann) =>
          ann.id === id ? response.data.annotation : ann
        ),
        isLoading: false
      }));

      return { success: true, data: response.data.annotation };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update annotation';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete annotation
  deleteAnnotation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/annotations/${id}`);

      // Remove from annotations list
      set((state) => ({
        annotations: state.annotations.filter((ann) => ann.id !== id),
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete annotation';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Add control to annotation
  addControlToAnnotation: async (annotationId, controlId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/annotations/${annotationId}/controls`, {
        controlId
      });

      // Map backend fields to frontend fields
      const mappedAnnotation = {
        ...response.data.annotation,
        content: response.data.annotation.highlightedText,
        position: response.data.annotation.positionData,
        pageNumber: JSON.parse(response.data.annotation.positionData).pageNumber
      };

      // Update annotation in list
      set((state) => ({
        annotations: state.annotations.map((ann) =>
          ann.id === annotationId ? mappedAnnotation : ann
        ),
        isLoading: false
      }));

      return { success: true, data: mappedAnnotation };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add control';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Remove control from annotation
  removeControlFromAnnotation: async (annotationId, controlId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete(`/annotations/${annotationId}/controls/${controlId}`);

      // Map backend fields to frontend fields
      const mappedAnnotation = {
        ...response.data.annotation,
        content: response.data.annotation.highlightedText,
        position: response.data.annotation.positionData,
        pageNumber: JSON.parse(response.data.annotation.positionData).pageNumber
      };

      // Update annotation in list
      set((state) => ({
        annotations: state.annotations.map((ann) =>
          ann.id === annotationId ? mappedAnnotation : ann
        ),
        isLoading: false
      }));

      return { success: true, data: mappedAnnotation };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove control';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear annotations
  clearAnnotations: () => set({ annotations: [], error: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useAnnotationStore;
