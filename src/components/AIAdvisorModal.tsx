import React, { useState } from 'react';
import { X, Bot, Send, Sparkles, Phone, HelpCircle, User, ArrowRight } from 'lucide-react';
import { AMIT_SAWHNEY } from '../data/agent';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVIPModal: () => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  onOpenVIPModal
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am **Amit Sawhney's AI VIP Real Estate Advisor** at Blueprint Realty. 

I can answer questions about Ontario pre-construction developments, VIP deposit structures, the mandatory 10-day cooling-off period, builder incentives, capped development levies, or help you find projects matching your budget!

How can I help you today?`,
      time: 'Just now'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'How does the 10-day cooling off period work in Ontario?',
    'What projects start under $600k in Niagara or Peel?',
    'What are capped development levies and builder incentives?',
    'How do pre-construction deposit structures work?'
  ];

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: query })
      });

      const data = await res.json();
      const aiMsg = {
        sender: 'ai' as const,
        text: data.answer || 'Thank you for your question. Please call Amit Sawhney directly at (647) 895-3613 for personalized guidance.',
        time: 'Just now'
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `In Ontario, purchasing a new build or pre-construction condo through a licensed REALTOR® like Amit Sawhney (647-895-3613) grants you early Platinum VIP pricing, capped development charges, and 10-day contract review protection at no buyer cost. For immediate help, call or text Amit directly at (647) 895-3613.`,
          time: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl h-[620px] shadow-2xl flex flex-col overflow-hidden text-stone-900 relative">
        
        {/* Header */}
        <div className="bg-[#0F2942] p-4 sm:p-5 border-b border-[#1E3A8A] flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A880]/30 border border-[#C5A880]/50 p-0.5 shadow-sm flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-serif">
                Amit's AI VIP Pre-Con Advisor
              </h3>
              <p className="text-[11px] text-stone-300">
                Ontario Real Estate & New Build Guidance • Direct REALTOR® Hotline: <a href={`tel:${AMIT_SAWHNEY.phone}`} className="text-[#C5A880] font-bold hover:underline">{AMIT_SAWHNEY.phoneFormatted}</a>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-stone-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-[#0F2942] text-[#C5A880] flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0F2942] text-white rounded-br-none shadow-sm font-medium'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{m.text}</div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#C5A880] text-[#111827] font-bold flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#8C6D43] italic">
              <Bot className="w-4 h-4 animate-bounce text-[#0F2942]" />
              <span>Consulting Ontario real estate knowledge base...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 shrink-0">
          <p className="text-[10px] text-stone-500 font-semibold mb-1">Suggested Inquiries:</p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-white hover:bg-stone-200/60 text-stone-700 border border-stone-200 rounded-lg whitespace-nowrap transition-colors shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask about 10-day cooling off, deposits, HST rebate, or new builds..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#0F2942] focus:bg-white"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
