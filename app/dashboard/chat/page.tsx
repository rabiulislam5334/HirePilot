'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Send, Search, Users, Circle, Loader2,
  MessageSquare, Hash, User, ArrowLeft
} from 'lucide-react';
import { fetchChatRooms, fetchMessages, sendMessage } from '@/app/actions/chat-actions';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';

type Message = {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  createdAt: Date;
};

type Room = {
  id: string;
  name: string;
  type: 'public' | 'dm';
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  memberCount?: number;
};

const DEFAULT_ROOMS: Room[] = [
  { id: 'general',    name: 'General',          type: 'public', unreadCount: 0, memberCount: 0 },
  { id: 'resume',     name: 'Resume Help',       type: 'public', unreadCount: 0, memberCount: 0 },
  { id: 'interviews', name: 'Interview Prep',    type: 'public', unreadCount: 0, memberCount: 0 },
  { id: 'jobs',       name: 'Job Opportunities', type: 'public', unreadCount: 0, memberCount: 0 },
];

export default function PeerChatPage() {
  const { user } = useUser();
  const [rooms, setRooms]             = useState<Room[]>(DEFAULT_ROOMS);
  const [activeRoom, setActiveRoom]   = useState<Room>(DEFAULT_ROOMS[0]);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [isSending, setIsSending]     = useState(false);
  const [onlineCount, setOnlineCount] = useState<Record<string, number>>({});
  const [showRooms, setShowRooms]     = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const { emit, on } = useSocket();

  // Load messages when room changes
  useEffect(() => {
    loadMessages(activeRoom.id);
    emit('join_chat_room', activeRoom.id);
    return () => { emit('leave_chat_room', activeRoom.id); };
  }, [activeRoom.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages(roomId: string) {
    setIsLoading(true);
    const data = await fetchMessages(roomId);
    setMessages(data as Message[]);
    setIsLoading(false);
  }

  // Socket — real-time messages
  const handleNewMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const handleRoomCount = useCallback((data: { roomId: string; count: number }) => {
    setOnlineCount(prev => ({ ...prev, [data.roomId]: data.count }));
  }, []);

  useEffect(() => {
    const offMsg   = on<Message>('chat_message', handleNewMessage);
    const offCount = on<{ roomId: string; count: number }>('room_count', handleRoomCount);
    return () => { offMsg(); offCount(); };
  }, [on, handleNewMessage, handleRoomCount]);

  async function handleSend() {
    const content = input.trim();
    if (!content || isSending || !user) return;

    setIsSending(true);
    setInput('');

    // Optimistic UI
    const optimistic: Message = {
      id:          `temp-${Date.now()}`,
      content,
      senderId:    user.id,
      senderName:  user.fullName ?? 'You',
      senderImage: user.imageUrl ?? null,
      createdAt:   new Date(),
    };
    setMessages(prev => [...prev, optimistic]);

    const result = await sendMessage({ roomId: activeRoom.id, content });

    if (!result.success) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      toast.error('Failed to send message');
    } else {
      // Emit via socket for real-time
      emit('send_chat_message', {
        roomId:  activeRoom.id,
        message: result.message,
      });
    }

    setIsSending(false);
    inputRef.current?.focus();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(date: Date) {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach(msg => {
    const date = formatDate(new Date(msg.createdAt));
    const last = groupedMessages[groupedMessages.length - 1];
    if (last?.date === date) { last.messages.push(msg); }
    else { groupedMessages.push({ date, messages: [msg] }); }
  });

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-white border border-slate-200 rounded-3xl overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`w-72 border-r border-slate-100 flex flex-col flex-shrink-0 ${showRooms ? 'flex' : 'hidden lg:flex'}`}>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-black text-slate-900 mb-3">Community Chat</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input placeholder="Search rooms..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-3 py-2">Public Channels</p>
          {rooms.map(room => (
            <button key={room.id}
              onClick={() => { setActiveRoom(room); setShowRooms(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${
                activeRoom.id === room.id ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}>
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                <Hash className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">{room.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {onlineCount[room.id] ?? 0} online
                </p>
              </div>
              {room.unreadCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center">
                  {room.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* User info */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
          <div className="relative">
            <img src={user?.imageUrl ?? ''} alt="" className="w-8 h-8 rounded-xl object-cover" />
            <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-emerald-500 fill-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.firstName}</p>
            <p className="text-xs text-emerald-600 font-bold">Online</p>
          </div>
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <button onClick={() => setShowRooms(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
            <ArrowLeft className="w-4 h-4 text-slate-500" />
          </button>
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
            <Hash className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <h3 className="font-black text-slate-900">{activeRoom.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
              {onlineCount[activeRoom.id] ?? 0} online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <MessageSquare className="w-14 h-14 text-slate-200" />
              <p className="text-slate-400 font-bold">No messages yet</p>
              <p className="text-sm text-slate-300">Be the first to say hello!</p>
            </div>
          ) : (
            groupedMessages.map(group => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs font-bold text-slate-400">{group.date}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="space-y-3">
                  {group.messages.map((msg, i) => {
                    const isMe   = msg.senderId === user?.id;
                    const isSame = i > 0 && group.messages[i - 1].senderId === msg.senderId;

                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        {!isSame ? (
                          msg.senderImage
                            ? <img src={msg.senderImage} alt="" className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                            : <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-slate-500" />
                              </div>
                        ) : <div className="w-8 flex-shrink-0" />}

                        <div className={`max-w-[65%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          {!isSame && !isMe && (
                            <p className="text-xs font-bold text-slate-500 mb-1 ml-1">{msg.senderName}</p>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                          }`}>
                            {msg.content}
                          </div>
                          <p className="text-xs text-slate-300 mt-1 mx-1">{formatTime(new Date(msg.createdAt))}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-slate-100">
          <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${activeRoom.name}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm focus:outline-none resize-none max-h-32 leading-relaxed"
            />
            <button onClick={handleSend} disabled={!input.trim() || isSending}
              className="w-9 h-9 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
