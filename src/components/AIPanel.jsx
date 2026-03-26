import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { getPageSuggestions } from '../hooks/useContextualAI';

function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  const renderContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parsed = line.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      return <p key={i} className={i > 0 ? 'mt-1.5' : ''} dangerouslySetInnerHTML={{ __html: parsed }} />;
    });
  };

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isUser ? 'bg-primary/10' : 'bg-gray-100'}`}>
        {isUser ? <User size={12} className="text-primary" /> : <Bot size={12} className="text-gray-500" />}
      </div>
      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
        isUser
          ? 'bg-primary text-white rounded-br-sm'
          : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm'
      }`}>
        {renderContent(message.content)}
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="flex gap-2.5">
      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Bot size={12} className="text-gray-400" />
      </div>
      <div className="flex-1 space-y-2 pt-1">
        <div className="skeleton h-2.5 w-full rounded" />
        <div className="skeleton h-2.5 w-4/5 rounded" />
        <div className="skeleton h-2.5 w-3/5 rounded" />
      </div>
    </div>
  );
}

export default function AIPanel({ isOpen, onClose, activePage, messages, isLoading, sendMessage, clearMessages }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), activePage);
    setInput('');
  };

  const suggestions = getPageSuggestions(activePage);

  return (
    <div
      className="fixed top-0 right-0 bottom-0 bg-white border-l border-gray-200 flex flex-col z-20"
      style={{
        width: isOpen ? 360 : 0,
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      <div className="flex-shrink-0 min-w-[360px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <h3 className="text-[13px] font-semibold text-gray-900">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button onClick={clearMessages} className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center" title="Clear">
                <Trash2 size={12} className="text-gray-400" />
              </button>
            )}
            <button onClick={onClose} className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center">
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-w-[360px]">
        {messages.length === 0 && (
          <div className="pt-4 pb-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Suggested questions</p>
            <div className="space-y-1.5">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => { sendMessage(q, activePage); }}
                  className="w-full text-left px-3 py-2 text-[12px] text-gray-600 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <SkeletonLoader />}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-100 p-3 min-w-[360px]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about this page..."
            className="flex-1 text-[13px] border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
