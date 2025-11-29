// Controls Store
// Zustand store for managing Annex A controls

import { create } from 'zustand';
import apiClient from '../api/client';

// Control categories
export const CATEGORIES = {
  ORGANIZATIONAL: 'A.5 - Organizational Controls',
  PEOPLE: 'A.6 - People Controls',
  PHYSICAL: 'A.7 - Physical Controls',
  TECHNOLOGICAL: 'A.8 - Technological Controls'
};

const useControlsStore = create((set) => ({
  // State
  controls: [],
  selectedControl: null,
  isLoading: false,
  isLoadingDetail: false,
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

  // Fetch single control with full details
  fetchControlById: async (id) => {
    set({ isLoadingDetail: true, error: null });
    try {
      const response = await apiClient.get(`/controls/${id}`);
      set({
        selectedControl: response.data.control,
        isLoadingDetail: false
      });
      return { success: true, data: response.data.control };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch control details';
      set({ error: errorMessage, isLoadingDetail: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get control by ID (from local state)
  getControlById: (id) => {
    const state = useControlsStore.getState();
    return state.controls.find(c => c.id === id);
  },

  // Clear selected control
  clearSelectedControl: () => set({ selectedControl: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useControlsStore;
