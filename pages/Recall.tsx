import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Mic } from 'lucide-react';
import { getAllMemories } from '../services/store';
import { chatWithMemories } from '../services/gemini';
import { Memory, ChatMessage } from '../types';
import LiveVoice from '../components/LiveVoice';
import { useAuth } from '../contexts/AuthContext';

const Recall: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello. I am your Second Brain. Ask me about your past memories, or I can help you recall specific events.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getAllMemories(user.uid).then(setMemories);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithMemories(userMsg.text, memories);
      
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "I'm sorry, I'm having trouble connecting to my memory bank right now.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-gray-50 md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-200 overflow-hidden relative">
      
      {isLiveActive && <LiveVoice onClose={() => setIsLiveActive(false)} />}

      <div className="bg-white border-b border-gray-200 p-4 shadow-sm z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-calm-900 flex items-center accessibility-text">
          <Bot className="w-6 h-6 mr-2 text-primary-600" /> 
          Recall Assistant
        </h1>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsLiveActive(true)}
             className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
           >
             <Mic className="w-4 h-4" /> Live Voice
           </button>
           <div className="hidden md:flex items-center text-xs text-gray-500">
             <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
             Powered by Gemini
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-primary-600" />
                </div>
             )}
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed accessibility-text">{msg.text}</p>
            </div>
             {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
             )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-primary-600" />
             </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 rounded-tl-none flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about your memories..."
            className="w-full pl-4 pr-14 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 focus:outline-none shadow-sm transition-shadow accessibility-text"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recall;