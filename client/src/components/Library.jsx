import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faTrophy, faRocket, faDownload, faCog } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

import Skeleton from './Skeleton';

const Library = () => {
  const { theme } = useTheme();
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true); // New state for mobile toggle

  useEffect(() => {
    fetchLibrary();
  }, []);

  useEffect(() => {
    const results = games.filter(game => 
      game.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGames(results);
    if (results.length > 0 && !results.find(g => g.id === selectedGame?.id)) {
        setSelectedGame(results[0]);
    }
  }, [searchTerm, games]);

  const fetchLibrary = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/library/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const gamesData = res.data?.data || [];
      const gamesList = gamesData.map(game => ({
          ...game,
          isInstalled: localStorage.getItem(`installed_${game.id}`) === 'true'
      }));
      
      setGames(gamesList);
      setFilteredGames(gamesList);
      if (gamesList.length > 0) setSelectedGame(gamesList[0]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle game selection on mobile
  const handleGameSelect = (game) => {
      setSelectedGame(game);
      setShowMobileList(false); // Hide list on mobile when game is selected
  };

  const handleBackToList = () => {
      setShowMobileList(true);
  };

  const handleDownload = (id) => {
      setDownloadingId(id);
      setProgress(0);
      
      const interval = setInterval(() => {
          setProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  setDownloadingId(null);
                  const updatedGames = games.map(g => 
                      g.id === id ? { ...g, isInstalled: true } : g
                  );
                  setGames(updatedGames);
                  if (selectedGame && selectedGame.id === id) {
                      setSelectedGame({ ...selectedGame, isInstalled: true });
                  }
                  localStorage.setItem(`installed_${id}`, 'true');
                  toast.success("Download complete!");
                  return 100;
              }
              return prev + 5;
          });
      }, 100);
  };

  const handleUninstall = (id) => {
      if (!window.confirm("Are you sure you want to uninstall this game?")) return;
      
      const updatedGames = games.map(g => 
          g.id === id ? { ...g, isInstalled: false } : g
      );
      setGames(updatedGames);
      if (selectedGame && selectedGame.id === id) {
          setSelectedGame({ ...selectedGame, isInstalled: false });
      }
      localStorage.removeItem(`installed_${id}`);
      toast.success("Game uninstalled");
  };

  const handleRemove = async (id) => {
      if (!window.confirm("PERINGATAN: Ini akan menghapus game secara permanen dari library Anda. Anda harus membelinya lagi jika ingin memainkannya. Lanjutkan?")) return;
      
      const token = localStorage.getItem('token');
      try {
          await axios.delete(`/api/library/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setGames(games.filter(g => g.id !== id));
          localStorage.removeItem(`installed_${id}`);
          toast.success("Game removed from library");
      } catch (err) {
          toast.error("Failed to remove game");
      }
  };

  const handlePlay = () => {
      toast.success(`Launching ${selectedGame.title}...`, {
          icon: '🚀',
          duration: 3000
      });
  };

  if (loading) return (
      <div className={`flex flex-col md:flex-row h-[calc(100vh-80px)] ${theme.colors.bg} overflow-hidden`}>
          {/* Sidebar Skeleton */}
          <div className={`w-full md:w-64 ${theme.colors.card} border-r ${theme.colors.border} flex flex-col p-4 space-y-4`}>
              <Skeleton className="h-8 w-full mb-4" />
              {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
              ))}
          </div>
          {/* Content Skeleton */}
          <div className="hidden md:block flex-1 p-8">
              <Skeleton className="h-64 w-full rounded-xl mb-8" />
              <div className="flex justify-between items-center mb-10">
                  <Skeleton className="h-12 w-48" />
                  <div className="flex gap-4">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                  </div>
              </div>
              <Skeleton className="h-40 w-full rounded-lg mb-8" />
              <div className="grid grid-cols-2 gap-8">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-32 w-full rounded-lg" />
              </div>
          </div>
      </div>
  );

  if (games.length === 0) return (
      <div className={`container mx-auto px-4 py-20 text-center opacity-60`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme.colors.text}`}>Your Library is Empty</h2>
          <p className={theme.colors.text}>Go to the store and find your next adventure!</p>
      </div>
  );

  return (
    <div className={`flex flex-col md:flex-row h-[calc(100vh-80px)] ${theme.colors.bg} overflow-hidden`}>
      {/* Sidebar List - Hidden on mobile if viewing details */}
      <div className={`w-full md:w-64 ${theme.colors.card} border-r ${theme.colors.border} flex flex-col ${!showMobileList ? 'hidden md:flex' : 'flex h-full'}`}>
          <div className={`p-4 border-b ${theme.colors.border} ${theme.colors.card} sticky top-0`}>
              <input 
                type="text" 
                placeholder="Search Collection" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-black/20 ${theme.colors.text} px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border ${theme.colors.border}`}
              />
          </div>
          <div className="overflow-y-auto flex-1">
              {filteredGames.map(game => (
                  <button
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    className={`w-full text-left px-4 py-3 md:py-2 text-sm truncate transition hover:bg-black/10 border-b border-white/5 md:border-b-0 ${selectedGame?.id === game.id ? `bg-black/20 ${theme.colors.text} font-medium md:border-l-2 ${theme.colors.accent.replace('text-', 'border-')}` : `opacity-70 ${theme.colors.text}`}`}
                  >
                      <span className="mr-3 md:mr-2 opacity-50">
                          {game.isInstalled ? <FontAwesomeIcon icon={faRocket} className="text-blue-400" /> : <FontAwesomeIcon icon={faDownload} />}
                      </span>
                      {game.title}
                  </button>
              ))}
              {filteredGames.length === 0 && (
                  <div className="p-4 text-xs opacity-50 italic text-center">No matches found</div>
              )}
          </div>
      </div>

      {/* Main Content - Full width on mobile when active */}
      <div className={`flex-1 overflow-y-auto ${theme.colors.bg} relative ${showMobileList ? 'hidden md:block' : 'block'}`}>
          {selectedGame && (
              <>
                {/* Mobile Back Button */}
                <button 
                    onClick={handleBackToList}
                    className="md:hidden absolute top-4 left-4 z-30 bg-black/50 text-white px-3 py-1 rounded-full backdrop-blur-md text-xs font-bold border border-white/20"
                >
                    ← Back to Library
                </button>

                {/* Hero Banner Background */}
                <div className="relative h-48 md:h-80 w-full">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${selectedGame.imageUrl}')` }}></div>
                    <div className={`absolute inset-0 bg-gradient-to-t from-${theme.colors.bg.split('-')[1] || 'gray'}-900 via-transparent to-transparent`}></div>
                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8 z-10 w-full pr-8">
                        {/* <div className="w-24 h-12 mb-4 bg-contain bg-no-repeat bg-left-bottom" style={{ backgroundImage: 'url(https://community.akamai.steamstatic.com/public/shared/images/header/globalheader_logo.png)' }}></div>  */}
                        <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg mb-2 md:mb-4">{selectedGame.title}</h1>
                    </div>
                </div>

                {/* Action Bar */}
                <div className={`${theme.colors.card}/50 backdrop-blur-sm px-4 md:px-8 py-4 border-b ${theme.colors.border} flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-20 gap-4`}>
                    <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                        {selectedGame.isInstalled ? (
                            <button 
                                onClick={handlePlay}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 md:px-10 py-2.5 md:py-3 rounded-lg md:rounded text-sm md:text-lg font-bold shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 flex-1 md:flex-initial"
                            >
                                <span className="text-lg md:text-xl"><FontAwesomeIcon icon={faPlay} /></span> PLAY
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleDownload(selectedGame.id)}
                                disabled={downloadingId === selectedGame.id}
                                className={`bg-blue-600 hover:bg-blue-500 text-white px-6 md:px-10 py-2.5 md:py-3 rounded-lg md:rounded text-sm md:text-lg font-bold shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 flex-1 md:flex-initial ${downloadingId === selectedGame.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-lg md:text-xl">
                                    <FontAwesomeIcon icon={downloadingId === selectedGame.id ? faRocket : faDownload} className={downloadingId === selectedGame.id ? 'animate-bounce' : ''} />
                                </span> 
                                {downloadingId === selectedGame.id ? `DOWNLOADING ${progress}%` : 'INSTALL'}
                            </button>
                        )}

                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`bg-gray-700 hover:bg-gray-600 text-gray-300 p-2.5 md:p-3 rounded shadow transition`}
                            >
                                <FontAwesomeIcon icon={faCog} size="lg" />
                            </button>

                            {isMenuOpen && (
                                <div className={`absolute left-0 mt-2 w-48 ${theme.colors.card} border ${theme.colors.border} rounded shadow-xl z-50`}>
                                    <button 
                                        onClick={() => {
                                            handleUninstall(selectedGame.id);
                                            setIsMenuOpen(false);
                                        }}
                                        disabled={!selectedGame.isInstalled}
                                        className={`block w-full text-left px-4 py-2 text-sm transition ${!selectedGame.isInstalled ? 'opacity-50 cursor-not-allowed' : `hover:bg-black/10 ${theme.colors.text}`}`}
                                    >
                                        Uninstall
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleRemove(selectedGame.id);
                                            setIsMenuOpen(false);
                                        }}
                                        disabled={selectedGame.isInstalled}
                                        className={`block w-full text-left px-4 py-2 text-sm transition ${selectedGame.isInstalled ? 'opacity-50 cursor-not-allowed' : 'text-red-400 hover:bg-black/10 hover:text-red-300'}`}
                                    >
                                        Remove from Library
                                    </button>
                                </div>
                            )}
                            
                            {isMenuOpen && (
                                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                            )}
                        </div>
                    </div>
                    
                    <div className={`hidden lg:flex gap-8 text-sm opacity-70 ${theme.colors.text}`}>
                        <div>
                            <div className="uppercase text-xs font-bold opacity-60">Last Played</div>
                            <div className="">Today</div>
                        </div>
                        <div>
                            <div className="uppercase text-xs font-bold opacity-60">Play Time</div>
                            <div className="">12.5 hours</div>
                        </div>
                        <div>
                            <div className="uppercase text-xs font-bold opacity-60">Achievements</div>
                            <div className="flex items-center gap-1">
                                <span className={`${theme.colors.accent}`}><FontAwesomeIcon icon={faTrophy} /> 8/24</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Details / Feed */}
                <div className="p-4 md:p-8 max-w-4xl">
                    <div className={`${theme.colors.card} p-4 md:p-6 rounded-lg border ${theme.colors.border} mb-8`}>
                        <h3 className={`text-lg md:text-xl font-bold ${theme.colors.text} mb-4 border-b ${theme.colors.border} pb-2`}>Activity</h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="bg-black/20 p-4 rounded flex-1">
                                <div className={`${theme.colors.accent} font-bold text-sm mb-1`}>ACHIEVEMENT UNLOCKED</div>
                                <div className={`${theme.colors.text} font-medium`}>First Blood</div>
                                <div className="text-xs opacity-60 mt-2">Unlocked on {new Date().toLocaleDateString()}</div>
                            </div>
                            <div className="bg-black/20 p-4 rounded flex-1">
                                <div className="text-blue-400 font-bold text-sm mb-1">SCREENSHOT CAPTURED</div>
                                <div className="h-20 bg-black/30 rounded mt-2"></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className={`text-lg font-bold ${theme.colors.text} mb-2`}>Friends Who Play</h3>
                            <div className="flex gap-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded bg-gray-700 border border-gray-600"></div>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h3 className={`text-lg font-bold ${theme.colors.text} mb-2`}>DLC</h3>
                             <div className="bg-black/20 p-3 rounded opacity-70 text-sm">
                                 No DLC available for this title.
                             </div>
                        </div>
                    </div>
                </div>
              </>
          )}
      </div>
    </div>
  );
};

export default Library;
