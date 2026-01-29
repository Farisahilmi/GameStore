import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import GameCard from './GameCard';

const Sales = ({ addToCart, library }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // In a real app, we'd have a specific endpoint or query param for discounted games
            // For now, let's fetch games and filter client-side or assume backend returns some
            const res = await axios.get('/api/games?limit=50');
            // Filter only games with discount > 0
            const discounted = res.data.data.games.filter(g => g.discountTotal > 0);
            setGames(discounted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-steam-dark pt-10 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white border-l-4 border-green-500 pl-4">Special Offers</h1>
            <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm uppercase animate-pulse">Live Now</span>
        </div>
        
        {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-steam-accent"></div>
             </div>
        ) : games.length === 0 ? (
            <div className="text-center py-20 bg-steam-light rounded-xl border border-gray-800">
                <h3 className="text-2xl text-white font-bold mb-2">No Active Sales</h3>
                <p className="text-gray-400">Check back later for more deals!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {games.map(game => (
                    <Link to={`/games/${game.id}`} key={game.id} className="block h-full">
                        <GameCard 
                            game={game} 
                            isOwned={library?.includes(game.id)}
                            onBuy={(e) => {
                                e.preventDefault();
                                addToCart(game);
                            }} 
                        />
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
