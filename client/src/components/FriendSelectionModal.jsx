import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGift, faSearch, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const FriendSelectionModal = ({ isOpen, onClose, onSelect, gameTitle }) => {
  const { theme } = useTheme();
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`${theme.colors.card} w-full max-w-md rounded-[2.5rem] border ${theme.colors.border} ${theme.colors.shadow} overflow-hidden relative z-10`}
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-black ${theme.colors.text} tracking-tight flex items-center gap-3 italic`}>
                <FontAwesomeIcon icon={faGift} className="text-blue-500" />
                Send a <span className="text-blue-500">Gift</span>
              </h2>
              <button onClick={onClose} className="opacity-40 hover:opacity-100 transition-all">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <p className="text-sm opacity-60 mb-8 font-medium">
                Choose a friend to receive <span className="text-blue-400 font-bold">{gameTitle}</span>.
            </p>

            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search friends..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${theme.colors.input} ${theme.colors.text} pl-11 pr-4 py-3 rounded-2xl border ${theme.colors.border} outline-none focus:ring-4 ${theme.colors.ring} transition-all text-xs font-bold`}
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs" />
            </div>

            <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
              {loading ? (
                <div className="text-center py-10 opacity-40 italic text-sm">Loading your friends...</div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-10">
                    <FontAwesomeIcon icon={faUserFriends} className="text-4xl opacity-10 mb-3" />
                    <p className="opacity-40 italic text-sm">No friends found.</p>
                </div>
              ) : (
                filteredFriends.map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => onSelect(friend)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${theme.colors.border} bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group text-left`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-black ${theme.colors.text}`}>{friend.name}</div>
                      <div className="text-[10px] opacity-40 uppercase font-black tracking-widest">{friend.role}</div>
                    </div>
                    <FontAwesomeIcon icon={faGift} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          </div>
          
          <div className="p-6 bg-black/20 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Secure Gift Delivery Guaranteed</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FriendSelectionModal;