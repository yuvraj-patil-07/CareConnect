import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { FiSend, FiImage, FiMoreVertical, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios.js';
import { format } from 'date-fns';

export default function ChatPage() {
  const { user } = useSelector((s) => s.auth);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Connect to Socket.io
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Fetch Chats
  const { data: chatsData, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => api.get('/chats').then((res) => res.data.data),
  });
  const chats = chatsData?.chats || [];

  // Fetch Messages for active chat
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chats', activeChat?._id, 'messages'],
    queryFn: () => api.get(`/chats/${activeChat._id}/messages`).then((res) => res.data.data),
    enabled: !!activeChat?._id,
  });
  const messages = messagesData?.messages || [];

  // Handle incoming socket messages
  useEffect(() => {
    if (!socket) return;

    socket.on('chat:message', (message) => {
      // If message belongs to active chat, append it
      if (activeChat && message.chat === activeChat._id) {
        queryClient.setQueryData(['chats', activeChat._id, 'messages'], (old) => {
          if (!old) return { messages: [message] };
          // Prevent duplicates
          if (old.messages.some((m) => m._id === message._id)) return old;
          return { ...old, messages: [...old.messages, message] };
        });
        scrollToBottom();
      }
      // Invalidate chats list to update lastMessage and unread count
      queryClient.invalidateQueries(['chats']);
    });

    return () => {
      socket.off('chat:message');
    };
  }, [socket, activeChat, queryClient]);

  // Join active chat room when selected
  useEffect(() => {
    if (activeChat && socket) {
      socket.emit('joinRoom', `chat:${activeChat._id}`);
    }
  }, [activeChat, socket]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length]);

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content) => api.post(`/chats/${activeChat._id}/messages`, { content }),
    onSuccess: (res) => {
      const newMessage = res.data.data.message;
      queryClient.setQueryData(['chats', activeChat._id, 'messages'], (old) => {
        if (!old) return { messages: [newMessage] };
        return { ...old, messages: [...old.messages, newMessage] };
      });
      setNewMessage('');
      scrollToBottom();
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    sendMessageMutation.mutate(newMessage);
  };

  const getOtherParticipant = (chat) => {
    return chat.participants?.find((p) => p._id !== user._id) || {};
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-800 flex overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 dark:border-dark-800`}>
        <div className="p-4 border-b border-slate-200 dark:border-dark-800">
          <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white">Messages</h2>
          <div className="mt-4 relative">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {chatsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full skeleton shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-4 skeleton w-1/2 rounded" /><div className="h-3 skeleton w-3/4 rounded" /></div>
              </div>
            ))
          ) : chats.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-sm">No conversations yet.</div>
          ) : (
            chats.map((chat) => {
              const other = getOtherParticipant(chat);
              const isActive = activeChat?._id === chat._id;
              const isUnread = chat.unreadCount?.get(user._id) > 0;

              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                    isActive ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-dark-800'
                  }`}
                >
                  <div className="relative shrink-0">
                    {other.avatar ? (
                      <img src={other.avatar} alt={other.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-lg">
                        {other.name?.charAt(0) || '?'}
                      </div>
                    )}
                    {other.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-dark-900 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`text-sm truncate ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                        {other.name}
                      </h4>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {format(new Date(chat.lastMessage.createdAt), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-xs truncate ${isUnread ? 'font-semibold text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      {isUnread && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {chat.unreadCount.get(user._id)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50 dark:bg-dark-950/50`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden text-slate-500 hover:text-slate-800 p-2 -ml-2 rounded-lg">
                  <FiArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-slate-800 dark:text-white">{getOtherParticipant(activeChat).name}</h3>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    {activeChat.booking ? (
                      <><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Booking #{activeChat.booking.bookingNumber}</>
                    ) : (
                      'Direct Message'
                    )}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-lg transition-colors">
                <FiMoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8"><span className="text-slate-400 text-sm">Loading messages...</span></div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
                    <FiMessageSquare size={24} className="text-primary-300" />
                  </div>
                  Send a message to start the conversation
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => {
                    const isMe = msg.sender === user._id;
                    const isFirstInGroup = index === 0 || messages[index - 1].sender !== msg.sender;
                    
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}
                      >
                        <div className={`max-w-[75%] lg:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          isMe 
                            ? 'bg-primary-600 text-white rounded-br-sm' 
                            : 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-dark-700 rounded-bl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-primary-200' : 'text-slate-400'} text-[10px]`}>
                            {format(new Date(msg.createdAt), 'HH:mm')}
                            {isMe && (msg.readBy?.length > 1 ? <div className="flex -space-x-1"><FiCheck size={12} /><FiCheck size={12} /></div> : <FiCheck size={12} />)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </AnimatePresence>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-800 shrink-0">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <button type="button" className="p-3 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors shrink-0">
                  <FiImage size={20} />
                </button>
                <div className="flex-1 bg-slate-100 dark:bg-dark-800 rounded-2xl border border-transparent focus-within:border-primary-500/30 focus-within:bg-white dark:focus-within:bg-dark-950 transition-all">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full bg-transparent text-slate-800 dark:text-white px-4 py-3 outline-none resize-none max-h-32 min-h-[44px] text-sm"
                    rows={1}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
                >
                  <FiSend size={20} className={sendMessageMutation.isPending ? 'opacity-50' : ''} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="w-24 h-24 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-6">
              <FiSend size={32} className="text-slate-300 dark:text-slate-600 -ml-1" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Your Messages</h3>
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
