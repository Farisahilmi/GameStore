import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import GameCard from './GameCard';

const BrowseGames = ({ addToCart, library }) => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [gamesRes, catsRes] = await Promise.all([
                axios.get('/api/games?limit=20'),
                axios.get('/api/categories')
            ]);
            setGames(gamesRes.data?.data?.games || []);
            setCategories(catsRes.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const filteredGames = selectedCategory 
    ? games.filter(g => g.categories.some(c => c.name === selectedCategory))
    : games;

  return (
    <div className="min-h-screen bg-steam-dark pt-10 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-steam-accent pl-4">Browse Games</h1>
        
        {/* Simple Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
            <button 
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition ${selectedCategory === '' ? 'bg-steam-accent text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
                All
            </button>
            {categories.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${selectedCategory === cat.name ? 'bg-steam-accent text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-steam-accent"></div>
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredGames.map(game => (
                    <Link to={`/games/${game.id}`} key={game.id} className="block h-full">
                        <GameCard 
                            game={game} 
                            isOwned={library?.includes(game.id)}
                            onBuy={(e) => { e.preventDefault(); addToCart(game); }}
                        />
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default BrowseGames;
