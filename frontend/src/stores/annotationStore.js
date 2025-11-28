// Annotation Store
// Zustand store for managing PDF annotations

import { create } from 'zustand';
import apiClient from '../api/client';

const useAnnotationStore = create((set, get) => ({
  // State
  annotations: [],
  isLoading: false,
  error: null,

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

      // Add to annotations list
      set((state) => ({
        annotations: [response.data.annotation, ...state.annotations],
        isLoading: false
      }));

      return { success: true, data: response.data.annotation };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create annotation';
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

      // Update annotation in list
      set((state) => ({
        annotations: state.annotations.map((ann) =>
          ann.id === annotationId ? response.data.annotation : ann
        ),
        isLoading: false
      }));

      return { success: true, data: response.data.annotation };
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

      // Update annotation in list
      set((state) => ({
        annotations: state.annotations.map((ann) =>
          ann.id === annotationId ? response.data.annotation : ann
        ),
        isLoading: false
      }));

      return { success: true, data: response.data.annotation };
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
