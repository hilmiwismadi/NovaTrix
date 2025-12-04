import { useRef, useEffect } from 'react';
import { X, Minus, Maximize2, Bot, Loader2 } from 'lucide-react';
import useChatStore from '../../stores/chatStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function AIChatbot() {
  const {
    isChatOpen,
    isMinimized,
    messages,
    isLoading,
    error,
    sendMessage,
    toggleMinimize,
    closeChat,
    clearError
  } = useChatStore();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isChatOpen) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] bg-white/90 backdrop-blur-glass border border-cyan-600/20 rounded-lg shadow-glass transition-all duration-300 ${
        isMinimized ? 'h-[60px]' : 'h-[600px]'
      } w-[400px]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <Bot className="text-cyan-600" size={20} />
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
          </button>
          <button
            onClick={closeChat}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Content - only visible when not minimized */}
      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="h-[calc(100%-120px)] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Bot size={48} className="mx-auto mb-3 text-cyan-600/50" />
                <p className="text-sm">Ask me anything about ISO 27001!</p>
                <p className="text-xs text-gray-400 mt-2">I can help with compliance questions, gap analysis, and more.</p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
                <button onClick={clearError} className="ml-2 underline hover:text-red-900">
                  Dismiss
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </>
      )}
    </div>
  );
}
