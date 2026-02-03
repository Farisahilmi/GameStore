import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserMinus, faGamepad, faCalendarAlt, faStore, faComments, faUsers } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import GameCard from './GameCard';
import { useTheme } from '../context/ThemeContext';

const UserProfile = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [library, setLibrary] = useState([]);
  const [friends, setFriends] = useState([]);
  const [following, setFollowing] = useState([]);
  const [friendStatus, setFriendStatus] = useState(null); // null, 'PENDING', 'ACCEPTED'
  const [activeTab, setActiveTab] = useState('library');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Get user profile
        const res = await axios.get(`/api/users/${id}/profile`, { headers });
        setUser(res.data.data.user);
        setLibrary(res.data.data.library);
        setFriendStatus(res.data.data.friendStatus);
        setFriends(res.data.data.friends || []);

        // If it's current user's profile, fetch following
        if (currentUser && currentUser.id === parseInt(id)) {
            const followRes = await axios.get('/api/follows/my', { headers });
            setFollowing(followRes.data.data);
        }
    } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
        navigate('/');
    } finally {
        setLoading(false);
    }
  };

  const handleAddFriend = async () => {
      try {
          const token = localStorage.getItem('token');
          await axios.post('/api/friends/request', { friendId: id }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setFriendStatus('PENDING');
          toast.success('Friend request sent!');
      } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to send request');
      }
  };

  const handleRemoveFriend = async () => {
      if (!window.confirm('Remove friend?')) return;
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/friends/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setFriendStatus(null);
          toast.success('Friend removed');
      } catch (err) {
          toast.error('Failed to remove friend');
      }
  };

  if (loading) return (
      <div className={`flex justify-center items-center h-screen ${theme.colors.bg}`}>
          <div className={`animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 ${theme.colors.accent}`}></div>
      </div>
  );

  if (!user) return null;

  const getProfileGradient = (role) => {
    switch (role) {
      case 'ADMIN': return 'from-red-600 to-red-800';
      case 'PUBLISHER': return 'from-blue-600 to-blue-800';
      default: return 'from-green-600 to-green-800';
    }
  };

  return (
    <div className={`min-h-screen ${theme.colors.bg} pt-24 pb-32 px-6`}>
      <div className="container mx-auto max-w-6xl">
        {/* Header Profile */}
        <div className={`${theme.colors.card} backdrop-blur-md rounded-[3rem] p-10 border ${theme.colors.border} ${theme.colors.shadow} mb-12 relative overflow-hidden group`}>
            {/* Background Decoration */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] group-hover:scale-150 transition-all duration-1000"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="relative">
                    <div className={`w-40 h-40 rounded-[2.5rem] bg-gradient-to-br ${getProfileGradient(user.role)} flex items-center justify-center text-6xl font-black text-white shadow-2xl border-4 border-white/10 transform transition-transform group-hover:scale-105 group-hover:rotate-3`}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl border-4 ${theme.colors.card.replace('bg-', 'border-')} flex items-center justify-center shadow-2xl`}>
                        <div className={`w-6 h-6 rounded-full ${
                            user.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)]' : 
                            user.status === 'PLAYING' ? 'bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)]' : 
                            user.status === 'AWAY' ? 'bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.8)]' : 
                            'bg-gray-500'
                        } animate-pulse`}></div>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
                        <h1 className={`text-5xl md:text-6xl font-black ${theme.colors.text} tracking-tighter italic`}>{user.name}</h1>
                        {user.statusMessage && (
                            <div className="bg-blue-500/10 text-blue-400 px-6 py-2 rounded-2xl border border-blue-500/20 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10">
                                {user.statusMessage}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs mb-8">
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'ONLINE' || user.status === 'PLAYING' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span className="font-black uppercase tracking-[0.2em] opacity-40">{user.status || 'OFFLINE'}</span>
                        </div>
                        <span className="opacity-20 font-black">/</span>
                        <span className={`${theme.colors.accent} font-black uppercase tracking-[0.2em]`}>
                            {user.role}
                        </span>
                        <span className="opacity-20 font-black">/</span>
                        <span className="opacity-40 font-black uppercase tracking-[0.2em]">Member since {new Date(user.createdAt).getFullYear()}</span>
                    </div>

                    {/* Badges Section */}
                    <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
                        {library.length >= 1 && (
                            <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-2xl border border-yellow-500/20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-yellow-500/5">
                                <FontAwesomeIcon icon={faGamepad} className="text-xs" /> {library.length >= 10 ? 'Elite Collector' : 'Game Collector'}
                            </div>
                        )}
                        {(user._count?.forumPosts > 0 || user._count?.forumComments > 5) && (
                            <div className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-2xl border border-orange-500/20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/5">
                                <FontAwesomeIcon icon={faComments} className="text-xs" /> Community Contributor
                            </div>
                        )}
                        {user.role === 'PUBLISHER' && (
                            <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-2xl border border-blue-500/20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/5">
                                <FontAwesomeIcon icon={faStore} className="text-xs" /> Official Publisher
                            </div>
                        )}
                        {new Date().getFullYear() - new Date(user.createdAt).getFullYear() >= 1 && (
                            <div className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-2xl border border-purple-500/20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/5">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" /> Veteran Member
                            </div>
                        )}
                    </div>

                    {user.bio && (
                        <p className={`opacity-60 max-w-2xl leading-relaxed italic border-l-4 ${theme.colors.border} pl-6 mb-10 text-lg`}>
                            &quot;{user.bio}&quot;
                        </p>
                    )}

                    {/* Community Stats */}
                    <div className="grid grid-cols-3 gap-6 max-w-md">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center group/stat hover:bg-white/10 transition-all">
                            <div className="text-3xl font-black text-blue-500 mb-1">{user._count?.forumPosts || 0}</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 group-hover/stat:opacity-60 transition-opacity">Posts</div>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center group/stat hover:bg-white/10 transition-all">
                            <div className="text-3xl font-black text-purple-500 mb-1">{user._count?.forumComments || 0}</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 group-hover/stat:opacity-60 transition-opacity">Comments</div>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 text-center group/stat hover:bg-white/10 transition-all">
                            <div className="text-3xl font-black text-green-500 mb-1">{user._count?.reviews || 0}</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 group-hover/stat:opacity-60 transition-opacity">Reviews</div>
                        </div>
                    </div>
                </div>
                
                {currentUser && currentUser.id !== parseInt(id) && (
                    <div className="shrink-0">
                        {friendStatus === 'ACCEPTED' ? (
                            <button 
                                onClick={handleRemoveFriend}
                                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-red-500/5 flex items-center gap-3 transform hover:scale-105 active:scale-95"
                            >
                                <FontAwesomeIcon icon={faUserMinus} /> Friends
                            </button>
                        ) : friendStatus === 'PENDING' ? (
                            <button className="bg-white/5 text-white/40 border border-white/10 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs cursor-default flex items-center gap-3">
                                <FontAwesomeIcon icon={faUserPlus} className="animate-pulse" /> Pending
                            </button>
                        ) : (
                            <button 
                                onClick={handleAddFriend}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 transform hover:scale-105 active:scale-95"
                            >
                                <FontAwesomeIcon icon={faUserPlus} /> Add Friend
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Content Tabs */}
        <div className="flex gap-12 border-b border-white/5 mb-12 px-4">
            {['library', 'friends', 'following'].map(tab => (
                (tab !== 'following' || (currentUser && currentUser.id === parseInt(id))) && (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-6 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${
                            activeTab === tab ? theme.colors.text : 'opacity-40 hover:opacity-100'
                        }`}
                    >
                        {tab === 'library' && `Library (${library.length})`}
                        {tab === 'friends' && `Friends (${friends.length})`}
                        {tab === 'following' && `Following (${following.length})`}
                        {activeTab === tab && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600 rounded-t-full shadow-[0_-5px_15px_rgba(59,130,246,0.5)]"
                            />
                        )}
                    </button>
                )
            ))}
        </div>
        
        <div className="px-4">
            {activeTab === 'library' && (
                <div>
                    {library.length === 0 ? (
                        <div className="bg-white/5 p-20 rounded-[3rem] text-center border border-dashed border-white/10">
                            <FontAwesomeIcon icon={faGamepad} className="text-5xl opacity-10 mb-6" />
                            <h3 className="text-xl font-black opacity-30">Library is empty</h3>
                            <p className="opacity-20 text-sm mt-2">No games found in this collection.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {library.map(item => (
                                <Link to={`/games/${item.game.id}`} key={item.id} className="group">
                                    <GameCard 
                                        game={item.game} 
                                        isOwned={true}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'friends' && (
                <div>
                    {friends.length === 0 ? (
                        <div className="bg-white/5 p-20 rounded-[3rem] text-center border border-dashed border-white/10">
                            <FontAwesomeIcon icon={faUsers} className="text-5xl opacity-10 mb-6" />
                            <h3 className="text-xl font-black opacity-30">No friends yet</h3>
                            <p className="opacity-20 text-sm mt-2">Connecting with others makes gaming better!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {friends.map(friend => (
                                <Link 
                                    key={friend.id} 
                                    to={`/profile/${friend.id}`}
                                    className={`${theme.colors.card} p-6 rounded-[2rem] border ${theme.colors.border} hover:border-blue-500/50 transition-all flex items-center gap-5 group`}
                                >
                                    <div className="relative">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getProfileGradient(friend.role)} flex items-center justify-center text-xl font-black text-white group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                                            {friend.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 ${theme.colors.card.replace('bg-', 'border-')} ${
                                            friend.status === 'ONLINE' ? 'bg-green-500' : 
                                            friend.status === 'PLAYING' ? 'bg-blue-400' : 
                                            friend.status === 'AWAY' ? 'bg-yellow-500' : 
                                            'bg-gray-500'
                                        }`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-black ${theme.colors.text} truncate group-hover:text-blue-500 transition-colors`}>{friend.name}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{friend.role}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'following' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {following.length === 0 ? (
                        <div className="col-span-full bg-white/5 p-20 rounded-[3rem] text-center border border-dashed border-white/10">
                            <FontAwesomeIcon icon={faStore} className="text-5xl opacity-10 mb-6" />
                            <h3 className="text-xl font-black opacity-30">Not following any publishers</h3>
                            <p className="opacity-20 text-sm mt-2">Follow publishers to get updates on their projects!</p>
                        </div>
                    ) : (
                        following.map(item => (
                            <Link 
                                to={`/publisher/${item.publisher.id}`} 
                                key={item.id}
                                className={`${theme.colors.card} p-8 rounded-[2rem] border ${theme.colors.border} hover:border-blue-500/50 transition-all flex items-center gap-6 group`}
                            >
                                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white group-hover:scale-110 group-hover:-rotate-3 transition-all shadow-xl shadow-blue-500/10">
                                    {item.publisher.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-black ${theme.colors.text} truncate group-hover:text-blue-500 transition-colors`}>{item.publisher.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 truncate">{item.publisher.email}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
