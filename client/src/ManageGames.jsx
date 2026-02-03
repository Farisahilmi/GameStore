import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from './context/ThemeContext';

const ManageGames = ({ user }) => {
  const { theme } = useTheme();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount: '',
    imageUrl: '',
    categoryNames: '' // comma separated for input
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [isUploading, setIsUploading] = useState(false);

  // Patch Notes State
  const [isPatchModalOpen, setIsPatchModalOpen] = useState(false);
  const [patchData, setPatchData] = useState({
      gameId: null,
      title: '',
      content: '',
      version: '',
      type: 'UPDATE'
  });

  useEffect(() => {
    fetchGames(currentPage);
  }, [currentPage]);

  const fetchGames = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/games?page=${page}&limit=${limit}`);
      setGames(res.data?.data?.games || []);
      setTotalPages(res.data?.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch games', err);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    let finalImageUrl = formData.imageUrl;

    try {
      if (uploadMode === 'file' && imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        setIsUploading(true);
        try {
          const uploadRes = await axios.post('/api/upload', uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          finalImageUrl = uploadRes.data.data.url;
        } catch (uploadErr) {
          console.error(uploadErr);
          toast.error('Image upload failed, falling back to existing URL');
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
        price: parseFloat(formData.price),
        discount: parseInt(formData.discount) || 0,
        categoryNames: formData.categoryNames.split(',').map(s => s.trim()).filter(s => s)
      };

      if (isEditing) {
        await axios.put(`/api/games/${currentId}`, payload, config);
        toast.success('Game updated successfully');
      } else {
        await axios.post('/api/games', payload, config);
        toast.success('Game created successfully');
      }
      resetForm();
      fetchGames();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (game) => {
    setIsEditing(true);
    setCurrentId(game.id);
    setFormData({
      title: game.title,
      description: game.description,
      price: game.price,
      discount: game.discount || 0,
      imageUrl: game.imageUrl || '',
      categoryNames: game.categories ? game.categories.map(c => c.name).join(', ') : ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Game deleted successfully');
      fetchGames();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setImageFile(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      discount: '',
      imageUrl: '',
      categoryNames: ''
    });
  };

  const handlePostPatch = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
          await axios.post('/api/game-updates', patchData, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Patch note posted successfully!');
          setIsPatchModalOpen(false);
          setPatchData({ gameId: null, title: '', content: '', version: '', type: 'UPDATE' });
      } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to post patch note');
      }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${theme.colors.text} ${theme.colors.bg} min-h-screen`}>
      <h2 className={`text-3xl font-bold mb-6 ${theme.colors.accent} border-b ${theme.colors.border} pb-2`}>Manage Games</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className={`${theme.colors.card} p-6 rounded-lg shadow-lg border ${theme.colors.border} h-fit`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme.colors.text}`}>{isEditing ? 'Edit Game' : 'Add New Game'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block opacity-50 text-sm mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} focus:border-blue-500 outline-none`} />
            </div>
            <div>
              <label className="block opacity-50 text-sm mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} focus:border-blue-500 outline-none h-24`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block opacity-50 text-sm mb-1">Price</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} focus:border-blue-500 outline-none`} step="0.01" />
                </div>
                <div>
                    <label className="block opacity-50 text-sm mb-1">Discount (%)</label>
                    <input type="number" name="discount" value={formData.discount} onChange={handleChange} className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} focus:border-blue-500 outline-none`} min="0" max="100" />
                </div>
            </div>
            <div>
              <label className="block opacity-50 text-sm mb-1">Game Image</label>
              <div className="flex gap-4 mb-2">
                <button 
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1 rounded text-sm transition ${uploadMode === 'url' ? 'bg-blue-600 text-white' : `bg-gray-700/50 ${theme.colors.text} opacity-50`}`}
                >
                  Image URL
                </button>
                <button 
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1 rounded text-sm transition ${uploadMode === 'file' ? 'bg-blue-600 text-white' : `bg-gray-700/50 ${theme.colors.text} opacity-50`}`}
                >
                  Upload File
                </button>
              </div>

              {uploadMode === 'url' ? (
                <input 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleChange} 
                  placeholder="https://example.com/image.jpg"
                  className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} focus:border-blue-500 outline-none`}
                />
              ) : (
                <div className={`border border-dashed ${theme.colors.border} rounded p-4 text-center hover:border-blue-500 transition`}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    className={`w-full ${theme.colors.text} text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500`}
                  />
                  {imageFile && <div className="text-green-500 text-xs mt-2 font-bold">Selected: {imageFile.name}</div>}
                </div>
              )}
            </div>
            <div>
              <label className="block opacity-50 text-sm mb-1">Categories (comma separated)</label>
              <input name="categoryNames" value={formData.categoryNames} onChange={handleChange} placeholder="Action, RPG, Indie" className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-2 ${theme.colors.text} focus:border-blue-500 outline-none`} />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                disabled={isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition disabled:opacity-50 shadow-lg"
              >
                {isUploading ? 'Uploading & Saving...' : (isEditing ? 'Update Game' : 'Create Game')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className={`text-xl font-semibold mb-4 ${theme.colors.text}`}>Existing Games</h3>
          
          {loading ? (
            <div className="flex justify-center py-10">
               <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${theme.colors.accent}`}></div>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {games.map(game => (
                  <div key={game.id} className={`${theme.colors.card} p-4 rounded-lg flex justify-between items-center border ${theme.colors.border} hover:border-blue-500/50 transition shadow-sm`}>
                    <div className="flex items-center gap-4">
                      {game.imageUrl && <img src={game.imageUrl} alt={game.title} className="w-16 h-16 object-cover rounded shadow-md" />}
                      <div>
                        <h4 className={`font-bold text-lg ${theme.colors.text}`}>{game.title}</h4>
                        <p className="text-sm opacity-60">${game.price} - {game.categories?.map(c => c.name).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(user.role === 'ADMIN' || (game.publisher && game.publisher.id === user.id)) && (
                        <>
                          <button 
                            onClick={() => {
                                setPatchData({ ...patchData, gameId: game.id });
                                setIsPatchModalOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                          >
                              <FontAwesomeIcon icon={faPlusCircle} /> Update
                          </button>
                          <button onClick={() => handleEdit(game)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition shadow-sm"><FontAwesomeIcon icon={faEdit} /> Edit</button>
                          <button onClick={() => handleDelete(game.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition shadow-sm"><FontAwesomeIcon icon={faTrash} /> Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI for Admin */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 ${theme.colors.card} ${theme.colors.text} rounded text-sm disabled:opacity-30 border ${theme.colors.border}`}
                  >
                    Prev
                  </button>
                  <span className="text-sm opacity-50">Page {currentPage} of {totalPages}</span>
                  <button 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 ${theme.colors.card} ${theme.colors.text} rounded text-sm disabled:opacity-30 border ${theme.colors.border}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Patch Note Modal */}
      {isPatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className={`${theme.colors.card} border ${theme.colors.border} rounded-xl shadow-2xl max-w-2xl w-full p-8 animate-fadeIn`}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-2xl font-bold ${theme.colors.text}`}>Post Game Update</h3>
                      <button onClick={() => setIsPatchModalOpen(false)} className="opacity-50 hover:opacity-100 transition text-2xl">
                          <FontAwesomeIcon icon={faTimes} />
                      </button>
                  </div>

                  <form onSubmit={handlePostPatch} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block opacity-50 text-xs font-bold uppercase mb-1 tracking-wider">Update Title</label>
                              <input 
                                  value={patchData.title}
                                  onChange={e => setPatchData({...patchData, title: e.target.value})}
                                  required
                                  placeholder="e.g. The Big Summer Update"
                                  className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-3 ${theme.colors.text} focus:border-blue-500 outline-none transition`}
                              />
                          </div>
                          <div>
                              <label className="block opacity-50 text-xs font-bold uppercase mb-1 tracking-wider">Version</label>
                              <input 
                                  value={patchData.version}
                                  onChange={e => setPatchData({...patchData, version: e.target.value})}
                                  placeholder="e.g. v1.2.4"
                                  className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-3 ${theme.colors.text} focus:border-blue-500 outline-none transition`}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block opacity-50 text-xs font-bold uppercase mb-1 tracking-wider">Update Type</label>
                              <select 
                                  value={patchData.type}
                                  onChange={e => setPatchData({...patchData, type: e.target.value})}
                                  className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-3 ${theme.colors.text} focus:border-blue-500 outline-none transition`}
                              >
                                  <option value="UPDATE">Standard Update</option>
                                  <option value="HOTFIX">Hotfix / Bugfix</option>
                                  <option value="DLC">DLC / Content Pack</option>
                                  <option value="ANNOUNCEMENT">Announcement</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block opacity-50 text-xs font-bold uppercase mb-1 tracking-wider">Content / Patch Notes</label>
                          <textarea 
                              value={patchData.content}
                              onChange={e => setPatchData({...patchData, content: e.target.value})}
                              required
                              placeholder="Describe what's new in this version..."
                              className={`w-full ${theme.colors.bg} border ${theme.colors.border} rounded p-3 ${theme.colors.text} focus:border-blue-500 outline-none transition h-48`}
                          />
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition"
                          >
                              Post Update
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsPatchModalOpen(false)}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 rounded-lg transition"
                          >
                              Cancel
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ManageGames;
