// Authentication State Management with Zustand

import { create } from 'zustand';
import apiClient from '../api/client';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Login action
  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false
      });
      return { success: false, error: errorMessage };
    }
  },

  // Logout action
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      });
    }
  },

  // Get current user
  getCurrentUser: async () => {
    set({ isLoading: true });

    try {
      const response = await apiClient.get('/auth/me');
      const { user } = response.data;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isLoading: false,
        error: null
      });

      return { success: true, user };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch user',
        isLoading: false
      });
      return { success: false };
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useAuthStore;
