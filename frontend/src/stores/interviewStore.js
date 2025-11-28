// Interview Store
// Zustand store for managing interviews, respondents, and question bank

import { create } from 'zustand';
import apiClient from '../api/client';

const useInterviewStore = create((set, get) => ({
  // State
  interviews: [],
  currentInterview: null,
  respondents: [],
  questionBank: [],
  isLoading: false,
  error: null,

  // Get all interviews
  fetchInterviews: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);

      const response = await apiClient.get(`/interviews?${params.toString()}`);
      set({
        interviews: response.data.interviews,
        isLoading: false
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch interviews';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get interview by ID
  fetchInterviewById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/interviews/${id}`);
      set({
        currentInterview: response.data.interview,
        isLoading: false
      });
      return { success: true, data: response.data.interview };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch interview';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Create new interview
  createInterview: async (interviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/interviews', interviewData);

      // Add new interview to the list
      set((state) => ({
        interviews: [response.data.interview, ...state.interviews],
        isLoading: false
      }));

      return { success: true, data: response.data.interview };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create interview';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get all respondents
  fetchRespondents: async () => {
    try {
      const response = await apiClient.get('/interviews/respondents/all');
      set({ respondents: response.data.respondents });
      return { success: true, data: response.data.respondents };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch respondents';
      console.error('Fetch respondents error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Get question bank
  fetchQuestionBank: async (category = null) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const response = await apiClient.get(`/interviews/questions/bank?${params.toString()}`);
      set({ questionBank: response.data.questions });
      return { success: true, data: response.data.questions };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch question bank';
      console.error('Fetch question bank error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Clear current interview
  clearCurrentInterview: () => set({ currentInterview: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useInterviewStore;
