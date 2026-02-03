import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import GameCard from './GameCard';
import { useTheme } from '../context/ThemeContext';
import { GameCardSkeleton } from './Skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';

const BrowseGames = ({ addToCart, library }) => {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Update local state when URL params change (e.g. from Navbar search)
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlSort = searchParams.get('sort') || 'newest';
    const urlMinPrice = searchParams.get('minPrice') || '';
    const urlMaxPrice = searchParams.get('maxPrice') || '';
    const urlPage = parseInt(searchParams.get('page')) || 1;

    setSearchTerm(urlSearch);
    setSelectedCategory(urlCategory);
    setSelectedSort(urlSort);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
    setCurrentPage(urlPage);
  }, [searchParams]);

  useEffect(() => {
    fetchGames();
  }, [searchTerm, selectedCategory, selectedSort, currentPage, minPrice, maxPrice]);

  const fetchCategories = async () => {
    try {
        const res = await axios.get('/api/categories');
        setCategories(res.data.data);
    } catch (err) {
        console.error(err);
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedSort) params.append('sort', selectedSort);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        params.append('page', currentPage);
        params.append('limit', 15);

        const res = await axios.get(`/api/games?${params.toString()}`);
        setGames(res.data?.data?.games || []);
        setTotalPages(res.data?.data?.meta?.totalPages || 1);
    } catch (err) {
        console.error(err);
        setGames([]);
    } finally {
        setLoading(false);
    }
  };

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
        if (value) newParams.set(key, value);
        else newParams.delete(key);
    });
    // Reset page on filter change
    if (!updates.page) newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchTerm, page: '1' });
  };

  return (
    <div className={`min-h-screen ${theme.colors.bg} pt-10 pb-20 px-4 transition-colors duration-500`}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <h1 className={`text-4xl font-black ${theme.colors.text} border-l-8 border-steam-accent pl-6 uppercase tracking-tighter italic`}>
                Browse <span className="text-steam-accent">Games</span>
            </h1>
            
            <div className="flex gap-3">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-80">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search titles..."
                        className={`w-full ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-black/20'} ${theme.colors.text} pl-12 pr-4 py-3 rounded-xl border ${theme.colors.border} focus:border-steam-accent outline-none transition shadow-inner`}
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                    {searchTerm && (
                        <button 
                            type="button"
                            onClick={() => { setSearchTerm(''); updateFilters({ search: '', page: '1' }); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </form>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`md:hidden px-4 py-3 rounded-xl border ${theme.colors.border} ${showFilters ? 'bg-steam-accent text-white' : theme.colors.text + ' opacity-70'}`}
                >
                    <FontAwesomeIcon icon={faFilter} />
                </button>
            </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Filters */}
            <div className={`lg:w-64 space-y-8 ${showFilters ? 'fixed inset-0 z-50 bg-black/90 p-10 overflow-y-auto lg:relative lg:inset-auto lg:bg-transparent lg:p-0' : 'hidden lg:block'}`}>
                {showFilters && (
                    <button 
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden absolute top-6 right-6 text-2xl text-white"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}

                <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 opacity-50 ${theme.colors.text}`}>Categories</h3>
                    <div className="flex flex-col gap-1">
                        <button 
                            onClick={() => updateFilters({ category: '' })}
                            className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${!selectedCategory ? 'bg-steam-accent text-white shadow-lg' : 'opacity-60 hover:opacity-100 hover:bg-black/10'}`}
                        >
                            All Genres
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => updateFilters({ category: cat.name })}
                                className={`text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedCategory === cat.name ? 'bg-steam-accent text-white shadow-lg' : 'opacity-60 hover:opacity-100 hover:bg-black/10'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 opacity-50 ${theme.colors.text}`}>Price Range</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                onBlur={() => updateFilters({ minPrice })}
                                className={`w-full ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-black/20'} ${theme.colors.text} p-2 rounded-lg border ${theme.colors.border} text-sm outline-none focus:border-steam-accent`}
                            />
                            <span className="opacity-30">-</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                onBlur={() => updateFilters({ maxPrice })}
                                className={`w-full ${theme.name === 'Clean Light' ? 'bg-gray-100' : 'bg-black/20'} ${theme.colors.text} p-2 rounded-lg border ${theme.colors.border} text-sm outline-none focus:border-steam-accent`}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Free', min: '0', max: '0' },
                                { label: '< $10', min: '0', max: '10' },
                                { label: '$10 - $50', min: '10', max: '50' },
                                { label: '> $50', min: '50', max: '' },
                            ].map((preset) => (
                                <button 
                                    key={preset.label}
                                    onClick={() => {
                                        if (minPrice === preset.min && maxPrice === preset.max) {
                                            // Deselect
                                            setMinPrice('');
                                            setMaxPrice('');
                                            updateFilters({ minPrice: '', maxPrice: '' });
                                        } else {
                                            // Select
                                            setMinPrice(preset.min);
                                            setMaxPrice(preset.max);
                                            updateFilters({ minPrice: preset.min, maxPrice: preset.max });
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${
                                        minPrice === preset.min && maxPrice === preset.max
                                        ? 'bg-steam-accent text-white border-steam-accent'
                                        : 'border-white/10 opacity-60 hover:opacity-100 hover:bg-white/5'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 opacity-50 ${theme.colors.text}`}>Sort By</h3>
                    <select 
                        value={selectedSort}
                        onChange={(e) => updateFilters({ sort: e.target.value })}
                        className={`w-full ${theme.colors.card} ${theme.colors.text} p-3 rounded-xl border ${theme.colors.border} outline-none focus:border-steam-accent text-sm font-bold cursor-pointer shadow-inner`}
                    >
                        <option value="newest" className="text-black">Newest First</option>
                        <option value="oldest" className="text-black">Oldest First</option>
                        <option value="price_asc" className="text-black">Price: Low to High</option>
                        <option value="price_desc" className="text-black">Price: High to Low</option>
                        <option value="name_asc" className="text-black">Name: A-Z</option>
                    </select>
                </div>

                <button 
                    onClick={() => {
                        setSearchTerm('');
                        setMinPrice('');
                        setMaxPrice('');
                        // Also reset category and sort
                        setSelectedCategory('');
                        setSelectedSort('newest');
                        updateFilters({ search: '', category: '', sort: 'newest', minPrice: '', maxPrice: '' });
                    }}
                    className={`w-full py-3 rounded-xl border-2 border-dashed ${theme.colors.border} opacity-40 hover:opacity-100 hover:border-red-500/50 hover:text-red-500 transition-all text-xs font-black uppercase tracking-widest`}
                >
                    Clear All
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <GameCardSkeleton key={i} />)}
                    </div>
                ) : games.length === 0 ? (
                    <div className={`${theme.colors.card} rounded-3xl p-20 text-center border ${theme.colors.border} border-dashed`}>
                        <div className="text-6xl mb-6 opacity-20">🔍</div>
                        <h2 className="text-2xl font-bold opacity-70 mb-2">No games match your search</h2>
                        <p className="opacity-40">Try adjusting your filters or search terms.</p>
                        <button 
                            onClick={() => { setSearchTerm(''); updateFilters({ search: '', category: '', sort: 'newest' }); }}
                            className="mt-8 bg-steam-accent hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition shadow-xl"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {games.map(game => (
                                <Link to={`/games/${game.id}`} key={game.id} className="block group">
                                    <GameCard 
                                        game={game} 
                                        isOwned={library?.includes(game.id)}
                                        onBuy={(e) => { e.preventDefault(); addToCart(game); }}
                                    />
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-16">
                                <button 
                                    onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 bg-steam-light text-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-steam-hover transition`}
                                >
                                    Previous
                                </button>
                                
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => updateFilters({ page: (i + 1).toString() })}
                                            className={`w-10 h-10 rounded font-bold transition ${currentPage === i + 1 ? 'bg-steam-accent text-white shadow-lg shadow-blue-500/50' : 'bg-steam-light text-gray-400 hover:text-white'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 bg-steam-light text-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-steam-hover transition`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseGames;
