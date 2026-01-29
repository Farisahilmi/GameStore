import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import GameCard from './GameCard';

const PublisherProfile = () => {
  const { id } = useParams();
  const [publisher, setPublisher] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/publishers/profile/${id}`);
        setPublisher(res.data.data);
        
        // Check following status if logged in
        const token = localStorage.getItem('token');
        if (token) {
            const followRes = await axios.get(`/api/follows/status/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFollowing(followRes.data.following);
        }
      } catch (err) {
        console.error('Failed to fetch publisher profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleToggleFollow = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          toast.error('Please login to follow publishers');
          return;
      }

      try {
          const res = await axios.post(`/api/follows/toggle/${id}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setIsFollowing(res.data.following);
          toast.success(res.data.message);
      } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to update follow status');
      }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-steam-dark">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-steam-accent"></div>
    </div>
  );

  if (!publisher) return <div className="text-center text-white mt-10">Publisher not found</div>;

  return (
    <div className="min-h-screen bg-steam-dark text-white pb-20">
      <div className="bg-gradient-to-r from-blue-900 to-steam-dark py-16 mb-10 border-b border-gray-800">
        <div className="container mx-auto px-4 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-2xl border-4 border-white/10">
                {publisher.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-4xl font-bold mb-2">{publisher.name}</h1>
            <p className="text-gray-400 max-w-lg text-center">
                Check out the full collection of games published by {publisher.name}.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex gap-8 text-sm text-gray-300">
                    <div className="text-center">
                        <div className="text-white font-bold text-xl">{publisher.publishedGames.length}</div>
                        <div className="uppercase text-[10px] tracking-widest text-gray-500">Games Released</div>
                    </div>
                </div>
                
                <button 
                    onClick={handleToggleFollow}
                    className={`px-8 py-2 rounded-full font-bold transition flex items-center gap-2 shadow-lg ${
                        isFollowing 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-steam-accent hover:bg-blue-500 text-white'
                    }`}
                >
                    <FontAwesomeIcon icon={isFollowing ? faUserCheck : faUserPlus} />
                    {isFollowing ? 'Following' : 'Follow Publisher'}
                </button>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 border-b border-gray-800 pb-2 uppercase tracking-wider">Published Games</h2>
        
        {publisher.publishedGames.length === 0 ? (
            <div className="text-center text-gray-500 py-20 italic">No games published yet.</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {publisher.publishedGames.map(game => (
                    <Link to={`/games/${game.id}`} key={game.id}>
                        <GameCard game={game} />
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default PublisherProfile;
