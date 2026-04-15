// Dashboard Store
// Zustand store for managing dashboard state and orchestrating multiple API calls

import { create } from 'zustand';
import apiClient from '../api/client';

const useDashboardStore = create((set, get) => ({
  // State
  documentStats: null,
  interviewStats: null,
  controlStats: null,
  activities: [],
  isLoading: {
    documents: false,
    interviews: false,
    controls: false,
    activities: false,
    overall: false
  },
  errors: {
    documents: null,
    interviews: null,
    controls: null,
    activities: null
  },
  lastFetched: null,

  // Fetch document statistics
  fetchDocumentStats: async () => {
    set((state) => ({
      isLoading: { ...state.isLoading, documents: true },
      errors: { ...state.errors, documents: null }
    }));

    try {
      const response = await apiClient.get('/documents/stats');
      set((state) => ({
        documentStats: response.data,
        isLoading: { ...state.isLoading, documents: false }
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch document statistics';
      set((state) => ({
        errors: { ...state.errors, documents: errorMessage },
        isLoading: { ...state.isLoading, documents: false }
      }));
      return { success: false, error: errorMessage };
    }
  },

  // Fetch interview statistics
  fetchInterviewStats: async () => {
    set((state) => ({
      isLoading: { ...state.isLoading, interviews: true },
      errors: { ...state.errors, interviews: null }
    }));

    try {
      const response = await apiClient.get('/interviews/stats');
      set((state) => ({
        interviewStats: response.data,
        isLoading: { ...state.isLoading, interviews: false }
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch interview statistics';
      set((state) => ({
        errors: { ...state.errors, interviews: errorMessage },
        isLoading: { ...state.isLoading, interviews: false }
      }));
      return { success: false, error: errorMessage };
    }
  },

  // Fetch control statistics
  fetchControlStats: async () => {
    set((state) => ({
      isLoading: { ...state.isLoading, controls: true },
      errors: { ...state.errors, controls: null }
    }));

    try {
      const response = await apiClient.get('/controls/stats');
      set((state) => ({
        controlStats: response.data,
        isLoading: { ...state.isLoading, controls: false }
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch control statistics';
      set((state) => ({
        errors: { ...state.errors, controls: errorMessage },
        isLoading: { ...state.isLoading, controls: false }
      }));
      return { success: false, error: errorMessage };
    }
  },

  // Fetch recent activities
  fetchRecentActivities: async (limit = 15) => {
    set((state) => ({
      isLoading: { ...state.isLoading, activities: true },
      errors: { ...state.errors, activities: null }
    }));

    try {
      const response = await apiClient.get(`/activities/recent?limit=${limit}`);
      set((state) => ({
        activities: response.data.activities,
        isLoading: { ...state.isLoading, activities: false }
      }));
      return { success: true, data: response.data.activities };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch recent activities';
      set((state) => ({
        errors: { ...state.errors, activities: errorMessage },
        isLoading: { ...state.isLoading, activities: false }
      }));
      return { success: false, error: errorMessage };
    }
  },

  // Fetch all dashboard data in parallel
  fetchAllDashboardData: async () => {
    set({
      isLoading: {
        documents: true,
        interviews: true,
        controls: true,
        activities: true,
        overall: true
      },
      errors: {
        documents: null,
        interviews: null,
        controls: null,
        activities: null
      }
    });

    try {
      // Execute all API calls in parallel
      const results = await Promise.allSettled([
        get().fetchDocumentStats(),
        get().fetchInterviewStats(),
        get().fetchControlStats(),
        get().fetchRecentActivities()
      ]);

      // Update overall loading state
      set((state) => ({
        isLoading: { ...state.isLoading, overall: false },
        lastFetched: new Date()
      }));

      // Check if any failed
      const failures = results.filter(r => r.status === 'rejected' || !r.value?.success);
      if (failures.length > 0) {
        console.warn('Some dashboard data failed to load:', failures);
      }

      return { success: true };
    } catch (error) {
      set((state) => ({
        isLoading: { ...state.isLoading, overall: false }
      }));
      console.error('Failed to fetch dashboard data:', error);
      return { success: false, error: 'Failed to fetch dashboard data' };
    }
  },

  // Clear specific error
  clearError: (section) => {
    set((state) => ({
      errors: { ...state.errors, [section]: null }
    }));
  },

  // Clear all errors
  clearAllErrors: () => {
    set({
      errors: {
        documents: null,
        interviews: null,
        controls: null,
        activities: null
      }
    });
  },

  // Reset store
  reset: () => set({
    documentStats: null,
    interviewStats: null,
    controlStats: null,
    activities: [],
    isLoading: {
      documents: false,
      interviews: false,
      controls: false,
      activities: false,
      overall: false
    },
    errors: {
      documents: null,
      interviews: null,
      controls: null,
      activities: null
    },
    lastFetched: null
  })
}));

export default useDashboardStore;
