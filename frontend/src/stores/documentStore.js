// Document Store
// Zustand store for managing documents state and API calls

import { create } from 'zustand';
import apiClient from '../api/client';

const useDocumentStore = create((set, get) => ({
  // State
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,

  // Get all documents
  fetchDocuments: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await apiClient.get(`/documents?${params.toString()}`);
      set({
        documents: response.data.documents,
        isLoading: false
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch documents';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get document by slug
  fetchDocumentBySlug: async (slug) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/documents/${slug}`);
      set({
        currentDocument: response.data.document,
        isLoading: false
      });
      return { success: true, data: response.data.document };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch document';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Upload document
  uploadDocument: async (formData, onProgress) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      const response = await apiClient.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          set({ uploadProgress: percentCompleted });
          if (onProgress) onProgress(percentCompleted);
        }
      });

      // Add new document to the list
      set((state) => ({
        documents: [response.data.document, ...state.documents],
        isLoading: false,
        uploadProgress: 0
      }));

      return { success: true, data: response.data.document };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload document';
      set({ error: errorMessage, isLoading: false, uploadProgress: 0 });
      return { success: false, error: errorMessage };
    }
  },

  // Update document
  updateDocument: async (slug, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/documents/${slug}`, updateData);

      // Update in documents list
      set((state) => ({
        documents: state.documents.map(doc =>
          doc.slug === slug ? response.data.document : doc
        ),
        currentDocument: state.currentDocument?.slug === slug
          ? response.data.document
          : state.currentDocument,
        isLoading: false
      }));

      return { success: true, data: response.data.document };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update document';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete document
  deleteDocument: async (slug) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/documents/${slug}`);

      // Remove from documents list
      set((state) => ({
        documents: state.documents.filter(doc => doc.slug !== slug),
        currentDocument: state.currentDocument?.slug === slug ? null : state.currentDocument,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete document';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get PDF URL for viewer
  getPDFUrl: (slug) => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL.startsWith('http')
      ? import.meta.env.VITE_API_URL
      : `http://localhost:5000${import.meta.env.VITE_API_URL}`;
    return `${baseUrl}/documents/${slug}/pdf?token=${token}`;
  },

  // Clear current document
  clearCurrentDocument: () => set({ currentDocument: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useDocumentStore;
