"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Loader2, 
  User, MessageSquare, 
  ChevronLeft, MoreVertical 
} from 'lucide-react';
import api from '@/lib/api';

interface Message {
  id: number;
  sender_email: string;
  text: string;
  created_at: string;
  is_read: boolean;
}

interface Participant {
  id: number;
  email: string;
  full_name: string;
  avatar: string | null;
}

interface Conversation {
  id: number;
  other_participant: Participant;
}

interface ChatWindowProps {
  conversationId: number;
  onClose: () => void;
}

export default function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const convRes = await api.get(`/marketplace/conversations/${conversationId}/`);
      setConversation(convRes.data);
      
      const msgRes = await api.get(`/marketplace/messages/?conversation=${conversationId}`);
      setMessages(msgRes.data.results || msgRes.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s for demo
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await api.post('/marketplace/messages/', {
        conversation: conversationId,
        text: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const currentUserEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-900/50 backdrop-blur-xl">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-l border-white/5 shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            {conversation?.other_participant.avatar ? (
              <img src={conversation.other_participant.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-sm">
                {conversation?.other_participant.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-neutral-900 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm leading-tight">
              {conversation?.other_participant.full_name || conversation?.other_participant.email}
            </h3>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-neutral-500">
             <MoreVertical className="w-5 h-5" />
           </button>
           <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
             <X className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation below</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender_email === currentUserEmail;
            return (
              <div 
                key={msg.id}
                className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`
                  max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
                  ${isSelf 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10' 
                    : 'bg-white/5 text-neutral-300 rounded-tl-none border border-white/5'}
                `}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-2 font-bold ${isSelf ? 'text-blue-200' : 'text-neutral-600'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-6 bg-black/20 border-t border-white/5">
        <div className="relative group">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-neutral-800 border border-white/5 rounded-2xl py-4 pl-6 pr-16 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-xl shadow-blue-600/20"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
