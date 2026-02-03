import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faPlus, faSearch, faClock, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const CommunityHub = () => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'DISCUSSION' });
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
  }, [filterType]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = filterType === 'ALL' ? '/api/forums' : `/api/forums?type=${filterType}`;
      const res = await axios.get(url);
      setPosts(res.data.data);
    } catch (err) {
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/forums', newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Post created successfully!');
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', type: 'DISCUSSION' });
      fetchPosts();
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${theme.colors.bg} pt-24 pb-32 px-6`}>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
                <h1 className={`text-5xl md:text-6xl font-black ${theme.colors.text} tracking-tighter italic mb-4`}>Community <span className="text-blue-500">Hub</span></h1>
                <p className="opacity-60 font-medium text-lg">Join the discussion, share guides, and connect with fellow gamers.</p>
            </div>
            {currentUser && (
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                    <FontAwesomeIcon icon={faPlus} /> Create Post
                </button>
            )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    placeholder="Search discussions, guides, or authors..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${theme.colors.card} border ${theme.colors.border} rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-4 ${theme.colors.ring} transition-all font-bold text-sm`}
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {['ALL', 'DISCUSSION', 'GUIDE', 'NEWS'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${
                            filterType === type 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg' 
                            : `${theme.colors.card} ${theme.colors.text} border-transparent opacity-60 hover:opacity-100`
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        {/* Post Grid */}
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`${theme.colors.card} h-48 rounded-[2.5rem] animate-pulse border ${theme.colors.border}`}></div>
                ))}
            </div>
        ) : filteredPosts.length === 0 ? (
            <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <FontAwesomeIcon icon={faComments} className="text-6xl opacity-10 mb-6" />
                <h3 className="text-2xl font-black opacity-40">No discussions found</h3>
                <p className="opacity-30">Be the first to start a conversation!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map(post => (
                    <motion.div 
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`${theme.colors.card} p-8 rounded-[2.5rem] border ${theme.colors.border} ${theme.colors.shadow} hover:border-blue-500/50 transition-all group relative overflow-hidden`}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700`}></div>
                        
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg ${
                                    post.type === 'GUIDE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                    post.type === 'NEWS' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                }`}>
                                    {post.type}
                                </span>
                                <div className="flex items-center gap-2 opacity-40 text-[10px] font-black uppercase">
                                    <FontAwesomeIcon icon={faClock} />
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <Link to={`/community/post/${post.id}`}>
                                <h3 className={`text-2xl font-black ${theme.colors.text} mb-4 group-hover:text-blue-500 transition-colors line-clamp-2 leading-tight`}>
                                    {post.title}
                                </h3>
                            </Link>
                            
                            <p className="opacity-50 text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                                {post.content}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-[10px]">
                                        {post.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-black opacity-80">{post.user.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-500">
                                    <FontAwesomeIcon icon={faCommentDots} className="text-sm" />
                                    <span className="text-xs font-black">{post._count?.comments || 0}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}

        {/* Create Post Modal */}
        <AnimatePresence>
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateModal(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`${theme.colors.card} w-full max-w-2xl rounded-[3rem] border ${theme.colors.border} ${theme.colors.shadow} overflow-hidden relative z-10`}
                    >
                        <form onSubmit={handleCreatePost} className="p-10">
                            <h2 className={`text-3xl font-black ${theme.colors.text} mb-8 tracking-tighter italic`}>Create New <span className="text-blue-500">Discussion</span></h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Post Type</label>
                                    <div className="flex gap-2">
                                        {['DISCUSSION', 'GUIDE', 'NEWS'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNewPost({...newPost, type})}
                                                className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all border ${
                                                    newPost.type === type 
                                                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg' 
                                                    : 'bg-white/5 opacity-40 border-transparent'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Title</label>
                                    <input 
                                        type="text" 
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                        placeholder="What's on your mind?"
                                        className={`w-full ${theme.colors.input} ${theme.colors.text} px-6 py-4 rounded-2xl border ${theme.colors.border} outline-none focus:ring-4 ${theme.colors.ring} transition-all font-bold text-lg`}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Content</label>
                                    <textarea 
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                        placeholder="Share your thoughts, guides, or news..."
                                        rows="6"
                                        className={`w-full ${theme.colors.input} ${theme.colors.text} px-6 py-4 rounded-2xl border ${theme.colors.border} outline-none focus:ring-4 ${theme.colors.ring} transition-all font-medium text-sm resize-none`}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button 
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    Publish Post
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-black transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityHub;