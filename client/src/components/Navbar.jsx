import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSearch, faBell, faHeart, faExchangeAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

const Navbar = ({ user, logout, cartCount, notifications = [], setNotifications }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

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
        navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSwitchAccount = () => {
      logout();
      navigate('/login');
      toast.success('Logged out. Please sign in with another account.');
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
    <nav className="bg-steam-light p-4 border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold tracking-wider text-white flex items-center gap-2 group">
                <span className="bg-gradient-to-br from-blue-600 to-steam-accent text-transparent bg-clip-text group-hover:to-blue-400 transition">GAMESTORE</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition uppercase tracking-wide">Store</Link>
                <Link to="/news" className="text-sm font-medium text-gray-300 hover:text-white transition uppercase tracking-wide">News</Link>
            </div>
        </div>

        {/* Main Search */}
        <div className="flex-1 mx-2 md:mx-8 max-w-md hidden md:flex items-center gap-4">
            <div className="relative flex-1">
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="text" 
                        placeholder="Search games..." 
                        className="w-full bg-steam-dark/50 text-white pl-10 pr-4 py-2 rounded-full border border-gray-700 focus:border-steam-accent focus:ring-1 focus:ring-steam-accent outline-none transition text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                </form>
            </div>
            
            {user && (
                <div className="relative flex-1 max-w-[180px]">
                    <input 
                        type="text" 
                        placeholder="Find friends..." 
                        className="w-full bg-steam-dark/50 text-white pl-4 pr-4 py-2 rounded-full border border-gray-700 focus:border-blue-400 outline-none transition text-sm"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                    {userSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-steam-light border border-gray-700 rounded-lg shadow-2xl mt-2 z-50 overflow-hidden animate-fadeIn">
                            {userSearchResults.map(u => (
                                <Link 
                                    key={u.id} 
                                    to={`/profile/${u.id}`}
                                    onClick={() => { setUserSearchTerm(''); setUserSearchResults([]); }}
                                    className="flex items-center gap-3 p-3 hover:bg-steam-hover transition border-b border-gray-800 last:border-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-steam-accent flex items-center justify-center text-xs font-bold text-white">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-white truncate">{u.name}</span>
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
                    <Link to="/wishlist" className="relative text-gray-400 hover:text-pink-500 transition group flex items-center justify-center w-8 h-8">
                        <FontAwesomeIcon icon={faHeart} className="text-lg" />
                        {wishlistCount > 0 && (
                            <span className="absolute top-1 right-0.5 bg-red-500 w-2 h-2 rounded-full border border-steam-light animate-pulse"></span>
                        )}
                    </Link>

                    {/* Notification Bell */}
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <button 
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="text-gray-400 hover:text-yellow-400 transition relative flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faBell} className="text-lg" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-steam-light">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="absolute top-full right-0 mt-2 w-[280px] md:w-80 bg-steam-light border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                                <div className="p-3 border-b border-gray-700 font-bold text-sm text-white flex justify-between items-center">
                                    <span>Notifications</span>
                                    {unreadCount > 0 && <span className="text-[10px] bg-steam-accent px-1.5 py-0.5 rounded text-white">{unreadCount} New</span>}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {safeNotifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 text-sm italic">No notifications yet</div>
                                    ) : (
                                        safeNotifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                onClick={() => markAsRead(n.id)}
                                                className={`p-4 border-b border-gray-800 hover:bg-steam-hover transition cursor-pointer ${!n.isRead ? 'bg-blue-500/10' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-400' : 'bg-transparent'}`}></div>
                                                    <div>
                                                        <p className={`text-sm ${!n.isRead ? 'text-white' : 'text-gray-400'}`}>{n.message}</p>
                                                        <span className="text-[10px] text-gray-500 mt-1 block">
                                                            {new Date(n.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/cart" className="relative text-gray-400 hover:text-green-400 transition group flex items-center justify-center w-8 h-8">
                        <span className="text-lg"><FontAwesomeIcon icon={faShoppingCart} /></span> 
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-steam-light">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="relative ml-2">
                        <button 
                            onClick={toggleDropdown}
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${getProfileGradient(user.role)} hover:opacity-90 flex items-center justify-center text-white transition focus:outline-none border border-white/20 shadow-lg`}
                        >
                            <span className="font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-steam-light border border-gray-700 rounded shadow-xl py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-700 mb-2">
                                    <div className="text-sm font-bold text-white truncate">{user.name}</div>
                                    <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                                        {user.role}
                                    </div>
                                </div>

                                <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-steam-hover hover:text-white transition">
                                    Wishlist
                                </Link>

                                <Link to="/library" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-steam-hover hover:text-white transition">
                                    My Library
                                </Link>

                                {pendingRequests.length > 0 && (
                                    <div className="px-4 py-2 border-t border-gray-700">
                                        <p className="text-[10px] font-bold text-steam-accent uppercase tracking-widest mb-2">Friend Requests</p>
                                        <div className="space-y-2">
                                            {pendingRequests.map(req => (
                                                <div key={req.id} className="flex items-center justify-between gap-2">
                                                    <span className="text-xs text-white truncate">{req.user.name}</span>
                                                    <button 
                                                        onClick={() => handleAcceptFriend(req.id)}
                                                        className="bg-steam-accent hover:bg-blue-500 text-white text-[10px] px-2 py-1 rounded transition"
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-steam-hover hover:text-white transition">
                                    Settings & Profile
                                </Link>

                                {user.role === 'PUBLISHER' && (
                                    <Link to="/dev-dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-blue-400 hover:bg-steam-hover hover:text-blue-300 transition font-bold">
                                        Dev Studio
                                    </Link>
                                )}

                                {user.role === 'ADMIN' && (
                                    <Link to="/manage-users" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-blue-400 hover:bg-steam-hover hover:text-blue-300 transition">
                                        Manage Users
                                    </Link>
                                )}
                                {(user.role === 'ADMIN' || user.role === 'PUBLISHER') && (
                                    <>
                                        <div className="border-t border-gray-700 my-1"></div>
                                        <Link to="/admin-dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-blue-400 hover:bg-steam-hover hover:text-blue-300 transition">
                                            Dashboard
                                        </Link>
                                        <Link to="/manage-games" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-blue-400 hover:bg-steam-hover hover:text-blue-300 transition">
                                            Manage Games
                                        </Link>
                                    </>
                                )}

                                <div className="border-t border-gray-700 my-1"></div>
                                
                                <button 
                                    onClick={handleSwitchAccount}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-steam-hover hover:text-white transition"
                                >
                                    <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" />
                                    Switch Account
                                </button>

                                <button 
                                    onClick={handleDeleteAccount}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-steam-hover hover:text-red-400 transition"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                    Delete Account
                                </button>

                                <button 
                                    onClick={() => { logout(); setIsDropdownOpen(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-steam-hover hover:text-white transition"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-gray-300 hover:text-white transition font-medium px-3 py-1">Log In</Link>
                    <Link to="/register" className="bg-steam-accent hover:bg-blue-500 text-white px-5 py-2 rounded transition font-bold shadow-lg text-sm flex items-center justify-center">Join Free</Link>
                </div>
            )}
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {(isDropdownOpen || isNotifOpen) && (
          <div className="fixed inset-0 z-40" onClick={() => { setIsDropdownOpen(false); setIsNotifOpen(false); }}></div>
      )}
    </nav>
  );
};

export default Navbar;
