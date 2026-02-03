import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserMinus, faMedal, faGamepad, faCalendarAlt, faStore } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import GameCard from './GameCard';

const UserProfile = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [library, setLibrary] = useState([]);
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
      <div className="flex justify-center items-center h-screen bg-steam-dark">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-steam-accent"></div>
      </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-steam-dark pt-10 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Profile */}
        <div className="bg-steam-light/80 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-2xl mb-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-steam-accent flex items-center justify-center text-5xl font-bold text-white shadow-xl border-4 border-white/10">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{user.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm mb-6">
                        <span className="bg-steam-accent/20 text-steam-accent px-3 py-1 rounded-full font-bold border border-steam-accent/30 uppercase tracking-widest text-[10px]">
                            {user.role}
                        </span>
                        <span className="text-gray-500 font-medium">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Badges Section */}
                    <div className="flex flex-wrap gap-3 mb-6 justify-center md:justify-start">
                        {library.length >= 1 && (
                            <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-xl border border-yellow-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-yellow-500/5">
                                <FontAwesomeIcon icon={faGamepad} /> {library.length >= 10 ? 'Elite Collector' : 'Game Collector'}
                            </div>
                        )}
                        {user.role === 'PUBLISHER' && (
                            <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-xl border border-blue-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-500/5">
                                <FontAwesomeIcon icon={faStore} /> Official Publisher
                            </div>
                        )}
                        {new Date().getFullYear() - new Date(user.createdAt).getFullYear() >= 1 && (
                            <div className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-xl border border-purple-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-purple-500/5">
                                <FontAwesomeIcon icon={faCalendarAlt} /> 1 Year Veteran
                            </div>
                        )}
                        <div className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-xl border border-green-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-green-500/5">
                            <FontAwesomeIcon icon={faMedal} /> Community Member
                        </div>
                    </div>

                    {user.bio && (
                        <p className="text-gray-400 max-w-2xl leading-relaxed italic border-l-2 border-gray-800 pl-4 mb-6">
                            &quot;{user.bio}&quot;
                        </p>
                    )}
                </div>
                
                {currentUser && currentUser.id !== parseInt(id) && (
                    <div className="shrink-0">
                        {friendStatus === 'ACCEPTED' ? (
                            <button 
                                onClick={handleRemoveFriend}
                                className="bg-gray-800 hover:bg-red-600/20 text-red-400 border border-red-500/30 px-6 py-2.5 rounded-full font-bold transition flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faUserMinus} /> Friends
                            </button>
                        ) : friendStatus === 'PENDING' ? (
                            <button className="bg-gray-800 text-gray-400 border border-gray-700 px-6 py-2.5 rounded-full font-bold cursor-default flex items-center gap-2">
                                <FontAwesomeIcon icon={faUserPlus} className="animate-pulse" /> Pending
                            </button>
                        ) : (
                            <button 
                                onClick={handleAddFriend}
                                className="bg-steam-accent hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold transition shadow-lg flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faUserPlus} /> Add Friend
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Content Tabs */}
        <div className="flex gap-8 border-b border-gray-800 mb-8">
            <button 
                onClick={() => setActiveTab('library')}
                className={`pb-4 text-lg font-bold transition relative ${activeTab === 'library' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Game Library ({library.length})
                {activeTab === 'library' && <div className="absolute bottom-0 left-0 w-full h-1 bg-steam-accent rounded-t-full"></div>}
            </button>
            {currentUser && currentUser.id === parseInt(id) && (
                <button 
                    onClick={() => setActiveTab('following')}
                    className={`pb-4 text-lg font-bold transition relative ${activeTab === 'following' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Following ({following.length})
                    {activeTab === 'following' && <div className="absolute bottom-0 left-0 w-full h-1 bg-steam-accent rounded-t-full"></div>}
                </button>
            )}
        </div>
        
        {activeTab === 'library' ? (
            <div>
                {library.length === 0 ? (
                    <div className="bg-steam-light/50 p-12 rounded-xl text-center text-gray-500 italic border border-gray-800">
                        This user hasn&apos;t added any games to their library yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {library.map(item => (
                            <Link to={`/games/${item.game.id}`} key={item.id}>
                                <GameCard 
                                    game={item.game} 
                                    isOwned={true}
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {following.length === 0 ? (
                    <div className="col-span-full bg-steam-light/50 p-12 rounded-xl text-center text-gray-500 italic border border-gray-800">
                        You are not following any publishers yet.
                    </div>
                ) : (
                    following.map(item => (
                        <Link 
                            to={`/publisher/${item.publisher.id}`} 
                            key={item.id}
                            className="bg-steam-light p-6 rounded-xl border border-gray-800 hover:border-steam-accent transition flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                                {item.publisher.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{item.publisher.name}</h4>
                                <p className="text-xs text-gray-500">{item.publisher.email}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
