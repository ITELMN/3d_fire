
import React, { useState, useRef, useEffect } from 'react';
import { generateSafetyResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, X, ShieldAlert, User, Bot } from 'lucide-react';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '您好，我是您的AI消防助手。您可以问我关于灭火器使用、火灾逃生或急救的问题。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsLoading(true);

    const responseText = await generateSafetyResponse(userText);
    
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900 shadow-xl">
        <div className="flex items-center gap-2 text-safety-orange">
          <ShieldAlert size={24} />
          <h2 className="font-bold text-lg tracking-wider">AI 消防助手</h2>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full active:scale-95">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user' ? 'bg-blue-600 border-blue-400' : 'bg-safety-red border-red-400'
              }`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-xs text-slate-400 animate-pulse flex items-center gap-2">
               <span className="w-2 h-2 bg-safety-orange rounded-full animate-bounce"></span>
               正在分析...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-700 pb-safe">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="例如：PASS口诀是什么？"
            className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none border border-slate-700 focus:border-safety-orange transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-safety-red text-white px-4 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 shadow-lg"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
