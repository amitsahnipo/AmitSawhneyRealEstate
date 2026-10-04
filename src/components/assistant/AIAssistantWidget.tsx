import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Phone,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  Building2,
  DollarSign,
  HelpCircle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  User,
  Bot,
  Search,
  ArrowRight
} from 'lucide-react';
import { AMIT_SAWHNEY } from '../../data/agent';
import {
  AssistantMessage,
  AssistantPropertyCardData,
  AssistantIntent,
  AssistantConversationState,
  VisitorProfile
} from '../../types/assistant';
import { AssistantPropertyCard } from './AssistantPropertyCard';
import { AssistantLeadForm } from './AssistantLeadForm';

interface AIAssistantWidgetProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectProject?: (projectId: string) => void;
  onSelectResale?: (resaleId: string) => void;
  onOpenVIPModal?: (projectId?: string) => void;
  onOpenConsultationModal?: () => void;
  onOpenCashbackModal?: () => void;
  onOpenValuationModal?: () => void;
  activeContext?: {
    projectId?: string;
    projectName?: string;
    page?: string;
    city?: string;
  };
}

// Requirement #1: No Long Welcome Messages
// Fast, simple greeting with 5 immediate quick actions
const INITIAL_MESSAGE: AssistantMessage = {
  id: 'msg-welcome-0',
  sender: 'assistant',
  text: '👋 Hi! How can I help?',
  timestamp: 'Just now',
  quickReplies: [
    'Buy a Home',
    'Pre-Construction',
    'Cashback',
    'Investment',
    'Ask a Question'
  ]
};

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  isOpen: controlledIsOpen,
  onOpenChange,
  onSelectProject,
  onSelectResale,
  onOpenVIPModal,
  onOpenConsultationModal,
  onOpenCashbackModal,
  onOpenValuationModal,
  activeContext
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (val: boolean) => {
    if (onOpenChange) {
      onOpenChange(val);
    } else {
      setInternalIsOpen(val);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [teaserVisible, setTeaserVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(1);
  const [messages, setMessages] = useState<AssistantMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string>('');
  const [conversationState, setConversationState] = useState<AssistantConversationState>('NEW_VISITOR');
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile>({});
  const [lastRecommendedProperties, setLastRecommendedProperties] = useState<AssistantPropertyCardData[]>([]);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      setTeaserVisible(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Requirement #20: Progressive streaming/appearance simulation
  const streamMessage = (fullText: string, targetMsgId: string, onComplete?: () => void) => {
    if (fullText.length < 40) {
      // Short text appears immediately
      setMessages(prev => prev.map(m => m.id === targetMsgId ? { ...m, text: fullText, isStreaming: false } : m));
      if (onComplete) onComplete();
      return;
    }

    let currentIndex = 0;
    const chunkSize = Math.max(4, Math.floor(fullText.length / 15));
    const interval = setInterval(() => {
      currentIndex += chunkSize;
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
        setMessages(prev => prev.map(m => m.id === targetMsgId ? { ...m, text: fullText, isStreaming: false } : m));
        if (onComplete) onComplete();
      } else {
        const partial = fullText.slice(0, currentIndex);
        setMessages(prev => prev.map(m => m.id === targetMsgId ? { ...m, text: partial, isStreaming: true } : m));
      }
    }, 20);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMessage: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setLoading(true);

    // Contextual status feedback (Requirement #20 & #21: Invisible tool usage)
    const lowerQ = query.toLowerCase();
    if (lowerQ.includes('cashback') || lowerQ.includes('rebate')) {
      setStatusFeedback('💰 Calculating cashback rebate...');
    } else if (lowerQ.includes('price') || lowerQ.includes('home') || lowerQ.includes('condo') || lowerQ.includes('town')) {
      setStatusFeedback('🔎 Checking current listings...');
    } else if (lowerQ.includes('pre-con') || lowerQ.includes('deposit') || lowerQ.includes('cooling off')) {
      setStatusFeedback('📋 Checking builder deposit schedules...');
    } else {
      setStatusFeedback('Thinking...');
    }

    try {
      // Build conversation history payload
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));

      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: historyPayload,
          currentMessage: query,
          conversationState,
          visitorProfile,
          lastRecommendedProperties,
          activeContext
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const data = await res.json();
      const msgId = `ast-${Date.now()}`;

      // Update state & profile
      if (data.conversationState) setConversationState(data.conversationState);
      if (data.visitorProfile) setVisitorProfile(prev => ({ ...prev, ...data.visitorProfile }));
      if (data.recommendedProperties) setLastRecommendedProperties(data.recommendedProperties);

      // Create placeholder assistant message and stream content
      const rawAnswer = data.answer || 'I can help with that. Please reach out to Amit directly at (647) 895-3613 for personalized details.';
      
      const assistantMessage: AssistantMessage = {
        id: msgId,
        sender: 'assistant',
        text: '',
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        recommendedProperties: data.recommendedProperties,
        quickReplies: data.suggestedQuickReplies || [],
        showLeadForm: data.showLeadForm,
        showConsultationPrompt: data.showConsultationPrompt
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStatusFeedback('');

      streamMessage(rawAnswer, msgId);

    } catch (err: any) {
      console.warn('AI Assistant request error, using fallback:', err);
      // Graceful error handling (Requirement #23)
      const fallbackMessage: AssistantMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: `In Ontario, purchasing a new build or resale through a licensed REALTOR® like Amit Sawhney gives you early Platinum VIP pricing, capped development charges, and 10-day cooling-off review protection with **zero buyer commission fees**.\n\nWant to know **how much cashback you could receive**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ['Calculate my Cashback', 'Pre-Con Projects', 'Call Amit Sawhney']
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
      setStatusFeedback('');
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setConversationState('NEW_VISITOR');
    setVisitorProfile({});
    setLastRecommendedProperties([]);
  };

  const handleQuickReply = (reply: string) => {
    if (reply.includes('Call Amit') || reply === 'Call') {
      window.location.href = `tel:${AMIT_SAWHNEY.phone}`;
      return;
    }
    if ((reply.includes('Calculate') && reply.includes('Cashback')) && onOpenCashbackModal) {
      onOpenCashbackModal();
      return;
    }
    if (reply.includes('Consultation') && onOpenConsultationModal) {
      onOpenConsultationModal();
      return;
    }
    if (reply.includes('Valuation') && onOpenValuationModal) {
      onOpenValuationModal();
      return;
    }
    handleSendMessage(reply);
  };

  const handlePropertyCardClick = (id: string, type: 'preconstruction' | 'resale' | 'mls') => {
    if (type === 'preconstruction' && onSelectProject) {
      onSelectProject(id);
    } else if (type === 'resale' && onSelectResale) {
      onSelectResale(id);
    }
  };

  const handlePropertyRequestVIP = (id: string, title: string) => {
    if (onOpenVIPModal) {
      onOpenVIPModal(id);
    } else {
      handleSendMessage(`I'd like to request the VIP price list and floor plans for ${title}.`);
    }
  };

  return (
    <>
      {/* Floating Trigger Button & Proactive Teaser Bubble */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-none select-none">
        
        {/* Proactive Teaser Bubble */}
        {!isOpen && teaserVisible && (
          <div className="pointer-events-auto bg-white border border-stone-200 text-stone-900 rounded-2xl shadow-xl p-3.5 max-w-[290px] animate-fadeIn relative text-xs">
            <button
              onClick={() => setTeaserVisible(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-full flex items-center justify-center text-xs transition-colors"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0F2942] text-[#C5A880] flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900 text-xs leading-tight">
                  👋 Hi! How can I help?
                </p>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Instant answers on VIP pre-con launches, 1% cashback, and 10-day cooling off.
                </p>
                <button
                  onClick={() => setIsOpen(true)}
                  className="mt-2 text-[11px] font-bold text-[#0F2942] hover:text-[#1a4168] flex items-center gap-1"
                >
                  <span>Chat with Advisor</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C5A880]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto group relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0F2942] hover:bg-[#153a5c] text-white shadow-2xl flex items-center justify-center border-2 border-[#C5A880] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open AI Real Estate Advisor"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white transition-transform duration-200" />
          ) : (
            <>
              <div className="relative">
                <Bot className="w-7 h-7 text-[#C5A880] group-hover:rotate-6 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F2942] animate-pulse" />
              </div>
              {unreadCount > 0 && !teaserVisible && (
                <span className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-[#C5A880] text-[#0F2942] font-black text-[10px] rounded-full shadow-md">
                  1
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isExpanded
              ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[580px] h-[calc(100vh-80px)] sm:h-[720px] max-h-[88vh]'
              : 'bottom-4 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[82vh]'
          } bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden text-stone-900 animate-fadeIn`}
        >
          {/* Header */}
          <div className="bg-[#0F2942] px-4 py-3.5 border-b border-[#1E3A8A] flex items-center justify-between text-white shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/50 text-[#C5A880] flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#0F2942]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white font-serif leading-tight">
                    Amit's Real Estate Advisor
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#C5A880] text-[#0F2942]">
                    RECO
                  </span>
                </div>
                <p className="text-[10px] text-stone-300 leading-tight">
                  Fast • Conversational • Licensed REALTOR® • <a href={`tel:${AMIT_SAWHNEY.phone}`} className="text-[#C5A880] hover:underline font-semibold">{AMIT_SAWHNEY.phoneFormatted}</a>
                </p>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1 text-stone-300">
              <a
                href={`tel:${AMIT_SAWHNEY.phone}`}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
                title={`Call Amit Sawhney (${AMIT_SAWHNEY.phoneFormatted})`}
              >
                <Phone className="w-4 h-4 text-[#C5A880]" />
              </a>

              <button
                onClick={handleResetChat}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Restart Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-stone-300 hover:text-white cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader: Trust Bar */}
          <div className="bg-stone-50 border-b border-stone-200 px-3 py-1.5 text-[10px] text-stone-500 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Free Buyer Service • Ontario RECO Registered</span>
            </span>
            {visitorProfile.location && (
              <span className="text-[10px] text-[#8C6D43] font-semibold">
                📍 {visitorProfile.location} {visitorProfile.budget ? `• ${visitorProfile.budget}` : ''}
              </span>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-[#F9F9F8]">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0F2942] text-white rounded-tr-none'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                  }`}
                >
                  {/* Markdown Rendering (Requirement #11: Scannable, Short Paragraphs & Bullets) */}
                  <div className="whitespace-pre-line space-y-1.5">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="font-extrabold text-sm text-[#0F2942] font-serif border-b border-stone-100 pb-1 mb-1">
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      return (
                        <p key={pIdx}>
                          {paragraph.split('\n').map((line, lineIdx) => {
                            if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
                              return (
                                <span key={lineIdx} className="flex items-start gap-1.5 my-0.5">
                                  <span className="text-[#C5A880] font-black shrink-0">•</span>
                                  <span>{line.replace(/^[-*•]\s*/, '')}</span>
                                </span>
                              );
                            }
                            return <span key={lineIdx}>{line}<br /></span>;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  <div
                    className={`mt-1.5 text-[9px] ${
                      msg.sender === 'user' ? 'text-stone-300' : 'text-stone-400'
                    } text-right flex items-center justify-end gap-1`}
                  >
                    {msg.isStreaming && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-ping inline-block mr-1" />
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Inline Recommended Properties (Requirement #19: Compact Visual Property Cards) */}
                {msg.recommendedProperties && msg.recommendedProperties.length > 0 && (
                  <div className="w-full max-w-[95%] mt-2 space-y-2">
                    <p className="text-[11px] font-bold text-stone-600 flex items-center gap-1.5 px-1">
                      <Building2 className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Matching Properties:</span>
                    </p>
                    {msg.recommendedProperties.map((prop) => (
                      <AssistantPropertyCard
                        key={prop.id}
                        property={prop}
                        onSelectProperty={handlePropertyCardClick}
                        onRequestVIP={handlePropertyRequestVIP}
                      />
                    ))}
                  </div>
                )}

                {/* Inline Lead Capture Form (Requirement #10: Progressive Lead Capture) */}
                {msg.showLeadForm && (
                  <div className="w-full max-w-[95%] mt-2">
                    <AssistantLeadForm
                      initialValues={{
                        buyerType: visitorProfile.buyerType,
                        budget: visitorProfile.budget,
                        targetLocation: visitorProfile.location
                      }}
                      activeContext={activeContext}
                      onSubmitSuccess={(lead) => {
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `lead-success-${Date.now()}`,
                            sender: 'assistant',
                            text: `Thank you, **${lead?.fullName || 'Client'}**! Amit Sawhney will personally follow up via call/text at **${lead?.phone || 'your phone'}** with confidential pricing, floor plans, and VIP allocations.`,
                            timestamp: 'Just now',
                            quickReplies: ['Call Amit Now', 'Calculate Cashback', 'Ask Another Question']
                          }
                        ]);
                      }}
                    />
                  </div>
                )}

                {/* Consultation Prompt Card (Requirement #9: Natural Next Step, Not Nagging) */}
                {msg.showConsultationPrompt && (
                  <div className="w-full max-w-[95%] mt-2 bg-[#0F2942] text-white rounded-2xl p-3.5 shadow-md border border-[#C5A880]/40">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-4 h-4 text-[#C5A880]" />
                      <h4 className="font-bold text-xs">Connect with Amit Sawhney</h4>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      Discuss VIP floor plan allocations, 10-day cooling off review, or book a 1-on-1 strategy session.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      {onOpenConsultationModal && (
                        <button
                          onClick={onOpenConsultationModal}
                          className="flex-1 py-1.5 bg-[#C5A880] hover:bg-[#b0946c] text-[#0F2942] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Book Strategy Call
                        </button>
                      )}
                      <a
                        href={`tel:${AMIT_SAWHNEY.phone}`}
                        className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-[#C5A880]" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Quick-Reply Buttons (Requirement #6: Minimize User Typing & Requirement #16 Contextual Suggestions) */}
                {msg.quickReplies && msg.quickReplies.length > 0 && idx === messages.length - 1 && !loading && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2 max-w-[95%]">
                    {msg.quickReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 bg-white hover:bg-stone-50 active:bg-stone-100 text-[#0F2942] border border-stone-300 hover:border-[#0F2942] rounded-full text-[11px] font-semibold shadow-2xs transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Requirement #20: Typing & Processing Feedback */}
            {loading && (
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl rounded-tl-none p-3 max-w-[220px] shadow-sm animate-fadeIn">
                <div className="w-2 h-2 rounded-full bg-[#0F2942] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#C5A880] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#0F2942] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-stone-600 font-medium ml-1">
                  {statusFeedback || 'Advisor is typing...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area (Requirement #25: Mobile-First, always visible, fast interaction) */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask anything about buying, pre-con, or cashback..."
                className="flex-1 bg-stone-50 border border-stone-300 focus:border-[#0F2942] rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F2942] transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="w-9 h-9 rounded-xl bg-[#0F2942] hover:bg-[#1a4168] disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-sm transition-colors cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-[#C5A880]" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[9px] text-stone-400 px-1">
              <span>Licensed REALTOR® • 100% Free Buyer Representation</span>
              <a
                href={`tel:${AMIT_SAWHNEY.phone}`}
                className="text-[#0F2942] hover:underline font-bold flex items-center gap-0.5"
              >
                <Phone className="w-2.5 h-2.5 text-[#C5A880]" />
                <span>(647) 895-3613</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
