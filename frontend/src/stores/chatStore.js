import { create } from 'zustand';
import apiClient from '../api/client';

const useChatStore = create((set, get) => ({
  // UI State
  isChatOpen: false,
  isMinimized: false,

  // Chat State
  messages: [], // { id, role: 'user' | 'assistant', content, timestamp }
  isLoading: false,
  error: null,
  sessionId: null, // For tracking conversation context

  // Actions
  openChat: () => set({ isChatOpen: true, isMinimized: false }),

  closeChat: () => set({ isChatOpen: false }),

  toggleChat: () => set((state) => ({
    isChatOpen: !state.isChatOpen,
    isMinimized: false
  })),

  toggleMinimize: () => set((state) => ({
    isMinimized: !state.isMinimized
  })),

  // Send message to AI
  sendMessage: async (content) => {
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      const response = await apiClient.post('/ai/chat', {
        message: content,
        sessionId: get().sessionId,
        history: get().messages.slice(-10) // Send last 10 messages for context
      });

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        sessionId: response.data.sessionId,
        isLoading: false
      }));

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get AI response. Please try again.';
      set({
        error: errorMessage,
        isLoading: false
      });
    }
  },

  // Clear conversation
  clearMessages: () => set({
    messages: [],
    sessionId: null,
    error: null
  }),

  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    isChatOpen: false,
    isMinimized: false,
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null
  })
}));

export default useChatStore;
