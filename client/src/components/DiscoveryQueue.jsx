import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTimes, faStar, faHeart, faShoppingCart, faBolt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const DiscoveryQueue = ({ addToCart, directPurchase, library }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/games/discovery-queue', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setQueue(res.data.data);
    } catch (err) {
        console.error(err);
        toast.error('Failed to load discovery queue');
        navigate('/');
    } finally {
        setLoading(false);
    }
  };

  const nextGame = () => {
      if (currentIndex < queue.length - 1) {
          setCurrentIndex(currentIndex + 1);
      } else {
          toast.success("You've finished your discovery queue for today!");
          navigate('/');
      }
  };

  const addToWishlist = async (gameId) => {
      try {
          const token = localStorage.getItem('token');
          await axios.post('/api/wishlist', { gameId }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Added to wishlist!');
          window.dispatchEvent(new Event('wishlistUpdated'));
      } catch (err) {
          toast.error('Failed to add to wishlist');
      }
  };

  if (loading) return (
      <div className="flex justify-center items-center h-screen bg-steam-dark">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-steam-accent"></div>
      </div>
  );

  if (queue.length === 0) return (
      <div className="min-h-screen bg-steam-dark flex items-center justify-center p-4">
          <div className="bg-steam-light p-12 rounded-2xl border border-gray-800 text-center max-w-lg shadow-2xl">
              <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">No New Discoveries</h2>
              <p className="text-gray-400 mb-8">You've seen everything we recommend for now. Check back tomorrow!</p>
              <button onClick={() => navigate('/')} className="bg-steam-accent hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition">
                  Back to Store
              </button>
          </div>
      </div>
  );

  const currentGame = queue[currentIndex];

  return (
    <div className="min-h-screen bg-steam-dark pt-10 pb-20 px-4 flex flex-col items-center">
      <div className="container max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-steam-accent">Discovery Queue</span>
                <span className="text-sm bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
                    {currentIndex + 1} of {queue.length}
                </span>
            </h1>
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white transition flex items-center gap-2">
                <FontAwesomeIcon icon={faTimes} /> Exit Queue
            </button>
        </div>

        <div className="bg-steam-light rounded-2xl overflow-hidden border border-gray-700 shadow-2xl animate-fadeIn flex flex-col md:flex-row h-full md:min-h-[500px]">
            {/* Image Section */}
            <div className="md:w-3/5 bg-black relative group overflow-hidden">
                <img src={currentGame.imageUrl} alt={currentGame.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{currentGame.title}</h2>
                    <div className="flex flex-wrap gap-2">
                        {currentGame.categories?.map(c => (
                            <span key={c.id} className="bg-steam-accent/20 backdrop-blur-md text-steam-accent border border-steam-accent/30 text-xs px-3 py-1 rounded-full font-bold">
                                {c.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="md:w-2/5 p-8 flex flex-col justify-between bg-gradient-to-br from-steam-light to-[#1b2838]">
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/30">
                            <FontAwesomeIcon icon={faStar} />
                            <span className="font-bold">{currentGame.avgRating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{currentGame.publisher?.name}</span>
                    </div>

                    <p className="text-gray-300 leading-relaxed mb-8 line-clamp-6">
                        {currentGame.description}
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Price</span>
                            <div className="text-2xl font-bold text-white">
                                {currentGame.price === 0 ? 'Free' : `$${Number(currentGame.price).toFixed(2)}`}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex gap-2">
                        {library && library.includes(currentGame.id) ? (
                            <div className="w-full bg-gray-800 text-gray-400 font-bold py-3 rounded text-center border border-gray-700 cursor-default">
                                In Library
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={() => addToCart(currentGame)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                                </button>
                                <button 
                                    onClick={() => directPurchase(currentGame)}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <FontAwesomeIcon icon={faBolt} /> Buy Now
                                </button>
                            </>
                        )}
                    </div>
                    <button 
                        onClick={() => addToWishlist(currentGame.id)}
                        className="w-full bg-pink-600/10 hover:bg-pink-600/20 text-pink-500 border border-pink-500/30 font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <FontAwesomeIcon icon={faHeart} /> Wishlist
                    </button>
                    <button 
                        onClick={nextGame}
                        className="w-full bg-steam-accent hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-xl transform active:scale-95 mt-4"
                    >
                        {currentIndex === queue.length - 1 ? 'Finish Queue' : 'Next in Queue'}
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryQueue;
