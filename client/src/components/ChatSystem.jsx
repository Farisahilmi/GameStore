import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Add axios import
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faCommentDots, faMinus } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const ChatSystem = ({ user, friends, socket }) => {
  const { theme } = useTheme();
  const [activeChats, setActiveChats] = useState([]); // Array of friend objects
  const [minimizedChats, setMinimizeChats] = useState([]); // Array of friend IDs
  const [messages, setMessages] = useState({}); // Map: friendId -> array of messages
  const [newMessage, setNewMessage] = useState({}); // Map: friendId -> input value

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (data) => {
        const { senderId, message, timestamp } = data;
        
        // Find sender info from friends list
        const sender = friends.find(f => f.id === senderId);
        if (!sender) return; // Ignore if not friend (security)

        // Open chat if not open
        if (!activeChats.find(c => c.id === senderId)) {
          setActiveChats(prev => [...prev, sender]);
        }

        // Add message
        setMessages(prev => ({
          ...prev,
          [senderId]: [...(prev[senderId] || []), { senderId, text: message, timestamp }]
        }));
      };

      socket.on('receive_message', handleReceiveMessage);
      return () => socket.off('receive_message', handleReceiveMessage);
    }
  }, [socket, friends, activeChats]);

  // Load chat history when opening a chat
  useEffect(() => {
    activeChats.forEach(async (friend) => {
        if (!messages[friend.id]) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/messages/${friend.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Transform data to match local state format
                const history = res.data.data.map(m => ({
                    senderId: m.senderId,
                    text: m.content,
                    timestamp: m.createdAt
                }));
                setMessages(prev => ({ ...prev, [friend.id]: history }));
            } catch (err) {
                console.error('Failed to load chat history', err);
            }
        }
    });
  }, [activeChats]);

  const openChat = (friend) => {
    if (!activeChats.find(c => c.id === friend.id)) {
      setActiveChats([...activeChats, friend]);
    }
    // Unminimize if minimized
    if (minimizedChats.includes(friend.id)) {
        setMinimizeChats(minimizedChats.filter(id => id !== friend.id));
    }
  };

  const closeChat = (friendId) => {
    setActiveChats(activeChats.filter(c => c.id !== friendId));
  };

  const toggleMinimize = (friendId) => {
      if (minimizedChats.includes(friendId)) {
          setMinimizeChats(minimizedChats.filter(id => id !== friendId));
      } else {
          setMinimizeChats([...minimizedChats, friendId]);
      }
  };

  const sendMessage = (friendId) => {
    const text = newMessage[friendId];
    if (!text?.trim()) return;

    // Emit to server
    socket.emit('send_message', {
      senderId: user.id,
      receiverId: friendId,
      message: text
    });

    // Add to local state (Optimistic UI)
    setMessages(prev => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), { senderId: user.id, text, timestamp: new Date() }]
    }));

    // Clear input
    setNewMessage(prev => ({ ...prev, [friendId]: '' }));
  };

  return (
    <div className="fixed bottom-0 right-4 flex flex-row-reverse items-end gap-4 z-[100] pointer-events-none">
      
      {/* Friend List Trigger (Always visible) */}
      <div className="pointer-events-auto">
        {/* We can integrate this into the main Friends Sidebar later, 
            for now let's just assume chats are opened from profile or existing sidebar */}
      </div>

      {/* Active Chat Windows */}
      {activeChats.map(friend => {
          const isMinimized = minimizedChats.includes(friend.id);
          const friendMessages = messages[friend.id] || [];

          return (
            <motion.div
                key={friend.id}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={`pointer-events-auto w-72 ${theme.colors.card} border ${theme.colors.border} rounded-t-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-12' : 'h-96'}`}
            >
                {/* Header */}
                <div 
                    className={`p-3 bg-gradient-to-r ${friend.status === 'ONLINE' ? 'from-green-600 to-green-700' : 'from-gray-700 to-gray-800'} flex justify-between items-center cursor-pointer`}
                    onClick={() => toggleMinimize(friend.id)}
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        </div>
                        <span className="text-white font-bold text-sm truncate max-w-[120px]">{friend.name}</span>
                    </div>
                    <div className="flex gap-2 text-white/70">
                        <button onClick={(e) => { e.stopPropagation(); toggleMinimize(friend.id); }} className="hover:text-white"><FontAwesomeIcon icon={faMinus} /></button>
                        <button onClick={(e) => { e.stopPropagation(); closeChat(friend.id); }} className="hover:text-white"><FontAwesomeIcon icon={faTimes} /></button>
                    </div>
                </div>

                {/* Body */}
                {!isMinimized && (
                    <>
                        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${theme.colors.bg} scrollbar-thin`}>
                            {friendMessages.length === 0 && (
                                <div className="text-center opacity-40 text-xs mt-4">
                                    Start chatting with {friend.name}
                                </div>
                            )}
                            {friendMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-2 text-xs break-words ${
                                        msg.senderId === user.id 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : `${theme.colors.input} ${theme.colors.text} rounded-bl-none`
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className={`p-2 border-t ${theme.colors.border} bg-black/10`}>
                            <form 
                                onSubmit={(e) => { e.preventDefault(); sendMessage(friend.id); }}
                                className="flex gap-2"
                            >
                                <input 
                                    type="text" 
                                    className={`flex-1 ${theme.colors.input} ${theme.colors.text} rounded px-3 py-1.5 text-xs outline-none border border-transparent focus:border-blue-500 transition`}
                                    placeholder="Say hello..."
                                    value={newMessage[friend.id] || ''}
                                    onChange={e => setNewMessage({...newMessage, [friend.id]: e.target.value})}
                                />
                                <button type="submit" className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center hover:bg-blue-500 transition">
                                    <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </motion.div>
          );
      })}
    </div>
  );
};

export default ChatSystem;