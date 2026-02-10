import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCartPlus, faBolt, faHeart, faEdit, faTrash, faTimes, faThumbsUp, faThumbsDown, faExpand, faPlayCircle, faCertificate, faGift } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import FriendSelectionModal from './FriendSelectionModal';

const GameDetails = ({ addToCart, directPurchase, library }) => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [relatedGames, setRelatedGames] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState('reviews');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAddingWishlist, setIsAddingWishlist] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const cardColorBase = 'gray';
  const accentColorBase = 'blue';
  
  // Helper for accent background
  const accentBg = 'bg-blue-600';
  
  const PLACEHOLDER_IMG = 'https://placehold.co/1920x1080/1a1a1a/ffffff?text=No+Image';

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
    e.target.src = PLACEHOLDER_IMG;
  };

  const handlePlayGame = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.put('/api/users/status', { 
            status: 'PLAYING', 
            statusMessage: `Playing ${game.title}` 
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`Starting ${game.title}...`);
    } catch (err) {
        toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className={`flex justify-center items-center h-screen ${theme.colors.bg}`}>
      <div className={`animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 ${theme.colors.accent}`}></div>
    </div>
  );

  if (!game) return null;
  
  // Mobile View
  const MobileView = () => (
    <div className={`md:hidden pb-24 relative`}>
        {/* Full Header Image */}
        <div className="relative h-64 w-full">
            <img 
                src={game.imageUrl} 
                alt={game.title} 
                className="w-full h-full object-cover"
                onClick={() => setIsLightboxOpen(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md">{game.title}</h1>
                <div className="flex items-center gap-2">
                    {game.publisher && <span className="text-xs font-bold opacity-80">{game.publisher.name}</span>}
                    {game.avgRating > 0 && (
                        <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded text-yellow-400 text-xs font-bold backdrop-blur-sm">
                            <FontAwesomeIcon icon={faStar} /> {game.avgRating.toFixed(1)}
                        </div>
                    )}
                </div>
            </div>
            <button 
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white"
            >
                ←
            </button>
        </div>

        <div className="p-4 space-y-6">
             {/* Price & Status */}
             <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                    {game.discountTotal > 0 && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded mb-1 inline-block">-{game.discountTotal}%</span>}
                    <div className="text-2xl font-black text-white">
                        {game.finalPrice === 0 ? 'Free' : `$${Number(game.finalPrice).toFixed(2)}`}
                    </div>
                </div>
                {game.activeSaleName && <span className="text-xs text-blue-400 font-bold uppercase">{game.activeSaleName}</span>}
             </div>

             {/* Categories Scroll */}
             <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {game.categories?.map(c => (
                    <span key={c.id} className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap">{c.name}</span>
                ))}
             </div>

             {/* Media Scroll */}
             <div>
                <h3 className="text-sm font-bold opacity-60 uppercase mb-3">Gallery</h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x">
                    {game.trailerUrl && (
                        <div className="w-64 aspect-video shrink-0 snap-center rounded-lg overflow-hidden relative">
                             <iframe src={`${game.trailerUrl.replace('watch?v=', 'embed/')}?autoplay=0`} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                        </div>
                    )}
                    <div className="w-64 aspect-video shrink-0 snap-center rounded-lg overflow-hidden">
                        <img src={game.imageUrl} className="w-full h-full object-cover" onClick={() => setIsLightboxOpen(true)} />
                    </div>
                    {game.screenshots?.map(ss => (
                        <div key={ss.id} className="w-64 aspect-video shrink-0 snap-center rounded-lg overflow-hidden">
                            <img src={ss.url} className="w-full h-full object-cover" onClick={() => { setSelectedImage(ss.url); setIsLightboxOpen(true); }} />
                        </div>
                    ))}
                </div>
             </div>

             {/* Description */}
             <div>
                <h3 className="text-sm font-bold opacity-60 uppercase mb-2">About</h3>
                <p className="text-sm leading-relaxed opacity-80">{game.description}</p>
             </div>

             {/* Reviews Preview */}
             <div>
                <h3 className="text-sm font-bold opacity-60 uppercase mb-3">Reviews</h3>
                {reviews.length > 0 ? (
                    <div className="bg-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">{reviews[0].user?.name[0]}</div>
                             <span className="text-sm font-bold">{reviews[0].user?.name}</span>
                             <div className="flex text-yellow-400 text-xs ml-auto">
                                {[...Array(5)].map((_, i) => <FontAwesomeIcon key={i} icon={faStar} className={i < reviews[0].rating ? '' : 'text-gray-600'} />)}
                             </div>
                        </div>
                        <p className="text-xs opacity-70 line-clamp-3">"{reviews[0].comment}"</p>
                    </div>
                ) : (
                    <p className="text-xs opacity-50 italic">No reviews yet.</p>
                )}
                <button 
                    onClick={() => {
                        // Scroll to reviews section if we were using a single page, 
                        // but here we might just expand or show more.
                        // For now just toggle tab logic if we reused it, but sticking to simple view.
                    }} 
                    className="w-full mt-3 py-2 text-xs font-bold text-blue-400 border border-blue-500/30 rounded-lg"
                >
                    Read All Reviews ({reviews.length})
                </button>
             </div>
        </div>

        {/* Sticky Mobile Action Bar */}
        <div className={`fixed bottom-[64px] left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 z-40 flex gap-3`}>
             {library && library.includes(game.id) ? (
                 <button onClick={handlePlayGame} className="w-full bg-green-600 text-white font-black py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                     <FontAwesomeIcon icon={faPlayCircle} /> PLAY
                 </button>
             ) : (
                 <>
                    <button 
                        onClick={async () => {
                            setIsAddingToCart(true);
                            await addToCart(game);
                            setTimeout(() => setIsAddingToCart(false), 500);
                        }}
                        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                        disabled={isAddingToCart}
                    >
                         {isAddingToCart ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <FontAwesomeIcon icon={faCartPlus} />}
                    </button>
                    <button 
                        onClick={async () => {
                            setIsBuyingNow(true);
                            await directPurchase(game);
                            setTimeout(() => setIsBuyingNow(false), 500);
                        }}
                        disabled={isBuyingNow}
                        className="flex-[2] bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                        {isBuyingNow ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Buy Now'
                        )}
                    </button>
                 </>
             )}
        </div>
    </div>
  );

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`min-h-screen ${theme.colors.bg} ${theme.colors.text} overflow-x-hidden`}
    >
      {/* Lightbox Overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                onClick={() => setIsLightboxOpen(false)}
            >
                <button className="absolute top-6 right-6 text-white text-3xl hover:text-steam-accent transition-colors">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <motion.img 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    src={selectedImage || game.imageUrl} 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                    alt="Lightbox"
                    onClick={(e) => e.stopPropagation()}
                />
            </motion.div>
        )}
      </AnimatePresence>

      <MobileView />

      <div className="hidden md:block pt-10 pb-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 ${theme.colors.bg} opacity-90`}></div>
        <img 
            src={game.imageUrl || 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image'} 
            className="w-full h-full object-cover blur-xl opacity-20" 
            alt="bg"
            onError={handleImageError} 
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Breadcrumb / Title */}
        <div className="mb-6 flex flex-wrap items-center gap-2 opacity-60 text-sm">
           <button onClick={() => navigate('/')} className="hover:opacity-100">Store</button>
           <span>&gt;</span>
           <span className="opacity-100 truncate max-w-[200px] sm:max-w-none">{game.title}</span>
        </div>

        <div className={`${theme.colors.card} backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border ${theme.colors.border} flex flex-col lg:grid lg:grid-cols-3`}>
          {/* Left Column: Media */}
          <div className="lg:col-span-2 bg-black flex flex-col min-h-[450px] lg:min-h-[600px] relative">
             <div className="flex-1 flex items-center justify-center overflow-hidden relative group cursor-pointer" onClick={() => !showTrailer && setIsLightboxOpen(true)}>
                {showTrailer && game.trailerUrl ? (
                    <iframe 
                        className="w-full h-full absolute inset-0"
                        src={`${game.trailerUrl.replace('watch?v=', 'embed/')}?autoplay=1`}
                        title="Trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <>
                        <img 
                          src={selectedImage || game.imageUrl || PLACEHOLDER_IMG} 
                          alt={game.title} 
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                          onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-0 group-hover:opacity-40 transition-opacity duration-300 flex items-center justify-center">
                            <FontAwesomeIcon icon={faExpand} className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110" />
                        </div>
                    </>
                )}
             </div>
             
             {/* Screenshots Gallery & Trailer Toggle */}
             <div className="p-4 bg-black/60 backdrop-blur-md flex gap-3 overflow-x-auto scrollbar-hide items-center">
                {game.trailerUrl && (
                    <div 
                        onClick={() => setShowTrailer(!showTrailer)}
                        className={`w-24 h-16 shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-red-600 to-red-900 ${showTrailer ? 'border-red-500 scale-105 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                        <FontAwesomeIcon icon={faPlayCircle} className="text-white text-xl" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Trailer</span>
                    </div>
                )}
                <div 
                    onClick={() => { setSelectedImage(game.imageUrl); setShowTrailer(false); }}
                    className={`w-24 h-16 shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${(!selectedImage || selectedImage === game.imageUrl) && !showTrailer ? 'border-steam-accent scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                    <img src={game.imageUrl} className="w-full h-full object-cover" alt="Cover" />
                </div>
                {game.screenshots && game.screenshots.map((ss, idx) => (
                    <div 
                        key={ss.id}
                        onClick={() => { setSelectedImage(ss.url); setShowTrailer(false); }}
                        className={`w-24 h-16 shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === ss.url && !showTrailer ? 'border-steam-accent scale-105 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                        <img src={ss.url} className="w-full h-full object-cover" alt={`Screenshot ${idx + 1}`} />
                    </div>
                ))}
             </div>
          </div>

          {/* Right Column: Info */}
          <div className={`p-6 md:p-8 flex flex-col justify-between bg-gradient-to-b from-${cardColorBase}-light to-${cardColorBase}-dark h-full border-t lg:border-t-0 lg:border-l ${theme.colors.border}`}>
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <h1 className={`text-3xl md:text-4xl font-bold ${theme.colors.text} tracking-tight`}>{game.title}</h1>
                    {game.avgRating > 0 && (
                        <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/30 shrink-0">
                            <FontAwesomeIcon icon={faStar} />
                            <span className="font-bold">{game.avgRating.toFixed(1)}</span>
                            <span className="text-[10px] opacity-60">({game.reviewCount})</span>
                        </div>
                    )}
                </div>
                <p className={`opacity-80 mb-6 leading-relaxed text-base md:text-lg line-clamp-6 hover:line-clamp-none transition-all`}>{game.description}</p>
                
                <div className="space-y-3 mb-8 text-sm">
                  <div className={`flex justify-between border-b ${theme.colors.border} pb-2`}>
                    <span className="opacity-60">Release Date</span>
                    <span className="opacity-90">{new Date(game.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className={`flex justify-between border-b ${theme.colors.border} pb-2`}>
                    <span className="opacity-60">Publisher</span>
                    <span className={`${theme.colors.accent} hover:underline cursor-pointer`}>{game.publisher?.name || 'Unknown'}</span>
                  </div>
                  <div className={`flex justify-between border-b ${theme.colors.border} pb-2`}>
                    <span className="opacity-60">Categories</span>
                    <div className="flex gap-2">
                      {game.categories?.map(c => (
                        <span key={c.id} className="bg-gray-700/50 px-2 py-0.5 rounded text-xs opacity-90">{c.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Action */}
              <div className="bg-black/20 p-6 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="opacity-60">Price</span>
                  <div className="flex flex-col items-end">
                    {game.discountTotal > 0 && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">-{game.discountTotal}%</span>
                            <span className="opacity-50 line-through text-sm">${Number(game.originalPrice).toFixed(2)}</span>
                        </div>
                    )}
                    <div className={`text-3xl font-bold ${theme.colors.text}`}>
                        {game.finalPrice === 0 ? <span className="text-green-500">Free</span> : `$${Number(game.finalPrice).toFixed(2)}`}
                    </div>
                    {game.activeSaleName && <span className={`text-[10px] ${theme.colors.accent} uppercase font-bold mt-1`}>{game.activeSaleName}</span>}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  {library && library.includes(game.id) ? (
                    <button 
                        onClick={handlePlayGame}
                        className={`w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-3 active:scale-95`}
                    >
                        <FontAwesomeIcon icon={faPlayCircle} className="text-xl" /> PLAY NOW
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={async () => {
                            setIsAddingToCart(true);
                            await addToCart(game);
                            setTimeout(() => setIsAddingToCart(false), 500);
                        }}
                        disabled={isAddingToCart}
                        className={`flex-1 bg-gradient-to-r from-blue-600 to-${accentColorBase}-500 hover:from-blue-500 hover:to-${accentColorBase}-400 text-white font-bold py-3 px-4 rounded shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base`}
                      >
                        {isAddingToCart ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <><FontAwesomeIcon icon={faCartPlus} /> Add to Cart</>
                        )}
                      </button>
                      <button 
                        onClick={async () => {
                            setIsBuyingNow(true);
                            await directPurchase(game);
                            setTimeout(() => setIsBuyingNow(false), 500);
                        }}
                        disabled={isBuyingNow}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                      >
                        {isBuyingNow ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <><FontAwesomeIcon icon={faBolt} /> Buy Now</>
                        )}
                      </button>
                      <button 
                        onClick={() => setIsGiftModalOpen(true)}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <FontAwesomeIcon icon={faGift} /> Buy as Gift
                      </button>
                    </>
                  )}
                </div>
                <button 
                    disabled={isAddingWishlist}
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      if (!token) {
                          toast.error('Please login to add to wishlist');
                          return;
                      }
                      setIsAddingWishlist(true);
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
                      } finally {
                          setIsAddingWishlist(false);
                      }
                    }}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/50 font-bold py-2 rounded text-sm transition disabled:opacity-50 flex items-center justify-center relative overflow-hidden group"
                >
                  {isAddingWishlist ? (
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                      <>
                        <motion.span 
                            initial={{ scale: 1 }}
                            whileTap={{ scale: 1.5, color: '#f87171' }} // Red color on tap
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="mr-2"
                        >
                            <FontAwesomeIcon icon={faHeart} />
                        </motion.span>
                        Add to Wishlist
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            whileTap={{ scale: 20, opacity: 0.1 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-red-500 rounded-full pointer-events-none"
                            style={{ originX: 0.5, originY: 0.5 }}
                        />
                      </>
                  )}
                </button>
              </div>
            </div>
        </div>

        {/* Related Games */}
        {relatedGames.length > 0 && (
            <div className="mt-16">
                <h2 className={`text-2xl font-bold mb-6 border-b ${theme.colors.border} pb-2`}>You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedGames.map(related => (
                        <div key={related.id} className={`${theme.colors.card} rounded-lg overflow-hidden shadow-lg border ${theme.colors.border} hover:border-blue-500 transition group cursor-pointer`} onClick={() => navigate(`/games/${related.id}`)}>
                            <div className="h-32 overflow-hidden relative">
                                <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" onError={handleImageError} />
                            </div>
                            <div className="p-3">
                                <h4 className={`font-bold ${theme.colors.text} truncate text-sm mb-1`}>{related.title}</h4>
                                <div className="text-xs opacity-70">${Number(related.price).toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Tabs Selection */}
        <div className={`mt-12 flex flex-wrap gap-8 border-b ${theme.colors.border}`}>
            <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 text-lg font-bold transition relative ${activeTab === 'reviews' ? theme.colors.text : 'opacity-50 hover:opacity-100'}`}
            >
                User Reviews ({reviews.length})
                {activeTab === 'reviews' && <div className={`absolute bottom-0 left-0 w-full h-1 ${accentBg} rounded-t-full`}></div>}
            </button>
            <button 
                onClick={() => setActiveTab('updates')}
                className={`pb-4 text-lg font-bold transition relative ${activeTab === 'updates' ? theme.colors.text : 'opacity-50 hover:opacity-100'}`}
            >
                Patch Notes ({updates.length})
                {activeTab === 'updates' && <div className={`absolute bottom-0 left-0 w-full h-1 ${accentBg} rounded-t-full`}></div>}
            </button>
            <button 
                onClick={() => setActiveTab('specs')}
                className={`pb-4 text-lg font-bold transition relative ${activeTab === 'specs' ? theme.colors.text : 'opacity-50 hover:opacity-100'}`}
            >
                Specifications
                {activeTab === 'specs' && <div className={`absolute bottom-0 left-0 w-full h-1 ${accentBg} rounded-t-full`}></div>}
            </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'reviews' ? (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            {library && library.includes(game.id) ? (
                                <div className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} shadow-lg sticky top-24`}>
                                    <h3 className={`text-xl font-bold mb-4 ${theme.colors.text} border-b ${theme.colors.border} pb-2`}>Write a Review</h3>
                                    <form onSubmit={handleSubmitReview}>
                                        <div className="mb-4">
                                            <label className="block opacity-70 text-sm mb-1">Rating</label>
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
                                            <label className="block opacity-70 text-sm mb-1">Comment</label>
                                            <textarea 
                                                value={userComment}
                                                onChange={(e) => setUserComment(e.target.value)}
                                                className={`w-full ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-black/20'} border ${theme.colors.border} rounded p-3 ${theme.colors.text} outline-none focus:border-blue-500 min-h-[100px]`}
                                                placeholder="Share your thoughts..."
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className={`w-full ${accentBg} hover:bg-blue-500 text-white font-bold py-2 rounded transition`}
                                        >
                                            Post Review
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} shadow-lg sticky top-24 text-center`}>
                                    <h3 className={`text-lg font-bold mb-2 ${theme.colors.text}`}>Want to review?</h3>
                                    <p className="text-sm opacity-60 mb-4">You must own this game to leave a review.</p>
                                    {!library?.includes(game.id) && (
                                        <button 
                                            onClick={async () => {
                                                setIsBuyingNow(true);
                                                await directPurchase(game);
                                                setTimeout(() => setIsBuyingNow(false), 500);
                                            }}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-sm transition"
                                        >
                                            Buy Now to Review
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            {reviews.length === 0 ? (
                                <div className={`${theme.colors.card} p-8 rounded-lg text-center opacity-60 italic border ${theme.colors.border}`}>
                                    No reviews yet. Be the first to review this game!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className={`${theme.colors.card} p-6 rounded-lg border ${theme.colors.border} hover:border-blue-500/30 transition group`}>
                                            {editingReviewId === review.id ? (
                                                <form onSubmit={handleUpdateReview} className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className={`font-bold ${theme.colors.accent}`}>Editing Your Review</h4>
                                                        <button type="button" onClick={() => setEditingReviewId(null)} className="opacity-50 hover:opacity-100">
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
                                                        className={`w-full ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-black/20'} border ${theme.colors.border} rounded p-3 ${theme.colors.text} outline-none focus:border-blue-500 min-h-[80px] text-sm`}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button type="submit" className={`${accentBg} text-white px-4 py-1.5 rounded text-sm font-bold`}>Save Changes</button>
                                                        <button type="button" onClick={() => setEditingReviewId(null)} className="bg-gray-700 text-white px-4 py-1.5 rounded text-sm">Cancel</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${accentBg} text-white`}>
                                                                {review.user?.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-bold ${theme.colors.accent}`}>{review.user?.name || 'Unknown User'}</span>
                                                                    <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1 font-black uppercase tracking-tighter">
                                                                        <FontAwesomeIcon icon={faCertificate} className="text-[8px]" /> Verified Owner
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs opacity-50">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                            {currentUser && (currentUser.id === review.userId || currentUser.role === 'ADMIN') && (
                                                                <div className="flex gap-2">
                                                                    {currentUser.id === review.userId && (
                                                                        <button onClick={() => handleEditReview(review)} className="opacity-50 hover:text-blue-400 transition" title="Edit">
                                                                            <FontAwesomeIcon icon={faEdit} size="sm" />
                                                                        </button>
                                                                    )}
                                                                    <button onClick={() => handleDeleteReview(review.id)} className="opacity-50 hover:text-red-400 transition" title="Delete">
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
                                                    <p className="opacity-80 leading-relaxed text-sm mb-4">
                                                        {review.comment || <span className="italic opacity-50">No comment provided.</span>}
                                                    </p>

                                                    {/* Voting UI */}
                                                    <div className={`flex items-center gap-4 border-t ${theme.colors.border} pt-3`}>
                                                        <span className="text-[10px] opacity-50 uppercase font-bold">Was this review helpful?</span>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => handleVoteReview(review.id, 'up')}
                                                                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition ${
                                                                    review.userVote === 'up' 
                                                                    ? 'bg-blue-600 text-white' 
                                                                    : 'bg-black/20 opacity-70 hover:opacity-100'
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
                                                                    : 'bg-black/20 opacity-70 hover:opacity-100'
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
                ) : activeTab === 'updates' ? (
                    <div className="mt-8 space-y-6 max-w-4xl mx-auto">
                        {updates.length === 0 ? (
                            <div className={`${theme.colors.card} p-12 rounded-lg text-center opacity-60 italic border ${theme.colors.border}`}>
                                No updates posted yet for this game.
                            </div>
                        ) : (
                            updates.map(update => (
                                <div key={update.id} className={`${theme.colors.card} p-8 rounded-xl border ${theme.colors.border} shadow-lg hover:border-blue-500/30 transition`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border mr-3 ${
                                                update.type === 'HOTFIX' ? 'bg-red-900/20 text-red-400 border-red-500/30' :
                                                update.type === 'DLC' ? 'bg-purple-900/20 text-purple-400 border-purple-500/30' :
                                                'bg-blue-900/20 text-blue-400 border-blue-500/30'
                                            }`}>
                                                {update.type}
                                            </span>
                                            <h3 className={`text-2xl font-bold ${theme.colors.text} mt-2`}>{update.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className={`${theme.colors.accent} font-mono text-sm font-bold`}>{update.version || 'v1.0'}</div>
                                            <div className="opacity-50 text-xs mt-1">{new Date(update.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className={`prose ${theme.name === 'Clean Light' ? '' : 'prose-invert'} max-w-none ${theme.colors.text} leading-relaxed`}>
                                        {update.content.split('\n').map((para, i) => <p key={i} className="mb-4">{para}</p>)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto animate-fadeIn">
                        <div className={`${theme.colors.card} p-8 rounded-3xl border ${theme.colors.border} shadow-xl`}>
                            <h3 className="text-xl font-black uppercase tracking-widest text-blue-500 mb-6">Minimum Requirements</h3>
                            <div className="opacity-70 text-sm leading-relaxed whitespace-pre-wrap">
                                {game.minRequirements || 'No minimum requirements specified.'}
                            </div>
                        </div>
                        <div className={`${theme.colors.card} p-8 rounded-3xl border ${theme.colors.border} shadow-xl`}>
                            <h3 className="text-xl font-black uppercase tracking-widest text-purple-500 mb-6">Recommended Requirements</h3>
                            <div className="opacity-70 text-sm leading-relaxed whitespace-pre-wrap">
                                {game.recRequirements || 'No recommended requirements specified.'}
                            </div>
                        </div>
                        {game.socialLinks && (
                            <div className={`col-span-full ${theme.colors.card} p-8 rounded-3xl border ${theme.colors.border} shadow-xl`}>
                                <h3 className="text-xl font-black uppercase tracking-widest text-green-500 mb-6">Official Links & Social</h3>
                                <div className="opacity-70 text-sm leading-relaxed whitespace-pre-wrap">
                                    {game.socialLinks}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>

        {/* Gift Modal */}
         <FriendSelectionModal 
             isOpen={isGiftModalOpen} 
             onClose={() => setIsGiftModalOpen(false)} 
             gameTitle={game.title}
             onSelect={(friend) => {
                 setIsGiftModalOpen(false);
                 directPurchase(game, friend.id, friend.name);
             }}
         />
      </div>
      </div>
    </motion.div>
  );
};

export default GameDetails;
