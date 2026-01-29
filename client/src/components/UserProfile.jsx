import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserMinus, faGamepad, faCalendarAlt, faEnvelope, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import GameCard from './GameCard';

const UserProfile = ({ currentUser, addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [library, setLibrary] = useState([]);
  const [friendStatus, setFriendStatus] = useState(null); // null, 'PENDING', 'ACCEPTED'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Get user profile (We might need a public profile endpoint or adjust getProfile)
        // For now, let's assume we can fetch by ID or get basic info
        const res = await axios.get(`/api/users/${id}/profile`, { headers });
        setUser(res.data.data.user);
        setLibrary(res.data.data.library);
        setFriendStatus(res.data.data.friendStatus);
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
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                        <h1 className="text-4xl font-bold text-white">{user.name}</h1>
                        <span className="bg-gray-800 text-steam-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-gray-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faShieldAlt} size="xs" />
                            {user.role}
                        </span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} /> {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} /> Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faGamepad} /> {library.length} Games
                        </div>
                    </div>
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

        {/* Content Tabs (Simplified) */}
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
                Game Library <span className="text-gray-500 text-lg">({library.length})</span>
            </h2>
            
            {library.length === 0 ? (
                <div className="bg-steam-light/50 p-12 rounded-xl text-center text-gray-500 italic border border-gray-800">
                    This user hasn't added any games to their library yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {library.map(item => (
                        <GameCard 
                            key={item.id} 
                            game={item.game} 
                            onBuy={() => addToCart(item.game)}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
