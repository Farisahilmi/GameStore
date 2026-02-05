import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSearch, faBell, faHeart, faExchangeAlt, faWallet, faGamepad, faCog, faRocket, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ user, logout, cartCount, notifications = [], setNotifications, socket, friends, setFriends }) => {
  const navigate = useNavigate();
  const { theme, currentTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameSearchResults, setGameSearchResults] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false); // Removed duplicate friend state logic

  // ... (inside Navbar return) ...

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
      const searchGames = async () => {
          if (!searchTerm || searchTerm.length < 2) {
              setGameSearchResults([]);
              return;
          }
          try {
              const res = await axios.get(`/api/games?search=${searchTerm}&limit=5`);
              setGameSearchResults(res.data.data.games);
          } catch (err) {
              console.error(err);
          }
      };
      const delayDebounceFn = setTimeout(() => {
          searchGames();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
      const searchUsers = async () => {
          if (!userSearchTerm || userSearchTerm.length < 2) {
              setUserSearchResults([]);
              return;
          }
          try {
              const token = localStorage.getItem('token');
              const res = await axios.get(`/api/friends/search?q=${userSearchTerm}`, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setUserSearchResults(res.data.data);
          } catch (err) {
              console.error(err);
          }
      };
      const delayDebounceFn = setTimeout(() => {
          searchUsers();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [userSearchTerm]);

  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [cartPreviewItems, setCartPreviewItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  useEffect(() => {
    if (user && cartPreviewOpen) {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/transactions/cart', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCartPreviewItems(res.data.data.games || []);
                setCartTotal(res.data.data.total || 0);
            } catch (err) {
                console.error('Failed to fetch cart preview');
            }
        };
        fetchCart();
    }
  }, [user, cartPreviewOpen, cartCount]);

  useEffect(() => {
    if (user) {
        const fetchWishlist = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/wishlist', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWishlistCount(res.data.data.length);
            } catch (err) {
                console.error('Failed to fetch wishlist count');
            }
        };

        // fetchFriends moved to App.jsx to share state with ChatSystem

        const fetchPendingFriends = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/friends/pending', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPendingRequests(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchWishlist();
        fetchPendingFriends();
        // fetchFriends(); // Called in App.jsx

        // Listen for updates
        const handleWishlistUpdate = () => {
            fetchWishlist();
        };

        window.addEventListener('wishlistUpdated', handleWishlistUpdate);

        return () => {
            window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
        };
    }
  }, [user]);

  // Listen for friend status updates
  useEffect(() => {
    if (socket) {
      const handleFriendStatus = ({ userId, status }) => {
        setFriends(prev => prev.map(f => 
          f.id === userId ? { ...f, status } : f
        ));
      };

      socket.on('friend_status', handleFriendStatus);

      return () => {
        socket.off('friend_status', handleFriendStatus);
      };
    }
  }, [socket]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`/api/notifications/${id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(safeNotifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
        console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        navigate(`/browse?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem('savedAccounts') || '[]');
    setSavedAccounts(accounts);
  }, [isSwitchModalOpen]);

  const handleSwitchAccount = () => {
      setIsSwitchModalOpen(true);
      setIsDropdownOpen(false);
  };

  const performSwitch = (account) => {
      localStorage.setItem('token', account.token);
      localStorage.setItem('user', JSON.stringify(account.user));
      window.location.reload(); // Reload to refresh all contexts
  };

  const removeSavedAccount = (userId) => {
      const filtered = savedAccounts.filter(acc => acc.user.id !== userId);
      localStorage.setItem('savedAccounts', JSON.stringify(filtered));
      setSavedAccounts(filtered);
  };

  const handleDeleteAccount = async () => {
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          try {
              const token = localStorage.getItem('token');
              await axios.delete('/api/users/me', {
                  headers: { Authorization: `Bearer ${token}` }
              });
              logout();
              navigate('/');
              toast.success('Account deleted successfully');
          } catch (err) {
              console.error(err);
              toast.error('Failed to delete account');
          }
      }
  };

  const handleAcceptFriend = async (requestId) => {
      try {
          const token = localStorage.getItem('token');
          await axios.put(`/api/friends/request/${requestId}/accept`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
          toast.success('Friend request accepted!');
      } catch (err) {
          toast.error('Failed to accept request');
      }
  };

  const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
  };

  const getProfileGradient = (role) => {
    switch (role) {
      case 'ADMIN': return 'from-red-600 to-red-800';
      case 'PUBLISHER': return 'from-blue-600 to-blue-800';
      default: return 'from-green-600 to-green-800'; // User default
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 py-3 block ${
        scrolled 
        ? `${theme.colors.glass} ${theme.colors.shadow} py-2` 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-12">
            <Link to="/" className={`text-2xl font-bold tracking-tighter ${theme.colors.text} flex items-center gap-3 group`}>
                <motion.div 
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20`}
                >
                    <span className="text-xl font-black">G</span>
                </motion.div>
                <span className={`hidden sm:block bg-gradient-to-r ${currentTheme === 'light' ? 'from-blue-700 to-indigo-600' : 'from-blue-400 to-indigo-300'} text-transparent bg-clip-text font-black tracking-tight`}>GAMESTORE</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
                <div 
                    className="relative group"
                    onMouseEnter={() => setIsMegaMenuOpen(true)}
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                    <Link to="/" onClick={() => setIsMegaMenuOpen(false)} className={`text-[10px] font-black opacity-60 hover:opacity-100 ${theme.colors.text} transition-all uppercase tracking-[0.25em] relative py-4 block`}>
                        Store
                        <span className="absolute bottom-2 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-50"></span>
                    </Link>

                    {/* Mega Menu */}
                    <AnimatePresence>
                    {isMegaMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={`absolute top-full left-0 w-[600px] ${theme.colors.card} border ${theme.colors.border} rounded-2xl ${theme.colors.shadow} z-50 overflow-hidden flex`}
                        >
                            {/* Categories Column */}
                            <div className="w-1/3 border-r border-white/5 bg-black/10 p-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Categories</h4>
                                <div className="space-y-1">
                                    {['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Simulation'].map(cat => (
                                        <Link key={cat} to={`/browse?category=${cat}`} className={`block px-3 py-2 text-xs font-bold rounded-lg hover:bg-white/5 ${theme.colors.text} transition`}>
                                            {cat}
                                        </Link>
                                    ))}
                                    <Link to="/browse" className="block px-3 py-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/10 rounded-lg transition mt-2">
                                        View All
                                    </Link>
                                </div>
                            </div>

                            {/* Featured & New Column */}
                            <div className="flex-1 p-5">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Discover</h4>
                                        <div className="space-y-2">
                                            <Link to="/browse?sort=newest" className="block text-xs font-bold hover:text-blue-400 transition">New Releases</Link>
                                            <Link to="/browse?sort=popular" className="block text-xs font-bold hover:text-blue-400 transition">Top Sellers</Link>
                                            <Link to="/sales" className="block text-xs font-bold hover:text-blue-400 transition">On Sale</Link>
                                            <Link to="/discovery" className="block text-xs font-bold hover:text-blue-400 transition">Discovery Queue</Link>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Featured</h4>
                                        <Link to="/sales" className="block relative aspect-video rounded-lg overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                            <div className="absolute bottom-2 left-2 z-20">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Summer Sale</span>
                                                <p className="text-xs text-white/80">Up to 80% off</p>
                                            </div>
                                            <div className="w-full h-full bg-blue-600 group-hover:scale-110 transition duration-700"></div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                <Link to="/news" className={`text-[10px] font-black opacity-60 hover:opacity-100 ${theme.colors.text} transition-all uppercase tracking-[0.25em] relative group py-4 block`}>
                    News
                    <span className="absolute bottom-2 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
                <Link to="/community" className={`text-[10px] font-black opacity-60 hover:opacity-100 ${theme.colors.text} transition-all uppercase tracking-[0.25em] relative group py-4 block`}>
                    Community
                    <span className="absolute bottom-2 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
            </div>
        </div>

        {/* Main Search */}
        <div className="flex-1 mx-8 max-w-lg hidden lg:flex items-center gap-4">
            <div className="relative flex-1 group">
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="text" 
                        placeholder="Search titles..." 
                        className={`w-full ${theme.colors.input} ${theme.colors.text} pl-11 pr-4 py-2.5 rounded-2xl border ${theme.colors.border} focus:ring-4 ${theme.colors.ring} outline-none transition-all text-xs font-medium group-hover:border-blue-500/50`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs group-hover:text-blue-500 transition-colors" />
                </form>
                {gameSearchResults.length > 0 && (
                    <div className={`absolute top-full left-0 w-full ${theme.colors.card} border ${theme.colors.border} rounded-2xl ${theme.colors.shadow} mt-2 z-50 overflow-hidden animate-slideUp`}>
                        <div className="p-3 border-b border-white/5 bg-blue-500/5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Game Matches</span>
                        </div>
                        {gameSearchResults.map(game => (
                            <Link 
                                key={game.id} 
                                to={`/games/${game.id}`}
                                onClick={() => { setSearchTerm(''); setGameSearchResults([]); }}
                                className={`flex items-center gap-4 p-3 hover:bg-white/5 transition border-b ${theme.colors.border} last:border-0`}
                            >
                                <img src={game.imageUrl} alt={game.title} className="w-10 h-14 object-cover rounded-lg shadow-md" />
                                <div className="flex flex-col min-w-0">
                                    <span className={`text-xs font-bold ${theme.colors.text} truncate`}>{game.title}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-green-400 font-black">${Number(game.price).toFixed(2)}</span>
                                        {game.discount > 0 && (
                                            <span className="text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-lg font-black">-{game.discount}%</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        <Link 
                            to={`/browse?search=${searchTerm}`}
                            onClick={() => { setGameSearchResults([]); }}
                            className="block p-3 text-center text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/5 transition"
                        >
                            View All Results
                        </Link>
                    </div>
                )}
            </div>
            
            {user && (
                <div className="relative flex-1 max-w-[200px]">
                    <input 
                        type="text" 
                        placeholder="Find friends..." 
                        className={`w-full ${theme.colors.input} ${theme.colors.text} pl-4 pr-4 py-2.5 rounded-2xl border ${theme.colors.border} focus:ring-4 ${theme.colors.ring} outline-none transition-all text-xs font-medium`}
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                    {userSearchResults.length > 0 && (
                        <div className={`absolute top-full left-0 w-full ${theme.colors.card} border ${theme.colors.border} rounded-2xl ${theme.colors.shadow} mt-2 z-50 overflow-hidden animate-slideUp`}>
                            {userSearchResults.map(u => (
                                <Link 
                                    key={u.id} 
                                    to={`/profile/${u.id}`}
                                    onClick={() => { setUserSearchTerm(''); setUserSearchResults([]); }}
                                    className={`flex items-center gap-3 p-3 hover:bg-white/5 transition border-b ${theme.colors.border} last:border-0`}
                                >
                                    <div className="relative">
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getProfileGradient(u.role)} flex items-center justify-center text-[10px] font-black text-white shadow-lg`}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${theme.colors.card.replace('bg-', 'border-')} ${
                                            u.status === 'ONLINE' ? 'bg-green-500' : 
                                            u.status === 'PLAYING' ? 'bg-blue-400' : 
                                            u.status === 'AWAY' ? 'bg-yellow-500' : 
                                            'bg-gray-500'
                                        }`}></div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-xs font-bold ${theme.colors.text} truncate`}>{u.name}</span>
                                        <span className="text-[8px] opacity-40 font-black uppercase tracking-tighter">{u.status || 'OFFLINE'}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
            
            {user ? (
                <>
                    {/* Wishlist Icon */}
                    <Link to="/wishlist" className={`relative opacity-70 hover:opacity-100 ${theme.colors.text} hover:text-pink-500 transition group flex items-center justify-center w-8 h-8`}>
                        <FontAwesomeIcon icon={faHeart} className="text-lg" />
                        {wishlistCount > 0 && (
                            <span className={`absolute top-1 right-0.5 bg-red-500 w-2 h-2 rounded-full border ${theme.colors.card} animate-pulse`}></span>
                        )}
                    </Link>

                    {/* Notification Bell */}
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <button 
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className={`opacity-70 hover:opacity-100 ${theme.colors.text} hover:text-yellow-400 transition relative flex items-center justify-center`}
                        >
                            <FontAwesomeIcon icon={faBell} className="text-lg" />
                            {unreadCount > 0 && (
                                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border ${theme.colors.card}`}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                            {isNotifOpen && (
                            <div className={`absolute top-full right-0 mt-4 w-[320px] md:w-96 ${theme.colors.card} border ${theme.colors.border} rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-slideUp`}>
                                <div className={`p-6 border-b ${theme.colors.border} flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent`}>
                                    <h3 className={`font-black text-sm uppercase tracking-[0.2em] ${theme.colors.text}`}>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                                    {safeNotifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="text-4xl mb-4 opacity-20">🔔</div>
                                            <p className="opacity-40 text-sm italic font-medium">All caught up!</p>
                                        </div>
                                    ) : (
                                        safeNotifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                onClick={() => markAsRead(n.id)}
                                                className={`p-5 border-b ${theme.colors.border} hover:bg-white/5 transition-all cursor-pointer relative group ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                                            >
                                                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-white shadow-lg ${!n.isRead ? 'bg-blue-600' : 'bg-gray-700 opacity-50'}`}>
                                                        {n.message.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-xs leading-relaxed ${!n.isRead ? 'font-bold ' + theme.colors.text : 'opacity-60'}`}>{n.message}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">
                                                                {new Date(n.createdAt).toLocaleDateString()}
                                                            </span>
                                                            {!n.isRead && <span className="text-[8px] text-blue-400 font-black uppercase tracking-tighter">Mark as read</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className={`p-4 text-center border-t ${theme.colors.border} bg-black/10`}>
                                    <button className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Clear all notifications</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div 
                        className="relative"
                        onMouseEnter={() => setCartPreviewOpen(true)}
                        onMouseLeave={() => setCartPreviewOpen(false)}
                    >
                        <Link to="/cart" className={`relative opacity-70 hover:opacity-100 ${theme.colors.text} hover:text-green-400 transition group flex items-center justify-center w-8 h-8`}>
                            <span className="text-lg"><FontAwesomeIcon icon={faShoppingCart} /></span> 
                            {cartCount > 0 && (
                                <span className={`absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border ${theme.colors.card}`}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        
                        {cartPreviewOpen && (
                            <div className={`absolute top-full right-0 mt-2 w-80 ${theme.colors.card} border ${theme.colors.border} rounded-2xl ${theme.colors.shadow} z-50 overflow-hidden animate-slideUp`}>
                                <div className="p-4 border-b border-white/5 bg-green-500/5 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Your Cart</span>
                                    <span className="text-xs font-bold">{cartCount} items</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {cartPreviewItems.length === 0 ? (
                                        <div className="p-8 text-center opacity-40">
                                            <FontAwesomeIcon icon={faShoppingCart} className="text-2xl mb-2" />
                                            <p className="text-xs font-bold">Your cart is empty</p>
                                        </div>
                                    ) : (
                                        cartPreviewItems.slice(0, 3).map(game => (
                                            <div key={game.id} className="flex gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition">
                                                <img src={game.imageUrl} alt={game.title} className="w-10 h-14 object-cover rounded" />
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <span className="text-xs font-bold truncate">{game.title}</span>
                                                    <span className="text-[10px] text-green-400 font-black">${Number(game.price).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {cartPreviewItems.length > 3 && (
                                        <div className="p-2 text-center text-[9px] opacity-40 font-black uppercase tracking-widest">
                                            And {cartPreviewItems.length - 3} more items...
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-black/20 border-t border-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs opacity-60">Total</span>
                                        <span className="text-sm font-black text-green-400">${Number(cartTotal).toFixed(2)}</span>
                                    </div>
                                    <Link 
                                        to="/cart" 
                                        onClick={() => setCartPreviewOpen(false)}
                                        className="block w-full bg-green-600 hover:bg-green-500 text-white text-center py-2 rounded-xl text-xs font-black uppercase tracking-widest transition"
                                    >
                                        Checkout
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative ml-2">
                        <button 
                            onClick={toggleDropdown}
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${getProfileGradient(user.role)} hover:opacity-90 flex items-center justify-center text-white transition focus:outline-none border border-white/20 shadow-lg`}
                        >
                            <span className="font-bold text-sm">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                    </button>

                    {isDropdownOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`absolute right-0 mt-4 w-64 ${theme.colors.card} border ${theme.colors.border} rounded-3xl ${theme.colors.shadow} py-3 z-50 overflow-hidden`}
                        >
                            <div className={`px-6 py-4 border-b ${theme.colors.border} mb-2 bg-gradient-to-br from-white/5 to-transparent`}>
                                <div className={`text-sm font-black ${theme.colors.text} truncate mb-0.5`}>{user.name || 'User'}</div>
                                    <div className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        {user.role}
                                    </div>
                                </div>

                                <div className="px-2 space-y-1">
                                    <Link to="/wallet" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 ${theme.colors.text} transition-all`}>
                                        <FontAwesomeIcon icon={faWallet} className="opacity-40 w-4" />
                                        My Wallet <span className="ml-auto opacity-40">${Number(user.walletBalance || 0).toFixed(2)}</span>
                                    </Link>

                                    <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 ${theme.colors.text} transition-all`}>
                                        <FontAwesomeIcon icon={faHeart} className="opacity-40 w-4" />
                                        Wishlist
                                    </Link>

                                    <Link to="/library" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 ${theme.colors.text} transition-all`}>
                                        <FontAwesomeIcon icon={faGamepad} className="opacity-40 w-4" />
                                        My Library
                                    </Link>
                                </div>

                                <div className={`mx-4 my-2 border-t ${theme.colors.border}`}></div>

                                <div className="px-2 space-y-1">
                                    <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 ${theme.colors.text} transition-all`}>
                                        <FontAwesomeIcon icon={faCog} className="opacity-40 w-4" />
                                        Settings & Profile
                                    </Link>

                                    {user.role === 'PUBLISHER' && (
                                        <Link to="/dev-dashboard" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 text-xs font-black rounded-xl hover:bg-blue-500/10 text-blue-400 transition-all`}>
                                            <FontAwesomeIcon icon={faRocket} className="opacity-60 w-4" />
                                            Dev Studio
                                        </Link>
                                    )}

                                    {(user.role === 'ADMIN' || user.role === 'PUBLISHER') && (
                                        <Link to="/manage-games" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 ${theme.colors.text} transition-all`}>
                                            <FontAwesomeIcon icon={faGamepad} className="opacity-40 w-4" />
                                            Manage Games
                                        </Link>
                                    )}

                                    {user.role === 'ADMIN' && (
                                        <Link to="/manage-users" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 ${theme.colors.text} transition-all`}>
                                            Manage Users
                                        </Link>
                                    )}

                                    {friends.length > 0 && (
                                        <div className="px-4 py-2 mt-2 border-t border-white/5 pt-4">
                                            <p className={`text-[9px] font-black opacity-40 uppercase tracking-widest mb-3`}>Friends Status</p>
                                            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                                                {friends.map(f => (
                                                    <Link 
                                                        key={f.id} 
                                                        to={`/profile/${f.id}`}
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center gap-3 group"
                                                    >
                                                        <div className="relative">
                                                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform`}>
                                                                {f.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${theme.colors.card.replace('bg-', 'border-')} ${
                                                                f.status === 'ONLINE' ? 'bg-green-500' : 
                                                                f.status === 'PLAYING' ? 'bg-blue-400' : 
                                                                f.status === 'AWAY' ? 'bg-yellow-500' : 
                                                                'bg-gray-500'
                                                            }`}></div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-[11px] font-bold ${theme.colors.text} truncate`}>{f.name}</div>
                                                            <div className="text-[8px] opacity-40 font-black uppercase tracking-tighter truncate">
                                                                {f.statusMessage || f.status || 'Offline'}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {pendingRequests.length > 0 && (
                                        <div className={`px-4 py-2 mt-2 bg-blue-500/5 rounded-2xl border border-blue-500/10`}>
                                            <p className={`text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2`}>Friend Requests</p>
                                            <div className="space-y-2">
                                                {pendingRequests.map(req => (
                                                    <div key={req.id} className="flex items-center justify-between gap-2">
                                                        <span className={`text-[10px] font-bold ${theme.colors.text} truncate`}>{req.user.name}</span>
                                                        <button 
                                                            onClick={() => handleAcceptFriend(req.id)}
                                                            className={`bg-blue-600 hover:bg-blue-500 text-white text-[9px] px-2 py-1 rounded-lg font-black transition-all`}
                                                        >
                                                            Accept
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`mx-4 my-2 border-t ${theme.colors.border}`}></div>

                                <div className="px-2 space-y-1">
                                    <button 
                                        onClick={handleSwitchAccount}
                                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 ${theme.colors.text} transition-all`}
                                    >
                                        <FontAwesomeIcon icon={faExchangeAlt} className="opacity-40 w-4" />
                                        Switch Account
                                    </button>

                                    <button 
                                        onClick={handleDeleteAccount}
                                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-red-500/5 text-red-500 transition-all`}
                                    >
                                        Delete Account
                                    </button>

                                    <button 
                                        onClick={() => { logout(); setIsDropdownOpen(false); }}
                                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-white/5 ${theme.colors.text} transition-all`}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                        </motion.div>
                    )}
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-4">
                    <Link to="/login" className={`opacity-80 hover:opacity-100 ${theme.colors.text} transition font-medium px-3 py-1`}>Log In</Link>
                    <Link to="/register" className={`bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded transition font-bold shadow-lg text-sm flex items-center justify-center`}>Join Free</Link>
                </div>
            )}
        </div>
      </div>
      
      {/* Switch Account Modal */}
      {isSwitchModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSwitchModalOpen(false)}></div>
              <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`${theme.colors.card} w-full max-w-md rounded-[2.5rem] border ${theme.colors.border} ${theme.colors.shadow} relative z-10 overflow-hidden backdrop-blur-2xl bg-opacity-80`}
              >
                  <div className="p-8">
                      <h3 className={`text-2xl font-black ${theme.colors.text} mb-6 tracking-tighter italic`}>Switch <span className="text-blue-500">Account</span></h3>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                          {savedAccounts.length === 0 ? (
                              <div className="text-center py-10 opacity-40">
                                  <p className="text-sm font-bold">No other saved accounts.</p>
                                  <p className="text-[10px] uppercase tracking-widest mt-2">Login to save accounts here.</p>
                              </div>
                          ) : (
                              savedAccounts.map(acc => (
                                  <div 
                                      key={acc.user.id} 
                                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                          user.id === acc.user.id 
                                          ? 'border-blue-500 bg-blue-500/5' 
                                          : `${theme.colors.border} hover:bg-white/5`
                                      }`}
                                  >
                                      <div 
                                          className="flex-1 flex items-center gap-4 cursor-pointer"
                                          onClick={() => user.id !== acc.user.id && performSwitch(acc)}
                                      >
                                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getProfileGradient(acc.user.role)} flex items-center justify-center text-white font-black`}>
                                              {acc.user.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                              <span className={`text-sm font-black ${theme.colors.text} truncate`}>{acc.user.name}</span>
                                              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{acc.user.role}</span>
                                          </div>
                                          {user.id === acc.user.id && (
                                              <span className="ml-auto text-[10px] font-black text-blue-500 uppercase tracking-widest">Active</span>
                                          )}
                                      </div>
                                      {user.id !== acc.user.id && (
                                          <button 
                                              onClick={() => removeSavedAccount(acc.user.id)}
                                              className="opacity-20 hover:opacity-100 hover:text-red-500 transition-all p-2"
                                          >
                                              <FontAwesomeIcon icon={faCog} className="text-xs" />
                                          </button>
                                      )}
                                  </div>
                              ))
                          )}
                      </div>

                      <div className="mt-8 flex gap-3">
                          <button 
                              onClick={() => { setIsSwitchModalOpen(false); navigate('/login'); }}
                              className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                          >
                              Add New Account
                          </button>
                          <button 
                              onClick={() => setIsSwitchModalOpen(false)}
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                          >
                              Close
                          </button>
                      </div>
                  </div>
              </motion.div>
          </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {(isDropdownOpen || isNotifOpen) && (
          <div className="fixed inset-0 z-40" onClick={() => { setIsDropdownOpen(false); setIsNotifOpen(false); }}></div>
      )}
    </nav>
  );
};

export default Navbar;
