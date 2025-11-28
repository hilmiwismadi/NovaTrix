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
    console.log('📥 [InterviewStore] Fetching interviews...', filters);
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);

      const url = `/interviews?${params.toString()}`;
      console.log('📡 [InterviewStore] API URL:', url);

      const response = await apiClient.get(url);
      console.log('✅ [InterviewStore] Interviews fetched:', response.data);

      set({
        interviews: response.data.interviews,
        isLoading: false
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ [InterviewStore] Failed to fetch interviews:', error);
      console.error('❌ [InterviewStore] Error response:', error.response?.data);
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
    console.log('📤 [InterviewStore] Creating interview...', interviewData);
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/interviews', interviewData);
      console.log('✅ [InterviewStore] Interview created:', response.data);

      // Add new interview to the list
      set((state) => ({
        interviews: [response.data.interview, ...state.interviews],
        isLoading: false
      }));

      return { success: true, data: response.data.interview };
    } catch (error) {
      console.error('❌ [InterviewStore] Failed to create interview:', error);
      console.error('❌ [InterviewStore] Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to create interview';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Get all respondents
  fetchRespondents: async () => {
    console.log('📥 [InterviewStore] Fetching respondents...');
    try {
      const response = await apiClient.get('/interviews/respondents/all');
      console.log('✅ [InterviewStore] Respondents fetched:', response.data.respondents.length, 'respondents');
      set({ respondents: response.data.respondents });
      return { success: true, data: response.data.respondents };
    } catch (error) {
      console.error('❌ [InterviewStore] Failed to fetch respondents:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch respondents';
      return { success: false, error: errorMessage };
    }
  },

  // Get question bank
  fetchQuestionBank: async (category = null) => {
    console.log('📥 [InterviewStore] Fetching question bank...', category);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const response = await apiClient.get(`/interviews/questions/bank?${params.toString()}`);
      console.log('✅ [InterviewStore] Question bank fetched:', response.data.questions.length, 'questions');
      set({ questionBank: response.data.questions });
      return { success: true, data: response.data.questions };
    } catch (error) {
      console.error('❌ [InterviewStore] Failed to fetch question bank:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch question bank';
      return { success: false, error: errorMessage };
    }
  },

  // Update interview
  updateInterview: async (id, updateData) => {
    console.log('📝 [InterviewStore] Updating interview...', id, updateData);
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/interviews/${id}`, updateData);
      console.log('✅ [InterviewStore] Interview updated:', response.data);

      // Update in interviews list
      set((state) => ({
        interviews: state.interviews.map(interview =>
          interview.id === id ? response.data.interview : interview
        ),
        currentInterview: state.currentInterview?.id === id
          ? response.data.interview
          : state.currentInterview,
        isLoading: false
      }));

      return { success: true, data: response.data.interview };
    } catch (error) {
      console.error('❌ [InterviewStore] Failed to update interview:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update interview';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete interview
  deleteInterview: async (id) => {
    console.log('🗑️ [InterviewStore] Deleting interview...', id);
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/interviews/${id}`);
      console.log('✅ [InterviewStore] Interview deleted');

      // Remove from interviews list
      set((state) => ({
        interviews: state.interviews.filter(interview => interview.id !== id),
        currentInterview: state.currentInterview?.id === id ? null : state.currentInterview,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      console.error('❌ [InterviewStore] Failed to delete interview:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete interview';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear current interview
  clearCurrentInterview: () => set({ currentInterview: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useInterviewStore;
