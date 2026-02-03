import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from './GameCard';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const Wishlist = ({ addToCart, library }) => {
  const { theme } = useTheme();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (gameId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/wishlist/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(wishlist.filter(item => item.gameId !== gameId));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      alert('Failed to remove from wishlist');
    }
  };

  if (loading) return (
    <div className={`flex justify-center items-center h-screen ${theme.colors.bg}`}>
      <div className={`animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 ${theme.colors.accent}`}></div>
    </div>
  );

  return (
    <div className={`container mx-auto px-4 py-8 min-h-screen ${theme.colors.bg}`}>
      <h2 className={`text-3xl font-bold ${theme.colors.text} mb-8 border-b ${theme.colors.border} pb-4`}>My Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
            <h3 className={`text-2xl opacity-60 mb-4 ${theme.colors.text}`}>Your wishlist is empty</h3>
            <Link to="/" className={`${theme.colors.accent} hover:underline`}>Browse Games</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(item => (
            <div key={item.id} className="relative group">
                <Link to={`/games/${item.gameId}`} className="block h-full">
                    <GameCard 
                        game={item.game} 
                        isOwned={library?.includes(item.gameId)}
                        onBuy={(e) => {
                            e.preventDefault();
                            addToCart(item.game);
                        }} 
                    />
                </Link>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(item.gameId);
                    }}
                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg z-10 w-8 h-8 flex items-center justify-center"
                    title="Remove from Wishlist"
                >
                    <FontAwesomeIcon icon={faTrash} size="sm" />
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
