import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBolt, faCheckCircle, faBook, faGamepad, faRocket, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

import ManageGames from './ManageGames.jsx';
import ManageUsers from './ManageUsers.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GameCard from './components/GameCard';
import GameDetails from './components/GameDetails';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Library from './components/Library';
import Settings from './components/Settings';
import DevDashboard from './components/DevDashboard';
import DevUpdatesFeed from './components/DevUpdatesFeed';
import PublisherProfile from './components/PublisherProfile';

// --- Page Components ---

const Home = ({ addToCart, user, directPurchase, library }) => {
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      setRecommendedGames([]);
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/games/recommendations/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendedGames(res.data.data);
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    }
  };

  useEffect(() => {
    const querySearch = searchParams.get('search') || '';
    setSearchTerm(querySearch);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchGames(currentPage, searchTerm, selectedCategory, selectedSort);
  }, [currentPage, selectedCategory, selectedSort, searchTerm]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGames = async (page = 1, search = '', category = '', sort = 'newest') => {
    setLoading(true);
    try {
      let url = `/api/games?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;
      if (category) url += `&category=${category}`;
      if (sort) url += `&sort=${sort}`;
      
      const res = await axios.get(url);
      setGames(res.data?.data?.games || []);
      setTotalPages(res.data?.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && games.length === 0) return (
    <div className="flex justify-center items-center h-screen bg-steam-dark">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-steam-accent"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-steam-dark overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#171a21] via-[#1b2838] to-[#171a21] animate-gradient-slow opacity-80"></div>
          
          {/* Ambient Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-steam-accent/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

          {/* Floating Controller Shapes (PlayStation & Xbox Vibes) - More & Random */}
          
          {/* Group 1: PlayStation Shapes */}
          <div className="absolute top-[15%] left-[10%] opacity-60 animate-float-slow filter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ animationDelay: '0s' }}>
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <path d="M12 4L21 20H3L12 4Z" />
              </svg>
          </div>
          <div className="absolute top-[70%] right-[20%] w-24 h-24 rounded-full border-[8px] border-red-500/50 animate-float-medium filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[85%] w-20 h-20 border-[8px] border-pink-500/50 animate-float-slow filter drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{ animationDelay: '5s' }}></div>
          <div className="absolute top-[60%] left-[15%] text-9xl text-blue-500/50 animate-float-fast font-bold filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ animationDelay: '1s' }}>✕</div>

          {/* Group 2: Xbox Buttons */}
          <div className="absolute top-[25%] right-[35%] w-20 h-20 rounded-full border-[6px] border-green-500/50 flex items-center justify-center text-green-500/50 font-bold text-5xl animate-float-slow filter drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" style={{ animationDelay: '7s' }}>A</div>
          <div className="absolute top-[85%] left-[5%] w-16 h-16 rounded-full border-[6px] border-red-500/50 flex items-center justify-center text-red-500/50 font-bold text-4xl animate-float-medium filter drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" style={{ animationDelay: '3s' }}>B</div>
          <div className="absolute top-[10%] right-[10%] w-24 h-24 rounded-full border-[6px] border-yellow-500/50 flex items-center justify-center text-yellow-500/50 font-bold text-6xl animate-float-fast filter drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" style={{ animationDelay: '4s' }}>Y</div>
          <div className="absolute top-[50%] left-[50%] w-20 h-20 rounded-full border-[6px] border-blue-500/50 flex items-center justify-center text-blue-500/50 font-bold text-5xl animate-float-slow filter drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" style={{ animationDelay: '6s' }}>X</div>

          {/* Group 3: Extra Random Particles (Small & Fast) */}
          <div className="absolute top-[5%] left-[40%] opacity-40 animate-float-fast filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" style={{ animationDelay: '1.5s' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" />
              </svg>
          </div>
          <div className="absolute top-[90%] right-[50%] w-12 h-12 rounded-full border-2 border-purple-500/40 animate-float-medium" style={{ animationDelay: '3.5s' }}></div>
          <div className="absolute top-[35%] left-[5%] text-4xl text-yellow-500/40 animate-float-slow" style={{ animationDelay: '0.5s' }}>▲</div>
          <div className="absolute top-[65%] right-[5%] text-5xl text-green-500/40 animate-float-fast" style={{ animationDelay: '2.5s' }}>●</div>
          <div className="absolute top-[20%] left-[60%] w-8 h-8 border-2 border-cyan-500/40 rotate-45 animate-float-medium" style={{ animationDelay: '4.5s' }}></div>
          
          {/* Group 4: Big Blur Shapes (Depth) */}
          <div className="absolute top-[45%] right-[5%] text-[150px] text-white/5 animate-float-slow rotate-12 blur-sm" style={{ animationDelay: '8s' }}>■</div>
          <div className="absolute bottom-[10%] left-[30%] text-[120px] text-white/5 animate-float-slow -rotate-12 blur-sm" style={{ animationDelay: '9s' }}>●</div>
      </div>

      <div className="relative z-10 pb-20">
        <Hero directPurchase={directPurchase} />
        <div className="container mx-auto px-4">
        {user && (user.role === 'PUBLISHER' || user.role === 'ADMIN') && <DevUpdatesFeed />}
        
        {/* Discovery Queue Banner */}
        {user && (
            <div className="mb-12 bg-gradient-to-r from-blue-600/40 via-steam-accent/40 to-purple-600/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl animate-fadeIn">
                <div className="flex items-center gap-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl shadow-inner border border-white/20">
                        <FontAwesomeIcon icon={faRocket} className="text-white animate-bounce-slow" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Your Discovery Queue</h3>
                        <p className="text-blue-100/70">Explore games we think you'll love. New games every day!</p>
                    </div>
                </div>
                <Link 
                    to="/discovery" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-3 rounded-full font-extrabold transition transform hover:scale-105 shadow-xl whitespace-nowrap"
                >
                    Start Exploring <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
            </div>
        )}

        {/* Recommended Section */}
        {user && recommendedGames.length > 0 && !searchTerm && !selectedCategory && (
            <div className="mb-12">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider border-l-4 border-blue-500 pl-3 mb-6">
                    Recommended For You
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {recommendedGames.map(game => (
                        <Link to={`/games/${game.id}`} key={game.id} className="block group">
                            <div className="bg-steam-light rounded overflow-hidden border border-gray-800 hover:border-blue-500 transition shadow-lg">
                                <div className="h-32 relative">
                                    <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                    {game.discountTotal > 0 && (
                                        <div className="absolute top-1 right-1 bg-red-600 text-[10px] px-1 rounded text-white font-bold">-{game.discountTotal}%</div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-green-400">${Number(game.finalPrice || game.price).toFixed(2)}</span>
                                        {game.avgRating > 0 && (
                                            <span className="text-[10px] text-yellow-500 flex items-center gap-0.5">
                                                ★ {game.avgRating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-l-4 border-steam-accent pl-3">
                {searchTerm ? `Results for "${searchTerm}"` : 'Trending Now'}
            </h2>
            
            <div className="flex flex-col md:flex-row w-full lg:w-auto gap-4">
                {/* Search Input */}
                <div className="relative">
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="bg-steam-light text-white px-4 py-2.5 rounded border border-gray-700 focus:border-steam-accent outline-none transition w-full md:w-64 pr-10"
                    />
                    <button 
                      onClick={() => { setCurrentPage(1); fetchGames(1, searchTerm, selectedCategory); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-steam-accent"
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>

                {/* Category Select */}
                <select 
                  className="bg-steam-light text-white px-4 py-2.5 rounded border border-gray-700 focus:border-steam-accent outline-none transition"
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>

                {/* Sort Select */}
                <select 
                  className="bg-steam-light text-white px-4 py-2.5 rounded border border-gray-700 focus:border-steam-accent outline-none transition"
                  value={selectedSort}
                  onChange={(e) => { setSelectedSort(e.target.value); setCurrentPage(1); }}
                >
                  <option value="newest">Newest Releases</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A-Z</option>
                </select>
            </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-steam-accent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Main Content: Games */}
            <div className="lg:col-span-3">
              {games.length === 0 ? (
                  <div className="text-center text-gray-400 py-20">No games found.</div>
              ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                    {games.map(game => (
                        <Link to={`/games/${game.id}`} key={game.id} className="block h-full">
                          <GameCard 
                              game={game} 
                              isOwned={library.includes(game.id)}
                              onBuy={(e) => {
                                e.preventDefault();
                                addToCart(game);
                              }} 
                              onBuyNow={(e) => {
                                e.preventDefault();
                                directPurchase(game);
                              }}
                          />
                        </Link>
                    ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-12">
                        <button 
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-steam-light text-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-steam-hover transition"
                        >
                          Previous
                        </button>
                        
                        <div className="flex gap-2">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => goToPage(i + 1)}
                              className={`w-10 h-10 rounded font-bold transition ${currentPage === i + 1 ? 'bg-steam-accent text-white shadow-lg shadow-blue-500/50' : 'bg-steam-light text-gray-400 hover:text-white'}`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-steam-light text-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-steam-hover transition"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
              )}
            </div>

            {/* Sidebar: Activity Feed */}
            <div className="lg:col-span-1">
                <ActivityFeed user={user} />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-steam-dark">
        <div className="bg-steam-light p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-800">
            <h2 className="text-3xl font-bold text-steam-accent mb-6 text-center">Sign In</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-steam-text mb-2 text-sm font-medium">Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="w-full bg-steam-dark text-white border border-gray-700 rounded p-3 focus:border-steam-accent outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-steam-text mb-2 text-sm font-medium">Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        className="w-full bg-steam-dark text-white border border-gray-700 rounded p-3 focus:border-steam-accent outline-none transition"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-steam-accent hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded shadow-lg transform active:scale-95 transition"
                >
                    Sign In
                </button>
            </form>
        </div>
    </div>
  );
};

const Register = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // const [role, setRole] = useState('USER'); // Default is USER now
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', { email, password, name }); // removed role
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Register failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-steam-dark">
        <div className="bg-steam-light p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-800">
            <h2 className="text-3xl font-bold text-steam-accent mb-6 text-center">Create Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-steam-text mb-1 text-sm font-medium">Display Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-steam-dark text-white border border-gray-700 rounded p-3 focus:border-steam-accent outline-none transition"/>
                </div>
                <div>
                    <label className="block text-steam-text mb-1 text-sm font-medium">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-steam-dark text-white border border-gray-700 rounded p-3 focus:border-steam-accent outline-none transition"/>
                </div>
                <div>
                    <label className="block text-steam-text mb-1 text-sm font-medium">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-steam-dark text-white border border-gray-700 rounded p-3 focus:border-steam-accent outline-none transition"/>
                </div>
                {/* Role selection removed. All users start as standard Gamers. */}
                <button type="submit" className="w-full bg-steam-accent hover:bg-blue-400 text-white font-bold py-3 rounded shadow-lg mt-4 transition">
                    Register
                </button>
            </form>
        </div>
    </div>
  );
};

// Removed Library component from App.jsx as it is now imported from components/Library.jsx

// --- Main App Component ---

import News from './components/News';
import NewsDetails from './components/NewsDetails';
import Footer from './components/Footer';
import BrowseGames from './components/BrowseGames';
import Sales from './components/Sales';
import DiscoveryQueue from './components/DiscoveryQueue';
import ActivityFeed from './components/ActivityFeed';
import UserProfile from './components/UserProfile';
import { Support, FAQ, SystemStatus, Contact, Privacy, Terms, Cookies, Refunds } from './components/StaticPages';

const App = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [library, setLibrary] = useState([]); // Array of owned game IDs
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchLibrary = async () => {
          try {
              const token = localStorage.getItem('token');
              const res = await axios.get('/api/library/my', {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setLibrary(res.data.data.map(g => g.id));
          } catch (err) {
              console.error('Failed to fetch library for ownership check');
          }
      };
      fetchLibrary();

      const newSocket = io(import.meta.env.VITE_API_URL || 'https://gamestore-production.up.railway.app');
      setSocket(newSocket);

      newSocket.emit('join', user.id);

      newSocket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        toast(notif.message, { icon: '🔔', duration: 5000 });
      });

      const fetchNotifications = async () => {
          try {
              const token = localStorage.getItem('token');
              const res = await axios.get('/api/notifications/my', {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setNotifications(res.data.data);
          } catch (err) {
              console.error('Failed to fetch notifications', err);
          }
      };
      fetchNotifications();

      return () => newSocket.close();
    } else {
        setNotifications([]);
        setLibrary([]);
        if (socket) socket.close();
        setSocket(null);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (game) => {
    if (cart.find(g => g.id === game.id)) {
      toast.error('Game is already in cart');
      return;
    }
    setCart([...cart, game]);
    toast.success('Added to cart!');
  };

  const removeFromCart = (gameId) => {
    setCart(cart.filter(g => g.id !== gameId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const [buyNowGame, setBuyNowGame] = useState(null);
  const [purchaseSuccessGame, setPurchaseSuccessGame] = useState(null);

  const directPurchase = async (game) => {
      const token = localStorage.getItem('token');
      if (!token) {
          toast.error('Please login to buy games');
          return;
      }

      if (user.role === 'ADMIN' || user.role === 'PUBLISHER') {
          toast.error('Admins and Publishers cannot buy games');
          return;
      }

      setBuyNowGame(game);
  };

  const confirmDirectPurchase = async () => {
      if (!buyNowGame) return;

      const token = localStorage.getItem('token');
      try {
          const res = await axios.post('/api/transactions', { 
              gameIds: [buyNowGame.id] 
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Purchase successful!');
          setPurchaseSuccessGame(buyNowGame);
          setBuyNowGame(null);
      } catch (err) {
          toast.error(err.response?.data?.error || 'Purchase failed');
      }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart([]); // Clear cart on logout
    window.location.href = '/';
  };

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
      }} />
      <div className="bg-steam-dark min-h-screen text-steam-text font-sans flex flex-col relative">
        {buyNowGame && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-steam-light border border-gray-700 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                    <h3 className="text-2xl font-bold text-white mb-4">Confirm Purchase</h3>
                    <div className="flex gap-4 mb-6">
                        <img src={buyNowGame.imageUrl} alt={buyNowGame.title} className="w-24 h-32 object-cover rounded shadow-md" />
                        <div>
                            <h4 className="text-lg font-bold text-steam-accent mb-1">{buyNowGame.title}</h4>
                            <div className="text-sm text-gray-400 mb-2">Standard Edition</div>
                            <div className="text-2xl font-bold text-white">
                                ${Number(buyNowGame.finalPrice !== undefined ? buyNowGame.finalPrice : buyNowGame.price).toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={confirmDirectPurchase}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faBolt} /> Buy Now
                        </button>
                        <button 
                            onClick={() => setBuyNowGame(null)}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-bold py-3 rounded transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
        {purchaseSuccessGame && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
                <div className="bg-steam-light border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full p-8 text-center">
                    <div className="text-green-500 text-6xl mb-6 scale-110">
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Purchase Successful!</h3>
                    <p className="text-gray-400 mb-8">
                        <span className="text-steam-accent font-bold">{purchaseSuccessGame.title}</span> has been added to your library.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                            onClick={() => {
                                setPurchaseSuccessGame(null);
                                window.location.href = '/library';
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faBook} /> Go to Library
                        </button>
                        <button 
                            onClick={() => setPurchaseSuccessGame(null)}
                            className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faGamepad} /> Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        )}
        <Navbar 
            user={user} 
            logout={logout} 
            cartCount={cart.length} 
            notifications={notifications}
            setNotifications={setNotifications}
          />
          <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} user={user} directPurchase={directPurchase} library={library} />} />
            <Route path="/publisher/:id" element={<PublisherProfile />} />
            <Route path="/games/:id" element={<GameDetails addToCart={addToCart} directPurchase={directPurchase} library={library} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} library={library} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/library" element={user ? <Library /> : <Login setUser={setUser} />} />
          <Route path="/wishlist" element={user ? <Wishlist addToCart={addToCart} /> : <Login setUser={setUser} />} />
          <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Login setUser={setUser} />} />
          <Route path="/manage-games" element={
            user && (user.role === 'ADMIN' || user.role === 'PUBLISHER') ? 
            <ManageGames user={user} /> : 
            <div className="text-center text-white mt-10">Access Denied</div>
          } />
          <Route path="/admin-dashboard" element={
            user && (user.role === 'ADMIN' || user.role === 'PUBLISHER') ? 
            <AdminDashboard user={user} /> : 
            <div className="text-center text-white mt-10">Access Denied</div>
          } />
          <Route path="/dev-dashboard" element={
            user && (user.role === 'ADMIN' || user.role === 'PUBLISHER') ? 
            <DevDashboard /> : 
            <div className="text-center text-white mt-10">Access Denied</div>
          } />
          <Route path="/manage-users" element={
            user && user.role === 'ADMIN' ? 
            <ManageUsers /> : 
            <div className="text-center text-white mt-10">Access Denied</div>
          } />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetails />} />
          <Route path="/profile/:id" element={<UserProfile currentUser={user} addToCart={addToCart} />} />
          <Route path="/browse" element={<BrowseGames addToCart={addToCart} library={library} />} />
          <Route path="/sales" element={<Sales addToCart={addToCart} library={library} />} />
          <Route path="/discovery" element={user ? <DiscoveryQueue addToCart={addToCart} directPurchase={directPurchase} library={library} /> : <Login setUser={setUser} />} />
          <Route path="/support" element={<Support />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/status" element={<SystemStatus />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/refunds" element={<Refunds />} />
        </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
