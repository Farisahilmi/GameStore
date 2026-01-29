import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faTrophy, faRocket, faDownload, faTrash, faTimesCircle, faCog } from '@fortawesome/free-solid-svg-icons';

const Library = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      
      const gamesList = res.data.data.map(game => ({
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
      <div className="flex justify-center items-center h-screen bg-steam-dark text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-steam-accent"></div>
      </div>
  );

  if (games.length === 0) return (
      <div className="container mx-auto px-4 py-20 text-center text-gray-400">
          <h2 className="text-2xl font-bold mb-4">Your Library is Empty</h2>
          <p>Go to the store and find your next adventure!</p>
      </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-steam-dark overflow-hidden">
      {/* Sidebar List */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 bg-gray-900 sticky top-0">
              <input 
                type="text" 
                placeholder="Search Collection" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-gray-300 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-steam-accent"
              />
          </div>
          <div className="overflow-y-auto flex-1">
              {filteredGames.map(game => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className={`w-full text-left px-4 py-2 text-sm truncate transition hover:bg-gray-800 ${selectedGame?.id === game.id ? 'bg-gray-800 text-white font-medium border-l-2 border-steam-accent' : 'text-gray-400'}`}
                  >
                      <span className="mr-2 opacity-50">
                          {game.isInstalled ? <FontAwesomeIcon icon={faRocket} className="text-blue-400" /> : <FontAwesomeIcon icon={faDownload} />}
                      </span>
                      {game.title}
                  </button>
              ))}
              {filteredGames.length === 0 && (
                  <div className="p-4 text-xs text-gray-500 italic text-center">No matches found</div>
              )}
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-steam-dark relative">
          {selectedGame && (
              <>
                {/* Hero Banner Background */}
                <div className="relative h-64 md:h-80 w-full">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${selectedGame.imageUrl}')` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-steam-dark via-steam-dark/50 to-transparent"></div>
                    <div className="absolute bottom-6 left-8 z-10">
                        <div className="w-24 h-12 mb-4 bg-contain bg-no-repeat bg-left-bottom" style={{ backgroundImage: 'url(https://community.akamai.steamstatic.com/public/shared/images/header/globalheader_logo.png)' }}></div> 
                        {/* Note: In real app, game logo would be better, using title text for now */}
                        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-4">{selectedGame.title}</h1>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-gray-800/50 backdrop-blur-sm px-8 py-4 border-b border-gray-700 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        {selectedGame.isInstalled ? (
                            <button 
                                onClick={handlePlay}
                                className="bg-green-600 hover:bg-green-500 text-white px-10 py-3 rounded text-lg font-bold shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                            >
                                <span className="text-xl"><FontAwesomeIcon icon={faPlay} /></span> PLAY
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleDownload(selectedGame.id)}
                                disabled={downloadingId === selectedGame.id}
                                className={`bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded text-lg font-bold shadow-lg transition transform hover:scale-105 flex items-center gap-2 ${downloadingId === selectedGame.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-xl">
                                    <FontAwesomeIcon icon={downloadingId === selectedGame.id ? faRocket : faDownload} className={downloadingId === selectedGame.id ? 'animate-bounce' : ''} />
                                </span> 
                                {downloadingId === selectedGame.id ? `DOWNLOADING ${progress}%` : 'INSTALL'}
                            </button>
                        )}

                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-3 rounded shadow transition"
                            >
                                <FontAwesomeIcon icon={faCog} size="lg" />
                            </button>

                            {isMenuOpen && (
                                <div className="absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-xl z-50">
                                    <button 
                                        onClick={() => {
                                            handleUninstall(selectedGame.id);
                                            setIsMenuOpen(false);
                                        }}
                                        disabled={!selectedGame.isInstalled}
                                        className={`block w-full text-left px-4 py-2 text-sm transition ${!selectedGame.isInstalled ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        Uninstall
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleRemove(selectedGame.id);
                                            setIsMenuOpen(false);
                                        }}
                                        disabled={selectedGame.isInstalled}
                                        className={`block w-full text-left px-4 py-2 text-sm transition ${selectedGame.isInstalled ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:bg-gray-700 hover:text-red-300'}`}
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
                    
                    <div className="hidden lg:flex gap-8 text-sm text-gray-400">
                        <div>
                            <div className="uppercase text-xs font-bold text-gray-500">Last Played</div>
                            <div className="text-white">Today</div>
                        </div>
                        <div>
                            <div className="uppercase text-xs font-bold text-gray-500">Play Time</div>
                            <div className="text-white">12.5 hours</div>
                        </div>
                        <div>
                            <div className="uppercase text-xs font-bold text-gray-500">Achievements</div>
                            <div className="text-white flex items-center gap-1">
                                <span className="text-steam-accent"><FontAwesomeIcon icon={faTrophy} /> 8/24</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Details / Feed */}
                <div className="p-8 max-w-4xl">
                    <div className="bg-steam-light p-6 rounded-lg border border-gray-700 mb-8">
                        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-600 pb-2">Activity</h3>
                        <div className="flex gap-4">
                            <div className="bg-gray-800 p-4 rounded flex-1">
                                <div className="text-steam-accent font-bold text-sm mb-1">ACHIEVEMENT UNLOCKED</div>
                                <div className="text-white font-medium">First Blood</div>
                                <div className="text-xs text-gray-500 mt-2">Unlocked on {new Date().toLocaleDateString()}</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded flex-1">
                                <div className="text-blue-400 font-bold text-sm mb-1">SCREENSHOT CAPTURED</div>
                                <div className="h-20 bg-gray-700 rounded mt-2"></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Friends Who Play</h3>
                            <div className="flex gap-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded bg-gray-700 border border-gray-600"></div>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h3 className="text-lg font-bold text-white mb-2">DLC</h3>
                             <div className="bg-gray-800 p-3 rounded text-gray-400 text-sm">
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
