// SOA (Statement of Applicability) Store
// Zustand store for managing SOA entries and evidence

import { create } from 'zustand';
import apiClient from '../api/client';

const useSOAStore = create((set, get) => ({
  // State
  entries: [],
  isLoading: false,
  error: null,
  selectedEvidence: null,
  isLoadingEvidence: false,

  // Fetch all SOA entries with evidence summary
  fetchSOAEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/soa');
      set({
        entries: response.data.entries,
        isLoading: false
      });
      return { success: true, data: response.data.entries };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch SOA entries';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Update SOA entry with optimistic UI update
  updateSOAEntry: async (id, updates) => {
    const { entries } = get();

    // Store original entries for rollback
    const originalEntries = [...entries];

    // Optimistic update: update UI immediately
    const updatedEntries = entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    set({ entries: updatedEntries });

    try {
      const response = await apiClient.put(`/soa/${id}`, updates);

      // Update with server response to ensure consistency
      const serverUpdatedEntries = entries.map(entry =>
        entry.id === id ? { ...entry, ...response.data.entry } : entry
      );
      set({ entries: serverUpdatedEntries });

      return { success: true, data: response.data.entry };
    } catch (error) {
      // Rollback on error
      set({ entries: originalEntries });

      const errorMessage = error.response?.data?.message || 'Failed to update SOA entry';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch detailed evidence for a control
  fetchEvidence: async (controlId) => {
    set({ isLoadingEvidence: true, selectedEvidence: null });
    try {
      const response = await apiClient.get(`/soa/evidence/${controlId}`);
      set({
        selectedEvidence: response.data,
        isLoadingEvidence: false
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch evidence';
      set({ error: errorMessage, isLoadingEvidence: false });
      return { success: false, error: errorMessage };
    }
  },

  // Sync SOA entry from annotation parsed summary using existing /soa endpoints
  syncFromAnnotation: async ({ controlId, applicable, implementationStatus, justification, recommendation }) => {
    try {
      const mapApplicable = (value) => {
        const v = String(value || '').toLowerCase();
        if (v === 'yes' || v === 'applicable') return 'applicable';
        if (v === 'no' || v === 'not-applicable') return 'not-applicable';
        return 'not-determined';
      };
      const mapImplementationStatus = (value) => {
        const v = String(value || '').toLowerCase();
        if (v === 'implemented') return 'implemented';
        if (v === 'partially implemented' || v === 'partially-implemented') return 'partially-implemented';
        if (v === 'not implemented' || v === 'not-implemented') return 'not-implemented';
        return 'planned';
      };

      const entriesResponse = await apiClient.get('/soa');
      const targetEntry = (entriesResponse.data.entries || []).find((entry) => entry.controlId === controlId);
      if (!targetEntry) {
        return { success: false, error: `SOA entry not found for control ${controlId}` };
      }

      const updateResponse = await apiClient.put(`/soa/${targetEntry.id}`, {
        applicability: mapApplicable(applicable),
        implementationStatus: mapImplementationStatus(implementationStatus),
        justification: justification || '',
        implementationMethod: recommendation || ''
      });

      const { entries } = get();
      const updatedEntries = entries.map((entry) =>
        entry.id === targetEntry.id ? { ...entry, ...updateResponse.data.entry } : entry
      );
      set({ entries: updatedEntries });

      return { success: true, data: updateResponse.data.entry };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to sync SOA entry from annotation';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Clear selected evidence
  clearEvidence: () => set({ selectedEvidence: null }),

  // Clear error
  clearError: () => set({ error: null }),

  // Get entry by control ID (from local state)
  getEntryByControlId: (controlId) => {
    const { entries } = get();
    return entries.find(entry => entry.controlId === controlId);
  },

  // Get entry by ID (from local state)
  getEntryById: (id) => {
    const { entries } = get();
    return entries.find(entry => entry.id === id);
  }
}));

export default useSOAStore;
