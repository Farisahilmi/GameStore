import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCode, faVial, faCheckCircle, faHammer, faComment, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const DevUpdatesFeed = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const res = await axios.get('/api/dev-projects/public'); 
                setUpdates(res.data?.data?.slice(0, 4) || []);
            } catch (err) {
                console.error('Failed to fetch dev updates');
                setUpdates([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUpdates();
    }, []);

    const fetchComments = async (projectId) => {
        setLoadingComments(true);
        try {
            const res = await axios.get(`/api/dev-projects/${projectId}/comments`);
            setComments(res.data?.data || []);
        } catch (err) {
            toast.error('Failed to load comments');
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        fetchComments(project.id);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to comment');
            return;
        }

        try {
            const res = await axios.post(`/api/dev-projects/${selectedProject.id}/comments`, {
                content: newComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments([res.data.data, ...comments]);
            setNewComment('');
            toast.success('Comment added');
        } catch (err) {
            toast.error('Failed to add comment');
        }
    };

    if (loading || updates.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faHammer} className="text-steam-accent" />
                Developer Studio Updates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {updates.map(project => (
                    <div 
                        key={project.id} 
                        onClick={() => handleProjectClick(project)}
                        className="bg-steam-light p-4 rounded-lg border border-gray-700 hover:border-steam-accent transition group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-sm text-white group-hover:text-steam-accent transition truncate">{project.title}</h3>
                            <FontAwesomeIcon icon={getStatusIcon(project.status)} className={`text-xs ${getStatusColor(project.status)}`} />
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-3">{project.status.replace('_', ' ')}</div>
                        
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div 
                                className="bg-steam-accent h-full transition-all duration-1000" 
                                style={{ width: `${project.progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500">
                            <span>{project.progress}% Complete</span>
                            <div className="flex items-center gap-1">
                                <FontAwesomeIcon icon={faComment} className="opacity-50" />
                                <span>Update Feed</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comments Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-steam-light border border-gray-700 rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-fadeIn">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">{selectedProject.title} Update</h3>
                                <p className="text-xs text-gray-400">Dev Studio Feedback</p>
                            </div>
                            <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-white transition">
                                <FontAwesomeIcon icon={faTimes} size="lg" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                            {loadingComments ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-steam-accent"></div>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 italic text-sm">No feedback yet. Be the first to comment!</div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="bg-steam-dark p-3 rounded border border-gray-800">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-steam-accent text-xs font-bold">{comment.user.name}</span>
                                            <span className="text-[10px] text-gray-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-700 bg-gray-900/30">
                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write your feedback..."
                                    className="flex-1 bg-steam-dark border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-steam-accent outline-none"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="bg-steam-accent hover:bg-blue-500 text-white p-2 rounded w-10 flex items-center justify-center transition disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'CONCEPT': return faCode;
        case 'IN_DEVELOPMENT': return faHammer;
        case 'ALPHA': return faVial;
        case 'BETA': return faRocket;
        case 'RELEASED': return faCheckCircle;
        default: return faCode;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'CONCEPT': return 'text-gray-400';
        case 'IN_DEVELOPMENT': return 'text-blue-400';
        case 'ALPHA': return 'text-purple-400';
        case 'BETA': return 'text-orange-400';
        case 'RELEASED': return 'text-green-400';
        default: return 'text-gray-400';
    }
};

export default DevUpdatesFeed;
