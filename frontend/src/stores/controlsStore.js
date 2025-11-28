// Controls Store
// Zustand store for managing Annex A controls

import { create } from 'zustand';
import apiClient from '../api/client';

const useControlsStore = create((set) => ({
  // State
  controls: [],
  isLoading: false,
  error: null,

  // Fetch all controls
  fetchControls: async (category = null) => {
    set({ isLoading: true, error: null });
    try {
      const params = category ? `?category=${category}` : '';
      const response = await apiClient.get(`/controls${params}`);
      set({
        controls: response.data.controls,
        isLoading: false
      });
      return { success: true, data: response.data.controls };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch controls';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get control by ID (from local state)
  getControlById: (id) => {
    const state = useControlsStore.getState();
    return state.controls.find(c => c.id === id);
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useControlsStore;
