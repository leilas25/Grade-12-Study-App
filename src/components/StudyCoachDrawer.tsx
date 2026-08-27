import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Lightbulb,
  HelpCircle,
  Brain,
  Check,
  User,
} from 'lucide-react';
import { geminiService, CoachMessage } from '../services/geminiService';
import { useStudy } from '../context/StudyContext';

interface StudyCoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextSubject?: string;
  contextTopic?: string;
}

export const StudyCoachDrawer: React.FC<StudyCoachDrawerProps> = ({
  isOpen,
  onClose,
  contextSubject,
  contextTopic,
}) => {
  const { userProfile, addXP } = useStudy();

  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: 'model',
      content: `Hello ${userProfile.name}! 👋 I'm your Matric AI Study Coach. Ask me anything about your Grade 12 subjects, exam techniques, mnemonics, or tricky concepts!`,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const newHistory: CoachMessage[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const reply = await geminiService.askCoach(textToSend, messages, {
        subject: contextSubject,
        topic: contextTopic,
      });

      setMessages((prev) => [...prev, { role: 'model', content: reply }]);
      addXP(10, 'Asked AI Coach');
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `Sorry, I ran into an issue: ${err.message || 'Please try again.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    `Explain ${contextTopic || 'this concept'} simply with an everyday analogy`,
    `Give me a mnemonic to remember key points in ${contextTopic || 'this topic'}`,
    `What are common exam mistakes students make here?`,
    `Quiz me with 2 quick questions on ${contextTopic || 'Grade 12 CAPS'}`,
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                <span>Matric AI Study Coach</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold px-1.5 py-0.2 rounded-full">
                  Gemini
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {contextSubject ? `${contextSubject} • ${contextTopic || 'General'}` : 'Grade 12 CAPS & IEB'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600 text-white shadow-sm'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 rounded-tl-none flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-500" />
                <span>Coach is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips & Input */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap hover:border-purple-400 transition-colors disabled:opacity-50 text-[11px]"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask your coach anything..."
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-all shadow-md shadow-purple-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
