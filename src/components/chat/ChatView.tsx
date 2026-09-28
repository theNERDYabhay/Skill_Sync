import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.js';
import { api } from '../../services/apiClient.js';
import { Conversation, ChatMessage } from '../../types/index.js';
import { 
  Send, 
  User, 
  ShieldAlert, 
  CheckCheck, 
  Clock, 
  Smile, 
  MoreVertical,
  MessageSquare
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const { 
    currentUser, 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    openReportModal, 
    addToast,
    setSelectedUserId,
    setActiveTab
  } = useApp();

  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else if (conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  const loadMessages = async (convId: string) => {
    try {
      const res = await api.getConversationMessages(convId);
      setActiveConv(res.conversation);
      setMessages(res.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !currentUser) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const res = await api.sendMessage({
        conversationId: activeConv.id,
        content: text,
      });

      setMessages((prev) => [...prev, res.message]);
      scrollToBottom();

      // Simulate other party response for interactive testing
      const otherParticipant = activeConv.participants.find((p) => p.id !== currentUser.id);
      if (otherParticipant) {
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          // Optional automated reply could be pushed if needed
        }, 2000);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to send message', 'error');
    }
  };

  const otherUser = activeConv?.participants.find((p) => p.id !== currentUser?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-[750px] flex overflow-hidden">
        {/* Left Pane: Conversations List */}
        <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">Collaboration Messages</h2>
            <span className="text-xs text-slate-400">{conversations.length} active</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations yet. Express interest in candidates to start chatting!
              </div>
            ) : (
              conversations.map((c) => {
                const partner = c.participants.find((p) => p.id !== currentUser?.id);
                const isActive = activeConversationId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isActive ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={partner?.avatar}
                        alt={partner?.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      {partner?.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{partner?.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.lastMessage?.content || 'Started collaboration chat'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Thread */}
        {activeConv && otherUser ? (
          <div className="flex-1 flex flex-col justify-between bg-slate-50/30">
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h3
                    onClick={() => {
                      setSelectedUserId(otherUser.id);
                      setActiveTab('profile');
                    }}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer"
                  >
                    {otherUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">{otherUser.headline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openReportModal({ targetType: 'user', targetId: otherUser.id, targetName: otherUser.name })}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Report user"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mutual Connection Trust Banner */}
            <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2 text-[11px] text-blue-800 flex items-center justify-between">
              <span>Mutual collaboration match confirmed. End-to-end authorized.</span>
              <button
                onClick={() => {
                  setSelectedUserId(otherUser.id);
                  setActiveTab('profile');
                }}
                className="font-semibold underline hover:text-blue-900"
              >
                View Portfolio
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const isMine = m.senderId === currentUser?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={m.senderAvatar}
                      alt={m.senderName}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                    />
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      <p>{m.content}</p>
                      <div className={`mt-1 flex items-center gap-1 text-[10px] ${isMine ? 'text-blue-200 justify-end' : 'text-slate-400'}`}>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && <CheckCheck className="w-3 h-3 text-blue-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></span>
                  <span>{otherUser.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${otherUser.name}...`}
                className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
