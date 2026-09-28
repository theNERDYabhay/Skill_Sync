import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Cpu,
  Zap,
  Layers,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Lightbulb,
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  roleUsed?: string;
}

type BotRole = 'general' | 'complex' | 'fast';

interface RoleConfig {
  id: BotRole;
  name: string;
  model: string;
  tagline: string;
  badgeColor: string;
  icon: React.ReactNode;
  systemSummary: string;
}

const ROLES: Record<BotRole, RoleConfig> = {
  general: {
    id: 'general',
    name: 'Matchmaker Advisor',
    model: 'gemini-3.5-flash',
    tagline: 'General Tasks: Skill discovery, team matchmaking, and collaboration advice',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: <Bot className="w-4 h-4 text-blue-400" />,
    systemSummary: 'Matchmaking & Collaboration Advisor',
  },
  complex: {
    id: 'complex',
    name: 'Senior Team Architect',
    model: 'gemini-3.1-pro-preview',
    tagline: 'Complex Tasks: Deep system architecture, hackathon tech roadmaps, tradeoffs',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icon: <Cpu className="w-4 h-4 text-purple-400" />,
    systemSummary: 'Senior Systems Architect & Hackathon Strategist',
  },
  fast: {
    id: 'fast',
    name: 'Rapid Pitch Coach',
    model: 'gemini-3.1-flash-lite',
    tagline: 'Fast Tasks: Instant elevator pitch polishing, catchy headlines, fast intro messages',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    systemSummary: 'Rapid Pitch & Headline Coach',
  },
};

const SUGGESTED_PROMPTS: Record<BotRole, string[]> = {
  general: [
    'What skills complement my React & TypeScript background for an AI hackathon?',
    'How should our team divide roles between ML engineers and full-stack builders?',
    'Draft a friendly collaboration message to connect with a senior UI designer.',
  ],
  complex: [
    'Design the end-to-end architecture for a distributed edge-AI healthcare application.',
    'Evaluate trade-offs between FastAPI microservices and Express monolith for a 48h hackathon.',
    'Build a technical execution roadmap for our 4-person hackathon team.',
  ],
  fast: [
    'Polish my developer headline: "Full stack engineer building cool web apps"',
    'Give me a 30-second elevator pitch to find a co-founder for a FinTech app.',
    'Quick one-line outreach message for a top GitHub contributor.',
  ],
};

export const GeminiChatbot: React.FC = () => {
  const { isGeminiChatOpen, setIsGeminiChatOpen, currentUser, addToast } = useApp();

  const [activeRole, setActiveRole] = useState<BotRole>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I'm your **SkillSync AI Collaboration Assistant**.\n\nI can help you find complementary collaborators, design technical hackathon architectures, or craft high-impact elevator pitches. Choose a role or ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      roleUsed: 'general',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isGeminiChatOpen) {
      scrollToBottom();
    }
  }, [messages, isGeminiChatOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      // Build conversation history for multi-turn chat
      const historyToSend = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendGeminiChat({
        messages: historyToSend,
        role: activeRole,
        customModel: ROLES[activeRole].model,
      });

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: res.modelUsed,
        roleUsed: res.roleUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('[Gemini Chat Error]', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `I ran into an issue connecting to Gemini: ${err.message || 'Please verify your API key or network connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: ROLES[activeRole].model,
      };
      setMessages((prev) => [...prev, errorMessage]);
      addToast('Gemini response error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Conversation refreshed. Ready for your next collaboration challenge! What shall we tackle?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: ROLES[activeRole].model,
        roleUsed: activeRole,
      },
    ]);
    addToast('Chat history cleared', 'info');
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('Message copied to clipboard', 'info');
  };

  // If closed, show floating button
  if (!isGeminiChatOpen) {
    return (
      <button
        onClick={() => setIsGeminiChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-3.5 rounded-2xl shadow-xl shadow-purple-900/30 flex items-center gap-2.5 transition-all transform hover:scale-105 group border border-white/20"
        title="Open Gemini AI SkillSync Advisor"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-spin-slow text-yellow-300" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="text-xs font-bold tracking-tight pr-1 hidden sm:inline-block">
          AI Co-Founder & Advisor
        </span>
      </button>
    );
  }

  const currentRole = ROLES[activeRole];

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden text-slate-100 ${
        isExpanded
          ? 'inset-4 sm:inset-10'
          : 'bottom-4 right-4 w-[95vw] sm:w-[460px] h-[620px] max-h-[92vh]'
      }`}
    >
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white tracking-tight">Gemini AI Advisor</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                {currentRole.model}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">{currentRole.systemSummary}</p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsGeminiChatOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Role & Model Selector Pill Bar */}
      <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
          Role:
        </span>
        {(Object.keys(ROLES) as BotRole[]).map((rKey) => {
          const role = ROLES[rKey];
          const isSelected = activeRole === rKey;
          return (
            <button
              key={rKey}
              onClick={() => setActiveRole(rKey)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {role.icon}
              <span>{role.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Role Description */}
      <div className="bg-slate-900/60 px-3 py-1.5 border-b border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="truncate">{currentRole.tagline}</span>
        <span className="text-[10px] font-mono text-purple-400 shrink-0 ml-2">
          {currentRole.model}
        </span>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-sm shadow-purple-500/20'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {/* Message Header (for AI) */}
                {!isUser && msg.modelUsed && (
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-700/60 text-[10px] text-slate-400">
                    <span className="font-mono text-purple-300 font-semibold">{msg.modelUsed}</span>
                    <button
                      onClick={() => copyMessage(msg.content, msg.id)}
                      className="hover:text-white transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Content formatted */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                  {msg.content}
                </div>

                {/* Timestamp */}
                <div
                  className={`text-[9px] text-right ${
                    isUser ? 'text-blue-200/70' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2.5 text-slate-400 text-xs py-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-2">
              <span className="font-mono text-[11px] text-purple-300">{currentRole.model}</span>
              <span className="text-[11px] text-slate-300">is analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Prompts (if only 1 or 2 messages) */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 pt-1 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {SUGGESTED_PROMPTS[activeRole].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/80 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Area */}
      <footer className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 focus-within:border-purple-500 transition-colors"
        >
          <textarea
            rows={1}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${currentRole.name} (${currentRole.model})...`}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 px-2.5 py-1.5 focus:outline-none resize-none max-h-24"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 shadow-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
          <span>Press Enter to send · Shift+Enter for newline</span>
          <span className="text-purple-400 font-mono">
            Powered by Google Gemini
          </span>
        </div>
      </footer>
    </div>
  );
};
