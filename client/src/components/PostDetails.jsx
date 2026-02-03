import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faClock, faCommentDots, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

const PostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchPostDetails();
    }, [id]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/forums/${id}`);
            setPost(res.data.data);
        } catch (err) {
            toast.error('Failed to load post details');
            navigate('/community');
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            await axios.post(`/api/forums/${id}/comments`, { content: comment }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Comment posted!');
            setComment('');
            fetchPostDetails();
        } catch (err) {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className={`min-h-screen ${theme.colors.bg} flex items-center justify-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!post) return null;

    return (
        <div className={`min-h-screen ${theme.colors.bg} pt-24 pb-32 px-6`}>
            <div className="container mx-auto max-w-4xl">
                <button 
                    onClick={() => navigate('/community')}
                    className="mb-8 opacity-50 hover:opacity-100 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                >
                    <FontAwesomeIcon icon={faChevronLeft} /> Back to Hub
                </button>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${theme.colors.card} p-10 rounded-[3rem] border ${theme.colors.border} ${theme.colors.shadow} mb-12`}
                >
                    <div className="flex justify-between items-start mb-8">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg ${
                            post.type === 'GUIDE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                            post.type === 'NEWS' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                            {post.type}
                        </span>
                        <div className="flex items-center gap-2 opacity-40 text-[10px] font-black uppercase">
                            <FontAwesomeIcon icon={faClock} />
                            {new Date(post.createdAt).toLocaleString()}
                        </div>
                    </div>

                    <h1 className={`text-4xl font-black ${theme.colors.text} mb-8 tracking-tighter leading-tight`}>
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
                            {post.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span className="block text-sm font-black">{post.user.name}</span>
                            <span className="block text-[10px] font-black opacity-30 uppercase tracking-widest">Author</span>
                        </div>
                    </div>

                    <div className={`prose prose-invert max-w-none opacity-80 text-lg leading-relaxed whitespace-pre-wrap ${theme.colors.text}`}>
                        {post.content}
                    </div>
                </motion.div>

                {/* Comments Section */}
                <div className="space-y-8">
                    <h2 className={`text-2xl font-black ${theme.colors.text} tracking-tight flex items-center gap-3`}>
                        <FontAwesomeIcon icon={faCommentDots} className="text-blue-500" />
                        Comments <span className="opacity-30">({post.comments?.length || 0})</span>
                    </h2>

                    {currentUser ? (
                        <form onSubmit={handlePostComment} className="relative">
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                rows="4"
                                className={`w-full ${theme.colors.card} ${theme.colors.text} px-8 py-6 rounded-[2.5rem] border ${theme.colors.border} outline-none focus:ring-4 ${theme.colors.ring} transition-all font-medium text-sm resize-none pr-24`}
                            />
                            <button 
                                type="submit"
                                disabled={submitting || !comment.trim()}
                                className="absolute right-6 bottom-6 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </form>
                    ) : (
                        <div className={`${theme.colors.card} p-8 rounded-[2.5rem] border ${theme.colors.border} border-dashed text-center`}>
                            <p className="opacity-40 font-bold">Please <Link to="/login" className="text-blue-500">login</Link> to join the discussion.</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {post.comments?.map((c, idx) => (
                            <motion.div 
                                key={c.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`${theme.colors.card} p-8 rounded-[2.5rem] border ${theme.colors.border}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black">
                                            {c.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-black opacity-80">{c.user.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black opacity-30">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="opacity-70 text-sm leading-relaxed">
                                    {c.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetails;
