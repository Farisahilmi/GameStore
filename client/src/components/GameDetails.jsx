import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCartPlus, faBolt, faHeart, faChevronRight, faEdit, faTrash, faTimes, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const GameDetails = ({ addToCart, directPurchase, library }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [relatedGames, setRelatedGames] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews');
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchGameAndRelated = async () => {
      try {
        const res = await axios.get(`/api/games/${id}`);
        setGame(res.data?.data);
        
        // Fetch related games based on first category
        const gameData = res.data?.data;
        if (gameData?.categories && gameData.categories.length > 0) {
            const category = gameData.categories[0].name;
            const relatedRes = await axios.get(`/api/games?category=${category}&limit=4`);
            setRelatedGames(relatedRes.data?.data?.games?.filter(g => g.id !== parseInt(id)) || []);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load game details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/reviews/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setReviews(res.data.data);
        } catch (err) {
            console.error('Failed to load reviews');
        }
    };

    const fetchUpdates = async () => {
        try {
            const res = await axios.get(`/api/game-updates/game/${id}`);
            setUpdates(res.data.data);
        } catch (err) {
            console.error('Failed to load updates');
        }
    };

    fetchGameAndRelated();
    fetchReviews();
    fetchUpdates();
  }, [id, navigate]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error('Please login to leave a review');
        return;
    }
    
    try {
        const res = await axios.post(`/api/reviews/${id}`, {
            rating: userRating,
            comment: userComment
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setReviews([res.data.data, ...reviews]);
        setUserComment('');
        toast.success('Review submitted successfully!');
    } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const handleEditReview = (review) => {
      setEditingReviewId(review.id);
      setEditRating(review.rating);
      setEditComment(review.comment || '');
  };

  const handleUpdateReview = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
          const res = await axios.put(`/api/reviews/${editingReviewId}`, {
              rating: editRating,
              comment: editComment
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setReviews(reviews.map(r => r.id === editingReviewId ? res.data.data : r));
          setEditingReviewId(null);
          toast.success('Review updated');
      } catch (err) {
          toast.error("Failed to update review");
      }
  };

  const handleVoteReview = async (reviewId, type) => {
      const token = localStorage.getItem('token');
      if (!token) {
          toast.error('Please login to vote');
          return;
      }

      try {
          const res = await axios.post(`/api/reviews/vote/${reviewId}`, { type }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Refresh reviews to get updated counts
          const reviewsRes = await axios.get(`/api/reviews/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setReviews(reviewsRes.data.data);
          toast.success(res.data.message);
      } catch (err) {
          toast.error('Failed to vote');
      }
  };

  const handleDeleteReview = async (reviewId) => {
      if (!window.confirm("Delete this review?")) return;
      const token = localStorage.getItem('token');
      try {
          await axios.delete(`/api/reviews/${reviewId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setReviews(reviews.filter(r => r.id !== reviewId));
          toast.success('Review deleted');
      } catch (err) {
          toast.error("Failed to delete review");
      }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-steam-dark">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-steam-accent"></div>
    </div>
  );

  if (!game) return null;

  return (
    <div className="min-h-screen bg-steam-dark text-white pt-10 pb-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-steam-dark opacity-90"></div>
        <img 
            src={game.imageUrl || 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image'} 
            className="w-full h-full object-cover blur-xl opacity-20" 
            alt="bg"
            onError={handleImageError} 
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Breadcrumb / Title */}
        <div className="mb-6 flex items-center gap-2 text-gray-400 text-sm">
           <button onClick={() => navigate('/')} className="hover:text-white">Store</button>
           <span>&gt;</span>
           <span className="text-white">{game.title}</span>
        </div>

        <div className="bg-steam-dark/80 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Column: Media */}
            <div className="lg:col-span-2 bg-black flex items-center justify-center bg-zinc-900 min-h-[300px] md:min-h-[450px]">
               <img 
                src={game.imageUrl || 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image'} 
                alt={game.title} 
                className="w-full h-full object-contain max-h-[600px]" 
                onError={handleImageError}
               />
            </div>

            {/* Right Column: Info */}
            <div className="p-6 md:p-8 flex flex-col justify-between bg-gradient-to-b from-steam-light to-steam-dark">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{game.title}</h1>
                    {game.avgRating > 0 && (
                        <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/30 shrink-0">
                            <FontAwesomeIcon icon={faStar} />
                            <span className="font-bold">{game.avgRating.toFixed(1)}</span>
                            <span className="text-[10px] opacity-60">({game.reviewCount})</span>
                        </div>
                    )}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed text-base md:text-lg line-clamp-6 hover:line-clamp-none transition-all">{game.description}</p>
                
                <div className="space-y-3 mb-8 text-sm">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500">Release Date</span>
                    <span className="text-gray-300">{new Date(game.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500">Publisher</span>
                    <span className="text-steam-accent hover:underline cursor-pointer">{game.publisher?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-500">Categories</span>
                    <div className="flex gap-2">
                      {game.categories?.map(c => (
                        <span key={c.id} className="bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-300">{c.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Action */}
              <div className="bg-black/30 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Price</span>
                  <div className="flex flex-col items-end">
                    {game.discountTotal > 0 && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">-{game.discountTotal}%</span>
                            <span className="text-gray-500 line-through text-sm">${Number(game.originalPrice).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="text-3xl font-bold text-white">
                        {game.finalPrice === 0 ? <span className="text-green-400">Free</span> : `$${Number(game.finalPrice).toFixed(2)}`}
                    </div>
                    {game.activeSaleName && <span className="text-[10px] text-steam-accent uppercase font-bold mt-1">{game.activeSaleName}</span>}
                  </div>
                </div>
                <div className="flex gap-3 mb-3">
                  {library && library.includes(game.id) ? (
                    <div className="w-full bg-gray-800 text-gray-400 font-bold py-4 rounded text-center border border-gray-700 cursor-default">
                        In Library
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => addToCart(game)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-steam-accent hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-8 rounded shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                      </button>
                      <button 
                        onClick={() => directPurchase(game)}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faBolt} /> Buy Now
                      </button>
                    </>
                  )}
                </div>
                <button 
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      if (!token) {
                          toast.error('Please login to add to wishlist');
                          return;
                      }
                      try {
                          await axios.post('/api/wishlist', { gameId: game.id }, {
                              headers: { Authorization: `Bearer ${token}` }
                          });
                          toast.success('Added to wishlist!');
                          window.dispatchEvent(new Event('wishlistUpdated'));
                      } catch (err) {
                          if (err.response && err.response.data && err.response.data.message) {
                              toast(err.response.data.message, { icon: 'ℹ️' });
                          } else {
                              toast.error('Failed to add to wishlist');
                          }
                      }
                    }}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/50 font-bold py-2 rounded text-sm transition"
                >
                  <FontAwesomeIcon icon={faHeart} className="mr-2" />
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Games */}
        {relatedGames.length > 0 && (
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedGames.map(related => (
                        <div key={related.id} className="bg-steam-light rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-steam-accent/50 transition group cursor-pointer" onClick={() => navigate(`/games/${related.id}`)}>
                            <div className="h-32 overflow-hidden relative">
                                <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" onError={(e) => e.target.src = 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image'} />
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-white truncate text-sm mb-1">{related.title}</h4>
                                <div className="text-gray-400 text-xs">${Number(related.price).toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Tabs Selection */}
        <div className="mt-12 flex gap-8 border-b border-gray-800">
            <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 text-lg font-bold transition relative ${activeTab === 'reviews' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                User Reviews ({reviews.length})
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-1 bg-steam-accent rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('updates')}
                className={`pb-4 text-lg font-bold transition relative ${activeTab === 'updates' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Patch Notes & Updates ({updates.length})
                {activeTab === 'updates' && <div className="absolute bottom-0 left-0 w-full h-1 bg-steam-accent rounded-t-full"></div>}
            </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'reviews' ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-steam-light p-6 rounded-lg border border-gray-700 shadow-lg sticky top-24">
                        <h3 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Write a Review</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setUserRating(star)}
                                            className={`text-2xl transition ${star <= userRating ? 'text-yellow-400 scale-110' : 'text-gray-600 hover:text-yellow-200'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-1">Comment</label>
                                <textarea 
                                    value={userComment}
                                    onChange={(e) => setUserComment(e.target.value)}
                                    className="w-full bg-steam-dark border border-gray-600 rounded p-3 text-white outline-none focus:border-steam-accent min-h-[100px]"
                                    placeholder="Share your thoughts..."
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-steam-accent hover:bg-blue-500 text-white font-bold py-2 rounded transition"
                            >
                                Post Review
                            </button>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-2">
                    {reviews.length === 0 ? (
                        <div className="bg-steam-light p-8 rounded-lg text-center text-gray-400 italic border border-gray-800">
                            No reviews yet. Be the first to review this game!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-steam-light p-6 rounded-lg border border-gray-700 hover:border-steam-accent/30 transition">
                                    {editingReviewId === review.id ? (
                                        <form onSubmit={handleUpdateReview} className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-steam-accent">Editing Your Review</h4>
                                                <button type="button" onClick={() => setEditingReviewId(null)} className="text-gray-500 hover:text-white">
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button 
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setEditRating(star)}
                                                        className={`text-xl transition ${star <= editRating ? 'text-yellow-400' : 'text-gray-600'}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea 
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                className="w-full bg-steam-dark border border-gray-600 rounded p-3 text-white outline-none focus:border-steam-accent min-h-[80px] text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <button type="submit" className="bg-steam-accent text-white px-4 py-1.5 rounded text-sm font-bold">Save Changes</button>
                                                <button type="button" onClick={() => setEditingReviewId(null)} className="bg-gray-700 text-white px-4 py-1.5 rounded text-sm">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="font-bold text-steam-accent">{review.user?.name || 'Unknown User'}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    {currentUser && (currentUser.id === review.userId || currentUser.role === 'ADMIN') && (
                                                        <div className="flex gap-2">
                                                            {currentUser.id === review.userId && (
                                                                <button onClick={() => handleEditReview(review)} className="text-gray-500 hover:text-blue-400 transition" title="Edit">
                                                                    <FontAwesomeIcon icon={faEdit} size="sm" />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleDeleteReview(review.id)} className="text-gray-500 hover:text-red-400 transition" title="Delete">
                                                                <FontAwesomeIcon icon={faTrash} size="sm" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-400 mb-2 text-sm gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <FontAwesomeIcon key={i} icon={faStar} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'} />
                                                ))}
                                            </div>
                                            <p className="text-gray-300 leading-relaxed text-sm mb-4">
                                                {review.comment || <span className="italic text-gray-600">No comment provided.</span>}
                                            </p>

                                            {/* Voting UI */}
                                            <div className="flex items-center gap-4 border-t border-gray-800 pt-3">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Was this review helpful?</span>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleVoteReview(review.id, 'up')}
                                                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition ${
                                                            review.userVote === 'up' 
                                                            ? 'bg-blue-600 text-white' 
                                                            : 'bg-gray-800 text-gray-400 hover:text-white'
                                                        }`}
                                                    >
                                                        <FontAwesomeIcon icon={faThumbsUp} />
                                                        <span>{review.upvotes || 0}</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleVoteReview(review.id, 'down')}
                                                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition ${
                                                            review.userVote === 'down' 
                                                            ? 'bg-red-600 text-white' 
                                                            : 'bg-gray-800 text-gray-400 hover:text-white'
                                                        }`}
                                                    >
                                                        <FontAwesomeIcon icon={faThumbsDown} />
                                                        <span>{review.downvotes || 0}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="mt-8 space-y-6 max-w-4xl mx-auto">
                {updates.length === 0 ? (
                    <div className="bg-steam-light p-12 rounded-lg text-center text-gray-400 italic border border-gray-800">
                        No updates posted yet for this game.
                    </div>
                ) : (
                    updates.map(update => (
                        <div key={update.id} className="bg-steam-light p-8 rounded-xl border border-gray-800 shadow-lg hover:border-steam-accent/30 transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border mr-3 ${
                                        update.type === 'HOTFIX' ? 'bg-red-900/20 text-red-400 border-red-500/30' :
                                        update.type === 'DLC' ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' :
                                        'bg-blue-900/20 text-blue-400 border-blue-500/30'
                                    }`}>
                                        {update.type}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mt-2">{update.title}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-steam-accent font-mono text-sm font-bold">{update.version || 'v1.0'}</div>
                                    <div className="text-gray-500 text-xs mt-1">{new Date(update.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                                {update.content.split('\n').map((para, i) => <p key={i} className="mb-4">{para}</p>)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;
